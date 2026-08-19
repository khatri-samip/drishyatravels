<?php
/**
 * Validation Utilities
 *
 * Input validation helpers for API endpoints
 */

/**
 * Validate required fields are present and not empty
 *
 * @param array $data Input data
 * @param array $required Array of required field names
 * @return array Empty if valid, otherwise field => error message
 */
function validateRequired(array $data, array $required): array
{
    $errors = [];
    foreach ($required as $field) {
        if (!array_key_exists($field, $data) || $data[$field] === '' || $data[$field] === null) {
            $errors[$field] = "$field is required";
        }
    }
    return $errors;
}

/**
 * Validate a field is one of allowed values
 *
 * @param mixed $value Value to validate
 * @param array $allowed Array of allowed values
 * @param string $fieldName Field name for error message
 * @return string|null Error message or null if valid
 */
function validateEnum(mixed $value, array $allowed, string $fieldName): ?string
{
    if ($value === null || $value === '') {
        return null; // Let required validation handle empty
    }
    if (!in_array($value, $allowed, true)) {
        return "$fieldName must be one of: " . implode(', ', $allowed);
    }
    return null;
}

/**
 * Validate a field is a positive integer
 *
 * @param mixed $value Value to validate
 * @param string $fieldName Field name for error message
 * @param int $min Minimum value (default 1)
 * @return string|null Error message or null if valid
 */
function validatePositiveInt(mixed $value, string $fieldName, int $min = 1): ?string
{
    if ($value === null || $value === '') {
        return null;
    }
    if (!is_numeric($value)) {
        return "$fieldName must be a number";
    }
    $intVal = (int)$value;
    if ((string)$intVal !== (string)$value && (string)$intVal !== (string)(float)$value) {
        return "$fieldName must be an integer";
    }
    if ($intVal < $min) {
        return "$fieldName must be at least $min";
    }
    return null;
}

/**
 * Validate a field is a valid decimal/float number
 *
 * @param mixed $value Value to validate
 * @param string $fieldName Field name for error message
 * @param float $min Minimum value
 * @return string|null Error message or null if valid
 */
function validateDecimal(mixed $value, string $fieldName, float $min = 0): ?string
{
    if ($value === null || $value === '') {
        return null;
    }
    if (!is_numeric($value)) {
        return "$fieldName must be a number";
    }
    $floatVal = (float)$value;
    if ($floatVal < $min) {
        return "$fieldName must be at least $min";
    }
    return null;
}

/**
 * Validate string length
 *
 * @param string $value Value to validate
 * @param string $fieldName Field name for error message
 * @param int $min Minimum length
 * @param int $max Maximum length
 * @return string|null Error message or null if valid
 */
function validateStringLength(string $value, string $fieldName, int $min = 0, int $max = 65535): ?string
{
    $len = mb_strlen($value);
    if ($len < $min) {
        return "$fieldName must be at least $min characters";
    }
    if ($len > $max) {
        return "$fieldName must not exceed $max characters";
    }
    return null;
}

/**
 * Validate email format
 *
 * @param string $value Value to validate
 * @param string $fieldName Field name for error message
 * @return string|null Error message or null if valid
 */
function validateEmail(string $value, string $fieldName = 'email'): ?string
{
    if ($value === '') return null;
    if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
        return "$fieldName must be a valid email address";
    }
    return null;
}

/**
 * Validate URL format
 *
 * @param string $value Value to validate
 * @param string $fieldName Field name for error message
 * @return string|null Error message or null if valid
 */
function validateUrl(string $value, string $fieldName = 'url'): ?string
{
    if ($value === '') return null;
    if (!filter_var($value, FILTER_VALIDATE_URL)) {
        return "$fieldName must be a valid URL";
    }
    return null;
}

/**
 * Sanitize string for safe output (basic XSS prevention)
 *
 * @param string $value
 * @return string
 */
function sanitizeString(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/**
 * Sanitize array recursively
 *
 * @param array $data
 * @return array
 */
function sanitizeArray(array $data): array
{
    $result = [];
    foreach ($data as $key => $value) {
        if (is_string($value)) {
            $result[$key] = sanitizeString($value);
        } elseif (is_array($value)) {
            $result[$key] = sanitizeArray($value);
        } else {
            $result[$key] = $value;
        }
    }
    return $result;
}

/**
 * Validate package data for create/update
 *
 * @param array $data Package data
 * @param bool $isUpdate Whether this is an update (optional fields)
 * @return array Validation errors (empty if valid)
 */
function validatePackage(array $data, bool $isUpdate = false): array
{
    $errors = [];

    // Required fields for create
    if (!$isUpdate) {
        $required = ['id', 'title', 'category', 'destination', 'duration', 'price', 'difficulty', 'short_description', 'description'];
        $errors = array_merge($errors, validateRequired($data, $required));
    }

    // Validate enum fields
    if (isset($data['difficulty'])) {
        $err = validateEnum($data['difficulty'], ['Easy', 'Moderate', 'Challenging'], 'difficulty');
        if ($err) $errors['difficulty'] = $err;
    }

    if (isset($data['status'])) {
        $err = validateEnum($data['status'], ['draft', 'published', 'archived'], 'status');
        if ($err) $errors['status'] = $err;
    }

    if (isset($data['currency'])) {
        $err = validateEnum($data['currency'], ['USD', 'NPR', 'EUR', 'GBP', 'INR'], 'currency');
        if ($err) $errors['currency'] = $err;
    }

    // Validate numeric fields
    if (isset($data['price'])) {
        $err = validateDecimal($data['price'], 'price', 0);
        if ($err) $errors['price'] = $err;
    }

    // Validate string lengths
    if (isset($data['title'])) {
        $err = validateStringLength($data['title'], 'title', 1, 255);
        if ($err) $errors['title'] = $err;
    }

    if (isset($data['id'])) {
        $err = validateStringLength($data['id'], 'id', 1, 100);
        if ($err) $errors['id'] = $err;
    }

    // Validate URLs
    if (isset($data['hero_image_url'])) {
        $err = validateUrl($data['hero_image_url'], 'hero_image_url');
        if ($err) $errors['hero_image_url'] = $err;
    }

    return $errors;
}

/**
 * Validate trip planner request data
 *
 * @param array $data Request data
 * @return array Validation errors (empty if valid)
 */
function validateTripPlanner(array $data): array
{
    $errors = [];

    $required = ['style', 'days', 'month', 'people'];
    $errors = array_merge($errors, validateRequired($data, $required));

    if (isset($data['style'])) {
        $err = validateEnum($data['style'], ['Adventure', 'Culture', 'Wildlife', 'Relaxed'], 'style');
        if ($err) $errors['style'] = $err;
    }

    if (isset($data['days'])) {
        $err = validatePositiveInt($data['days'], 'days', 1);
        if ($err) $errors['days'] = $err;
    }

    if (isset($data['people'])) {
        $err = validatePositiveInt($data['people'], 'people', 1);
        if ($err) $errors['people'] = $err;
    }

    return $errors;
}