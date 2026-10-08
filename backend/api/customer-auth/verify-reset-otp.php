<?php
declare(strict_types=1);

require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/request.php';

methodOnly('POST');

function customerResetSchemaReady(PDO $db): bool
{
    $required = [
        'customer_email_otps' => ['id', 'email', 'otp_hash', 'purpose', 'expires_at', 'attempts', 'used_at', 'created_at'],
        'customer_password_resets' => ['id', 'customer_id', 'token_hash', 'expires_at', 'used_at', 'created_at'],
        'customers' => ['id', 'email', 'status'],
    ];

    foreach ($required as $table => $columns) {
        $statement = $db->query('SHOW COLUMNS FROM `' . $table . '`');
        $actual = array_column($statement->fetchAll(), 'Field');
        if (array_diff($columns, $actual) !== []) {
            return false;
        }
    }

    return true;
}

safeApi(function (): void {
    $input = jsonRequest();
    $email = strtolower(inputString($input, 'email', true));
    $otp = preg_replace('/\D+/', '', (string) ($input['otp'] ?? ''));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($otp) !== 6) {
        jsonResponse(false, 'Invalid verification code.', null, [], 422);
    }

    $db = apiDatabase();
    try {
        if (!customerResetSchemaReady($db)) {
            jsonResponse(false, 'Password reset service is temporarily unavailable.', null, [], 503, 'RESET_SCHEMA_NOT_READY');
        }
    } catch (Throwable $exception) {
        error_log('[Customer Reset OTP Verify] ' . get_class($exception) . ': ' . $exception->getMessage() . ' | ' . $exception->getFile() . ':' . $exception->getLine());
        jsonResponse(false, 'Password reset service is temporarily unavailable.', null, [], 503, 'RESET_SCHEMA_NOT_READY');
    }
    $query = $db->prepare(
        "SELECT id, email, otp_hash, expires_at, attempts, used_at
         FROM customer_email_otps
         WHERE email = :email
           AND purpose = 'PASSWORD_RESET'
           AND used_at IS NULL
         ORDER BY id DESC
         LIMIT 1"
    );
    $query->execute([':email' => $email]);
    $otpRow = $query->fetch();

    if (!$otpRow) {
        jsonResponse(false, 'Invalid verification code.', null, [], 422);
    }

    if (strtotime((string) $otpRow['expires_at']) <= time()) {
        jsonResponse(false, 'This verification code has expired. Please request a new one.', null, [], 410);
    }

    if ((int) $otpRow['attempts'] >= 5) {
        jsonResponse(false, 'Too many verification attempts. Please request a new code.', null, [], 429);
    }

    if (!password_verify($otp, (string) $otpRow['otp_hash'])) {
        $db->prepare('UPDATE customer_email_otps SET attempts = attempts + 1 WHERE id = :id')
            ->execute([':id' => $otpRow['id']]);
        jsonResponse(false, 'Invalid verification code.', null, [], 422);
    }

    $query = $db->prepare("SELECT id FROM customers WHERE email = :email AND status = 'ACTIVE' LIMIT 1");
    $query->execute([':email' => $email]);
    $customer = $query->fetch();
    if (!$customer) {
        jsonResponse(false, 'Invalid verification code.', null, [], 422);
    }

    $rawToken = bin2hex(random_bytes(32));

    try {
        $db->beginTransaction();
        $db->prepare('UPDATE customer_email_otps SET used_at = NOW() WHERE id = :id')
            ->execute([':id' => $otpRow['id']]);
        $db->prepare('UPDATE customer_password_resets SET used_at = NOW() WHERE customer_id = :customer_id AND used_at IS NULL')
            ->execute([':customer_id' => $customer['id']]);
        $db->prepare(
            'INSERT INTO customer_password_resets (customer_id, token_hash, expires_at, used_at)
             VALUES (:customer_id, :token_hash, DATE_ADD(NOW(), INTERVAL 15 MINUTE), NULL)'
        )->execute([
            ':customer_id' => $customer['id'],
            ':token_hash' => hash('sha256', $rawToken),
        ]);
        $db->commit();
    } catch (Throwable $exception) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        error_log('[Customer Reset OTP Verify] ' . get_class($exception) . ': ' . $exception->getMessage() . ' | ' . $exception->getFile() . ':' . $exception->getLine());
        throw $exception;
    }

    jsonResponse(true, 'Verification successful.', ['reset_token' => $rawToken]);
});
