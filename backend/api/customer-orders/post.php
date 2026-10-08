<?php

declare(strict_types=1);

require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/request.php';
require_once __DIR__ . '/../shared/auth.php';
require_once __DIR__ . '/../shared/customer-addresses.php';

final class CustomerOrderException extends RuntimeException
{
}

methodOnly('POST');
$customer = getCurrentCustomer();
if (!$customer) {
    jsonResponse(false, 'Customer authentication required.', null, [], 401);
}

safeApi(function () use ($customer): void {
    $input = jsonRequest();
    $addressId = filter_var($input['address_id'] ?? $input['selected_address_id'] ?? null, FILTER_VALIDATE_INT);
    $items = $input['items'] ?? null;
    $couponCode = strtoupper(trim((string) ($input['coupon_code'] ?? '')));
    $paymentMethod = strtoupper(trim((string) ($input['payment_method'] ?? 'COD')));
    if (!$addressId || $addressId < 1 || !is_array($items) || $items === []) {
        jsonResponse(false, 'Please provide a valid address and cart.', null, [], 422);
    }
    if ($paymentMethod !== 'COD') {
        jsonResponse(false, 'The selected payment method is not available.', null, [], 422);
    }
    if (count($items) > 100) {
        jsonResponse(false, 'The order contains too many items.', null, [], 422);
    }

    $db = apiDatabase();
    $db->beginTransaction();

    try {
        $addressColumns = customerAddressColumns($db);
        $addressQuery = $db->prepare(
            'SELECT ' . customerAddressSelect($addressColumns)
            . ' FROM customer_addresses WHERE ' . customerAddressColumn($addressColumns, 'id')
            . ' = :id AND ' . customerAddressColumn($addressColumns, 'customer_id') . ' = :customer_id FOR UPDATE'
        );
        $addressQuery->execute([':id' => $addressId, ':customer_id' => $customer['id']]);
        $address = $addressQuery->fetch();
        if (!$address) {
            throw new CustomerOrderException('Delivery address not found.', 422);
        }

        $lines = [];
        $inventoryUpdates = [];
        $subtotalCents = 0;
        $seenLines = [];
        foreach ($items as $item) {
            if (!is_array($item)) {
                throw new CustomerOrderException('Each cart item must be an object.', 422);
            }

            $productId = filter_var($item['product_id'] ?? null, FILTER_VALIDATE_INT);
            $rawVariationId = $item['variation_id'] ?? null;
            $variationId = $rawVariationId === null || $rawVariationId === ''
                ? null
                : filter_var($rawVariationId, FILTER_VALIDATE_INT);
            $quantity = filter_var($item['quantity'] ?? null, FILTER_VALIDATE_INT);
            if (!$productId || $productId < 1 || $quantity === false || $quantity < 1
                || ($rawVariationId !== null && $rawVariationId !== ''
                    && ($variationId === false || $variationId < 1))) {
                throw new CustomerOrderException('Cart item product, variation, or quantity is invalid.', 422);
            }

            $variationId = $variationId ?: null;
            $lineKey = $productId . ':' . ($variationId ?? 0);
            if (isset($seenLines[$lineKey])) {
                throw new CustomerOrderException('The cart contains a duplicate product line.', 422);
            }
            $seenLines[$lineKey] = true;

            $productQuery = $db->prepare(
                "SELECT id, name, selling_price, offer_price, sale_price, price, manage_inventory, stock_quantity, "
                . "low_stock_threshold FROM products WHERE id = :id AND UPPER(status) = 'ACTIVE' FOR UPDATE"
            );
            $productQuery->execute([':id' => $productId]);
            $product = $productQuery->fetch();
            if (!$product) {
                throw new CustomerOrderException('A product in your cart is no longer available.', 404);
            }

            $variation = null;
            if ($variationId !== null) {
                $variationQuery = $db->prepare(
                    "SELECT id, variation_name, selling_price, stock_quantity FROM product_variations "
                    . "WHERE id = :id AND product_id = :product_id AND UPPER(status) = 'ACTIVE' FOR UPDATE"
                );
                $variationQuery->execute([':id' => $variationId, ':product_id' => $productId]);
                $variation = $variationQuery->fetch();
                if (!$variation) {
                    throw new CustomerOrderException('A selected product variation is no longer available.', 404);
                }
            } else {
                $variationCount = $db->prepare(
                    "SELECT COUNT(*) FROM product_variations WHERE product_id = :product_id AND UPPER(status) = 'ACTIVE'"
                );
                $variationCount->execute([':product_id' => $productId]);
                if ((int) $variationCount->fetchColumn() > 0) {
                    throw new CustomerOrderException('Please select a variation for every product that requires one.', 422);
                }
            }

            $priceValue = $variation['selling_price'] ?? null;
            if ($variation === null) {
                foreach (['selling_price', 'offer_price', 'sale_price', 'price'] as $priceColumn) {
                    if ((float) ($product[$priceColumn] ?? 0) > 0) {
                        $priceValue = $product[$priceColumn];
                        break;
                    }
                }
            }
            if ($priceValue === null || !is_numeric($priceValue) || (float) $priceValue <= 0) {
                throw new CustomerOrderException('A product price is unavailable. Please refresh your cart.', 422);
            }

            $unitPriceCents = (int) round((float) $priceValue * 100);
            $lineTotalCents = $unitPriceCents * $quantity;
            $subtotalCents += $lineTotalCents;
            $manageInventory = (int) ($product['manage_inventory'] ?? 1) === 1;

            if ($manageInventory) {
                $stock = (int) ($variation['stock_quantity'] ?? $product['stock_quantity']);
                if ($stock < $quantity) {
                    throw new CustomerOrderException(
                        $variationId !== null
                            ? 'Not enough stock is available for the selected variation.'
                            : 'Not enough stock is available for this product.',
                        409
                    );
                }
                $inventoryUpdates[] = [
                    'product_id' => $productId,
                    'variation_id' => $variationId,
                    'stock' => $stock - $quantity,
                    'threshold' => (int) ($product['low_stock_threshold'] ?? 0),
                ];
            }

            $lines[] = [
                'product_id' => $productId,
                'variation_id' => $variationId,
                'name' => $product['name'],
                'variation' => $variation['variation_name'] ?? null,
                'quantity' => $quantity,
                'unit_price' => number_format($unitPriceCents / 100, 2, '.', ''),
                'line_total' => number_format($lineTotalCents / 100, 2, '.', ''),
            ];
        }

        $discountCents = 0;
        $coupon = null;
        if ($couponCode !== '') {
            $couponQuery = $db->prepare('SELECT * FROM coupons WHERE code = :code FOR UPDATE');
            $couponQuery->execute([':code' => $couponCode]);
            $coupon = $couponQuery->fetch();
            if (!$coupon || $coupon['status'] !== 'ACTIVE') throw new CustomerOrderException('This coupon is not valid.', 422);
            $today = date('Y-m-d');
            if (($coupon['start_date'] && $today < substr((string) $coupon['start_date'], 0, 10)) || ($coupon['expiry_date'] && $today > substr((string) $coupon['expiry_date'], 0, 10))) throw new CustomerOrderException('This coupon is not currently valid.', 422);
            $usage = $db->prepare('SELECT COUNT(*) FROM coupon_usages WHERE coupon_id = :id');
            $usage->execute([':id' => $coupon['id']]);
            if ((int) $coupon['usage_limit'] > 0 && (int) $usage->fetchColumn() >= (int) $coupon['usage_limit']) throw new CustomerOrderException('This coupon has reached its usage limit.', 429);
            $userUsage = $db->prepare('SELECT COUNT(*) FROM coupon_usages WHERE coupon_id = :id AND customer_id = :customer');
            $userUsage->execute([':id' => $coupon['id'], ':customer' => $customer['id']]);
            if ((int) $coupon['per_user_limit'] > 0 && (int) $userUsage->fetchColumn() >= (int) $coupon['per_user_limit']) throw new CustomerOrderException('You have already used this coupon the maximum number of times.', 429);
            if (($subtotalCents / 100) < (float) $coupon['min_order_amount']) throw new CustomerOrderException('Minimum order value for this coupon was not met.', 422);
            $eligibleCents = $subtotalCents;
            if ($coupon['applies_to'] !== 'ALL') {
                $eligibleCents = 0;
                foreach ($lines as $line) {
                    $eligibleCents += (int) round((float) $line['line_total'] * 100);
                }
            }
            $discount = $coupon['discount_type'] === 'PERCENTAGE' ? ($eligibleCents * (float) $coupon['discount_value'] / 100) : ((float) $coupon['discount_value'] * 100);
            if ($coupon['max_discount'] !== null) $discount = min($discount, (float) $coupon['max_discount'] * 100);
            $discountCents = (int) min($discount, $eligibleCents, $subtotalCents);
        }

        $addressText = implode(', ', array_filter([
            $address['full_name'],
            $address['phone'],
            $address['address_line1'],
            $address['address_line2'],
            $address['city'],
            $address['state'],
            $address['postal_code'],
            $address['country'],
        ], static fn($value): bool => $value !== null && $value !== ''));
        $subtotal = number_format($subtotalCents / 100, 2, '.', '');
        $discountAmount = number_format($discountCents / 100, 2, '.', '');
        $total = number_format(($subtotalCents - $discountCents) / 100, 2, '.', '');
        $orderNumber = 'NS' . date('ymdHis') . random_int(10000000, 99999999);
        $insertOrder = $db->prepare(
            "INSERT INTO orders (customer_id, coupon_id, coupon_code, order_number, customer_name, email, phone, shipping_address, subtotal, discount_amount, total_amount, payment_method, payment_status, order_status) "
            . "VALUES (:customer_id, :coupon_id, :coupon_code, :order_number, :customer_name, :email, :phone, :shipping_address, :subtotal, :discount_amount, :total_amount, :payment_method, 'PENDING', 'NEW')"
        );
        $insertOrder->execute([
            ':customer_id' => $customer['id'],
            ':coupon_id' => $coupon['id'] ?? null,
            ':coupon_code' => $coupon['code'] ?? null,
            ':order_number' => $orderNumber,
            ':customer_name' => $address['full_name'],
            ':email' => $customer['email'],
            ':phone' => $address['phone'],
            ':shipping_address' => $addressText,
            ':subtotal' => $subtotal,
            ':discount_amount' => $discountAmount,
            ':total_amount' => $total,
            ':payment_method' => $paymentMethod,
        ]);
        $orderId = (int) $db->lastInsertId();

        $insertItem = $db->prepare(
            'INSERT INTO order_items (order_id, product_id, product_variation_id, product_name_snapshot, '
            . 'variation_snapshot, quantity, unit_price, line_total) '
            . 'VALUES (:order_id, :product_id, :variation_id, :product_name, :variation_name, :quantity, :unit_price, :line_total)'
        );
        foreach ($lines as $line) {
            $insertItem->execute([
                ':order_id' => $orderId,
                ':product_id' => $line['product_id'],
                ':variation_id' => $line['variation_id'],
                ':product_name' => $line['name'],
                ':variation_name' => $line['variation'],
                ':quantity' => $line['quantity'],
                ':unit_price' => $line['unit_price'],
                ':line_total' => $line['line_total'],
            ]);
        }

        foreach ($inventoryUpdates as $update) {
            if ($update['variation_id'] !== null) {
                $db->prepare('UPDATE product_variations SET stock_quantity = :stock WHERE id = :id')
                    ->execute([':stock' => $update['stock'], ':id' => $update['variation_id']]);
            } else {
                $stockStatus = $update['stock'] <= 0
                    ? 'OUT_OF_STOCK'
                    : ($update['stock'] <= $update['threshold'] ? 'LOW_STOCK' : 'IN_STOCK');
                $db->prepare('UPDATE products SET stock_quantity = :stock, stock_status = :stock_status WHERE id = :id')
                    ->execute([
                        ':stock' => $update['stock'],
                        ':stock_status' => $stockStatus,
                        ':id' => $update['product_id'],
                    ]);
            }
        }

        if ($coupon) {
            $db->prepare('INSERT INTO coupon_usages (coupon_id, customer_id, order_id, discount_amount) VALUES (:coupon, :customer, :order, :discount)')->execute([':coupon' => $coupon['id'], ':customer' => $customer['id'], ':order' => $orderId, ':discount' => $discountAmount]);
        }

        $db->commit();
        jsonResponse(true, 'Order placed successfully.', [
            'order_id' => $orderId,
            'order_number' => $orderNumber,
            'total' => $total,
        ], [], 201);
    } catch (CustomerOrderException $exception) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        jsonResponse(false, $exception->getMessage(), null, [], $exception->getCode() ?: 422);
    } catch (Throwable $exception) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        throw $exception;
    }
});
