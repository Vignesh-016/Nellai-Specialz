<?php
/**
 * Offers & Coupons REST API (GET, POST, PUT, DELETE)
 * Nellai Specialz Backend
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

$offers = [
    [
        'id' => 1,
        'code' => 'FESTIVAL10',
        'title' => 'Festival Special 10% Off',
        'discount_type' => 'percentage',
        'discount_value' => 10,
        'min_order_amount' => 500,
        'expires_at' => '2026-12-31'
    ],
    [
        'id' => 2,
        'code' => 'FREESHIP',
        'title' => 'Free Shipping on Orders above ₹999',
        'discount_type' => 'free_shipping',
        'discount_value' => 0,
        'min_order_amount' => 999,
        'expires_at' => '2026-12-31'
    ]
];

switch ($method) {
    case 'GET':
        echo json_encode(['status' => 'success', 'data' => $offers]);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['code'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Coupon code required']);
            break;
        }
        $newOffer = array_merge(['id' => rand(10, 99)], $input);
        http_response_code(201);
        echo json_encode(['status' => 'success', 'message' => 'Offer created', 'data' => $newOffer]);
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        echo json_encode(['status' => 'success', 'message' => 'Offer updated', 'data' => $input]);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        echo json_encode(['status' => 'success', 'message' => "Offer #$id deleted"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
        break;
}
?>
