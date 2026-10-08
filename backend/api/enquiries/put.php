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
    $allowedStatuses = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    $sets = [];
    $parameters = [':id' => $id];

    if (array_key_exists('status', $input)) {
        $status = is_string($input['status']) ? strtoupper(trim($input['status'])) : '';
        if (!in_array($status, $allowedStatuses, true)) {
            jsonResponse(false, 'Validation failed.', null, ['status' => 'Select a valid enquiry status.'], 422);
        }
        $sets[] = 'status = :status';
        $parameters[':status'] = $status;
    }
    if (array_key_exists('admin_notes', $input)) {
        $notes = is_string($input['admin_notes']) ? trim($input['admin_notes']) : null;
        $noteLength = $notes === null ? 0 : preg_match_all('/./us', $notes, $matches);
        if ($notes === null || $noteLength === false || $noteLength > 3000) {
            jsonResponse(false, 'Validation failed.', null, ['admin_notes' => 'Notes must be 3000 characters or fewer.'], 422);
        }
        $sets[] = 'admin_notes = :admin_notes';
        $parameters[':admin_notes'] = $notes === '' ? null : $notes;
    }
    if ($sets === []) {
        jsonResponse(false, 'No valid fields to update.', null, [], 422);
    }

    $statement = $db->prepare('UPDATE enquiries SET ' . implode(', ', $sets) . ' WHERE id = :id');
    $statement->execute($parameters);
    if ($statement->rowCount() === 0) {
        $exists = $db->prepare('SELECT 1 FROM enquiries WHERE id = :id');
        $exists->execute([':id' => $id]);
        if (!$exists->fetchColumn()) {
            jsonResponse(false, 'Enquiry not found.', null, [], 404);
        }
    }

    jsonResponse(true, 'Enquiry updated successfully.');
});
