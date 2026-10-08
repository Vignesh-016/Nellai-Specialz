<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/request.php';
require_once __DIR__ . '/../shared/auth.php';

methodOnly('POST');
startAdminSession();

$input = jsonRequest();
$email = strtolower(trim((string) inputString($input, 'email', true)));
$password = (string) inputString($input, 'password', true);
$db = getDbConnection();

if (!$db) {
    jsonResponse(false, 'Database connection unavailable.', null, [], 503);
}

$statement = $db->prepare('SELECT id, name, email, password_hash, email_verified_at, role, status FROM admin_users WHERE email = :email LIMIT 1');
$statement->execute([':email' => $email]);
$admin = $statement->fetch();

if (!$admin || !password_verify($password, $admin['password_hash'])) {
    jsonResponse(false, 'Invalid email or password.', null, [], 401);
}

if (empty($admin['email_verified_at'])) {
    jsonResponse(false, 'Please verify your email.', null, [], 403);
}

if ($admin['status'] === 'PENDING') {
    jsonResponse(false, 'Your admin account is awaiting approval.', null, [], 403);
}

if ($admin['status'] !== 'ACTIVE') {
    jsonResponse(false, 'Your admin account is disabled.', null, [], 403);
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
