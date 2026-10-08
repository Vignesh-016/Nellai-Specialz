<?php declare(strict_types=1);
require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/request.php';
require_once __DIR__ . '/../shared/auth.php';
methodOnly('POST');
safeApi(function (): void {
    $i = jsonRequest();
    $email = strtolower(inputString($i, 'email', true));
    $db = apiDatabase();
    $q = $db->prepare('SELECT id,name,email,phone,password_hash,status,email_verified_at FROM customers WHERE email=:email LIMIT 1');
    $q->execute([':email' => $email]);
    $c = $q->fetch();
    if (!$c || !password_verify((string) ($i['password'] ?? ''), $c['password_hash']))
        jsonResponse(false, 'Invalid email or password.', null, [], 401);
    if (!$c['email_verified_at'])
        jsonResponse(false, 'Please verify your email before signing in.', null, [], 403, 'EMAIL_NOT_VERIFIED');
    if ($c['status'] !== 'ACTIVE')
        jsonResponse(false, 'This customer account is not active.', null, [], 403);
    startCustomerSession();
    session_regenerate_id(true);
    $_SESSION['customer'] = ['id' => (int) $c['id'], 'email' => $c['email'], 'name' => $c['name']];
    $db->prepare('UPDATE customers SET last_login_at=NOW() WHERE id=:id')->execute([':id' => $c['id']]);
    jsonResponse(true, 'Signed in successfully.', ['id' => (int) $c['id'], 'name' => $c['name'], 'email' => $c['email'], 'phone' => $c['phone']]);
});
