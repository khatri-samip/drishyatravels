<?php
/**
 * Seasons API
 *
 * GET    /api/seasons           - List all seasons (with filtering)
 * POST   /api/seasons           - Create a new season
 * GET    /api/seasons/{slug}    - Get a single season by slug
 * PUT    /api/seasons/{slug}    - Update a season
 * DELETE /api/seasons/{slug}    - Delete a season
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Season.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../middleware/cors.php';

handlePreflight();

$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Handle both /api/seasons and /{project}/api/seasons deployments
$patterns = [
    '#/api/seasons/?$#',
    '#/drishya-travels-backend/api/seasons/?$#',
    '#/api/seasons/([^/]+)/?$#',
    '#/drishya-travels-backend/api/seasons/([^/]+)/?$#',
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
                // List seasons
                $filters = [];
                if (isset($_GET['status'])) $filters['status'] = $_GET['status'];
                if (isset($_GET['limit'])) $filters['limit'] = max(1, min(100, (int)$_GET['limit']));
                if (isset($_GET['offset'])) $filters['offset'] = max(0, (int)$_GET['offset']);

                [$seasons, $total] = Season::getAll($filters);
                jsonResponse([
                    'data' => $seasons,
                    'meta' => [
                        'total' => $total,
                        'limit' => $filters['limit'] ?? 50,
                        'offset' => $filters['offset'] ?? 0,
                    ],
                ]);
            } else {
                // Get single season by slug
                $season = Season::getBySlug($slug);
                if (!$season) {
                    jsonNotFound('Season not found');
                }
                jsonResponse($season);
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
            $season = Season::create($input);
            jsonResponse($season, 201);
            break;

        case 'PUT':
        case 'PATCH':
            if ($isCollection || $slug === '') {
                jsonError('Season slug required', 400);
            }
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                jsonError('Invalid JSON', 400);
            }
            $season = Season::updateBySlug($slug, $input);
            if (!$season) {
                jsonNotFound('Season not found');
            }
            jsonResponse($season);
            break;

        case 'DELETE':
            if ($isCollection || $slug === '') {
                jsonError('Season slug required', 400);
            }
            $deleted = Season::deleteBySlug($slug);
            if (!$deleted) {
                jsonNotFound('Season not found');
            }
            jsonResponse(['message' => 'Season deleted']);
            break;

        default:
            jsonError('Method not allowed', 405);
    }
} catch (InvalidArgumentException $e) {
    jsonError($e->getMessage(), 400);
} catch (Exception $e) {
    jsonServerError('Failed to process request: ' . $e->getMessage());
}