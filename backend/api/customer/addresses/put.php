<?php

declare(strict_types=1);

require_once __DIR__ . '/../../shared/response.php';
require_once __DIR__ . '/../../shared/request.php';
require_once __DIR__ . '/../../shared/auth.php';
require_once __DIR__ . '/../../shared/customer-addresses.php';

methodOnly('PUT');
$customer = getCurrentCustomer();
if (!$customer) {
    jsonResponse(false, 'Customer authentication required.', null, [], 401);
}

safeApi(function () use ($customer): void {
    $id = requestId();
    $input = jsonRequest();
    $address = [
        'label' => inputString($input, 'label') ?? 'Home',
        'full_name' => inputString($input, 'full_name', true),
        'phone' => inputString($input, 'phone', true),
        'address_line1' => inputString($input, 'address_line1') ?? inputString($input, 'address_line_1', true),
        'address_line2' => inputString($input, 'address_line2') ?? inputString($input, 'address_line_2'),
        'city' => inputString($input, 'city', true),
        'state' => inputString($input, 'state', true),
        'postal_code' => inputString($input, 'postal_code') ?? inputString($input, 'pincode', true),
        'country' => inputString($input, 'country') ?? 'India',
    ];
    $phoneDigits = preg_replace('/\D/', '', $address['phone']);
    if (!preg_match('/^[0-9+() -]{7,20}$/', $address['phone'])
        || strlen($phoneDigits) < 7 || strlen($phoneDigits) > 15) {
        jsonResponse(false, 'Validation failed.', null, ['phone' => 'Enter a valid phone number.'], 422);
    }
    $validPostalCode = strcasecmp($address['country'], 'India') === 0
        ? preg_match('/^\d{6}$/', $address['postal_code'])
        : preg_match('/^[A-Za-z0-9 -]{3,20}$/', $address['postal_code']);
    if (!$validPostalCode) {
        jsonResponse(false, 'Validation failed.', null, ['postal_code' => 'Enter a valid postal code.'], 422);
    }

    $db = apiDatabase();
    $columns = customerAddressColumns($db);
    $db->beginTransaction();
    try {
        $customerLock = $db->prepare('SELECT id FROM customers WHERE id = :customer_id FOR UPDATE');
        $customerLock->execute([':customer_id' => $customer['id']]);
        if (!$customerLock->fetch()) {
            $db->rollBack();
            jsonResponse(false, 'Customer authentication required.', null, [], 401);
        }
        $idColumn = customerAddressColumn($columns, 'id');
        $customerColumn = customerAddressColumn($columns, 'customer_id');
        $find = $db->prepare('SELECT ' . $idColumn . ' FROM customer_addresses WHERE ' . $idColumn
            . ' = :id AND ' . $customerColumn . ' = :customer_id FOR UPDATE');
        $find->execute([':id' => $id, ':customer_id' => $customer['id']]);
        if (!$find->fetch()) {
            $db->rollBack();
            jsonResponse(false, 'Address not found.', null, [], 404);
        }

        $isDefault = !empty($input['is_default']);
        if ($isDefault) {
            $db->prepare('UPDATE customer_addresses SET ' . customerAddressColumn($columns, 'is_default')
                . ' = 0 WHERE ' . $customerColumn . ' = :customer_id')
                ->execute([':customer_id' => $customer['id']]);
        }

        $values = [
            'label' => $address['label'],
            'full_name' => $address['full_name'],
            'phone' => $address['phone'],
            'address_line1' => $address['address_line1'],
            'city' => $address['city'],
            'state' => $address['state'],
            'postal_code' => $address['postal_code'],
            'country' => $address['country'],
            'is_default' => $isDefault ? 1 : 0,
        ];
        if (isset($columns['address_line2'])) {
            $values['address_line2'] = $address['address_line2'];
        }
        $set = [];
        foreach ($values as $name => $value) {
            $set[] = customerAddressColumn($columns, $name) . ' = :' . $name;
        }
        $statement = $db->prepare('UPDATE customer_addresses SET ' . implode(', ', $set)
            . ' WHERE ' . $idColumn . ' = :id AND ' . $customerColumn . ' = :customer_id');
        foreach ($values as $name => $value) {
            $statement->bindValue(':' . $name, $value);
        }
        $statement->bindValue(':id', $id);
        $statement->bindValue(':customer_id', $customer['id']);
        $statement->execute();
        $db->commit();

        jsonResponse(true, 'Address updated.');
    } catch (Throwable $exception) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        throw $exception;
    }
});
