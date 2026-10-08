<?php

declare(strict_types=1);

require_once __DIR__ . '/../../shared/response.php';
require_once __DIR__ . '/../../shared/request.php';
require_once __DIR__ . '/../../shared/auth.php';
require_once __DIR__ . '/../../shared/customer-addresses.php';

methodOnly('DELETE');
$customer = getCurrentCustomer();
if (!$customer) {
    jsonResponse(false, 'Customer authentication required.', null, [], 401);
}

safeApi(function () use ($customer): void {
    $id = requestId();
    $db = apiDatabase();
    $columns = customerAddressColumns($db);
    $idColumn = customerAddressColumn($columns, 'id');
    $customerColumn = customerAddressColumn($columns, 'customer_id');
    $defaultColumn = customerAddressColumn($columns, 'is_default');
    $db->beginTransaction();
    try {
        $customerLock = $db->prepare('SELECT id FROM customers WHERE id = :customer_id FOR UPDATE');
        $customerLock->execute([':customer_id' => $customer['id']]);
        if (!$customerLock->fetch()) {
            $db->rollBack();
            jsonResponse(false, 'Customer authentication required.', null, [], 401);
        }
        $find = $db->prepare('SELECT ' . $defaultColumn . ' FROM customer_addresses WHERE '
            . $idColumn . ' = :id AND ' . $customerColumn . ' = :customer_id FOR UPDATE');
        $find->execute([':id' => $id, ':customer_id' => $customer['id']]);
        $wasDefault = $find->fetchColumn();
        if ($wasDefault === false) {
            $db->rollBack();
            jsonResponse(false, 'Address not found.', null, [], 404);
        }

        $delete = $db->prepare('DELETE FROM customer_addresses WHERE ' . $idColumn
            . ' = :id AND ' . $customerColumn . ' = :customer_id');
        $delete->execute([':id' => $id, ':customer_id' => $customer['id']]);
        if ((int) $wasDefault === 1) {
            $order = isset($columns['created_at'])
                ? customerAddressColumn($columns, 'created_at') . ' DESC'
                : $idColumn . ' DESC';
            $next = $db->prepare('SELECT ' . $idColumn . ' FROM customer_addresses WHERE '
                . $customerColumn . ' = :customer_id ORDER BY ' . $order . ' LIMIT 1');
            $next->execute([':customer_id' => $customer['id']]);
            $nextId = $next->fetchColumn();
            if ($nextId !== false) {
                $db->prepare('UPDATE customer_addresses SET ' . $defaultColumn . ' = 1 WHERE '
                    . $idColumn . ' = :id AND ' . $customerColumn . ' = :customer_id')
                    ->execute([':id' => $nextId, ':customer_id' => $customer['id']]);
            }
        }
        $db->commit();

        jsonResponse(true, 'Address deleted.');
    } catch (Throwable $exception) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        throw $exception;
    }
});
