<?php
declare(strict_types=1);
require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/request.php';
require_once __DIR__ . '/../shared/auth.php';
methodOnly('GET');

safeApi(function (): void {
  try {
    $db = apiDatabase();
    $productColumns = schemaColumns($db, 'products');
    if (!$productColumns) {
      throw new RuntimeException('The products table or its columns are unavailable.');
    }

    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    $slug = trim((string) ($_GET['slug'] ?? ''));
    $where = [];
    $params = [];
    $admin = getCurrentAdmin();
    $includeInactive = $admin && filter_var($_GET['include_inactive'] ?? false, FILTER_VALIDATE_BOOLEAN);
    if (!$includeInactive && in_array('status', $productColumns, true))
      $where[] = "UPPER(p.status) = 'ACTIVE'";
    if ($id) {
      $where[] = 'p.id = :id';
      $params[':id'] = $id;
    } elseif ($slug !== '') {
      $where[] = 'p.slug = :slug';
      $params[':slug'] = $slug;
    }
    if (($category = filter_input(INPUT_GET, 'category_id', FILTER_VALIDATE_INT)) && in_array('category_id', $productColumns, true)) {
      $where[] = 'p.category_id = :category_id';
      $params[':category_id'] = $category;
    }

    $joins = '';
    $categoryName = null;
    $subCategoryName = null;
    if (tableExists($db, 'categories')) {
      $categoryColumns = schemaColumns($db, 'categories');
      $categoryName = in_array('name', $categoryColumns, true) ? 'name' : (in_array('category_name', $categoryColumns, true) ? 'category_name' : null);
      if ($categoryName && in_array('category_id', $productColumns, true))
        $joins .= " LEFT JOIN categories c ON c.id = p.category_id";
    }
    if (tableExists($db, 'sub_categories')) {
      $subColumns = schemaColumns($db, 'sub_categories');
      $subCategoryName = in_array('name', $subColumns, true) ? 'name' : (in_array('category_name', $subColumns, true) ? 'category_name' : null);
      if ($subCategoryName && in_array('sub_category_id', $productColumns, true))
        $joins .= " LEFT JOIN sub_categories sc ON sc.id = p.sub_category_id";
    }
    $select = 'p.*';
    if ($categoryName)
      $select .= ', c.' . $categoryName . ' AS category_name';
    if ($subCategoryName)
      $select .= ', sc.' . $subCategoryName . ' AS sub_category_name';
    $order = in_array('created_at', $productColumns, true) ? 'p.created_at DESC' : 'p.id DESC';
    if (in_array('featured', $productColumns, true))
      $order = 'p.featured DESC, ' . $order;
    $sql = "SELECT {$select} FROM products p{$joins}" . ($where ? ' WHERE ' . implode(' AND ', $where) : '') . " ORDER BY {$order}";
    if (!$id && $slug === '') {
      $limit = max(1, min(100, isset($_GET['limit']) ? (int) $_GET['limit'] : 100));
      $sql .= " LIMIT {$limit}";
    }
    $query = $db->prepare($sql);
    $query->execute($params);
    $rows = ($id || $slug !== '') ? [$query->fetch()] : $query->fetchAll();
    if (($id || $slug !== '') && !$rows[0])
      jsonResponse(false, 'Product not found.', null, [], 404);

    $variationColumns = tableExists($db, 'product_variations') ? schemaColumns($db, 'product_variations') : [];
    $imageColumns = tableExists($db, 'product_images') ? schemaColumns($db, 'product_images') : [];
    foreach ($rows as &$row) {
      normalizeProductRow($row, $productColumns);
      $row['variations'] = loadVariations($db, (int) $row['id'], $variationColumns, (bool) $includeInactive);
      $activeVariations = array_filter(
        $row['variations'],
        static fn (array $variation): bool => strtoupper((string) ($variation['status'] ?? 'ACTIVE')) === 'ACTIVE'
      );
      if ((int) ($row['manage_inventory'] ?? 1) === 1 && $activeVariations !== []) {
        $row['stock_quantity'] = array_sum(array_map(
          static fn (array $variation): int => (int) ($variation['stock_quantity'] ?? 0),
          $activeVariations
        ));
        $threshold = (int) ($row['low_stock_threshold'] ?? 0);
        $row['stock_status'] = $row['stock_quantity'] <= 0
          ? 'OUT_OF_STOCK'
          : ($row['stock_quantity'] <= $threshold ? 'LOW_STOCK' : 'IN_STOCK');
      }
      $row['images'] = loadImages($db, (int) $row['id'], $imageColumns);
    }
    jsonResponse(true, 'Products loaded.', ($id || $slug !== '') ? $rows[0] : $rows);
  } catch (Throwable $e) {
    error_log('[Products GET] ' . $e->getMessage() . ' | file=' . $e->getFile() . ' | line=' . $e->getLine());
    throw $e;
  }
});

