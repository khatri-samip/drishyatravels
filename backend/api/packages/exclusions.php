<?php
/**
 * Package Exclusions API
 *
 * GET /api/packages/{id}/exclusions - Get exclusions for a package
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
// Handle both /api/packages/{id}/exclusions and /{project}/api/packages/{id}/exclusions deployments
$patterns = [
    '#/api/packages/([^/]+)/exclusions/?#',
    '#/drishya-travels-backend/api/packages/([^/]+)/exclusions/?#',
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

    $exclusions = Package::getExclusions($id);
    jsonResponse($exclusions);
} catch (Exception $e) {
    jsonServerError('Failed to fetch exclusions: ' . $e->getMessage());
}