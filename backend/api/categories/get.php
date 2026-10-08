<?php
declare(strict_types=1);
require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/request.php';

function publicCategoryAssetUrl(?string $path): ?string
{
    $path = trim((string) $path);
    if ($path === '') return null;
    if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) return $path;
    return 'https://backend.nellaispecialz.com/' . ltrim($path, '/');
}

methodOnly('GET');
safeApi(function (): void {
    $db = apiDatabase();
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    $sql = $id
        ? 'SELECT c.*, COUNT(sc.id) AS sub_category_count FROM categories c LEFT JOIN sub_categories sc ON sc.category_id=c.id WHERE c.id=:id GROUP BY c.id'
        : 'SELECT c.*, COUNT(sc.id) AS sub_category_count FROM categories c LEFT JOIN sub_categories sc ON sc.category_id=c.id GROUP BY c.id ORDER BY c.sort_order,c.name';
    $query = $db->prepare($sql);
    $query->execute($id ? [':id' => $id] : []);
    $data = $id ? $query->fetch() : $query->fetchAll();
    if ($id && !$data) jsonResponse(false, 'Category not found.', null, [], 404);
    $normalize = static function (array $category): array {
        $category['image_url'] = publicCategoryAssetUrl($category['image'] ?? null);
        return $category;
    };
    $data = $id ? $normalize($data) : array_map($normalize, $data);
    jsonResponse(true, 'Categories loaded.', $data);
});