function schemaColumns(PDO $db, string $table): array
{
  $q = $db->prepare('SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table ORDER BY ORDINAL_POSITION');
  $q->execute([':table' => $table]);
  return array_column($q->fetchAll(), 'COLUMN_NAME');
}
function tableExists(PDO $db, string $table): bool
{
  $q = $db->prepare('SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table');
  $q->execute([':table' => $table]);
  return (bool) $q->fetchColumn();
}
function normalizeProductRow(array &$row, array $columns): void
{
  $row['category_id'] = isset($row['category_id']) ? (int) $row['category_id'] : null;
  $row['sub_category_id'] = array_key_exists('sub_category_id', $row) && $row['sub_category_id'] !== null ? (int) $row['sub_category_id'] : null;
  if (!isset($row['selling_price']) || (float) $row['selling_price'] <= 0) {
    foreach (['offer_price', 'sale_price', 'price'] as $fallbackPrice) {
      if (isset($row[$fallbackPrice]) && (float) $row[$fallbackPrice] > 0) {
        $row['selling_price'] = $row[$fallbackPrice];
        break;
      }
    }
  }
  if (!array_key_exists('main_image', $row) || !$row['main_image'])
    $row['main_image'] = $row['image'] ?? null;
  $stock = (int) ($row['stock_quantity'] ?? 0);
  $threshold = (int) ($row['low_stock_threshold'] ?? 0);
  $row['stock_status'] = $row['stock_status'] ?? ($stock <= 0 ? 'OUT_OF_STOCK' : ($stock <= $threshold ? 'LOW_STOCK' : 'IN_STOCK'));
}
function loadVariations(PDO $db, int $productId, array $columns, bool $includeInactive = false): array
{
  if (!$columns || !in_array('product_id', $columns, true))
    return [];
  $select = array_values(array_intersect(['id', 'product_id', 'variation_name', 'sku', 'weight', 'weight_unit', 'selling_price', 'strike_price', 'stock_quantity', 'status'], $columns));
  if (in_array('selling_price', $columns, true) === false && in_array('price', $columns, true))
    $select[] = 'price AS selling_price';
  if (in_array('stock_quantity', $columns, true) === false && in_array('stock', $columns, true))
    $select[] = 'stock AS stock_quantity';
  if (!$select)
    return [];
  $where = 'product_id = :product_id';
  if (in_array('status', $columns, true) && !$includeInactive)
    $where .= " AND UPPER(status) = 'ACTIVE'";
  $q = $db->prepare('SELECT ' . implode(',', $select) . ' FROM product_variations WHERE ' . $where . ' ORDER BY id');
  $q->execute([':product_id' => $productId]);
  return array_map(static function (array $variation): array {
    $variation['id'] = (int) $variation['id'];
    if (isset($variation['product_id'])) {
      $variation['product_id'] = (int) $variation['product_id'];
    }
    if (isset($variation['stock_quantity'])) {
      $variation['stock_quantity'] = (int) $variation['stock_quantity'];
    }
    foreach (['weight', 'selling_price', 'strike_price'] as $numericColumn) {
      if (array_key_exists($numericColumn, $variation) && $variation[$numericColumn] !== null) {
        $variation[$numericColumn] = (float) $variation[$numericColumn];
      }
    }
    return $variation;
  }, $q->fetchAll());
}
function loadImages(PDO $db, int $productId, array $columns): array
{
  if (!$columns || !in_array('product_id', $columns, true))
    return [];
  $select = ['id', 'image_path'];
  if (!in_array('id', $columns, true) || !in_array('image_path', $columns, true))
    return [];
  $order = [];
  if (in_array('is_primary', $columns, true))
    $order[] = 'is_primary DESC';
  if (in_array('sort_order', $columns, true))
    $order[] = 'sort_order';
  $order[] = 'id';
  $q = $db->prepare('SELECT ' . implode(',', $select) . ' FROM product_images WHERE product_id = :product_id ORDER BY ' . implode(', ', $order));
  $q->execute([':product_id' => $productId]);
  return array_map(static fn(array $image): array => ['id' => (int) $image['id'], 'image_url' => normalizeProductImageUrl($image['image_path'])], $q->fetchAll());
}
function normalizeProductImageUrl(?string $path): ?string
{
  if (!$path)
    return null;
  if (preg_match('#^https?://#i', $path))
    return $path;
  return 'https://backend.nellaispecialz.com/' . ltrim($path, '/');
}
