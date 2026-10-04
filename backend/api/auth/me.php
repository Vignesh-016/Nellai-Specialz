<?php

declare(strict_types=1);

require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/auth.php';

methodOnly('GET');
jsonResponse(true, 'Authenticated admin.', requireAdmin());
