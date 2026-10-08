<?php
declare(strict_types=1);
require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/request.php';
require_once __DIR__ . '/../auth/otp-mail.php';
methodOnly('POST');
safeApi(function (): void {
    $i = jsonRequest();
    $email = strtolower(inputString($i, 'email', true));
    $password = inputString($i, 'password', true);
    $name = inputString($i, 'name', true);
    $phone = inputString($i, 'phone');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8)
        jsonResponse(false, 'Please provide valid registration details.', null, [], 422);
    $db = apiDatabase();
    $q = $db->prepare('SELECT id FROM customers WHERE email=:email');
    $q->execute([':email' => $email]);
    if ($q->fetch())
        jsonResponse(false, 'This email is already registered.', null, [], 409);
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $otp = (string) random_int(100000, 999999);
    $db->beginTransaction();
    $q = $db->prepare('INSERT INTO customer_pending_registrations(name,email,phone,password_hash,expires_at) VALUES(:name,:email,:phone,:hash,DATE_ADD(NOW(),INTERVAL 10 MINUTE)) ON DUPLICATE KEY UPDATE name=VALUES(name),phone=VALUES(phone),password_hash=VALUES(password_hash),expires_at=VALUES(expires_at)');
    $q->execute([':name' => $name, ':email' => $email, ':phone' => $phone, ':hash' => $hash]);
    $db->prepare("UPDATE customer_email_otps SET used_at=NOW() WHERE email=:email AND purpose='SIGNUP' AND used_at IS NULL")->execute([':email' => $email]);
    $db->prepare('INSERT INTO customer_email_otps(email,otp_hash,expires_at) VALUES(:email,:hash,DATE_ADD(NOW(),INTERVAL 10 MINUTE))')->execute([':email' => $email, ':hash' => password_hash($otp, PASSWORD_DEFAULT)]);
    $db->commit();
    if (!sendAdminOtpEmail($email, $otp))
        jsonResponse(false, 'We could not send the verification code. Please try again.', null, [], 503);
    jsonResponse(true, 'Verification code sent.', ['email' => $email]);
});
