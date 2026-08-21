<?php
/**
 * Visa Rule Model
 *
 * Handles all database operations for visa rules
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/validation.php';

class VisaRule
{
    /**
     * Get all visa rules with optional filtering
     *
     * @param array $filters Filter options: status, country_code, limit, offset
     * @return array [data, total]
     */
    public static function getAll(array $filters = []): array
    {
        $where = ['1=1'];
        $params = [];

        if (!empty($filters['status'])) {
            $where[] = '`status` = ?';
            $params[] = $filters['status'];
        }

        if (!empty($filters['country_code'])) {
            $where[] = '`country_code` = ?';
            $params[] = strtoupper($filters['country_code']);
        }

        $whereClause = implode(' AND ', $where);

        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM `visa_rules` WHERE $whereClause";
        $totalResult = dbSelectOne($countSql, $params);
        $total = (int)($totalResult['total'] ?? 0);

        // Get paginated results
        $limit = $filters['limit'] ?? 100;
        $offset = $filters['offset'] ?? 0;

        $sql = "SELECT * FROM `visa_rules` WHERE $whereClause ORDER BY `country_name` LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $rules = dbSelect($sql, $params);

        return [$rules, $total];
    }

    /**
     * Get a single visa rule by ID
     *
     * @param int $id Visa rule ID
     * @return array|false
     */
    public static function getById(int $id): array|false
    {
        return dbSelectOne("SELECT * FROM `visa_rules` WHERE `id` = ?", [$id]);
    }

    /**
     * Get a single visa rule by country code
     *
     * @param string $countryCode ISO 2-letter country code
     * @return array|false
     */
    public static function getByCountryCode(string $countryCode): array|false
    {
        return dbSelectOne("SELECT * FROM `visa_rules` WHERE `country_code` = ?", [strtoupper($countryCode)]);
    }

    /**
     * Get default visa rule for unspecified countries
     *
     * @return array|false
     */
    public static function getDefault(): array|false
    {
        return dbSelectOne("SELECT * FROM `visa_rules` WHERE `country_code` = 'XX' AND `status` = 'published'");
    }

    /**
     * Create a new visa rule
     *
     * @param array $data Visa rule data
     * @return array Created visa rule
     * @throws Exception
     */
    public static function create(array $data): array
    {
        $errors = validateVisaRule($data);
        if (!empty($errors)) {
            throw new InvalidArgumentException('Validation failed: ' . json_encode($errors));
        }

        $data['country_code'] = strtoupper($data['country_code']);

        $sql = "INSERT INTO `visa_rules` (
            `country_code`, `country_name`, `visa_required`, `visa_on_arrival`, `visa_free_days`,
            `visa_fee_usd`, `requirements`, `notes`, `official_url`, `status`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        dbExecute($sql, [
            $data['country_code'],
            $data['country_name'],
            $data['visa_required'] ?? true,
            $data['visa_on_arrival'] ?? false,
            $data['visa_free_days'] ?? null,
            $data['visa_fee_usd'] ?? null,
            $data['requirements'] ?? null,
            $data['notes'] ?? null,
            $data['official_url'] ?? null,
            $data['status'] ?? 'draft',
        ]);

        $id = dbSelectOne("SELECT LAST_INSERT_ID() as id")['id'];
        return self::getById($id);
    }

    /**
     * Update a visa rule
     *
     * @param int $id Visa rule ID
     * @param array $data Updated data (partial allowed)
     * @return array|false Updated visa rule or false if not found
     * @throws Exception
     */
    public static function update(int $id, array $data): array|false
    {
        $existing = self::getById($id);
        if (!$existing) {
            return false;
        }

        $errors = validateVisaRule($data, true);
        if (!empty($errors)) {
            throw new InvalidArgumentException('Validation failed: ' . json_encode($errors));
        }

        if (isset($data['country_code'])) {
            $data['country_code'] = strtoupper($data['country_code']);
        }

        $allowedFields = [
            'country_code', 'country_name', 'visa_required', 'visa_on_arrival', 'visa_free_days',
            'visa_fee_usd', 'requirements', 'notes', 'official_url', 'status'
        ];

        $setParts = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $setParts[] = "`$field` = ?";
                $params[] = $data[$field];
            }
        }

        if (!empty($setParts)) {
            $params[] = $id;
            $sql = "UPDATE `visa_rules` SET " . implode(', ', $setParts) . " WHERE `id` = ?";
            dbExecute($sql, $params);
        }

        return self::getById($id);
    }

    /**
     * Delete a visa rule
     *
     * @param int $id Visa rule ID
     * @return bool True if deleted, false if not found
     */
    public static function delete(int $id): bool
    {
        $affected = dbExecute("DELETE FROM `visa_rules` WHERE `id` = ?", [$id]);
        return $affected > 0;
    }

    /**
     * Update a visa rule by country code
     *
     * @param string $countryCode ISO 2-letter country code
     * @param array $data Updated data (partial allowed)
     * @return array|false Updated visa rule or false if not found
     * @throws Exception
     */
    public static function updateByCountryCode(string $countryCode, array $data): array|false
    {
        $existing = self::getByCountryCode($countryCode);
        if (!$existing) {
            return false;
        }
        return self::update($existing['id'], $data);
    }

    /**
     * Delete a visa rule by country code
     *
     * @param string $countryCode ISO 2-letter country code
     * @return bool True if deleted, false if not found
     */
    public static function deleteByCountryCode(string $countryCode): bool
    {
        $existing = self::getByCountryCode($countryCode);
        if (!$existing) {
            return false;
        }
        return self::delete($existing['id']);
    }
}