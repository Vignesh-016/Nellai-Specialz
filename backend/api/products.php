<?php
/**
 * Products REST API (GET, POST, PUT, DELETE)
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

// Sample product dataset for API response
$products = [
    [
        'id' => 1,
        'slug' => 'tirunelveli-halwa',
        'name' => 'Tirunelveli Halwa',
        'category_id' => 1,
        'category_name' => 'Sweets',
        'tagline' => 'The authentic taste of tradition.',
        'rating' => 5.0,
        'reviews_count' => 125,
        'pack_sizes' => [
            ['weight' => '250g', 'price' => 180],
            ['weight' => '500g', 'price' => 320],
            ['weight' => '1 Kg', 'price' => 600, 'default' => true],
            ['weight' => '2 Kg', 'price' => 1150]
        ],
        'in_stock' => true,
        'image' => 'assets/images/products/halwa-bowl.jpg',
        'description' => "Indulge in the rich, soft and melt-in-mouth delicious Tirunelveli Halwa. Made with pure ingredients and traditional slow-cooking."
    ],
    [
        'id' => 2,
        'slug' => 'mini-combo',
        'name' => 'Mini Combo',
        'category_id' => 3,
        'category_name' => 'Combos',
        'weight' => '250g Halwa',
        'price' => 190,
        'image' => 'assets/images/products/combo-mini.svg'
    ],
    [
        'id' => 3,
        'slug' => 'family-combo',
        'name' => 'Family Combo',
        'category_id' => 3,
        'category_name' => 'Combos',
        'weight' => '500g Halwa',
        'price' => 540,
        'image' => 'assets/images/products/combo-family.svg'
    ],
    [
        'id' => 4,
        'slug' => 'festival-combo',
        'name' => 'Festival Combo',
        'category_id' => 3,
        'category_name' => 'Combos',
        'weight' => '1Kg Halwa',
        'price' => 640,
        'image' => 'assets/images/products/combo-festive.svg'
    ]
];

switch ($method) {
    case 'GET':
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        if ($id) {
            $filtered = array_values(array_filter($products, fn($p) => $p['id'] === $id));
            if (!empty($filtered)) {
                echo json_encode(['status' => 'success', 'data' => $filtered[0]]);
            } else {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Product not found']);
            }
        } else {
            echo json_encode(['status' => 'success', 'data' => $products]);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['name'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Product name required']);
            break;
        }
        $newProduct = array_merge(['id' => rand(10, 999)], $input);
        http_response_code(201);
        echo json_encode(['status' => 'success', 'message' => 'Product created', 'data' => $newProduct]);
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['id'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Product ID required for update']);
            break;
        }
        echo json_encode(['status' => 'success', 'message' => 'Product updated successfully', 'data' => $input]);
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Product ID required for deletion']);
            break;
        }
        echo json_encode(['status' => 'success', 'message' => "Product #$id deleted successfully"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
        break;
}
?>
