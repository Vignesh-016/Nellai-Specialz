<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "This script must be run from the command line.\n");
    exit(1);
}

require_once __DIR__ . '/../config/database.php';

function prompt(string $label): string
{
    $value = readline($label);
    return trim($value === false ? '' : $value);
}

$name = prompt('Admin name: ');
$email = prompt('Admin email: ');
$password = prompt('Admin password: ');

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 12) {
    fwrite(STDERR, "Name, valid email, and a password of at least 12 characters are required.\n");
    exit(1);
}

$db = getDbConnection();

if (!$db) {
    fwrite(STDERR, "Database connection failed. Check backend/config/database.php.\n");
    exit(1);
}

$statement = $db->prepare(
    'INSERT INTO admin_users (name, email, password_hash) VALUES (:name, :email, :password_hash)'
);

try {
    $statement->execute([
        ':name' => $name,
        ':email' => strtolower($email),
        ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
    ]);

    fwrite(STDOUT, "Admin account created successfully.\n");
} catch (PDOException $exception) {
    fwrite(STDERR, "Unable to create admin account. The email may already exist.\n");
    exit(1);
}
