<?php
/**
 * Package Highlights API
 *
 * GET /api/packages/{id}/highlights - Get highlights for a package
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Package.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../middleware/cors.php';

handlePreflight();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Method not allowed', 405);
}

$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
// Handle both /api/packages/{id}/highlights and /{project}/api/packages/{id}/highlights deployments
$patterns = [
    '#/api/packages/([^/]+)/highlights/?#',
    '#/drishya-travels-backend/api/packages/([^/]+)/highlights/?#',
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

try {
    $package = Package::getByIdSimple($id);
    if (!$package) {
        jsonNotFound('Package not found');
    }

    $highlights = Package::getHighlights($id);
    jsonResponse($highlights);
} catch (Exception $e) {
    jsonServerError('Failed to fetch highlights: ' . $e->getMessage());
}