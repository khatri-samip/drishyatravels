<?php
/**
 * Travel Tip Model
 *
 * Handles all database operations for travel tips
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/validation.php';

class TravelTip
{
    /**
     * Get all travel tips with optional filtering
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
        $countSql = "SELECT COUNT(*) as total FROM `travel_tips` WHERE $whereClause";
        $totalResult = dbSelectOne($countSql, $params);
        $total = (int)($totalResult['total'] ?? 0);

        // Get paginated results
        $limit = $filters['limit'] ?? 50;
        $offset = $filters['offset'] ?? 0;

        $sql = "SELECT * FROM `travel_tips` WHERE $whereClause ORDER BY `display_order`, `id` LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $tips = dbSelect($sql, $params);

        return [$tips, $total];
    }

    /**
     * Get a single travel tip by ID
     *
     * @param int $id Travel tip ID
     * @return array|false
     */
    public static function getById(int $id): array|false
    {
        return dbSelectOne("SELECT * FROM `travel_tips` WHERE `id` = ?", [$id]);
    }

    /**
     * Get a single travel tip by slug
     *
     * @param string $slug Travel tip slug
     * @return array|false
     */
    public static function getBySlug(string $slug): array|false
    {
        return dbSelectOne("SELECT * FROM `travel_tips` WHERE `slug` = ?", [$slug]);
    }

    /**
     * Create a new travel tip
     *
     * @param array $data Travel tip data
     * @return array Created travel tip
     * @throws Exception
     */
    public static function create(array $data): array
    {
        $errors = validateTravelTip($data);
        if (!empty($errors)) {
            throw new InvalidArgumentException('Validation failed: ' . json_encode($errors));
        }

        $sql = "INSERT INTO `travel_tips` (
            `slug`, `title`, `icon`, `summary`, `content`, `display_order`, `status`
        ) VALUES (?, ?, ?, ?, ?, ?, ?)";

        dbExecute($sql, [
            $data['slug'],
            $data['title'],
            $data['icon'] ?? null,
            $data['summary'] ?? null,
            $data['content'],
            $data['display_order'] ?? 0,
            $data['status'] ?? 'draft',
        ]);

        $id = dbSelectOne("SELECT LAST_INSERT_ID() as id")['id'];
        return self::getById($id);
    }

    /**
     * Update a travel tip
     *
     * @param int $id Travel tip ID
     * @param array $data Updated data (partial allowed)
     * @return array|false Updated travel tip or false if not found
     * @throws Exception
     */
    public static function update(int $id, array $data): array|false
    {
        $existing = self::getById($id);
        if (!$existing) {
            return false;
        }

        $errors = validateTravelTip($data, true);
        if (!empty($errors)) {
            throw new InvalidArgumentException('Validation failed: ' . json_encode($errors));
        }

        $allowedFields = [
            'slug', 'title', 'icon', 'summary', 'content', 'display_order', 'status'
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
            $sql = "UPDATE `travel_tips` SET " . implode(', ', $setParts) . " WHERE `id` = ?";
            dbExecute($sql, $params);
        }

        return self::getById($id);
    }

    /**
     * Delete a travel tip
     *
     * @param int $id Travel tip ID
     * @return bool True if deleted, false if not found
     */
    public static function delete(int $id): bool
    {
        $affected = dbExecute("DELETE FROM `travel_tips` WHERE `id` = ?", [$id]);
        return $affected > 0;
    }

    /**
     * Update a travel tip by slug
     *
     * @param string $slug Travel tip slug
     * @param array $data Updated data (partial allowed)
     * @return array|false Updated travel tip or false if not found
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
     * Delete a travel tip by slug
     *
     * @param string $slug Travel tip slug
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