<?php
/**
 * Package Related/Recommended Packages API
 *
 * GET /api/packages/{id}/related - Get related packages for a package
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Package.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../middleware/cors.php';

handlePreflight();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Method not allowed', 405);
}

// Extract package ID from URI
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
// Handle both /api/packages/{id}/related and /{project}/api/packages/{id}/related deployments
$patterns = [
    '#/api/packages/([^/]+)/related/?#',
    '#/drishya-travels-backend/api/packages/([^/]+)/related/?#',
];
$id = '';

foreach ($patterns as $pattern) {
    if (preg_match($pattern, $path, $matches)) {
        $id = $matches[1];
        break;
    }
}

if ($id === '') {
    jsonError('Package ID required', 400);
}

// Optional limit parameter
$limit = isset($_GET['limit']) ? max(1, min(10, (int)$_GET['limit'])) : 3;

try {
    // Verify package exists
    $package = Package::getByIdSimple($id);
    if (!$package) {
        jsonNotFound('Package not found');
    }

    $related = Package::getRelated($id, $limit);
    jsonResponse($related);
} catch (Exception $e) {
    jsonServerError('Failed to fetch related packages: ' . $e->getMessage());
}