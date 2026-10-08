<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../../config/mail.php';

$autoload = __DIR__ . '/../../vendor/autoload.php';

if (is_file($autoload)) {
    require_once $autoload;
} else {
    error_log('[OTP Mail] vendor/autoload.php missing at: ' . $autoload);
}

function sendCustomerPasswordResetEmail(string $email, string $otp): bool
{
    try {
        if (!class_exists(PHPMailer::class)) return false;
        $mail = new PHPMailer(true); $mail->isSMTP(); $mail->Host = SMTP_HOST; $mail->SMTPAuth = true; $mail->Username = SMTP_USERNAME; $mail->Password = SMTP_PASSWORD; $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; $mail->Port = SMTP_PORT; $mail->CharSet = 'UTF-8'; $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME); $mail->addAddress($email); $mail->isHTML(true); $mail->Subject = 'Nellai Specialz Password Reset Code';
        $safeOtp = htmlspecialchars($otp, ENT_QUOTES, 'UTF-8'); $mail->Body = '<h2>Nellai Specialz</h2><p>Your password reset code is:</p><p style="font-size:30px;font-weight:700;letter-spacing:8px">'.$safeOtp.'</p><p>This code expires in 10 minutes.</p><p>If you did not request this, you can ignore this email.</p>'; $mail->AltBody = "Your password reset code is: {$otp}\nThis code expires in 10 minutes."; $mail->send(); return true;
    } catch (Throwable $e) { error_log('[Customer Password Reset Mail] '.$e->getMessage()); return false; }
}

/**
 * Send an OTP verification email via PHPMailer SMTP.
 *
 * Returns true on success, false on any failure.
 * All failures are logged to the PHP error log with safe diagnostics.
 */
function sendAdminOtpEmail(string $email, string $otp): bool
{
    try {
        // ── Dependency checks ──────────────────────────────────────

        if (!extension_loaded('openssl')) {
            error_log('[OTP Mail] OpenSSL PHP extension is unavailable.');
            return false;
        }

        if (!class_exists(PHPMailer::class)) {
            error_log('[OTP Mail] PHPMailer class is unavailable – vendor may not be deployed.');
            return false;
        }

        if (!class_exists(\PHPMailer\PHPMailer\Exception::class)) {
            error_log('[OTP Mail] PHPMailer Exception class is unavailable.');
            return false;
        }

        // ── PHPMailer setup ────────────────────────────────────────

        $mail = new PHPMailer(true);

        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USERNAME;
        $mail->Password   = SMTP_PASSWORD;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;
        $mail->CharSet    = 'UTF-8';

        // ── Temporary SMTP debug (writes to error_log, NOT JSON response) ──
        // Remove this block once email delivery is confirmed working.
        $mail->SMTPDebug   = 2;
        $mail->Debugoutput = static function (string $str, int $level): void {
            error_log('[PHPMailer SMTP][' . $level . '] ' . $str);
        };

        // ── Sender & recipient ─────────────────────────────────────

        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $mail->addAddress($email);

        // ── Email body ─────────────────────────────────────────────

        $mail->isHTML(true);
        $mail->Subject = 'Nellai Specialz Admin Verification Code';

        $safeOtp = htmlspecialchars($otp, ENT_QUOTES, 'UTF-8');

        $mail->Body = '
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial,sans-serif;background:#f7f4ef;padding:30px;">
                <div style="
                    max-width:520px;
                    margin:auto;
                    background:#ffffff;
                    padding:32px;
                    border-radius:12px;
                ">
                    <h2 style="color:#70180f;margin-top:0;">
                        Nellai Specialz
                    </h2>

                    <p>Your admin verification code is:</p>

                    <div style="
                        font-size:32px;
                        font-weight:700;
                        letter-spacing:8px;
                        color:#70180f;
                        margin:24px 0;
                    ">
                        ' . $safeOtp . '
                    </div>

                    <p>
                        This verification code expires in
                        <strong>10 minutes</strong>.
                    </p>

                    <p style="font-size:13px;color:#666;">
                        If you did not request this verification,
                        you can safely ignore this email.
                    </p>
                </div>
            </body>
            </html>
        ';

        $mail->AltBody =
            "Nellai Specialz Admin Verification\n\n" .
            "Your verification code is: {$otp}\n" .
            "This code expires in 10 minutes.\n";

        // ── Send ───────────────────────────────────────────────────

        $mail->send();

        error_log(
            '[OTP Mail] Verification email successfully accepted by SMTP for: ' .
            $email
        );

        return true;

    } catch (\Throwable $e) {
        error_log(
            '[OTP Mail] Send failed: ' . $e->getMessage()
        );

        return false;
    }
}
