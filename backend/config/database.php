<?php
/**
 * Database Connection Configuration
 * Nellai Specialz Backend API
 */
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'nellai_specialz');

function getDbConnection() {
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        // Return null if database connection is not yet configured locally
        return null;
    }
}
?>
