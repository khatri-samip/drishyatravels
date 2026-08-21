<?php
/**
 * Travel Tips API
 *
 * GET    /api/travel-tips           - List all travel tips (with filtering)
 * POST   /api/travel-tips           - Create a new travel tip
 * GET    /api/travel-tips/{slug}    - Get a single travel tip by slug
 * PUT    /api/travel-tips/{slug}    - Update a travel tip
 * DELETE /api/travel-tips/{slug}    - Delete a travel tip
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/TravelTip.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../middleware/cors.php';

handlePreflight();

$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Handle both /api/travel-tips and /{project}/api/travel-tips deployments
$patterns = [
    '#/api/travel-tips/?$#',
    '#/drishya-travels-backend/api/travel-tips/?$#',
    '#/api/travel-tips/([^/]+)/?$#',
    '#/drishya-travels-backend/api/travel-tips/([^/]+)/?$#',
];

$slug = '';
$isCollection = false;

foreach ($patterns as $pattern) {
    if (preg_match($pattern, $path, $matches)) {
        if (isset($matches[1])) {
            $slug = $matches[1];
        } else {
            $isCollection = true;
        }
        break;
    }
}

try {
    switch ($method) {
        case 'GET':
            if ($isCollection) {
                // List travel tips
                $filters = [];
                if (isset($_GET['status'])) $filters['status'] = $_GET['status'];
                if (isset($_GET['limit'])) $filters['limit'] = max(1, min(100, (int)$_GET['limit']));
                if (isset($_GET['offset'])) $filters['offset'] = max(0, (int)$_GET['offset']);

                [$tips, $total] = TravelTip::getAll($filters);
                jsonResponse([
                    'data' => $tips,
                    'meta' => [
                        'total' => $total,
                        'limit' => $filters['limit'] ?? 50,
                        'offset' => $filters['offset'] ?? 0,
                    ],
                ]);
            } else {
                // Get single travel tip by slug
                $tip = TravelTip::getBySlug($slug);
                if (!$tip) {
                    jsonNotFound('Travel tip not found');
                }
                jsonResponse($tip);
            }
            break;

        case 'POST':
            if (!$isCollection) {
                jsonError('Invalid endpoint', 400);
            }
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                jsonError('Invalid JSON', 400);
            }
            $tip = TravelTip::create($input);
            jsonResponse($tip, 201);
            break;

        case 'PUT':
        case 'PATCH':
            if ($isCollection || $slug === '') {
                jsonError('Travel tip slug required', 400);
            }
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                jsonError('Invalid JSON', 400);
            }
            $tip = TravelTip::updateBySlug($slug, $input);
            if (!$tip) {
                jsonNotFound('Travel tip not found');
            }
            jsonResponse($tip);
            break;

        case 'DELETE':
            if ($isCollection || $slug === '') {
                jsonError('Travel tip slug required', 400);
            }
            $deleted = TravelTip::deleteBySlug($slug);
            if (!$deleted) {
                jsonNotFound('Travel tip not found');
            }
            jsonResponse(['message' => 'Travel tip deleted']);
            break;

        default:
            jsonError('Method not allowed', 405);
    }
} catch (InvalidArgumentException $e) {
    jsonError($e->getMessage(), 400);
} catch (Exception $e) {
    jsonServerError('Failed to process request: ' . $e->getMessage());
}