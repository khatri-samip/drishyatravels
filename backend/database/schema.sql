-- ============================================================
-- DRISHYA TRAVELS
-- MySQL/MariaDB Database Schema
-- For use with MySQL 8.0+ / MariaDB 10.2+
-- ============================================================
--
-- Purpose:
--   Store travel packages and their related content.
--
-- Architecture:
--   Frontend -> PHP Backend -> MySQL/MariaDB
--
-- ============================================================

-- Drop existing tables if they exist (for clean re-run)
-- Order matters due to foreign keys - child tables first
DROP TABLE IF EXISTS `package_faqs`;
DROP TABLE IF EXISTS `package_gallery`;
DROP TABLE IF EXISTS `package_exclusions`;
DROP TABLE IF EXISTS `package_inclusions`;
DROP TABLE IF EXISTS `package_highlights`;
DROP TABLE IF EXISTS `itinerary_days`;
DROP TABLE IF EXISTS `packages`;

-- ============================================================
-- 1. PACKAGES
-- ============================================================

CREATE TABLE `packages` (
    `id` VARCHAR(100) NOT NULL PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `destination` VARCHAR(255) NOT NULL,
    `duration` VARCHAR(100) NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'USD',
    `price_details` TEXT,
    `difficulty` VARCHAR(50) NOT NULL,
    `best_season` VARCHAR(100),
    `maximum_altitude` VARCHAR(50),
    `starting_point` VARCHAR(100),
    `ending_point` VARCHAR(100),
    `package_type` VARCHAR(100),
    `short_description` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `hero_image_url` TEXT,
    `status` VARCHAR(20) NOT NULL DEFAULT 'draft',
    `is_featured` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Constraints
    CONSTRAINT `chk_packages_price` CHECK (`price` >= 0),
    CONSTRAINT `chk_packages_difficulty` CHECK (`difficulty` IN ('Easy', 'Moderate', 'Challenging')),
    CONSTRAINT `chk_packages_status` CHECK (`status` IN ('draft', 'published', 'archived')),
    CONSTRAINT `chk_packages_currency` CHECK (`currency` IN ('USD', 'NPR', 'EUR', 'GBP', 'INR'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. ITINERARY DAYS
-- ============================================================

CREATE TABLE `itinerary_days` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `package_id` VARCHAR(100) NOT NULL,
    `day_number` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    CONSTRAINT `fk_itinerary_days_package_id` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE CASCADE,
    CONSTRAINT `uk_itinerary_days_package_day` UNIQUE (`package_id`, `day_number`),
    CONSTRAINT `chk_itinerary_days_day_number` CHECK (`day_number` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. PACKAGE HIGHLIGHTS
-- ============================================================

CREATE TABLE `package_highlights` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `package_id` VARCHAR(100) NOT NULL,
    `highlight` TEXT NOT NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    CONSTRAINT `fk_package_highlights_package_id` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE CASCADE,
    CONSTRAINT `chk_package_highlights_display_order` CHECK (`display_order` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. PACKAGE INCLUSIONS
-- ============================================================

CREATE TABLE `package_inclusions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `package_id` VARCHAR(100) NOT NULL,
    `inclusion` TEXT NOT NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    CONSTRAINT `fk_package_inclusions_package_id` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE CASCADE,
    CONSTRAINT `chk_package_inclusions_display_order` CHECK (`display_order` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. PACKAGE EXCLUSIONS
-- ============================================================

CREATE TABLE `package_exclusions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `package_id` VARCHAR(100) NOT NULL,
    `exclusion` TEXT NOT NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    CONSTRAINT `fk_package_exclusions_package_id` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE CASCADE,
    CONSTRAINT `chk_package_exclusions_display_order` CHECK (`display_order` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. PACKAGE GALLERY
-- ============================================================

CREATE TABLE `package_gallery` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `package_id` VARCHAR(100) NOT NULL,
    `image_url` TEXT NOT NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    CONSTRAINT `fk_package_gallery_package_id` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE CASCADE,
    CONSTRAINT `chk_package_gallery_display_order` CHECK (`display_order` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. PACKAGE FAQS
-- ============================================================

CREATE TABLE `package_faqs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `package_id` VARCHAR(100) NOT NULL,
    `question` TEXT NOT NULL,
    `answer` TEXT NOT NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    CONSTRAINT `fk_package_faqs_package_id` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE CASCADE,
    CONSTRAINT `chk_package_faqs_display_order` CHECK (`display_order` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX `idx_packages_status` ON `packages`(`status`);
CREATE INDEX `idx_packages_category` ON `packages`(`category`);
CREATE INDEX `idx_packages_difficulty` ON `packages`(`difficulty`);
CREATE INDEX `idx_packages_currency` ON `packages`(`currency`);
CREATE INDEX `idx_packages_featured` ON `packages`(`is_featured`);
CREATE INDEX `idx_itinerary_days_package_id` ON `itinerary_days`(`package_id`);
CREATE INDEX `idx_package_highlights_package_id` ON `package_highlights`(`package_id`);
CREATE INDEX `idx_package_inclusions_package_id` ON `package_inclusions`(`package_id`);
CREATE INDEX `idx_package_exclusions_package_id` ON `package_exclusions`(`package_id`);
CREATE INDEX `idx_package_gallery_package_id` ON `package_gallery`(`package_id`);
CREATE INDEX `idx_package_faqs_package_id` ON `package_faqs`(`package_id`);

-- ============================================================
-- VERIFICATION QUERIES (run manually after seeding, not part of schema)
-- ============================================================

-- SELECT id, title, price, currency, status, is_featured FROM packages;

-- SELECT p.id, p.title, COUNT(DISTINCT i.id) as itinerary_days, COUNT(DISTINCT h.id) as highlights,
--        COUNT(DISTINCT inc.id) as inclusions, COUNT(DISTINCT exc.id) as exclusions,
--        COUNT(DISTINCT g.id) as gallery_images, COUNT(DISTINCT f.id) as faqs
-- FROM packages p
-- LEFT JOIN itinerary_days i ON i.package_id = p.id
-- LEFT JOIN package_highlights h ON h.package_id = p.id
-- LEFT JOIN package_inclusions inc ON inc.package_id = p.id
-- LEFT JOIN package_exclusions exc ON exc.package_id = p.id
-- LEFT JOIN package_gallery g ON g.package_id = p.id
-- LEFT JOIN package_faqs f ON f.package_id = p.id
-- GROUP BY p.id, p.title;

-- SELECT 'itinerary_days' as table_name, COUNT(*) FROM itinerary_days WHERE package_id NOT IN (SELECT id FROM packages)
-- UNION ALL SELECT 'package_highlights', COUNT(*) FROM package_highlights WHERE package_id NOT IN (SELECT id FROM packages)
-- UNION ALL SELECT 'package_inclusions', COUNT(*) FROM package_inclusions WHERE package_id NOT IN (SELECT id FROM packages)
-- UNION ALL SELECT 'package_exclusions', COUNT(*) FROM package_exclusions WHERE package_id NOT IN (SELECT id FROM packages)
-- UNION ALL SELECT 'package_gallery', COUNT(*) FROM package_gallery WHERE package_id NOT IN (SELECT id FROM packages)
-- UNION ALL SELECT 'package_faqs', COUNT(*) FROM package_faqs WHERE package_id NOT IN (SELECT id FROM packages);