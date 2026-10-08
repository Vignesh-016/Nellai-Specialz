<?php
declare(strict_types=1);

require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/request.php';
require_once __DIR__ . '/../shared/auth.php';

final class ProductImageUploadException extends RuntimeException
{
    public int $httpStatus;

    public function __construct(string $message, int $httpStatus = 422)
    {
        parent::__construct($message);
        $this->httpStatus = $httpStatus;
    }
}

methodOnly('POST');
requireAdmin();

safeApi(function (): void {
    $db = null;
    $newFiles = [];

    try {
        $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
        if ($contentLength > 0 && $_POST === [] && $_FILES === []) {
            throw new ProductImageUploadException('The upload exceeds the server request-size limit.', 413);
        }
        $productId = filter_var($_POST['product_id'] ?? null, FILTER_VALIDATE_INT);
        if (!$productId || $productId < 1) {
            throw new ProductImageUploadException('A valid product_id is required.');
        }

        $db = apiDatabase();
        $productQuery = $db->prepare('SELECT id, main_image FROM products WHERE id = :id');
        $productQuery->execute([':id' => $productId]);
        $product = $productQuery->fetch();
        if (!$product) {
            throw new ProductImageUploadException('Product not found.', 404);
        }

        $files = [];
        if (isset($_FILES['main_image'])) {
            $files[] = ['file' => $_FILES['main_image'], 'main' => true];
        }

        $galleryUpload = $_FILES['gallery_images'] ?? null;
        if (is_array($galleryUpload['tmp_name'] ?? null)) {
            foreach ($galleryUpload['tmp_name'] as $index => $temporaryPath) {
                $files[] = [
                    'file' => [
                        'tmp_name' => $temporaryPath,
                        'error' => $galleryUpload['error'][$index] ?? UPLOAD_ERR_NO_FILE,
                        'size' => $galleryUpload['size'][$index] ?? 0,
                    ],
                    'main' => false,
                ];
            }
        }

        $files = array_values(array_filter(
            $files,
            static fn (array $item): bool => (int) ($item['file']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE
        ));
        if ($files === []) {
            throw new ProductImageUploadException('Choose at least one JPG, PNG, or WebP image to upload.');
        }

        $galleryCount = count(array_filter($files, static fn (array $item): bool => !$item['main']));
        $imageColumns = [];
        if ($galleryCount > 0) {
            $imageColumns = uploadSchemaColumns($db, 'product_images');
            if (!in_array('product_id', $imageColumns, true) || !in_array('image_path', $imageColumns, true)) {
                throw new ProductImageUploadException('Product gallery storage is not installed. Run the product database migrations.', 503);
            }
        }

        $uploadDirectory = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'products' . DIRECTORY_SEPARATOR;
        if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0755, true) && !is_dir($uploadDirectory)) {
            throw new ProductImageUploadException('The product image directory could not be created. Check server storage permissions.', 500);
        }
        if (!is_writable($uploadDirectory)) {
            throw new ProductImageUploadException('The product image directory is not writable. Check server storage permissions.', 500);
        }

        $mimeMap = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        ];
        $fileInfo = class_exists('finfo') ? new finfo(FILEINFO_MIME_TYPE) : null;
        if (!$fileInfo && !function_exists('mime_content_type')) {
            throw new ProductImageUploadException('The server cannot validate image files because the Fileinfo extension is unavailable.', 500);
        }

        foreach ($files as $item) {
            $file = $item['file'];
            $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
            if ($error !== UPLOAD_ERR_OK) {
                $message = match ($error) {
                    UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'An image exceeds the server upload limit.',
                    UPLOAD_ERR_PARTIAL => 'An image upload was interrupted. Please try again.',
                    UPLOAD_ERR_NO_TMP_DIR => 'The server upload temporary directory is unavailable.',
                    UPLOAD_ERR_CANT_WRITE => 'The server could not write an uploaded image.',
                    default => 'An image upload failed. Please try again.',
                };
                $status = in_array($error, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true) ? 413 : 422;
                throw new ProductImageUploadException($message, $status);
            }

            $temporaryPath = (string) ($file['tmp_name'] ?? '');
            if ($temporaryPath === '' || !is_uploaded_file($temporaryPath)) {
                throw new ProductImageUploadException('The uploaded image could not be verified.');
            }
            if ((int) ($file['size'] ?? 0) > 5 * 1024 * 1024) {
                throw new ProductImageUploadException('Each image must be 5 MB or smaller.', 413);
            }

            $mimeType = $fileInfo ? $fileInfo->file($temporaryPath) : mime_content_type($temporaryPath);
            if (!is_string($mimeType) || !isset($mimeMap[$mimeType])) {
                throw new ProductImageUploadException('Only JPG, PNG, and WebP images are allowed.');
            }

            $filename = 'product_' . $productId . '_' . bin2hex(random_bytes(10)) . '.' . $mimeMap[$mimeType];
            $targetPath = $uploadDirectory . $filename;
            if (!move_uploaded_file($temporaryPath, $targetPath)) {
                throw new ProductImageUploadException('The server could not store the image. Check server storage permissions.', 500);
            }

            $newFiles[] = $targetPath;
            $relativePath = 'uploads/products/' . $filename;
            if ($item['main']) {
                $mainImage = $relativePath;
            } else {
                $galleryImages[] = $relativePath;
            }
        }

        $db->beginTransaction();
        if (isset($mainImage)) {
            $db->prepare('UPDATE products SET main_image = :path WHERE id = :id')
                ->execute([':path' => $mainImage, ':id' => $productId]);
        }

        if (!empty($galleryImages)) {
            $sortOrder = 0;
            if (in_array('sort_order', $imageColumns, true)) {
                $sortQuery = $db->prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 FROM product_images WHERE product_id = :id');
                $sortQuery->execute([':id' => $productId]);
                $sortOrder = (int) $sortQuery->fetchColumn();
            }

            foreach ($galleryImages as $path) {
                $columns = ['product_id', 'image_path'];
                $values = [':product_id' => $productId, ':image_path' => $path];
                if (in_array('is_primary', $imageColumns, true)) {
                    $columns[] = 'is_primary';
                    $values[':is_primary'] = 0;
                }
                if (in_array('sort_order', $imageColumns, true)) {
                    $columns[] = 'sort_order';
                    $values[':sort_order'] = $sortOrder++;
                }
                $db->prepare(
                    'INSERT INTO product_images (' . implode(',', $columns) . ') VALUES (' . implode(',', array_keys($values)) . ')'
                )->execute($values);
            }
        }
        $db->commit();

        $mainImagePath = $mainImage ?? ($product['main_image'] ?? null);
        $responseImages = array_map(
            static fn (string $path): array => ['image_url' => 'https://backend.nellaispecialz.com/' . $path],
            $galleryImages ?? []
        );
        jsonResponse(true, 'Images uploaded.', [
            'main_image' => $mainImagePath ? 'https://backend.nellaispecialz.com/' . $mainImagePath : null,
            'images' => $responseImages,
        ]);
    } catch (Throwable $exception) {
        if ($db instanceof PDO && $db->inTransaction()) {
            $db->rollBack();
        }
        foreach ($newFiles as $filePath) {
            if (is_file($filePath)) {
                unlink($filePath);
            }
        }

        error_log('[Product Upload] ' . $exception->getMessage() . ' | file=' . $exception->getFile() . ' | line=' . $exception->getLine());
        if ($exception instanceof ProductImageUploadException) {
            jsonResponse(false, $exception->getMessage(), null, [], $exception->httpStatus);
        }

        jsonResponse(false, 'Image upload could not be saved. Check the product image database and server storage configuration.', null, [], 500);
    }
});

function uploadSchemaColumns(PDO $db, string $table): array
{
    $query = $db->prepare(
        'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table'
    );
    $query->execute([':table' => $table]);
    return array_column($query->fetchAll(), 'COLUMN_NAME');
}
