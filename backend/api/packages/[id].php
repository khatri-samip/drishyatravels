<?php
/**
 * Package API - Single Package Operations
 *
 * GET    /api/packages/{id}        - Get package with all relations
 * PUT    /api/packages/{id}        - Update package (full replace)
 * PATCH  /api/packages/{id}        - Update package (partial)
 * DELETE /api/packages/{id}        - Delete package
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Package.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../utils/validation.php';
require_once __DIR__ . '/../../middleware/cors.php';

// Handle preflight
handlePreflight();

// Extract ID from request URI
// In a real router, this would be handled by the router
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
// Handle both /api/packages/{id} and /{project}/api/packages/{id} deployments
$basePaths = [
    '/DRISHYATRAVELS/backend/api/packages/', // why: hardcoded for XAMPP subdirectory deployment; add new base paths here for other environments
    '/api/packages/',
    '/drishya-travels-backend/api/packages/',
];
$id = '';

foreach ($basePaths as $basePath) {
    if (str_starts_with($path, $basePath)) {
        $id = substr($path, strlen($basePath));
        // Remove any trailing slash or query string
        $id = trim($id, '/');
        $id = explode('?', $id)[0];
        break;
    }
}

if ($id === '') {
    jsonError('Package ID required', 400);
}

$method = $_SERVER['REQUEST_METHOD'];

// GET /api/packages/{id} - Get single package
if ($method === 'GET') {
    try {
        $package = Package::getById($id);
        if (!$package) {
            jsonNotFound('Package not found');
        }
        jsonResponse($package);
    } catch (Exception $e) {
        jsonServerError('Failed to fetch package: ' . $e->getMessage());
    }
}

// PUT /api/packages/{id} - Full update
elseif ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    // Ensure ID in body matches URL
    if (isset($input['id']) && $input['id'] !== $id) {
        jsonError('ID in body does not match URL', 400);
    }
    $input['id'] = $id;

    try {
        $package = Package::update($id, $input);
        if (!$package) {
            jsonNotFound('Package not found');
        }
        jsonResponse($package);
    } catch (InvalidArgumentException $e) {
        jsonValidationError($e->getMessage());
    } catch (Exception $e) {
        jsonServerError('Failed to update package: ' . $e->getMessage());
    }
}

// PATCH /api/packages/{id} - Partial update
elseif ($method === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    // Ensure ID in body matches URL
    if (isset($input['id']) && $input['id'] !== $id) {
        jsonError('ID in body does not match URL', 400);
    }
    $input['id'] = $id;

    try {
        $package = Package::update($id, $input);
        if (!$package) {
            jsonNotFound('Package not found');
        }
        jsonResponse($package);
    } catch (InvalidArgumentException $e) {
        jsonValidationError($e->getMessage());
    } catch (Exception $e) {
        jsonServerError('Failed to update package: ' . $e->getMessage());
    }
}

// DELETE /api/packages/{id} - Delete package
elseif ($method === 'DELETE') {
    try {
        $deleted = Package::delete($id);
        if (!$deleted) {
            jsonNotFound('Package not found');
        }
        jsonNoContent();
    } catch (Exception $e) {
        jsonServerError('Failed to delete package: ' . $e->getMessage());
    }
}

// Unsupported method
else {
    jsonError('Method not allowed', 405);
}