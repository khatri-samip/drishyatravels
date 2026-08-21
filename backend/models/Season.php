<?php
/**
 * Season Model
 *
 * Handles all database operations for seasons (best time to visit)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/validation.php';

class Season
{
    /**
     * Get all seasons with optional filtering
     *
     * @param array $filters Filter options: status, limit, offset
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

        $whereClause = implode(' AND ', $where);

        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM `seasons` WHERE $whereClause";
        $totalResult = dbSelectOne($countSql, $params);
        $total = (int)($totalResult['total'] ?? 0);

        // Get paginated results
        $limit = $filters['limit'] ?? 50;
        $offset = $filters['offset'] ?? 0;

        $sql = "SELECT * FROM `seasons` WHERE $whereClause ORDER BY `display_order`, `id` LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $seasons = dbSelect($sql, $params);

        return [$seasons, $total];
    }

    /**
     * Get a single season by ID
     *
     * @param int $id Season ID
     * @return array|false
     */
    public static function getById(int $id): array|false
    {
        return dbSelectOne("SELECT * FROM `seasons` WHERE `id` = ?", [$id]);
    }

    /**
     * Get a single season by slug
     *
     * @param string $slug Season slug
     * @return array|false
     */
    public static function getBySlug(string $slug): array|false
    {
        return dbSelectOne("SELECT * FROM `seasons` WHERE `slug` = ?", [$slug]);
    }

    /**
     * Create a new season
     *
     * @param array $data Season data
     * @return array Created season
     * @throws Exception
     */
    public static function create(array $data): array
    {
        $errors = validateSeason($data);
        if (!empty($errors)) {
            throw new InvalidArgumentException('Validation failed: ' . json_encode($errors));
        }

        $sql = "INSERT INTO `seasons` (
            `slug`, `name`, `months`, `description`, `highlights`, `recommended_for`, `display_order`, `status`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        dbExecute($sql, [
            $data['slug'],
            $data['name'],
            $data['months'],
            $data['description'],
            $data['highlights'] ?? null,
            $data['recommended_for'] ?? null,
            $data['display_order'] ?? 0,
            $data['status'] ?? 'draft',
        ]);

        $id = dbSelectOne("SELECT LAST_INSERT_ID() as id")['id'];
        return self::getById($id);
    }

    /**
     * Update a season
     *
     * @param int $id Season ID
     * @param array $data Updated data (partial allowed)
     * @return array|false Updated season or false if not found
     * @throws Exception
     */
    public static function update(int $id, array $data): array|false
    {
        $existing = self::getById($id);
        if (!$existing) {
            return false;
        }

        $errors = validateSeason($data, true);
        if (!empty($errors)) {
            throw new InvalidArgumentException('Validation failed: ' . json_encode($errors));
        }

        $allowedFields = [
            'slug', 'name', 'months', 'description', 'highlights', 'recommended_for', 'display_order', 'status'
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
            $sql = "UPDATE `seasons` SET " . implode(', ', $setParts) . " WHERE `id` = ?";
            dbExecute($sql, $params);
        }

        return self::getById($id);
    }

    /**
     * Delete a season
     *
     * @param int $id Season ID
     * @return bool True if deleted, false if not found
     */
    public static function delete(int $id): bool
    {
        $affected = dbExecute("DELETE FROM `seasons` WHERE `id` = ?", [$id]);
        return $affected > 0;
    }

    /**
     * Update a season by slug
     *
     * @param string $slug Season slug
     * @param array $data Updated data (partial allowed)
     * @return array|false Updated season or false if not found
     * @throws Exception
     */
    public static function updateBySlug(string $slug, array $data): array|false
    {
        $existing = self::getBySlug($slug);
        if (!$existing) {
            return false;
        }
        return self::update($existing['id'], $data);
    }

    /**
     * Delete a season by slug
     *
     * @param string $slug Season slug
     * @return bool True if deleted, false if not found
     */
    public static function deleteBySlug(string $slug): bool
    {
        $existing = self::getBySlug($slug);
        if (!$existing) {
            return false;
        }
        return self::delete($existing['id']);
    }
}