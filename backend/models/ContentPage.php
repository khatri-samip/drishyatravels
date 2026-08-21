<?php
/**
 * Content Page Model
 *
 * Handles all database operations for static content pages
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/validation.php';

class ContentPage
{
    /**
     * Get all content pages with optional filtering
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
        $countSql = "SELECT COUNT(*) as total FROM `content_pages` WHERE $whereClause";
        $totalResult = dbSelectOne($countSql, $params);
        $total = (int)($totalResult['total'] ?? 0);

        // Get paginated results
        $limit = $filters['limit'] ?? 50;
        $offset = $filters['offset'] ?? 0;

        $sql = "SELECT * FROM `content_pages` WHERE $whereClause ORDER BY `updated_at` DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $pages = dbSelect($sql, $params);

        return [$pages, $total];
    }

    /**
     * Get a single content page by ID
     *
     * @param int $id Content page ID
     * @return array|false
     */
    public static function getById(int $id): array|false
    {
        return dbSelectOne("SELECT * FROM `content_pages` WHERE `id` = ?", [$id]);
    }

    /**
     * Get a single content page by slug
     *
     * @param string $slug Content page slug
     * @return array|false
     */
    public static function getBySlug(string $slug): array|false
    {
        return dbSelectOne("SELECT * FROM `content_pages` WHERE `slug` = ?", [$slug]);
    }

    /**
     * Create a new content page
     *
     * @param array $data Content page data
     * @return array Created content page
     * @throws Exception
     */
    public static function create(array $data): array
    {
        $errors = validateContentPage($data);
        if (!empty($errors)) {
            throw new InvalidArgumentException('Validation failed: ' . json_encode($errors));
        }

        $sql = "INSERT INTO `content_pages` (
            `slug`, `title`, `description`, `content`, `meta_title`, `meta_description`, `status`
        ) VALUES (?, ?, ?, ?, ?, ?, ?)";

        dbExecute($sql, [
            $data['slug'],
            $data['title'],
            $data['description'] ?? null,
            $data['content'],
            $data['meta_title'] ?? null,
            $data['meta_description'] ?? null,
            $data['status'] ?? 'draft',
        ]);

        $id = dbSelectOne("SELECT LAST_INSERT_ID() as id")['id'];
        return self::getById($id);
    }

    /**
     * Update a content page
     *
     * @param int $id Content page ID
     * @param array $data Updated data (partial allowed)
     * @return array|false Updated content page or false if not found
     * @throws Exception
     */
    public static function update(int $id, array $data): array|false
    {
        $existing = self::getById($id);
        if (!$existing) {
            return false;
        }

        $errors = validateContentPage($data, true);
        if (!empty($errors)) {
            throw new InvalidArgumentException('Validation failed: ' . json_encode($errors));
        }

        $allowedFields = [
            'slug', 'title', 'description', 'content', 'meta_title', 'meta_description', 'status'
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
            $sql = "UPDATE `content_pages` SET " . implode(', ', $setParts) . " WHERE `id` = ?";
            dbExecute($sql, $params);
        }

        return self::getById($id);
    }

    /**
     * Delete a content page
     *
     * @param int $id Content page ID
     * @return bool True if deleted, false if not found
     */
    public static function delete(int $id): bool
    {
        $affected = dbExecute("DELETE FROM `content_pages` WHERE `id` = ?", [$id]);
        return $affected > 0;
    }

    /**
     * Update a content page by slug
     *
     * @param string $slug Content page slug
     * @param array $data Updated data (partial allowed)
     * @return array|false Updated content page or false if not found
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
     * Delete a content page by slug
     *
     * @param string $slug Content page slug
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