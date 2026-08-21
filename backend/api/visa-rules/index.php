<?php
/**
 * Visa Rules API
 *
 * GET    /api/visa-rules              - List all visa rules (with filtering)
 * POST   /api/visa-rules              - Create a new visa rule
 * GET    /api/visa-rules/{code}       - Get a single visa rule by country code
 * PUT    /api/visa-rules/{code}       - Update a visa rule
 * DELETE /api/visa-rules/{code}       - Delete a visa rule
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/VisaRule.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../middleware/cors.php';

handlePreflight();

$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Handle both /api/visa-rules and /{project}/api/visa-rules deployments
$patterns = [
    '#/api/visa-rules/?$#',
    '#/drishya-travels-backend/api/visa-rules/?$#',
    '#/api/visa-rules/([^/]+)/?$#',
    '#/drishya-travels-backend/api/visa-rules/([^/]+)/?$#',
];

$code = '';
$isCollection = false;

foreach ($patterns as $pattern) {
    if (preg_match($pattern, $path, $matches)) {
        if (isset($matches[1])) {
            $code = strtoupper($matches[1]);
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
                // List visa rules
                $filters = [];
                if (isset($_GET['status'])) $filters['status'] = $_GET['status'];
                if (isset($_GET['country_code'])) $filters['country_code'] = strtoupper($_GET['country_code']);
                if (isset($_GET['limit'])) $filters['limit'] = max(1, min(200, (int)$_GET['limit']));
                if (isset($_GET['offset'])) $filters['offset'] = max(0, (int)$_GET['offset']);

                [$rules, $total] = VisaRule::getAll($filters);
                jsonResponse([
                    'data' => $rules,
                    'meta' => [
                        'total' => $total,
                        'limit' => $filters['limit'] ?? 100,
                        'offset' => $filters['offset'] ?? 0,
                    ],
                ]);
            } else {
                // Get single visa rule by country code
                $rule = VisaRule::getByCountryCode($code);
                if (!$rule) {
                    jsonNotFound('Visa rule not found');
                }
                jsonResponse($rule);
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
            $rule = VisaRule::create($input);
            jsonResponse($rule, 201);
            break;

        case 'PUT':
        case 'PATCH':
            if ($isCollection || $code === '') {
                jsonError('Country code required', 400);
            }
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                jsonError('Invalid JSON', 400);
            }
            $rule = VisaRule::updateByCountryCode($code, $input);
            if (!$rule) {
                jsonNotFound('Visa rule not found');
            }
            jsonResponse($rule);
            break;

        case 'DELETE':
            if ($isCollection || $code === '') {
                jsonError('Country code required', 400);
            }
            $deleted = VisaRule::deleteByCountryCode($code);
            if (!$deleted) {
                jsonNotFound('Visa rule not found');
            }
            jsonResponse(['message' => 'Visa rule deleted']);
            break;

        default:
            jsonError('Method not allowed', 405);
    }
} catch (InvalidArgumentException $e) {
    jsonError($e->getMessage(), 400);
} catch (Exception $e) {
    jsonServerError('Failed to process request: ' . $e->getMessage());
}