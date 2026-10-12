<?php
declare(strict_types=1);

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/mail.php';

use PHPMailer\PHPMailer\PHPMailer;

/**
 * Sends an operational notification after a successful database commit.
 * The caller must catch failures so a stored record is never rolled back.
 * @param array<string, scalar|null> $fields
 */
function sendAdminNotification(string $subject, string $heading, array $fields, ?string $replyTo = null): bool
{
    $htmlRows = '';
    $textRows = [];
    foreach ($fields as $label => $value) {
        $display = $value === null || $value === '' ? '-' : (string) $value;
        $htmlRows .= '<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;vertical-align:top">'
            . htmlspecialchars((string) $label, ENT_QUOTES, 'UTF-8')
            . '</td><td style="padding:8px 12px;border-bottom:1px solid #eee;white-space:pre-wrap">'
            . htmlspecialchars($display, ENT_QUOTES, 'UTF-8') . '</td></tr>';
        $textRows[] = (string) $label . ': ' . $display;
    }

    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = SMTP_HOST;
    $mail->SMTPAuth = true;
    $mail->Username = SMTP_USERNAME;
    $mail->Password = SMTP_PASSWORD;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = SMTP_PORT;
    $mail->CharSet = 'UTF-8';
    $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
    $mail->addAddress(ADMIN_NOTIFICATION_EMAIL);
    if ($replyTo !== null && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $mail->addReplyTo($replyTo);
    }
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body = '<!doctype html><html><body style="font-family:Arial,sans-serif;color:#32170d;line-height:1.5">'
        . '<h2 style="color:#8f1d12">Nellai Specialz</h2><h3>'
        . htmlspecialchars($heading, ENT_QUOTES, 'UTF-8') . '</h3>'
        . '<table style="border-collapse:collapse;width:100%;max-width:700px">' . $htmlRows . '</table>'
        . '<p style="color:#666;font-size:12px">This is an automated operational notification.</p>'
        . '</body></html>';
    $mail->AltBody = "Nellai Specialz\n\n" . $heading . "\n\n" . implode("\n", $textRows);
    return $mail->send();
}

/**
 * Notification failures are deliberately logged and never exposed to customers.
 * @param array<string, scalar|null> $fields
 */
function notifyAdminSafely(string $logLabel, string $subject, string $heading, array $fields, ?string $replyTo = null): void
{
    try {
        if (sendAdminNotification($subject, $heading, $fields, $replyTo)) {
            error_log('[' . $logLabel . '] sent');
        } else {
            error_log('[' . $logLabel . ' ERROR] mail transport returned false');
        }
    } catch (Throwable $exception) {
        error_log('[' . $logLabel . ' ERROR] ' . $exception->getMessage());
    }
}
