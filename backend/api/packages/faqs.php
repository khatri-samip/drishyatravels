<?php
/**
 * Package FAQs API
 *
 * GET /api/packages/{id}/faqs - Get FAQs for a package
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
// Handle both /api/packages/{id}/faqs and /{project}/api/packages/{id}/faqs deployments
$patterns = [
    '#/api/packages/([^/]+)/faqs/?#',
    '#/drishya-travels-backend/api/packages/([^/]+)/faqs/?#',
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

    $faqs = Package::getFaqs($id);
    jsonResponse($faqs);
} catch (Exception $e) {
    jsonServerError('Failed to fetch FAQs: ' . $e->getMessage());
}