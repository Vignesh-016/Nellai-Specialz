<?php
declare(strict_types=1);

require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/request.php';
require_once __DIR__ . '/../shared/auth.php';

methodOnly('GET');
requireAdmin();

safeApi(function (): void {
    $db = apiDatabase();
    $hasId = array_key_exists('id', $_GET);
    $rawId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if ($hasId && (!$rawId || $rawId < 1)) {
        jsonResponse(false, 'A valid id is required.', null, [], 422);
    }
    $type = strtoupper(trim((string) ($_GET['type'] ?? '')));
    if ($type !== '' && !in_array($type, ['CONTACT', 'BULK_ORDER'], true)) {
        jsonResponse(false, 'Invalid enquiry type.', null, ['type' => 'Select a valid enquiry type.'], 422);
    }

    $where = [];
    $parameters = [];
    if ($hasId) {
        $where[] = 'id = :id';
        $parameters[':id'] = $rawId;
    }
    if ($type !== '') {
        $where[] = 'enquiry_type = :type';
        $parameters[':type'] = $type;
    }

    $statement = $db->prepare(
        'SELECT id, enquiry_type AS type, name, email, phone, subject, message, company_name, address, '
        . 'employee_size, combo_boxes_required, custom_quantity, status, admin_notes, created_at, updated_at '
        . 'FROM enquiries'
        . ($where ? ' WHERE ' . implode(' AND ', $where) : '')
        . ' ORDER BY created_at DESC, id DESC'
    );
    $statement->execute($parameters);
    $rows = $hasId ? $statement->fetch() : $statement->fetchAll();
    if ($hasId && !$rows) {
        jsonResponse(false, 'Enquiry not found.', null, [], 404);
    }
    jsonResponse(true, 'Enquiries loaded.', $rows);
});
