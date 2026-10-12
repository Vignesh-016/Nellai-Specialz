<?php

declare(strict_types=1);

require_once __DIR__ . '/response.php';

function startAdminSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $sameSite = in_array($origin, ['http://127.0.0.1:5500', 'http://localhost:5500'], true) ? 'None' : 'Lax';
    session_set_cookie_params([
        'httponly' => true,
        'secure' => true,
        'samesite' => $sameSite,
    ]);

    session_start();
}

function startCustomerSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $isLocalOrigin = in_array($origin, ['http://127.0.0.1:5500', 'http://localhost:5500'], true);
    $params = [
        'lifetime' => 0,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        // The frontend and backend are same-site subdomains. Lax is safer and
        // still allows the credentialed same-site requests used by the store.
        'samesite' => $isLocalOrigin ? 'None' : 'Lax',
    ];

    session_name('NELLAI_CUSTOMER_SESSION');
    session_set_cookie_params($params);
    session_start();
}

function refreshCustomerSessionCookie(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE || headers_sent()) {
        return;
    }

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $isLocalOrigin = in_array($origin, ['http://127.0.0.1:5500', 'http://localhost:5500'], true);
    setcookie(session_name(), session_id(), [
        'expires' => 0,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => $isLocalOrigin ? 'None' : 'Lax',
    ]);
}

function getCurrentCustomer(): ?array
{
    startCustomerSession();
    return isset($_SESSION['customer']) && is_array($_SESSION['customer'])
        ? $_SESSION['customer']
        : null;
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
