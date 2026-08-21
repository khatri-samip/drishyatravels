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

/**
 * Validate content page data for create/update
 *
 * @param array $data Content page data
 * @param bool $isUpdate Whether this is an update (optional fields)
 * @return array Validation errors (empty if valid)
 */
function validateContentPage(array $data, bool $isUpdate = false): array
{
    $errors = [];

    // Required fields for create
    if (!$isUpdate) {
        $required = ['slug', 'title', 'content'];
        $errors = array_merge($errors, validateRequired($data, $required));
    }

    // Validate enum fields
    if (isset($data['status'])) {
        $err = validateEnum($data['status'], ['draft', 'published', 'archived'], 'status');
        if ($err) $errors['status'] = $err;
    }

    // Validate string lengths
    if (isset($data['slug'])) {
        $err = validateStringLength($data['slug'], 'slug', 1, 100);
        if ($err) $errors['slug'] = $err;
    }

    if (isset($data['title'])) {
        $err = validateStringLength($data['title'], 'title', 1, 255);
        if ($err) $errors['title'] = $err;
    }

    if (isset($data['meta_title'])) {
        $err = validateStringLength($data['meta_title'], 'meta_title', 0, 255);
        if ($err) $errors['meta_title'] = $err;
    }

    if (isset($data['meta_description'])) {
        $err = validateStringLength($data['meta_description'], 'meta_description', 0, 500);
        if ($err) $errors['meta_description'] = $err;
    }

    // Validate URLs
    if (isset($data['meta_image_url'])) {
        $err = validateUrl($data['meta_image_url'], 'meta_image_url');
        if ($err) $errors['meta_image_url'] = $err;
    }

    return $errors;
}

/**
 * Validate travel tip data for create/update
 *
 * @param array $data Travel tip data
 * @param bool $isUpdate Whether this is an update (optional fields)
 * @return array Validation errors (empty if valid)
 */
function validateTravelTip(array $data, bool $isUpdate = false): array
{
    $errors = [];

    // Required fields for create
    if (!$isUpdate) {
        $required = ['slug', 'title', 'content'];
        $errors = array_merge($errors, validateRequired($data, $required));
    }

    // Validate enum fields
    if (isset($data['status'])) {
        $err = validateEnum($data['status'], ['draft', 'published', 'archived'], 'status');
        if ($err) $errors['status'] = $err;
    }

    // Validate string lengths
    if (isset($data['slug'])) {
        $err = validateStringLength($data['slug'], 'slug', 1, 100);
        if ($err) $errors['slug'] = $err;
    }

    if (isset($data['title'])) {
        $err = validateStringLength($data['title'], 'title', 1, 255);
        if ($err) $errors['title'] = $err;
    }

    if (isset($data['icon'])) {
        $err = validateStringLength($data['icon'], 'icon', 0, 100);
        if ($err) $errors['icon'] = $err;
    }

    // Validate display_order
    if (isset($data['display_order'])) {
        $err = validatePositiveInt($data['display_order'], 'display_order', 0);
        if ($err) $errors['display_order'] = $err;
    }

    return $errors;
}

/**
 * Validate visa rule data for create/update
 *
 * @param array $data Visa rule data
 * @param bool $isUpdate Whether this is an update (optional fields)
 * @return array Validation errors (empty if valid)
 */
function validateVisaRule(array $data, bool $isUpdate = false): array
{
    $errors = [];

    // Required fields for create
    if (!$isUpdate) {
        $required = ['country_code', 'country_name'];
        $errors = array_merge($errors, validateRequired($data, $required));
    }

    // Validate enum fields
    if (isset($data['status'])) {
        $err = validateEnum($data['status'], ['draft', 'published', 'archived'], 'status');
        if ($err) $errors['status'] = $err;
    }

    // Validate boolean fields
    if (isset($data['visa_required']) && !is_bool($data['visa_required'])) {
        $errors['visa_required'] = 'visa_required must be a boolean';
    }
    if (isset($data['visa_on_arrival']) && !is_bool($data['visa_on_arrival'])) {
        $errors['visa_on_arrival'] = 'visa_on_arrival must be a boolean';
    }

    // Validate string lengths
    if (isset($data['country_code'])) {
        $err = validateStringLength($data['country_code'], 'country_code', 2, 2);
        if ($err) $errors['country_code'] = $err;
    }

    if (isset($data['country_name'])) {
        $err = validateStringLength($data['country_name'], 'country_name', 1, 100);
        if ($err) $errors['country_name'] = $err;
    }

    // Validate numeric fields
    if (isset($data['visa_free_days'])) {
        $err = validatePositiveInt($data['visa_free_days'], 'visa_free_days', 1);
        if ($err) $errors['visa_free_days'] = $err;
    }

    if (isset($data['visa_fee_usd'])) {
        $err = validateDecimal($data['visa_fee_usd'], 'visa_fee_usd', 0);
        if ($err) $errors['visa_fee_usd'] = $err;
    }

    // Validate URLs
    if (isset($data['official_url'])) {
        $err = validateUrl($data['official_url'], 'official_url');
        if ($err) $errors['official_url'] = $err;
    }

    return $errors;
}

/**
 * Validate season data for create/update
 *
 * @param array $data Season data
 * @param bool $isUpdate Whether this is an update (optional fields)
 * @return array Validation errors (empty if valid)
 */
function validateSeason(array $data, bool $isUpdate = false): array
{
    $errors = [];

    // Required fields for create
    if (!$isUpdate) {
        $required = ['slug', 'name', 'months', 'description'];
        $errors = array_merge($errors, validateRequired($data, $required));
    }

    // Validate enum fields
    if (isset($data['status'])) {
        $err = validateEnum($data['status'], ['draft', 'published', 'archived'], 'status');
        if ($err) $errors['status'] = $err;
    }

    // Validate string lengths
    if (isset($data['slug'])) {
        $err = validateStringLength($data['slug'], 'slug', 1, 100);
        if ($err) $errors['slug'] = $err;
    }

    if (isset($data['name'])) {
        $err = validateStringLength($data['name'], 'name', 1, 100);
        if ($err) $errors['name'] = $err;
    }

    if (isset($data['months'])) {
        $err = validateStringLength($data['months'], 'months', 1, 50);
        if ($err) $errors['months'] = $err;
    }

    // Validate display_order
    if (isset($data['display_order'])) {
        $err = validatePositiveInt($data['display_order'], 'display_order', 0);
        if ($err) $errors['display_order'] = $err;
    }

    return $errors;
}