<?php
/**
 * Packages API - List and Create
 *
 * GET    /api/packages           - List packages with filters
 * POST   /api/packages           - Create new package
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Package.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../utils/validation.php';
require_once __DIR__ . '/../../middleware/cors.php';

// Handle preflight
handlePreflight();

$method = $_SERVER['REQUEST_METHOD'];

// GET /api/packages - List packages
if ($method === 'GET') {
    // Parse query parameters
    $filters = [
        'status' => $_GET['status'] ?? null,
        'category' => $_GET['category'] ?? null,
        'difficulty' => $_GET['difficulty'] ?? null,
        'featured' => $_GET['featured'] ?? null,
        'limit' => isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 50,
        'offset' => isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0,
    ];

    // Remove null filters
    $filters = array_filter($filters, fn($v) => $v !== null);

    try {
        [$packages, $total] = Package::getAll($filters);

        jsonResponse($packages, 200, [
            'total' => $total,
            'limit' => $filters['limit'] ?? 50,
            'offset' => $filters['offset'] ?? 0,
        ]);
    } catch (Exception $e) {
        jsonServerError('Failed to fetch packages: ' . $e->getMessage());
    }
}

// POST /api/packages - Create package
elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    try {
        $package = Package::create($input);
        $location = '/api/packages/' . $package['id'];
        jsonCreated($package, $location);
    } catch (InvalidArgumentException $e) {
        jsonValidationError($e->getMessage());
    } catch (Exception $e) {
        jsonServerError('Failed to create package: ' . $e->getMessage());
    }
}

// Unsupported method
else {
    jsonError('Method not allowed', 405);
}