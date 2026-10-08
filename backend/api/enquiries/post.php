<?php
declare(strict_types=1);

require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/request.php';

methodOnly('POST');

function enquiryStringLength(string $value): int
{
    $count = preg_match_all('/./us', $value, $matches);
    return $count === false ? strlen($value) : $count;
}

$input = jsonRequest();
$honeypot = isset($input['website']) && is_string($input['website'])
    ? trim($input['website'])
    : '';
if ($honeypot !== '') {
    jsonResponse(false, 'Validation failed.', null, ['website' => 'Invalid submission.'], 422);
}

$errors = [];
$type = strtoupper(trim((string) ($input['type'] ?? $input['enquiry_type'] ?? '')));
if (!in_array($type, ['CONTACT', 'BULK_ORDER'], true)) {
    $errors['type'] = 'Select a valid enquiry type.';
}

$read = static function (string $field, int $maxLength, bool $required = false) use ($input, &$errors): ?string {
    $value = isset($input[$field]) && is_string($input[$field]) ? trim($input[$field]) : '';
    if ($required && $value === '') {
        $errors[$field] = 'This field is required.';
        return null;
    }
    if ($value !== '' && enquiryStringLength($value) > $maxLength) {
        $errors[$field] = "Must be {$maxLength} characters or fewer.";
        return null;
    }

    return $value === '' ? null : $value;
};

$name = $read('name', 150, true);
$email = null;
$phone = null;
$subject = null;
$message = null;
$company = null;
$address = null;
$employeeSize = null;
$comboBoxes = null;
$customQuantity = null;

if ($type === 'CONTACT') {
    $email = $read('email', 255, true);
    if ($email !== null && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Enter a valid email address.';
    }
    $phone = $read('phone', 25);
    $subject = $read('subject', 200, true);
    $message = $read('message', 3000, true);
} elseif ($type === 'BULK_ORDER') {
    $company = $read('company_name', 200, true);
    $address = $read('address', 1000, true);
    $employeeSize = $read('employee_size', 20, true);
    $phone = $read('phone', 25, true);
    $comboBoxes = $read('combo_boxes_required', 20, true);

    if ($employeeSize !== null && !in_array($employeeSize, ['Below 25', '25–50', '51–100', '101–250', '251–500', 'Above 500'], true)) {
        $errors['employee_size'] = 'Select a valid employee size.';
    }
    if ($comboBoxes !== null && !in_array($comboBoxes, ['Below 20', '20 to 50', '50 to 100', 'Customize'], true)) {
        $errors['combo_boxes_required'] = 'Select a valid combo box quantity.';
    }
    if ($phone !== null && !preg_match('/^[0-9+().\-\s]+$/', $phone)) {
        $errors['phone'] = 'Enter a valid phone number.';
    }
    if ($comboBoxes === 'Customize') {
        $quantity = filter_var($input['custom_quantity'] ?? null, FILTER_VALIDATE_INT);
        if ($quantity === false || $quantity < 1 || $quantity > 4294967295) {
            $errors['custom_quantity'] = 'Enter a positive whole number within the supported quantity range.';
        } else {
            $customQuantity = $quantity;
        }
    }
}

if ($phone !== null && !preg_match('/^[0-9+().\-\s]+$/', $phone)) {
    $errors['phone'] = 'Enter a valid phone number.';
}
if ($errors !== []) {
    jsonResponse(false, 'Validation failed.', null, $errors, 422);
}

try {
    require_once __DIR__ . '/../../config/database.php';
    $db = getDbConnection();
    if (!($db instanceof PDO)) {
        throw new RuntimeException('Database connection unavailable for enquiry submission.');
    }
    $statement = $db->prepare(
        'INSERT INTO enquiries '
        . '(enquiry_type, name, company_name, address, employee_size, email, phone, subject, message, combo_boxes_required, custom_quantity) '
        . 'VALUES (:type, :name, :company, :address, :employee_size, :email, :phone, :subject, :message, :combo_boxes, :custom_quantity)'
    );
    $statement->execute([
        ':type' => $type,
        ':name' => $name,
        ':company' => $company,
        ':address' => $address,
        ':employee_size' => $employeeSize,
        ':email' => $email,
        ':phone' => $phone,
        ':subject' => $subject,
        ':message' => $message,
        ':combo_boxes' => $comboBoxes,
        ':custom_quantity' => $customQuantity,
    ]);

    jsonResponse(true, 'Enquiry submitted successfully.', ['id' => (int) $db->lastInsertId()], [], 201);
} catch (PDOException $exception) {
    error_log('[Enquiries POST] ' . $exception);
    jsonResponse(false, 'Unable to submit enquiry right now.', null, [], 500);
} catch (Throwable $exception) {
    error_log('[Enquiries POST] ' . $exception);
    jsonResponse(false, 'Unable to submit enquiry right now.', null, [], 500);
}
