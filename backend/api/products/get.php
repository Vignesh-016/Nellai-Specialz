<?php
declare(strict_types=1);
require_once __DIR__ . '/../shared/response.php'; require_once __DIR__ . '/../shared/request.php';
methodOnly('GET');
safeApi(function (): void {
    $db = apiDatabase(); $sql = 'SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON c.id = p.category_id'; $params = [];
    if ($id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT)) { $sql .= ' WHERE p.id = :id'; $params[':id'] = $id; }
    else { $sql .= ' ORDER BY p.created_at DESC'; }
    $statement = $db->prepare($sql); $statement->execute($params); $data = $id ? $statement->fetch() : $statement->fetchAll();
    if ($id && !$data) { jsonResponse(false, 'Product not found.', null, [], 404); }
    jsonResponse(true, 'Products loaded.', $data);
});
