<?php
/**
 * Backend API Entry Point
 * Nellai Specialz REST API Backend
 */
header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'app' => 'Nellai Specialz Backend REST API',
    'version' => '1.0.0',
    'status' => 'online',
    'endpoints' => [
        'products' => '/backend/api/products.php',
        'categories' => '/backend/api/categories.php',
        'offers' => '/backend/api/offers.php'
    ]
]);
?>
