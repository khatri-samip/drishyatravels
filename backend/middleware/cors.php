<?php
/**
 * CORS Middleware
 *
 * Handles Cross-Origin Resource Sharing for API endpoints
 * Reads configuration from environment variables
 */

// TODO: [High/Security/DevOps] Fragile CORS config for production
// - Defaults to wildcard origin (*) with credentials=true which is INVALID per spec
// - Credentials not allowed with wildcard origin - browsers will reject
// - No validation that CORS_ALLOW_ORIGIN is set in production
// - Should separate dev/prod configs, require explicit origin list in production
function corsHeaders(): void
{
    $allowOrigin = $_ENV['CORS_ALLOW_ORIGIN'] ?? '*';
    $allowMethods = $_ENV['CORS_ALLOW_METHODS'] ?? 'GET,POST,PUT,PATCH,DELETE,OPTIONS';
    $allowHeaders = $_ENV['CORS_ALLOW_HEADERS'] ?? 'Content-Type,Authorization,X-Requested-With';
    $maxAge = $_ENV['CORS_MAX_AGE'] ?? '86400';

    // Allow all origins in development, specific origin in production
    if ($allowOrigin === '*') {
        header('Access-Control-Allow-Origin: *');
        // WARNING: Access-Control-Allow-Credentials: true with wildcard origin is INVALID
        // Browsers will reject this combination. Only enable credentials with specific origins.
    } else {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowedOrigins = array_map('trim', explode(',', $allowOrigin));
        if (in_array($origin, $allowedOrigins, true)) {
            header("Access-Control-Allow-Origin: $origin");
            header('Vary: Origin');
        }
    }

    header("Access-Control-Allow-Methods: $allowMethods");
    header("Access-Control-Allow-Headers: $allowHeaders");
    header("Access-Control-Max-Age: $maxAge");
    header('Access-Control-Allow-Credentials: true');
}

/**
 * Handle preflight OPTIONS request
 * Should be called early in the request lifecycle
 */
function handlePreflight(): void
{
    corsHeaders();

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204); // No Content
        exit(0);
    }
}

/**
 * Apply CORS headers to the current response
 * Call this before sending any JSON response
 */
function applyCors(): void
{
    corsHeaders();
    header('Content-Type: application/json; charset=utf-8');
}