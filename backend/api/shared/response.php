<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function jsonResponse(bool $success, string $message, mixed $data = null, array $errors = [], int $status = 200): never
{
    http_response_code($status);

    $payload = [
        'success' => $success,
        'message' => $message,
    ];

    if ($data !== null) {
        $payload['data'] = $data;
    }

    if ($errors !== []) {
        $payload['errors'] = $errors;
    }

    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function methodOnly(string $method): void
{
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        header('Allow: ' . $method);
        jsonResponse(false, 'Method Not Allowed.', null, [], 405);
    }
}
