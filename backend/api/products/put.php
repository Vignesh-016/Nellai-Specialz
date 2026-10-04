<?php
declare(strict_types=1);
require_once __DIR__ . '/../shared/response.php'; require_once __DIR__ . '/../shared/request.php'; require_once __DIR__ . '/../shared/auth.php';
methodOnly('PUT'); requireAdmin();
safeApi(function (): void {
    $db=apiDatabase(); $id=requestId(); $input=jsonRequest(); $fields=['category_id','name','slug','description','weight','price','sale_price','image','badge','stock_quantity','status']; $sets=[]; $params=[':id'=>$id];
    foreach($fields as $field){ if(array_key_exists($field,$input)){ $sets[]="$field = :$field"; $params[":$field"]=$input[$field]; }} if(!$sets){jsonResponse(false,'No fields to update.',null,[],422);}
    $statement=$db->prepare('UPDATE products SET '.implode(', ',$sets).' WHERE id = :id'); $statement->execute($params); if(!$statement->rowCount()){jsonResponse(false,'Product not found or unchanged.',null,[],404);} jsonResponse(true,'Product updated successfully.');
});
