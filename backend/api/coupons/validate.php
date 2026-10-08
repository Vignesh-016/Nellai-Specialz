<?php
declare(strict_types=1);
require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/request.php';
require_once __DIR__ . '/../shared/auth.php';
methodOnly('POST');
safeApi(function (): void {
    $customer = getCurrentCustomer();
    if (!$customer) jsonResponse(false, 'Customer authentication required.', null, [], 401);
    $input = jsonRequest();
    $code = strtoupper(trim((string) ($input['code'] ?? '')));
    $items = $input['items'] ?? [];
    if ($code === '' || !is_array($items) || $items === []) jsonResponse(false, 'Enter a coupon code and cart items.', null, [], 422);
    $db = apiDatabase();
    $q = $db->prepare('SELECT * FROM coupons WHERE code=:code LIMIT 1'); $q->execute([':code'=>$code]); $coupon=$q->fetch();
    if (!$coupon) jsonResponse(false, 'Invalid coupon code.', null, [], 404);
    $today=date('Y-m-d');
    if ($coupon['status'] !== 'ACTIVE') jsonResponse(false, 'This coupon is not active.', null, [], 422);
    if ($coupon['start_date'] && $today < substr((string)$coupon['start_date'],0,10)) jsonResponse(false, 'This coupon is not active yet.', null, [], 422);
    if ($coupon['expiry_date'] && $today > substr((string)$coupon['expiry_date'],0,10)) jsonResponse(false, 'This coupon has expired.', null, [], 422);
    $s=$db->prepare('SELECT COUNT(*) FROM coupon_usages WHERE coupon_id=:id'); $s->execute([':id'=>$coupon['id']]);
    if ((int)$coupon['usage_limit']>0 && (int)$s->fetchColumn()>=(int)$coupon['usage_limit']) jsonResponse(false,'This coupon has reached its usage limit.',null,[],429);
    $s=$db->prepare('SELECT COUNT(*) FROM coupon_usages WHERE coupon_id=:id AND customer_id=:customer'); $s->execute([':id'=>$coupon['id'],':customer'=>$customer['id']]);
    if ((int)$coupon['per_user_limit']>0 && (int)$s->fetchColumn()>=(int)$coupon['per_user_limit']) jsonResponse(false,'You have already used this coupon the maximum number of times.',null,[],429);
    $subtotal=0; $eligible=0;
    foreach ($items as $item) {
        $productId=(int)($item['product_id']??0); $variationId=($item['variation_id']??null)!==null?(int)$item['variation_id']:null; $quantity=(int)($item['quantity']??0);
        if($productId<1||$quantity<1) jsonResponse(false,'Cart item product or quantity is invalid.',null,[],422);
        $p=$db->prepare("SELECT p.id,p.category_id,p.selling_price,p.offer_price,p.sale_price,p.price,v.selling_price variation_price FROM products p LEFT JOIN product_variations v ON v.id=:variation AND v.product_id=p.id AND UPPER(v.status)='ACTIVE' WHERE p.id=:product AND UPPER(p.status)='ACTIVE'"); $p->execute([':variation'=>$variationId,':product'=>$productId]); $product=$p->fetch();
        if(!$product) jsonResponse(false,'A product in your cart is no longer available.',null,[],422);
        if($variationId!==null && $product['variation_price']===null) jsonResponse(false,'A selected product variation is no longer available.',null,[],422);
        $price=(float)($product['variation_price']?:($product['selling_price']?:($product['offer_price']?:($product['sale_price']?:$product['price']))));
        $line=$price*$quantity; $subtotal+=$line;
        $eligibleLine=$coupon['applies_to']==='ALL';
        if($coupon['applies_to']==='PRODUCTS'){ $r=$db->prepare('SELECT 1 FROM coupon_products WHERE coupon_id=:c AND product_id=:p');$r->execute([':c'=>$coupon['id'],':p'=>$productId]);$eligibleLine=(bool)$r->fetchColumn(); }
        if($coupon['applies_to']==='CATEGORIES'){ $r=$db->prepare('SELECT 1 FROM coupon_categories WHERE coupon_id=:c AND category_id=:cat');$r->execute([':c'=>$coupon['id'],':cat'=>$product['category_id']]);$eligibleLine=(bool)$r->fetchColumn(); }
        if($eligibleLine)$eligible+=$line;
    }
    if($subtotal<(float)$coupon['min_order_amount'])jsonResponse(false,'Minimum order value of ₹'.number_format((float)$coupon['min_order_amount'],2).' is required for this coupon.',null,[],422);
    if($eligible<=0)jsonResponse(false,'This coupon does not apply to the products in your cart.',null,[],422);
    $discount=$coupon['discount_type']==='PERCENTAGE'?$eligible*(float)$coupon['discount_value']/100:(float)$coupon['discount_value']; if($coupon['max_discount']!==null)$discount=min($discount,(float)$coupon['max_discount']); $discount=min($discount,$eligible,$subtotal);
    jsonResponse(true,'Coupon applied successfully.',['coupon_id'=>(int)$coupon['id'],'code'=>$code,'discount_type'=>$coupon['discount_type'],'discount_value'=>(float)$coupon['discount_value'],'subtotal'=>round($subtotal,2),'eligible_subtotal'=>round($eligible,2),'discount_amount'=>round($discount,2),'total'=>round($subtotal-$discount,2)]);
});
