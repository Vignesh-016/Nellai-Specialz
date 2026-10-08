<?php

declare(strict_types=1);

function jsonRequest(): array
{
    $raw = file_get_contents('php://input');

    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);

    if (!is_array($data)) {
        require_once __DIR__ . '/response.php';
        jsonResponse(false, 'Request body must contain valid JSON.', null, [], 400);
    }

    return $data;
}

function inputString(array $input, string $key, bool $required = false): ?string
{
    $value = isset($input[$key]) && is_string($input[$key]) ? trim($input[$key]) : null;

    if ($required && ($value === null || $value === '')) {
        require_once __DIR__ . '/response.php';
        jsonResponse(false, 'Validation failed.', null, [$key => 'This field is required.'], 422);
    }

    return $value === '' ? null : $value;
}

function apiDatabase(): PDO
{
    require_once __DIR__ . '/../../config/database.php';
    require_once __DIR__ . '/response.php';
    $db = getDbConnection();

    if (!$db) {
        jsonResponse(false, 'Database connection unavailable.', null, [], 503);
    }

    return $db;
}

function requestId(): int
{
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

    if (!$id || $id < 1) {
        require_once __DIR__ . '/response.php';
        jsonResponse(false, 'A valid id is required.', null, [], 422);
    }

    return $id;
}

function safeApi(callable $callback): never
{
    require_once __DIR__ . '/response.php';

    try {
        $callback();
    } catch (PDOException $exception) {
        error_log($exception->getMessage());
        $status = str_contains($exception->getMessage(), 'Duplicate entry') ? 409 : 500;
        jsonResponse(false, $status === 409 ? 'A record with this value already exists.' : 'Internal server error.', null, [], $status);
    } catch (Throwable $exception) {
        error_log($exception->getMessage());
        jsonResponse(false, 'Internal server error.', null, [], 500);
    }

    exit;
}
