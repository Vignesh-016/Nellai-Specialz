<?php
declare(strict_types=1);
require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/request.php';
require_once __DIR__ . '/../shared/auth.php';
methodOnly('PUT');
requireAdmin();
safeApi(function (): void {
    $db = apiDatabase();
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($id <= 0) jsonResponse(false, 'A valid category id is required.', null, [], 422);
    $existing = $db->prepare('SELECT id, image FROM categories WHERE id = :id LIMIT 1');
    $existing->execute([':id' => $id]);
    $category = $existing->fetch();
    if (!$category) jsonResponse(false, 'Category not found.', null, [], 404);

    $input = jsonRequest();
    $name = inputString($input, 'name', true);
    $slug = inputString($input, 'slug', true);
    $status = strtoupper((string) ($input['status'] ?? 'ACTIVE'));
    if (!in_array($status, ['ACTIVE', 'INACTIVE'], true)) {
        jsonResponse(false, 'Invalid category status.', null, ['status' => 'Use ACTIVE or INACTIVE.'], 422);
    }
    $duplicate = $db->prepare('SELECT id FROM categories WHERE slug = :slug AND id <> :id LIMIT 1');
    $duplicate->execute([':slug' => $slug, ':id' => $id]);
    if ($duplicate->fetch()) jsonResponse(false, 'Another category already uses this slug.', null, ['slug' => 'Slug must be unique.'], 409);

    $image = array_key_exists('image', $input) && trim((string) $input['image']) !== ''
        ? trim((string) $input['image']) : $category['image'];
    $update = $db->prepare('UPDATE categories SET name=:name, slug=:slug, description=:description, image=:image, status=:status, sort_order=:sort_order, updated_at=NOW() WHERE id=:id');
    $update->execute([
        ':name' => $name,
        ':slug' => $slug,
        ':description' => inputString($input, 'description'),
        ':image' => $image,
        ':status' => $status,
        ':sort_order' => (int) ($input['sort_order'] ?? 0),
        ':id' => $id,
    ]);
    jsonResponse(true, 'Category updated successfully.', ['id' => $id]);
});
