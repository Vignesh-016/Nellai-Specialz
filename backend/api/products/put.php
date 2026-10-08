<?php
declare(strict_types=1);
require_once __DIR__.'/../shared/response.php'; require_once __DIR__.'/../shared/request.php'; require_once __DIR__.'/../shared/auth.php';
methodOnly('PUT'); requireAdmin();
safeApi(function(): void {
  $db = apiDatabase(); $id = requestId(); $i = jsonRequest();
  if (isset($i['variations']) && !is_array($i['variations'])) {
    jsonResponse(false, 'Product variations must be an array.', null, [], 422);
  }
  $db->beginTransaction();
  $stock=max(0,(int)($i['stock_quantity']??0)); $threshold=max(0,(int)($i['low_stock_threshold']??5));
  $fields=['name','slug','sku','short_description','description','category_id','sub_category_id','selling_price','strike_price','offer_price','weight','weight_unit','ingredient_type','key_ingredients','storage_shelf_life','manage_inventory','stock_quantity','low_stock_threshold','status','featured','is_combo_offer','show_in_hero','main_image'];
  $set=[]; $p=[':id'=>$id]; foreach($fields as $f) if(array_key_exists($f,$i)){ $set[]="$f=:$f"; $p[":$f"]=$i[$f]; }
  if(array_key_exists('stock_quantity',$i)||array_key_exists('low_stock_threshold',$i)){ $set[]='stock_status=:stock_status'; $p[':stock_status']=$stock<=0?'OUT_OF_STOCK':($stock<=$threshold?'LOW_STOCK':'IN_STOCK'); }
  if(!$set) jsonResponse(false,'No fields to update.',null,[],422);
  $q=$db->prepare('UPDATE products SET '.implode(',',$set).' WHERE id=:id'); $q->execute($p);
  if ($q->rowCount() === 0) {
    $exists = $db->prepare('SELECT 1 FROM products WHERE id = :id');
    $exists->execute([':id' => $id]);
    if (!$exists->fetchColumn()) {
      jsonResponse(false, 'Product not found.', null, [], 404);
    }
  }
  if(array_key_exists('variations',$i)){ saveVariations($db,$id,$i['variations']); }
  $db->commit(); jsonResponse(true,'Product updated successfully.');
});
function saveVariations(PDO $db,int $id,array $items):void {
  $existingQuery=$db->prepare('SELECT id FROM product_variations WHERE product_id=:product_id FOR UPDATE');
  $existingQuery->execute([':product_id'=>$id]);
  $existing=array_fill_keys(array_map('intval',$existingQuery->fetchAll(PDO::FETCH_COLUMN)),true);
  $seen=[];
  $update=$db->prepare('UPDATE product_variations SET variation_name=:name,sku=:sku,weight=:weight,weight_unit=:unit,selling_price=:price,strike_price=:strike,stock_quantity=:stock,status=:status WHERE id=:id AND product_id=:product_id');
  $insert=$db->prepare('INSERT INTO product_variations(product_id,variation_name,sku,weight,weight_unit,selling_price,strike_price,stock_quantity,status) VALUES(:product_id,:name,:sku,:weight,:unit,:price,:strike,:stock,:status)');
  foreach($items as $item) {
    if (!is_array($item)) {
      jsonResponse(false,'Each product variation must be an object.',null,[],422);
    }
    $name=trim((string)($item['variation_name']??$item['weight']??''));
    $price=$item['selling_price']??null;
    if ($name==='' || !is_numeric($price) || (float)$price<=0) {
      jsonResponse(false,'Each variation needs a name and a valid selling price.',null,[],422);
    }
    $rawId=$item['id']??null;
    $variationId=$rawId===null||$rawId===''?null:filter_var($rawId,FILTER_VALIDATE_INT);
    if ($variationId!==null && ($variationId===false || $variationId<1 || !isset($existing[(int)$variationId]))) {
      jsonResponse(false,'A variation ID does not belong to this product.',null,[],422);
    }
    $values=[
      ':name'=>$name,
      ':sku'=>$item['sku']??null,
      ':weight'=>$item['weight']??null,
      ':unit'=>$item['weight_unit']??null,
      ':price'=>(float)$price,
      ':strike'=>$item['strike_price']??null,
      ':stock'=>max(0,(int)($item['stock_quantity']??0)),
      ':status'=>strtoupper((string)($item['status']??'ACTIVE'))==='INACTIVE'?'INACTIVE':'ACTIVE',
    ];
    if ($variationId!==null) {
      $values[':id']=(int)$variationId;
      $values[':product_id']=$id;
      $update->execute($values);
      $seen[(int)$variationId]=true;
    } else {
      $values[':product_id']=$id;
      $insert->execute($values);
    }
  }
  $deactivate=$db->prepare("UPDATE product_variations SET status='INACTIVE' WHERE id=:id AND product_id=:product_id");
  foreach(array_keys($existing) as $existingId) {
    if (!isset($seen[$existingId])) {
      $deactivate->execute([':id'=>$existingId,':product_id'=>$id]);
    }
  }
}
