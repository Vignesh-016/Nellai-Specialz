<?php

declare(strict_types=1);

require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/request.php';
require_once __DIR__ . '/../shared/auth.php';

methodOnly('GET');
$customer = getCurrentCustomer();
if (!$customer) {
    jsonResponse(false, 'Customer authentication required.', null, [], 401);
}

safeApi(function () use ($customer): void {
    $db = apiDatabase();
    $id = array_key_exists('id', $_GET)
        ? filter_var($_GET['id'], FILTER_VALIDATE_INT)
        : null;
    if (array_key_exists('id', $_GET) && (!$id || $id < 1)) {
        jsonResponse(false, 'A valid order id is required.', null, [], 422);
    }

    if ($id) {
        $statement = $db->prepare('SELECT * FROM orders WHERE id = :id AND customer_id = :customer_id');
        $statement->execute([':id' => $id, ':customer_id' => $customer['id']]);
        $order = $statement->fetch();
        if (!$order) {
            jsonResponse(false, 'Order not found.', null, [], 404);
        }
        $items = $db->prepare('SELECT * FROM order_items WHERE order_id = :order_id ORDER BY id');
        $items->execute([':order_id' => $id]);
        $order['items'] = $items->fetchAll();
        jsonResponse(true, 'Order loaded.', $order);
    }

    $statement = $db->prepare(
        'SELECT o.*, COALESCE((SELECT SUM(i.quantity) FROM order_items i WHERE i.order_id = o.id), 0) AS item_count '
        . 'FROM orders o WHERE o.customer_id = :customer_id ORDER BY o.created_at DESC'
    );
    $statement->execute([':customer_id' => $customer['id']]);
    jsonResponse(true, 'Orders loaded.', $statement->fetchAll());
});
