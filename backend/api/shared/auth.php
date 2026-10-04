<?php

declare(strict_types=1);

require_once __DIR__ . '/response.php';

function startAdminSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_set_cookie_params([
        'httponly' => true,
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'samesite' => 'Lax',
    ]);

    session_start();
}

function getCurrentAdmin(): ?array
{
    startAdminSession();
    return isset($_SESSION['admin']) && is_array($_SESSION['admin']) ? $_SESSION['admin'] : null;
}

function requireAdmin(): array
{
    $admin = getCurrentAdmin();

    if ($admin === null) {
        jsonResponse(false, 'Authentication required.', null, [], 401);
    }

    return $admin;
}
