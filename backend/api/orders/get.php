<?php

declare(strict_types=1);

require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/request.php';
require_once __DIR__ . '/../shared/auth.php';

methodOnly('GET');
requireAdmin();

safeApi(function (): void {
    $db = apiDatabase();
    $id = array_key_exists('id', $_GET)
        ? filter_var($_GET['id'], FILTER_VALIDATE_INT)
        : null;
    if (array_key_exists('id', $_GET) && (!$id || $id < 1)) {
        jsonResponse(false, 'A valid order id is required.', null, [], 422);
    }

    if ($id) {
        $statement = $db->prepare(
            'SELECT o.*, c.email AS customer_email, c.phone AS customer_phone, '
            . 'COALESCE((SELECT SUM(i.quantity) FROM order_items i WHERE i.order_id = o.id), 0) AS item_count '
            . 'FROM orders o LEFT JOIN customers c ON c.id = o.customer_id WHERE o.id = :id'
        );
        $statement->execute([':id' => $id]);
        $order = $statement->fetch();
        if (!$order) {
            jsonResponse(false, 'Order not found.', null, [], 404);
        }
        $items = $db->prepare('SELECT * FROM order_items WHERE order_id = :order_id ORDER BY id');
        $items->execute([':order_id' => $id]);
        $order['items'] = $items->fetchAll();
        jsonResponse(true, 'Order loaded.', $order);
    }

    $statement = $db->query(
        'SELECT o.*, COALESCE((SELECT SUM(i.quantity) FROM order_items i WHERE i.order_id = o.id), 0) AS item_count '
        . 'FROM orders o ORDER BY o.created_at DESC LIMIT 100'
    );
    jsonResponse(true, 'Orders loaded.', $statement->fetchAll());
});
