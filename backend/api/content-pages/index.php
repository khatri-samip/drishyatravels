<?php
/**
 * Content Pages API
 *
 * GET    /api/content-pages           - List all content pages (with filtering)
 * POST   /api/content-pages           - Create a new content page
 * GET    /api/content-pages/{slug}    - Get a single content page by slug
 * PUT    /api/content-pages/{slug}    - Update a content page
 * DELETE /api/content-pages/{slug}    - Delete a content page
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/ContentPage.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../middleware/cors.php';

handlePreflight();

$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Handle both /api/content-pages and /{project}/api/content-pages deployments
$patterns = [
    '#/api/content-pages/?$#',
    '#/drishya-travels-backend/api/content-pages/?$#',
    '#/api/content-pages/([^/]+)/?$#',
    '#/drishya-travels-backend/api/content-pages/([^/]+)/?$#',
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
                // List content pages
                $filters = [];
                if (isset($_GET['status'])) $filters['status'] = $_GET['status'];
                if (isset($_GET['limit'])) $filters['limit'] = max(1, min(100, (int)$_GET['limit']));
                if (isset($_GET['offset'])) $filters['offset'] = max(0, (int)$_GET['offset']);

                [$pages, $total] = ContentPage::getAll($filters);
                jsonResponse([
                    'data' => $pages,
                    'meta' => [
                        'total' => $total,
                        'limit' => $filters['limit'] ?? 50,
                        'offset' => $filters['offset'] ?? 0,
                    ],
                ]);
            } else {
                // Get single content page by slug
                $page = ContentPage::getBySlug($slug);
                if (!$page) {
                    jsonNotFound('Content page not found');
                }
                jsonResponse($page);
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
            $page = ContentPage::create($input);
            jsonResponse($page, 201);
            break;

        case 'PUT':
        case 'PATCH':
            if ($isCollection || $slug === '') {
                jsonError('Content page slug required', 400);
            }
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                jsonError('Invalid JSON', 400);
            }
            $page = ContentPage::updateBySlug($slug, $input);
            if (!$page) {
                jsonNotFound('Content page not found');
            }
            jsonResponse($page);
            break;

        case 'DELETE':
            if ($isCollection || $slug === '') {
                jsonError('Content page slug required', 400);
            }
            $deleted = ContentPage::deleteBySlug($slug);
            if (!$deleted) {
                jsonNotFound('Content page not found');
            }
            jsonResponse(['message' => 'Content page deleted']);
            break;

        default:
            jsonError('Method not allowed', 405);
    }
} catch (InvalidArgumentException $e) {
    jsonError($e->getMessage(), 400);
} catch (Exception $e) {
    jsonServerError('Failed to process request: ' . $e->getMessage());
}