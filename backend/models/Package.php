<?php
/**
 * Package Model
 *
 * Handles all database operations for travel packages
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/validation.php';

class Package
{
    /**
     * Get all packages with optional filtering
     *
     * @param array $filters Filter options: status, category, difficulty, limit, offset
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

        if (!empty($filters['category'])) {
            $where[] = '`category` = ?';
            $params[] = $filters['category'];
        }

        if (!empty($filters['difficulty'])) {
            $where[] = '`difficulty` = ?';
            $params[] = $filters['difficulty'];
        }

        $whereClause = implode(' AND ', $where);

        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM `packages` WHERE $whereClause";
        $totalResult = dbSelectOne($countSql, $params);
        $total = (int)($totalResult['total'] ?? 0);

        // Get paginated results
        $limit = $filters['limit'] ?? 50;
        $offset = $filters['offset'] ?? 0;

        $sql = "SELECT * FROM `packages` WHERE $whereClause ORDER BY `created_at` DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $packages = dbSelect($sql, $params);

        return [$packages, $total];
    }

    /**
     * Get a single package by ID with all relations
     *
     * @param string $id Package ID
     * @return array|false Package data with relations or false if not found
     */
    public static function getById(string $id): array|false
    {
        $package = dbSelectOne("SELECT * FROM `packages` WHERE `id` = ?", [$id]);
        if (!$package) {
            return false;
        }

        // Load all relations
        $package['itinerary'] = self::getItinerary($id);
        $package['highlights'] = self::getHighlights($id);
        $package['inclusions'] = self::getInclusions($id);
        $package['exclusions'] = self::getExclusions($id);
        $package['gallery'] = self::getGallery($id);
        $package['faqs'] = self::getFaqs($id);

        return $package;
    }

    /**
     * Get package without relations (lightweight)
     *
     * @param string $id Package ID
     * @return array|false
     */
    public static function getByIdSimple(string $id): array|false
    {
        return dbSelectOne("SELECT * FROM `packages` WHERE `id` = ?", [$id]);
    }

    /**
     * Create a new package with all relations
     *
     * @param array $data Package data including relations
     * @return array Created package with relations
     * @throws Exception
     */
    public static function create(array $data): array
    {
        $errors = validatePackage($data);
        if (!empty($errors)) {
            throw new InvalidArgumentException('Validation failed: ' . json_encode($errors));
        }

        return dbTransaction(function (PDO $pdo) use ($data) {
            // Insert main package
            $sql = "INSERT INTO `packages` (
                `id`, `title`, `category`, `destination`, `duration`, `price`, `currency`,
                `price_details`, `difficulty`, `best_season`, `maximum_altitude`,
                `starting_point`, `ending_point`, `package_type`, `short_description`,
                `description`, `hero_image_url`, `status`
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['id'],
                $data['title'],
                $data['category'],
                $data['destination'],
                $data['duration'],
                $data['price'],
                $data['currency'] ?? 'USD',
                $data['price_details'] ?? null,
                $data['difficulty'],
                $data['best_season'] ?? null,
                $data['maximum_altitude'] ?? null,
                $data['starting_point'] ?? null,
                $data['ending_point'] ?? null,
                $data['package_type'] ?? null,
                $data['short_description'],
                $data['description'],
                $data['hero_image_url'] ?? null,
                $data['status'] ?? 'draft',
            ]);

            $packageId = $data['id'];

            // Insert relations if provided
            if (!empty($data['itinerary']) && is_array($data['itinerary'])) {
                self::insertItinerary($pdo, $packageId, $data['itinerary']);
            }
            if (!empty($data['highlights']) && is_array($data['highlights'])) {
                self::insertHighlights($pdo, $packageId, $data['highlights']);
            }
            if (!empty($data['inclusions']) && is_array($data['inclusions'])) {
                self::insertInclusions($pdo, $packageId, $data['inclusions']);
            }
            if (!empty($data['exclusions']) && is_array($data['exclusions'])) {
                self::insertExclusions($pdo, $packageId, $data['exclusions']);
            }
            if (!empty($data['gallery']) && is_array($data['gallery'])) {
                self::insertGallery($pdo, $packageId, $data['gallery']);
            }
            if (!empty($data['faqs']) && is_array($data['faqs'])) {
                self::insertFaqs($pdo, $packageId, $data['faqs']);
            }

            return self::getById($packageId);
        });
    }

    /**
     * Update a package
     *
     * @param string $id Package ID
     * @param array $data Updated data (partial allowed)
     * @return array|false Updated package or false if not found
     * @throws Exception
     */
    public static function update(string $id, array $data): array|false
    {
        $existing = self::getByIdSimple($id);
        if (!$existing) {
            return false;
        }

        $errors = validatePackage($data, true);
        if (!empty($errors)) {
            throw new InvalidArgumentException('Validation failed: ' . json_encode($errors));
        }

        // Update relations FIRST if provided (handles relation-only updates)
        if (array_key_exists('itinerary', $data) && is_array($data['itinerary'])) {
            self::replaceItinerary($id, $data['itinerary']);
        }
        if (array_key_exists('highlights', $data) && is_array($data['highlights'])) {
            self::replaceHighlights($id, $data['highlights']);
        }
        if (array_key_exists('inclusions', $data) && is_array($data['inclusions'])) {
            self::replaceInclusions($id, $data['inclusions']);
        }
        if (array_key_exists('exclusions', $data) && is_array($data['exclusions'])) {
            self::replaceExclusions($id, $data['exclusions']);
        }
        if (array_key_exists('gallery', $data) && is_array($data['gallery'])) {
            self::replaceGallery($id, $data['gallery']);
        }
        if (array_key_exists('faqs', $data) && is_array($data['faqs'])) {
            self::replaceFaqs($id, $data['faqs']);
        }

        // Build dynamic update query for scalar fields
        $allowedFields = [
            'title', 'category', 'destination', 'duration', 'price', 'currency',
            'price_details', 'difficulty', 'best_season', 'maximum_altitude',
            'starting_point', 'ending_point', 'package_type', 'short_description',
            'description', 'hero_image_url', 'status'
        ];

        $setParts = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $setParts[] = "`$field` = ?";
                $params[] = $data[$field];
            }
        }

        // Update scalar fields if any
        if (!empty($setParts)) {
            $params[] = $id;
            $sql = "UPDATE `packages` SET " . implode(', ', $setParts) . " WHERE `id` = ?";
            dbExecute($sql, $params);
        }

        return self::getById($id);
    }

    /**
     * Delete a package (cascades to relations via FK)
     *
     * @param string $id Package ID
     * @return bool True if deleted, false if not found
     */
    public static function delete(string $id): bool
    {
        $affected = dbExecute("DELETE FROM `packages` WHERE `id` = ?", [$id]);
        return $affected > 0;
    }

    // ==================== Relation Methods ====================

    /**
     * Get itinerary for a package
     */
    public static function getItinerary(string $packageId): array
    {
        return dbSelect(
            "SELECT `id`, `day_number`, `title`, `description` FROM `itinerary_days` WHERE `package_id` = ? ORDER BY `day_number`",
            [$packageId]
        );
    }

    /**
     * Get highlights for a package
     */
    public static function getHighlights(string $packageId): array
    {
        return dbSelect(
            "SELECT `id`, `highlight`, `display_order` FROM `package_highlights` WHERE `package_id` = ? ORDER BY `display_order`, `id`",
            [$packageId]
        );
    }

    /**
     * Get inclusions for a package
     */
    public static function getInclusions(string $packageId): array
    {
        return dbSelect(
            "SELECT `id`, `inclusion`, `display_order` FROM `package_inclusions` WHERE `package_id` = ? ORDER BY `display_order`, `id`",
            [$packageId]
        );
    }

    /**
     * Get exclusions for a package
     */
    public static function getExclusions(string $packageId): array
    {
        return dbSelect(
            "SELECT `id`, `exclusion`, `display_order` FROM `package_exclusions` WHERE `package_id` = ? ORDER BY `display_order`, `id`",
            [$packageId]
        );
    }

    /**
     * Get gallery for a package
     */
    public static function getGallery(string $packageId): array
    {
        return dbSelect(
            "SELECT `id`, `image_url`, `display_order` FROM `package_gallery` WHERE `package_id` = ? ORDER BY `display_order`, `id`",
            [$packageId]
        );
    }

    /**
     * Get FAQs for a package
     */
    public static function getFaqs(string $packageId): array
    {
        return dbSelect(
            "SELECT `id`, `question`, `answer`, `display_order` FROM `package_faqs` WHERE `package_id` = ? ORDER BY `display_order`, `id`",
            [$packageId]
        );
    }

    /**
     * Get related/recommended packages for a package.
     *
     * Strategy: prefer published packages sharing the same category,
     * then same destination, then any other published packages,
     * excluding the package itself. Limited to $limit results.
     *
     * @param string $packageId Package ID
     * @param int $limit Maximum number of related packages
     * @return array
     */
    public static function getRelated(string $packageId, int $limit = 3): array
    {
        $limit = max(1, min(10, $limit));

        // Fetch the source package to base the relationship on
        $source = self::getByIdSimple($packageId);
        if (!$source) {
            return [];
        }

        $sql = "SELECT `id`, `title`, `category`, `destination`, `duration`, `price`, `currency`,
                       `difficulty`, `short_description`, `hero_image_url`
                FROM `packages`
                WHERE `id` != ? AND `status` = 'published'
                ORDER BY
                    (CASE WHEN `category` = ? THEN 0 ELSE 1 END),
                    (CASE WHEN `destination` = ? THEN 0 ELSE 1 END),
                    `created_at` DESC
                LIMIT ?";

        return dbSelect($sql, [$packageId, $source['category'], $source['destination'], $limit]);
    }

    // ==================== Private Insert/Replace Methods ====================

    private static function insertItinerary(PDO $pdo, string $packageId, array $items): void
    {
        $sql = "INSERT INTO `itinerary_days` (`package_id`, `day_number`, `title`, `description`) VALUES (?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        foreach ($items as $index => $item) {
            $dayNumber = $item['day_number'] ?? ($index + 1);
            $stmt->execute([$packageId, $dayNumber, $item['title'] ?? '', $item['description'] ?? '']);
        }
    }

    private static function insertHighlights(PDO $pdo, string $packageId, array $items): void
    {
        $sql = "INSERT INTO `package_highlights` (`package_id`, `highlight`, `display_order`) VALUES (?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        foreach ($items as $index => $item) {
            $highlight = is_string($item) ? $item : ($item['highlight'] ?? '');
            $displayOrder = $item['display_order'] ?? $index;
            $stmt->execute([$packageId, $highlight, $displayOrder]);
        }
    }

    private static function insertInclusions(PDO $pdo, string $packageId, array $items): void
    {
        $sql = "INSERT INTO `package_inclusions` (`package_id`, `inclusion`, `display_order`) VALUES (?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        foreach ($items as $index => $item) {
            $inclusion = is_string($item) ? $item : ($item['inclusion'] ?? '');
            $displayOrder = $item['display_order'] ?? $index;
            $stmt->execute([$packageId, $inclusion, $displayOrder]);
        }
    }

    private static function insertExclusions(PDO $pdo, string $packageId, array $items): void
    {
        $sql = "INSERT INTO `package_exclusions` (`package_id`, `exclusion`, `display_order`) VALUES (?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        foreach ($items as $index => $item) {
            $exclusion = is_string($item) ? $item : ($item['exclusion'] ?? '');
            $displayOrder = $item['display_order'] ?? $index;
            $stmt->execute([$packageId, $exclusion, $displayOrder]);
        }
    }

    private static function insertGallery(PDO $pdo, string $packageId, array $items): void
    {
        $sql = "INSERT INTO `package_gallery` (`package_id`, `image_url`, `display_order`) VALUES (?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        foreach ($items as $index => $item) {
            $imageUrl = is_string($item) ? $item : ($item['image_url'] ?? '');
            $displayOrder = $item['display_order'] ?? $index;
            $stmt->execute([$packageId, $imageUrl, $displayOrder]);
        }
    }

    private static function insertFaqs(PDO $pdo, string $packageId, array $items): void
    {
        $sql = "INSERT INTO `package_faqs` (`package_id`, `question`, `answer`, `display_order`) VALUES (?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        foreach ($items as $index => $item) {
            $question = is_string($item) ? $item : ($item['question'] ?? '');
            $answer = is_string($item) ? '' : ($item['answer'] ?? '');
            $displayOrder = $item['display_order'] ?? $index;
            // Handle array format: ["question", "answer"]
            if (is_array($item) && count($item) === 2 && isset($item[0], $item[1])) {
                $question = $item[0];
                $answer = $item[1];
            }
            $stmt->execute([$packageId, $question, $answer, $displayOrder]);
        }
    }

    private static function replaceItinerary(string $packageId, array $items): void
    {
        dbExecute("DELETE FROM `itinerary_days` WHERE `package_id` = ?", [$packageId]);
        if (!empty($items)) {
            dbTransaction(function (PDO $pdo) use ($packageId, $items) {
                self::insertItinerary($pdo, $packageId, $items);
            });
        }
    }

    private static function replaceHighlights(string $packageId, array $items): void
    {
        dbExecute("DELETE FROM `package_highlights` WHERE `package_id` = ?", [$packageId]);
        if (!empty($items)) {
            dbTransaction(function (PDO $pdo) use ($packageId, $items) {
                self::insertHighlights($pdo, $packageId, $items);
            });
        }
    }

    private static function replaceInclusions(string $packageId, array $items): void
    {
        dbExecute("DELETE FROM `package_inclusions` WHERE `package_id` = ?", [$packageId]);
        if (!empty($items)) {
            dbTransaction(function (PDO $pdo) use ($packageId, $items) {
                self::insertInclusions($pdo, $packageId, $items);
            });
        }
    }

    private static function replaceExclusions(string $packageId, array $items): void
    {
        dbExecute("DELETE FROM `package_exclusions` WHERE `package_id` = ?", [$packageId]);
        if (!empty($items)) {
            dbTransaction(function (PDO $pdo) use ($packageId, $items) {
                self::insertExclusions($pdo, $packageId, $items);
            });
        }
    }

    private static function replaceGallery(string $packageId, array $items): void
    {
        dbExecute("DELETE FROM `package_gallery` WHERE `package_id` = ?", [$packageId]);
        if (!empty($items)) {
            dbTransaction(function (PDO $pdo) use ($packageId, $items) {
                self::insertGallery($pdo, $packageId, $items);
            });
        }
    }

    private static function replaceFaqs(string $packageId, array $items): void
    {
        dbExecute("DELETE FROM `package_faqs` WHERE `package_id` = ?", [$packageId]);
        if (!empty($items)) {
            dbTransaction(function (PDO $pdo) use ($packageId, $items) {
                self::insertFaqs($pdo, $packageId, $items);
            });
        }
    }
}