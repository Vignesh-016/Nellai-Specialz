<?php
declare(strict_types=1);

define('DB_HOST', 'localhost');
define('DB_NAME', 'u737525190_nellaispecialz');
define('DB_USER', 'u737525190_Nellaispecialz');
define('DB_PASS', 'Nellai@1234#');

function getDbConnection(): ?PDO
{
    try {
        return new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]
        );
    } catch (PDOException $e) {
        error_log('Database connection failed: ' . $e->getMessage());
        return null;
    }
}