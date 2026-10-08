<?php
declare(strict_types=1);

require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/auth.php';

methodOnly('POST');
requireAdmin();

function categoryUploadError(string $message, string $errorCode, int $status): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => $message,
        'data' => ['error_code' => $errorCode],
    ], JSON_UNESCAPED_SLASHES);
    exit;
}

try {
    error_log('[Category Upload] START');
    if (!isset($_FILES['image']) || !is_array($_FILES['image'])) categoryUploadError('No image file was received.', 'NO_FILE_RECEIVED', 422);
    $file = $_FILES['image'];
    $uploadError = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
    error_log('[Category Upload] PHP upload code=' . $uploadError . ' size=' . (int) ($file['size'] ?? 0));
    if ($uploadError !== UPLOAD_ERR_OK) {
        if ($uploadError === UPLOAD_ERR_INI_SIZE || $uploadError === UPLOAD_ERR_FORM_SIZE) categoryUploadError('The selected image is too large.', 'FILE_TOO_LARGE', 413);
        categoryUploadError('The server could not receive the uploaded image.', 'UPLOAD_PHP_ERROR_' . $uploadError, 422);
    }
    $tmp = (string) ($file['tmp_name'] ?? '');
    if ($tmp === '' || !is_uploaded_file($tmp)) categoryUploadError('The uploaded file is invalid.', 'TEMP_FILE_INVALID', 422);
    $size = (int) ($file['size'] ?? 0);
    if ($size <= 0) categoryUploadError('The uploaded image is empty.', 'EMPTY_FILE', 422);
    if ($size > 5 * 1024 * 1024) categoryUploadError('Image must be 5 MB or smaller.', 'FILE_TOO_LARGE', 413);

    $mime = null;
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo !== false) { $mime = finfo_file($finfo, $tmp); finfo_close($finfo); }
    } elseif (function_exists('mime_content_type')) {
        $mime = mime_content_type($tmp);
    }
    if (!is_string($mime) || $mime === '') categoryUploadError('Server image validation is unavailable.', 'FILEINFO_UNAVAILABLE', 500);
    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (!isset($allowed[$mime])) categoryUploadError('Only JPG, PNG and WebP images are allowed.', 'UNSUPPORTED_MIME', 422);
    error_log('[Category Upload] MIME=' . $mime);

    $backendRoot = dirname(__DIR__, 2);
    $uploadDirectory = $backendRoot . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'categories';
    error_log('[Category Upload] target=' . $uploadDirectory);
    if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0755, true) && !is_dir($uploadDirectory)) categoryUploadError('Unable to prepare the image directory.', 'UPLOAD_DIR_CREATE_FAILED', 500);
    if (!is_writable($uploadDirectory)) categoryUploadError('The image directory is not writable.', 'UPLOAD_DIR_NOT_WRITABLE', 500);

    $filename = 'category_' . date('YmdHis') . '_' . bin2hex(random_bytes(8)) . '.' . $allowed[$mime];
    $destination = $uploadDirectory . DIRECTORY_SEPARATOR . $filename;
    if (!move_uploaded_file($tmp, $destination)) categoryUploadError('The server could not save the image.', 'MOVE_UPLOAD_FAILED', 500);
    if (!is_file($destination)) categoryUploadError('The saved image could not be verified.', 'MOVE_UPLOAD_FAILED', 500);
    @chmod($destination, 0644);
    $relativePath = 'uploads/categories/' . $filename;
    error_log('[Category Upload] SUCCESS ' . $relativePath);
    http_response_code(200);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => true, 'message' => 'Image uploaded successfully.', 'data' => ['image' => $relativePath, 'image_url' => 'https://backend.nellaispecialz.com/' . $relativePath]], JSON_UNESCAPED_SLASHES);
    exit;
} catch (Throwable $e) {
    error_log('[Category Upload Fatal] ' . get_class($e) . ': ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    categoryUploadError('Unable to upload category image.', 'UNKNOWN_UPLOAD_ERROR', 500);
}
