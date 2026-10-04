<?php
declare(strict_types=1);
require_once __DIR__ . '/../shared/response.php'; require_once __DIR__ . '/../shared/request.php'; require_once __DIR__ . '/../shared/auth.php';
methodOnly('POST'); requireAdmin();
safeApi(function (): void {
    $db = apiDatabase(); $input = jsonRequest(); $name = inputString($input, 'name', true); $slug = inputString($input, 'slug', true); $category = (int) ($input['category_id'] ?? 0); $price = (float) ($input['price'] ?? -1); $stock = (int) ($input['stock_quantity'] ?? -1);
    if ($category < 1 || $price < 0 || $stock < 0) { jsonResponse(false, 'Validation failed.', null, ['category_id' => 'Valid category required.', 'price' => 'Price must be non-negative.', 'stock_quantity' => 'Stock must be non-negative.'], 422); }
    $statement = $db->prepare('INSERT INTO products (category_id,name,slug,description,weight,price,sale_price,image,badge,stock_quantity,status) VALUES (:category_id,:name,:slug,:description,:weight,:price,:sale_price,:image,:badge,:stock_quantity,:status)');
    $statement->execute([':category_id'=>$category, ':name'=>$name, ':slug'=>$slug, ':description'=>inputString($input,'description'), ':weight'=>inputString($input,'weight'), ':price'=>$price, ':sale_price'=>$input['sale_price'] ?? null, ':image'=>inputString($input,'image'), ':badge'=>inputString($input,'badge'), ':stock_quantity'=>$stock, ':status'=>$input['status'] ?? 'ACTIVE']);
    jsonResponse(true, 'Product created successfully.', ['id'=>(int)$db->lastInsertId()], [], 201);
});
