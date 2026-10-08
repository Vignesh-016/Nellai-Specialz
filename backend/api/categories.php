<?php
/**
 * Categories & Sub-Categories REST API (GET, POST, PUT, DELETE)
 * Nellai Specialz Backend
 */
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

$categories = [
    [
        'id' => 1,
        'name' => 'Traditional Sweets',
        'slug' => 'sweets',
        'subcategories' => [
            ['id' => 101, 'name' => 'Wheat Halwa', 'slug' => 'wheat-halwa'],
            ['id' => 102, 'name' => 'Ghee Sweets', 'slug' => 'ghee-sweets'],
            ['id' => 103, 'name' => 'Milk Sweets', 'slug' => 'milk-sweets']
        ]
    ],
    [
        'id' => 2,
        'name' => 'Native Savory Snacks',
        'slug' => 'snacks',
        'subcategories' => [
            ['id' => 201, 'name' => 'Tirunelveli Mixture', 'slug' => 'mixture'],
            ['id' => 202, 'name' => 'Karasev', 'slug' => 'karasev'],
            ['id' => 203, 'name' => 'Murukku', 'slug' => 'murukku']
        ]
    ],
    [
        'id' => 3,
        'name' => 'Halwa Combos',
        'slug' => 'combos',
        'subcategories' => [
            ['id' => 301, 'name' => 'Family Combos', 'slug' => 'family-combos'],
            ['id' => 302, 'name' => 'Festival Packs', 'slug' => 'festival-packs']
        ]
    ]
];

switch ($method) {
    case 'GET':
        echo json_encode(['status' => 'success', 'data' => $categories]);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['name'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Category name required']);
            break;
        }
        $newCat = array_merge(['id' => rand(10, 99)], $input);
        http_response_code(201);
        echo json_encode(['status' => 'success', 'message' => 'Category created', 'data' => $newCat]);
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        echo json_encode(['status' => 'success', 'message' => 'Category updated', 'data' => $input]);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        echo json_encode(['status' => 'success', 'message' => "Category #$id deleted"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
        break;
}
?>
