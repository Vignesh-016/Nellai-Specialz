<?php declare(strict_types=1);
require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/request.php';
require_once __DIR__ . '/../shared/auth.php';
methodOnly('GET');
safeApi(function (): void {
    $customer = requireCustomer();
    $id = (int) $customer['id'];
    $db = apiDatabase();
    $q = $db->prepare('SELECT id,name,email,phone,status FROM customers WHERE id=:id AND status="ACTIVE"');
    $q->execute([':id' => $id]);
    $c = $q->fetch();
    if (!$c)
        jsonResponse(false, 'Customer authentication required.', null, [], 401);
    jsonResponse(true, 'Authenticated customer.', $c);
});
