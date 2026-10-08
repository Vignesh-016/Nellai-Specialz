<?php

declare(strict_types=1);

function applyCorsHeaders(): void
{
    $allowed = [
        'https://nellaispecialz.com',
        'https://www.nellaispecialz.com',
        'http://127.0.0.1:5500',
        'http://localhost:5500',
    ];
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '' && in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Vary: Origin');
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

applyCorsHeaders();
header('Content-Type: application/json; charset=utf-8');

function jsonResponse(bool $success, string $message, mixed $data = null, array $errors = [], int $status = 200, ?string $code = null): never
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

    if ($code !== null) {
        $payload['code'] = $code;
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
