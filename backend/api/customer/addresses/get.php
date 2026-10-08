<?php

declare(strict_types=1);

require_once __DIR__ . '/../../shared/response.php';
require_once __DIR__ . '/../../shared/request.php';
require_once __DIR__ . '/../../shared/auth.php';
require_once __DIR__ . '/../../shared/customer-addresses.php';

methodOnly('GET');
$customer = getCurrentCustomer();
if (!$customer) {
    jsonResponse(false, 'Customer authentication required.', null, [], 401);
}

safeApi(function () use ($customer): void {
    try {
        $db = apiDatabase();
        $columns = customerAddressColumns($db);
        $order = customerAddressColumn($columns, 'is_default') . ' DESC';
        $order .= isset($columns['created_at'])
            ? ', ' . customerAddressColumn($columns, 'created_at') . ' DESC'
            : ', ' . customerAddressColumn($columns, 'id') . ' DESC';
        $sql = 'SELECT ' . customerAddressSelect($columns)
            . ' FROM customer_addresses WHERE ' . customerAddressColumn($columns, 'customer_id')
            . ' = :customer_id ORDER BY ' . $order;
        $statement = $db->prepare($sql);
        $statement->execute([':customer_id' => $customer['id']]);

        jsonResponse(true, 'Addresses loaded.', $statement->fetchAll());
    } catch (Throwable $exception) {
        error_log('[Customer Addresses GET] ' . $exception->getMessage()
            . ' file=' . $exception->getFile() . ' line=' . $exception->getLine());
        throw $exception;
    }
});
