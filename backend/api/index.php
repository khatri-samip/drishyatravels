<?php
/**
 * API Entry Point / Health Check
 *
 * GET /api/ - API welcome message and endpoint listing
 * Mirrors Django config.urls.home endpoint
 */

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/cors.php';

handlePreflight();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Method not allowed', 405);
}

$response = [
    'message' => 'Welcome to Drishya Travels API',
    'status' => 'running',
    'version' => '1.0.0',
    'endpoints' => [
        'health' => '/api/',
        'trip_planner' => '/api/trip-planner/',
        'packages' => [
            'list' => 'GET /api/packages',
            'get' => 'GET /api/packages/{id}',
            'create' => 'POST /api/packages',
            'update' => 'PUT/PATCH /api/packages/{id}',
            'delete' => 'DELETE /api/packages/{id}',
        ],
        'package_relations' => [
            'itinerary' => 'GET /api/packages/{id}/itinerary',
            'highlights' => 'GET /api/packages/{id}/highlights',
            'inclusions' => 'GET /api/packages/{id}/inclusions',
            'exclusions' => 'GET /api/packages/{id}/exclusions',
            'gallery' => 'GET /api/packages/{id}/gallery',
            'faqs' => 'GET /api/packages/{id}/faqs',
        ],
    ],
];

jsonResponse($response);