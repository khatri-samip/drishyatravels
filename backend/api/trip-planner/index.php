<?php
/**
 * Trip Planner API Endpoint
 *
 * Migrated from Django backend/trip_planner/views.py
 * POST /api/trip-planner/
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Package.php';
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

// Map trip styles to package categories for recommendations
$styleToCategory = [
    'Adventure' => ['Adventure Tour', 'Trekking'],
    'Culture' => ['Cultural Tour'],
    'Wildlife' => ['Adventure Tour'], // Closest match
    'Relaxed' => ['Cultural Tour'],
];

// Fetch matching packages
$recommendedPackages = [];
$categories = $styleToCategory[$style] ?? [];

if (!empty($categories)) {
    foreach ($categories as $category) {
        $filters = [
            'category' => $category,
            'status' => 'published',
            'limit' => 2, // Limit per category
            'offset' => 0,
        ];
        [$packages] = Package::getAll($filters);
        $recommendedPackages = array_merge($recommendedPackages, $packages);
        if (count($recommendedPackages) >= 4) break; // Max 4 recommendations
    }
}

// Format package data for frontend
$recommended = array_map(function($pkg) {
    return [
        'id' => $pkg['id'],
        'title' => $pkg['title'],
        'destination' => $pkg['destination'],
        'duration' => $pkg['duration'],
        'price' => $pkg['price'],
        'currency' => $pkg['currency'],
        'difficulty' => $pkg['difficulty'],
        'hero_image_url' => $pkg['hero_image_url'],
    ];
}, $recommendedPackages);

$response = [
    'route' => $route,
    'style' => $style,
    'days' => $input['days'],
    'month' => $input['month'],
    'people' => $people,
    'recommended_packages' => $recommended,
];

jsonResponse($response);