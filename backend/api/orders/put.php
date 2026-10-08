<?php

declare(strict_types=1);

require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/request.php';
require_once __DIR__ . '/../shared/auth.php';

methodOnly('PUT');
requireAdmin();

safeApi(function (): void {
    $db = apiDatabase();
    $id = requestId();
    $input = jsonRequest();
    $fields = ['order_status', 'payment_status', 'notes'];
    $set = [];
    $parameters = [':id' => $id];

    foreach ($fields as $field) {
        if (!array_key_exists($field, $input)) {
            continue;
        }
        if ($field === 'notes') {
            $set[] = 'notes = :notes';
            $parameters[':notes'] = is_string($input['notes']) ? trim($input['notes']) : null;
            continue;
        }

        $value = strtoupper(trim((string) $input[$field]));
        $column = $db->prepare(
            'SELECT COLUMN_TYPE FROM information_schema.COLUMNS '
            . 'WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND COLUMN_NAME = :column'
        );
        $column->execute([':table' => 'orders', ':column' => $field]);
        $columnType = $column->fetchColumn();
        if (!is_string($columnType)) {
            throw new RuntimeException('The orders.' . $field . ' column is unavailable.');
        }
        preg_match_all("/'((?:[^'\\\\]|\\\\.)*)'/", $columnType, $matches);
        $allowed = array_map(static fn(string $item): string => strtoupper(stripslashes($item)), $matches[1] ?? []);
        if ($allowed !== [] && !in_array($value, $allowed, true)) {
            jsonResponse(false, 'Validation failed.', null, [$field => 'Choose a status supported by the database.'], 422);
        }
        if ($allowed === [] && $value === '') {
            jsonResponse(false, 'Validation failed.', null, [$field => 'A value is required.'], 422);
        }
        $set[] = $field . ' = :' . $field;
        $parameters[':' . $field] = $value;
    }

    if ($set === []) {
        jsonResponse(false, 'No fields to update.', null, [], 422);
    }

    $exists = $db->prepare('SELECT id FROM orders WHERE id = :id');
    $exists->execute([':id' => $id]);
    if (!$exists->fetch()) {
        jsonResponse(false, 'Order not found.', null, [], 404);
    }

    $statement = $db->prepare('UPDATE orders SET ' . implode(', ', $set) . ' WHERE id = :id');
    $statement->execute($parameters);
    jsonResponse(true, 'Order updated.');
});
