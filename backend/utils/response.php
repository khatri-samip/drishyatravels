<?php
/**
 * Response Utilities
 *
 * Standardized JSON response helpers for API endpoints
 */

require_once __DIR__ . '/../middleware/cors.php';

/**
 * Send a successful JSON response
 *
 * @param mixed $data Response data
 * @param int $statusCode HTTP status code (default 200)
 * @param array $meta Optional metadata (pagination, etc.)
 * @return never
 */
function jsonResponse(mixed $data, int $statusCode = 200, array $meta = []): never
{
    applyCors();
    http_response_code($statusCode);

    $response = ['success' => true, 'data' => $data];
    if (!empty($meta)) {
        $response['meta'] = $meta;
    }

    echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit(0);
}

/**
 * Send an error JSON response
 *
 * @param string $message Error message
 * @param int $statusCode HTTP status code (default 400)
 * @param mixed $errors Optional validation errors or details
 * @return never
 */
function jsonError(string $message, int $statusCode = 400, mixed $errors = null): never
{
    applyCors();
    http_response_code($statusCode);

    $response = ['success' => false, 'error' => $message];
    if ($errors !== null) {
        $response['errors'] = $errors;
    }

    echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit(0);
}

/**
 * Send a 404 Not Found response
 *
 * @param string $message Error message (default: "Resource not found")
 * @return never
 */
function jsonNotFound(string $message = 'Resource not found'): never
{
    jsonError($message, 404);
}

/**
 * Send a 422 Unprocessable Entity response (validation errors)
 *
 * @param string $message Error message
 * @param array $errors Validation errors (field => message)
 * @return never
 */
function jsonValidationError(string $message = 'Validation failed', array $errors = []): never
{
    jsonError($message, 422, $errors);
}

/**
 * Send a 500 Internal Server Error response
 *
 * @param string $message Error message (default: "Internal server error")
 * @return never
 */
function jsonServerError(string $message = 'Internal server error'): never
{
    // In production, log the actual error and return generic message
    if (($_ENV['APP_DEBUG'] ?? false) === true || ($_SERVER['APP_DEBUG'] ?? false) === true) {
        jsonError($message, 500);
    } else {
        jsonError('Internal server error', 500);
    }
}

/**
 * Send a 201 Created response with location header
 *
 * @param mixed $data Created resource data
 * @param string $location URL of the created resource
 * @return never
 */
function jsonCreated(mixed $data, string $location): never
{
    applyCors();
    http_response_code(201);
    header("Location: $location");

    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit(0);
}

/**
 * Send a 204 No Content response
 *
 * @return never
 */
function jsonNoContent(): never
{
    applyCors();
    http_response_code(204);
    exit(0);
}

/**
 * Handle uncaught exceptions and return JSON error
 *
 * @param Throwable $e
 * @return never
 */
function handleException(Throwable $e): never
{
    // Log the full error
    error_log("Uncaught exception: " . $e->getMessage() . "\n" . $e->getTraceAsString());

    $debug = ($_ENV['APP_DEBUG'] ?? $_SERVER['APP_DEBUG'] ?? false);

    if ($debug) {
        jsonError($e->getMessage(), 500, [
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => explode("\n", $e->getTraceAsString()),
        ]);
    } else {
        jsonServerError();
    }
}

// Set exception handler for uncaught exceptions
set_exception_handler('handleException');