<?php
/**
 * Package Itinerary API
 *
 * GET /api/packages/{id}/itinerary - Get itinerary days for a package
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
// Handle both /api/packages/{id}/itinerary and /{project}/api/packages/{id}/itinerary deployments
$patterns = [
    '#/api/packages/([^/]+)/itinerary/?#',
    '#/drishya-travels-backend/api/packages/([^/]+)/itinerary/?#',
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
    // Verify package exists
    $package = Package::getByIdSimple($id);
    if (!$package) {
        jsonNotFound('Package not found');
    }

    $itinerary = Package::getItinerary($id);
    jsonResponse($itinerary);
} catch (Exception $e) {
    jsonServerError('Failed to fetch itinerary: ' . $e->getMessage());
}