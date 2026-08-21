<?php
/**
 * Trip Planner API Endpoint
 *
 * Migrated from Django backend/trip_planner/views.py
 * POST /api/trip-planner/
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../utils/validation.php';
require_once __DIR__ . '/../../middleware/cors.php';

// Handle preflight
handlePreflight();

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// Validate input
$errors = validateTripPlanner($input);
if (!empty($errors)) {
    jsonValidationError('Validation failed', $errors);
}

// Business logic (mirrors Django ROUTES dictionary)
$routes = [
    'Adventure' => 'Kathmandu → Pokhara → Annapurna region',
    'Culture' => 'Kathmandu → Bhaktapur → Patan → Bandipur',
    'Wildlife' => 'Kathmandu → Chitwan → Pokhara',
    'Relaxed' => 'Kathmandu → Pokhara → Bandipur',
];

$style = $input['style'];
$route = $routes[$style] ?? null;

if (!$route) {
    jsonError('Invalid trip style', 400);
}

$people = (int)$input['people'];

$response = [
    'route' => $route,
    'style' => $style,
    'days' => $input['days'],
    'month' => $input['month'],
    'people' => $people,
];

jsonResponse($response);