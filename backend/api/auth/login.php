<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/request.php';
require_once __DIR__ . '/../shared/auth.php';

methodOnly('POST');
startAdminSession();

$input = jsonRequest();
$email = strtolower((string) inputString($input, 'email', true));
$password = (string) inputString($input, 'password', true);
$db = getDbConnection();

if (!$db) {
    jsonResponse(false, 'Database connection unavailable.', null, [], 503);
}

$statement = $db->prepare('SELECT id, name, email, password_hash, role, status FROM admin_users WHERE email = :email LIMIT 1');
$statement->execute([':email' => $email]);
$admin = $statement->fetch();

if (!$admin || $admin['status'] !== 'ACTIVE' || !password_verify($password, $admin['password_hash'])) {
    jsonResponse(false, 'Invalid email or password.', null, [], 401);
}

session_regenerate_id(true);
$_SESSION['admin'] = [
    'id' => (int) $admin['id'],
    'name' => $admin['name'],
    'email' => $admin['email'],
    'role' => $admin['role'],
];

$update = $db->prepare('UPDATE admin_users SET last_login_at = NOW() WHERE id = :id');
$update->execute([':id' => $admin['id']]);

jsonResponse(true, 'Signed in successfully.', $_SESSION['admin']);
