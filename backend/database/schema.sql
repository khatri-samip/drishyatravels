-- ============================================================
-- DRISHYA TRAVELS
-- MySQL/MariaDB Database Schema (Converted from PostgreSQL)
-- For use with XAMPP (MySQL 8.0+ / MariaDB 10.2+)
-- ============================================================
--
-- Purpose:
--   Store travel packages and their related content.
--
-- Architecture:
--   Frontend -> PHP Backend -> MySQL/MariaDB (via XAMPP)
--
-- This migration:
--   1. Creates the package database structure for MySQL
--   2. Seeds the 4 existing frontend packages
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
    -- Foreign Key
    CONSTRAINT `fk_itinerary_days_package_id` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE CASCADE,
    -- Unique Constraint
    CONSTRAINT `uk_itinerary_days_package_day` UNIQUE (`package_id`, `day_number`),
    -- Check Constraint
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
    -- Foreign Key
    CONSTRAINT `fk_package_highlights_package_id` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE CASCADE,
    -- Check Constraint
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
    -- Foreign Key
    CONSTRAINT `fk_package_inclusions_package_id` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE CASCADE,
    -- Check Constraint
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
    -- Foreign Key
    CONSTRAINT `fk_package_exclusions_package_id` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE CASCADE,
    -- Check Constraint
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
    -- Foreign Key
    CONSTRAINT `fk_package_gallery_package_id` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE CASCADE,
    -- Check Constraint
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
    -- Foreign Key
    CONSTRAINT `fk_package_faqs_package_id` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE CASCADE,
    -- Check Constraint
    CONSTRAINT `chk_package_faqs_display_order` CHECK (`display_order` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX `idx_packages_status` ON `packages`(`status`);
CREATE INDEX `idx_packages_category` ON `packages`(`category`);
CREATE INDEX `idx_packages_difficulty` ON `packages`(`difficulty`);
CREATE INDEX `idx_packages_currency` ON `packages`(`currency`);
CREATE INDEX `idx_itinerary_days_package_id` ON `itinerary_days`(`package_id`);
CREATE INDEX `idx_package_highlights_package_id` ON `package_highlights`(`package_id`);
CREATE INDEX `idx_package_inclusions_package_id` ON `package_inclusions`(`package_id`);
CREATE INDEX `idx_package_exclusions_package_id` ON `package_exclusions`(`package_id`);
CREATE INDEX `idx_package_gallery_package_id` ON `package_gallery`(`package_id`);
CREATE INDEX `idx_package_faqs_package_id` ON `package_faqs`(`package_id`);

-- ============================================================
-- SEED DATA
-- Existing packages from public/data/packages.js
-- Using INSERT ... ON DUPLICATE KEY UPDATE for idempotency
-- ============================================================


-- ============================================================
-- EVEREST BASE CAMP
-- ============================================================

INSERT INTO `packages` (
    `id`, `title`, `category`, `destination`, `duration`, `price`, `currency`,
    `price_details`, `difficulty`, `best_season`, `maximum_altitude`,
    `starting_point`, `ending_point`, `package_type`, `short_description`,
    `description`, `hero_image_url`, `status`
)
VALUES (
    'everest-base-camp',
    'Everest Base Camp Trek',
    'Trekking',
    'Everest Region, Nepal',
    '15 days',
    1725.00,
    'USD',
    '02 Pax: USD 1,725/person · 3–5 Pax: USD 1,695/person · 6–9 Pax: USD 1,635/person',
    'Challenging',
    'March–May, September–November',
    '5,545m',
    'Kathmandu',
    'Kathmandu',
    'Himalayan Trekking',
    'Everest Base Camp trekking through the Everest region, Sherpa settlements and the high Himalayas.',
    'Everest Base Camp Trekking takes you to some of the highest navigable points on Earth, through the Everest region, Sherpa settlements, monasteries and the Himalayan giants including Everest, Lhotse, Makalu, Ama Dablam and Cho Oyu.',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1800&q=85',
    'published'
)
ON DUPLICATE KEY UPDATE
    `title` = VALUES(`title`),
    `category` = VALUES(`category`),
    `destination` = VALUES(`destination`),
    `duration` = VALUES(`duration`),
    `price` = VALUES(`price`),
    `currency` = VALUES(`currency`),
    `price_details` = VALUES(`price_details`),
    `difficulty` = VALUES(`difficulty`),
    `best_season` = VALUES(`best_season`),
    `maximum_altitude` = VALUES(`maximum_altitude`),
    `starting_point` = VALUES(`starting_point`),
    `ending_point` = VALUES(`ending_point`),
    `package_type` = VALUES(`package_type`),
    `short_description` = VALUES(`short_description`),
    `description` = VALUES(`description`),
    `hero_image_url` = VALUES(`hero_image_url`),
    `status` = VALUES(`status`),
    `updated_at` = CURRENT_TIMESTAMP;


-- ============================================================
-- MARDI TREK
-- ============================================================

INSERT INTO `packages` (
    `id`, `title`, `category`, `destination`, `duration`, `price`, `currency`,
    `price_details`, `difficulty`, `best_season`, `maximum_altitude`,
    `starting_point`, `ending_point`, `package_type`, `short_description`,
    `description`, `hero_image_url`, `status`
)
VALUES (
    'mardi-trek',
    'Mardi Trek',
    'Trekking',
    'Mardi Himal, Nepal',
    '4 nights / 5 days',
    57400.00,
    'NPR',
    'Per person, including Government Tax',
    'Moderate',
    'March–May, September–November',
    '4,500m',
    'Pokhara',
    'Pokhara',
    'Himalayan Trekking',
    'A short Himalayan trek from Pokhara through Deurali, Low Camp and High Camp.',
    'A 4-night/5-day Mardi trek from Pokhara through Deurali, Low Camp and High Camp, with an excursion toward Mardi Himal Base Camp and a descent to Badal Danda and Siding.',
    'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1800&q=85',
    'published'
)
ON DUPLICATE KEY UPDATE
    `title` = VALUES(`title`),
    `category` = VALUES(`category`),
    `destination` = VALUES(`destination`),
    `duration` = VALUES(`duration`),
    `price` = VALUES(`price`),
    `currency` = VALUES(`currency`),
    `price_details` = VALUES(`price_details`),
    `difficulty` = VALUES(`difficulty`),
    `best_season` = VALUES(`best_season`),
    `maximum_altitude` = VALUES(`maximum_altitude`),
    `starting_point` = VALUES(`starting_point`),
    `ending_point` = VALUES(`ending_point`),
    `package_type` = VALUES(`package_type`),
    `short_description` = VALUES(`short_description`),
    `description` = VALUES(`description`),
    `hero_image_url` = VALUES(`hero_image_url`),
    `status` = VALUES(`status`),
    `updated_at` = CURRENT_TIMESTAMP;


-- ============================================================
-- RANI MAHAL
-- ============================================================

INSERT INTO `packages` (
    `id`, `title`, `category`, `destination`, `duration`, `price`, `currency`,
    `price_details`, `difficulty`, `best_season`, `maximum_altitude`,
    `starting_point`, `ending_point`, `package_type`, `short_description`,
    `description`, `hero_image_url`, `status`
)
VALUES (
    'rani-mahal',
    'The Taj of Nepal: Rani Mahal',
    'Cultural Tour',
    'Tansen · Palpa, Nepal',
    '2 nights / 3 days',
    11500.00,
    'NPR',
    'Per person',
    'Easy',
    'March–May, September–November',
    NULL,
    'Kathmandu',
    'Kathmandu',
    'Cultural Tour',
    'Explore historic Tansen and the riverside Rani Mahal, known as the Taj of Nepal.',
    'Explore Tansen and Rani Mahal, the historic palace associated with Khadga Shumsher Jung Bahadur Rana and situated on the bank of the Kali Gandaki River. It is often called the Taj of Nepal.',
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1800&q=85',
    'published'
)
ON DUPLICATE KEY UPDATE
    `title` = VALUES(`title`),
    `category` = VALUES(`category`),
    `destination` = VALUES(`destination`),
    `duration` = VALUES(`duration`),
    `price` = VALUES(`price`),
    `currency` = VALUES(`currency`),
    `price_details` = VALUES(`price_details`),
    `difficulty` = VALUES(`difficulty`),
    `best_season` = VALUES(`best_season`),
    `maximum_altitude` = VALUES(`maximum_altitude`),
    `starting_point` = VALUES(`starting_point`),
    `ending_point` = VALUES(`ending_point`),
    `package_type` = VALUES(`package_type`),
    `short_description` = VALUES(`short_description`),
    `description` = VALUES(`description`),
    `hero_image_url` = VALUES(`hero_image_url`),
    `status` = VALUES(`status`),
    `updated_at` = CURRENT_TIMESTAMP;


-- ============================================================
-- MANANG
-- ============================================================

INSERT INTO `packages` (
    `id`, `title`, `category`, `destination`, `duration`, `price`, `currency`,
    `price_details`, `difficulty`, `best_season`, `maximum_altitude`,
    `starting_point`, `ending_point`, `package_type`, `short_description`,
    `description`, `hero_image_url`, `status`
)
VALUES (
    'manang',
    'Explore the District after Himalayas: Manang',
    'Adventure Tour',
    'Manang, Nepal',
    '4 nights / 5 days',
    16500.00,
    'NPR',
    'Per person',
    'Moderate',
    'March–May, September–November',
    NULL,
    'Kathmandu',
    'Kathmandu',
    'Himalayan Tour',
    'Explore Chame, Pisang and the Manang Valley with scenic lakes, mountains and landscapes.',
    'A 4-night/5-day journey through Chame, Pisang and the Manang valley, including exploration around Green Lake, Blue Lake and Gangapurna.',
    'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1800&q=85',
    'published'
)
ON DUPLICATE KEY UPDATE
    `title` = VALUES(`title`),
    `category` = VALUES(`category`),
    `destination` = VALUES(`destination`),
    `duration` = VALUES(`duration`),
    `price` = VALUES(`price`),
    `currency` = VALUES(`currency`),
    `price_details` = VALUES(`price_details`),
    `difficulty` = VALUES(`difficulty`),
    `best_season` = VALUES(`best_season`),
    `maximum_altitude` = VALUES(`maximum_altitude`),
    `starting_point` = VALUES(`starting_point`),
    `ending_point` = VALUES(`ending_point`),
    `package_type` = VALUES(`package_type`),
    `short_description` = VALUES(`short_description`),
    `description` = VALUES(`description`),
    `hero_image_url` = VALUES(`hero_image_url`),
    `status` = VALUES(`status`),
    `updated_at` = CURRENT_TIMESTAMP;


-- ============================================================
-- ITINERARY
-- ============================================================

INSERT INTO `itinerary_days` (`package_id`, `day_number`, `title`, `description`)
VALUES
-- Everest
('everest-base-camp', 1, 'Arrive to Kathmandu and Transfer to Hotel', 'Panoramic arrival into Kathmandu, airport meet-and-greet, hotel transfer and briefing. Overnight at Hotel Marshyangdi.'),
('everest-base-camp', 2, 'Kathmandu Sightseeing', 'Sightseeing at Pashupatinath, Boudhanath and Patan Durbar Square. Overnight at Hotel Marshyangdi.'),
('everest-base-camp', 3, 'Fly to Lukla · Trek to Phakding', 'Fly to Lukla (2840m, approximately 45 minutes) and trek to Phakding (2610m, approximately 3–4 hours).'),
('everest-base-camp', 4, 'Trek to Namche Bazar', 'Trek from Phakding to Namche Bazar (3450m, approximately 6–7 hours), crossing suspension bridges and entering Sagarmatha National Park.'),
('everest-base-camp', 5, 'Acclimatization in Namche Bazar', 'Explore Namche Bazar and optional hikes around Khunde, Khumjung and the Everest View Hotel.'),
('everest-base-camp', 6, 'Trek to Tengboche', 'Trek to Tengboche (3867m, approximately 5–6 hours), with views of Everest, Lhotse, Nuptse and Ama Dablam.'),
('everest-base-camp', 7, 'Trek to Dingboche', 'Descend through forest, cross the Imja Khola and continue to Dingboche (4410m).'),
('everest-base-camp', 8, 'Rest Day in Dingboche', 'Acclimatization day with options including Nangkartshang Peak, Chhukung Village or Chhukung Ri.'),
('everest-base-camp', 9, 'Trek to Lobuche', 'Continue beneath Cholatse and Tawoche, pass the Khumbu Glacier moraine and reach Lobuche (4930m).'),
('everest-base-camp', 10, 'Goraksheop · Everest Base Camp · Gorakshep', 'Trek to Goraksheop (5184m), continue to Everest Base Camp (5357m) and return to Gorakshep; approximately 7–8 hours.'),
('everest-base-camp', 11, 'Kala Patthar · Pheriche', 'Morning climb to Kala Patthar (approximately 5545m), return to Gorakshep and trek to Pheriche (4371m), approximately 7–8 hours.'),
('everest-base-camp', 12, 'Trek to Namche Bazar', 'Mostly downhill trekking following the river, passing Tengboche and returning to Namche Bazar (3450m).'),
('everest-base-camp', 13, 'Trek to Lukla', 'Final trekking day following the Dudh Koshi to Lukla (2840m), with a farewell celebration in the evening.'),
('everest-base-camp', 14, 'Fly Back to Kathmandu', 'Fly back to Kathmandu and transfer to the hotel. Free time for shopping or exploring Thamel.'),
('everest-base-camp', 15, 'International Departure', 'Transfer to the airport for your international flight.'),

-- Mardi
('mardi-trek', 1, 'Pokhara to Deaurali', 'Guide pickup from Pokhara and drive to Kande. Trek to Pitan Deurali (1925m), about 4 hours. Overnight at the lodge.'),
('mardi-trek', 2, 'Deurali to Low Camp', 'Trek from Pitan Deurali to Low Camp (2985m). Lunch at Forest Camp (2600m) after about four hours. Total trekking time is about 6 hours. Overnight at the lodge.'),
('mardi-trek', 3, 'Low Camp to High Camp', 'Trek from Low Camp to High Camp (3,700m). Enjoy views of Machhapuchhre ahead and Annapurna South to the left. Trek takes about four hours. Overnight at the lodge.'),
('mardi-trek', 4, 'High Camp to Mardi to Badal Danda', 'Hike to Mardi Himal Base Camp (4500m) and return to High Camp, approximately 4–5 hours round trip. Then trek down to Badal Danda (3210m) and overnight at a lodge.'),
('mardi-trek', 5, 'Badal Danda to Pokhara', 'Trek to Siding village for about 5 hours and drive back to Pokhara.'),

-- Rani Mahal
('rani-mahal', 1, 'KTM – Tansen', 'Depart Kathmandu at 6:00 AM. Drive through Nagdhunga, Chitwan and the Daunne section, enter Butwal and head uphill to Tansen. Overnight at Hotel Pauwa Palpa.'),
('rani-mahal', 2, 'Tansen – Rani Mahal', 'Breakfast at Hotel Pauwa Palpa, then drive approximately 13 km from Tansen to Rani Mahal. Explore the palace and Kali Gandaki River, take photos/videos and return to the hotel for the night.'),
('rani-mahal', 3, 'Tansen – Kathmandu', 'Wake up at 8:00 AM, have breakfast, pack belongings and depart for Kathmandu by drive.'),

-- Manang
('manang', 1, 'KTM – Chame', 'Depart Kathmandu at 6:00 AM. Drive through Trishuli River, Mugling and Chitwan, then via Dumre to the Besisahar–Chame road. Continue the off-road route beside the Marshyangdi River to Chame. Overnight at Hotel New Shangrila.'),
('manang', 2, 'Chame – Pisang', 'Wake early for mountain views, have breakfast and drive to Pisang. Enjoy the apple farming and Manang Valley. Overnight at Hotel Himalayan Mountain Bridge and rooftop restaurant.'),
('manang', 3, 'Explore Pisang', 'Explore Green Lake, then continue to Blue Lake and Gangapurna. Return to the hotel for dinner and overnight.'),
('manang', 4, 'Pisang – Besisahar', 'Wake early and pack by 8:00 AM. Have breakfast and drive back to Besisahar, enjoying the Marshyangdi gorge and Octopus Fall.'),
('manang', 5, 'Besisahar – Kathmandu', 'Wake early, have breakfast, pack belongings and depart for Kathmandu.')
ON DUPLICATE KEY UPDATE
    `title` = VALUES(`title`),
    `description` = VALUES(`description`);


-- ============================================================
-- HIGHLIGHTS
-- ============================================================

INSERT INTO `package_highlights` (`package_id`, `highlight`, `display_order`)
VALUES
('everest-base-camp', 'Everest Base Camp at 5357m', 0),
('everest-base-camp', 'Kala Patthar viewpoint at approximately 5545m', 1),
('everest-base-camp', 'Lukla mountain flight', 2),
('everest-base-camp', 'Namche Bazaar acclimatization', 3),
('everest-base-camp', 'Tengboche Monastery', 4),
('everest-base-camp', 'Sherpa villages and Himalayan landscapes', 5),

('mardi-trek', 'Pokhara to Kande by sharing jeep', 0),
('mardi-trek', 'Pitan Deurali and Low Camp', 1),
('mardi-trek', 'High Camp at approximately 3,700m', 2),
('mardi-trek', 'Mardi Himal Base Camp excursion up to 4,500m', 3),
('mardi-trek', 'Badal Danda and Siding', 4),
('mardi-trek', 'Tea house accommodation and trekking meals', 5),

('rani-mahal', 'Historic Tansen', 0),
('rani-mahal', 'Rani Mahal', 1),
('rani-mahal', 'Kali Gandaki River', 2),
('rani-mahal', 'Scenic western Nepal drive', 3),
('rani-mahal', 'Hotel Pauwa Palpa', 4),

('manang', 'Scenic Kathmandu–Chame drive', 0),
('manang', 'Marshyangdi River and gorge', 1),
('manang', 'Chame and Pisang', 2),
('manang', 'Green Lake', 3),
('manang', 'Blue Lake and Gangapurna', 4),
('manang', 'Manang Valley landscapes', 5);


-- ============================================================
-- INCLUSIONS
-- ============================================================

INSERT INTO `package_inclusions` (`package_id`, `inclusion`, `display_order`)
VALUES
('everest-base-camp', 'Lodge trek with guide, accommodation and porters (standard room on twin sharing)', 0),
('everest-base-camp', 'All meals during tea house trek only', 1),
('everest-base-camp', 'English-speaking local expert guide', 2),
('everest-base-camp', 'Porter service (2 members = 1 porter)', 3),
('everest-base-camp', 'Domestic KTM/LUK/KTM flights', 4),
('everest-base-camp', 'Sagarmatha National Park permit', 5),
('everest-base-camp', 'Khumbu Village Development Community (VDC) permit', 6),
('everest-base-camp', '3 nights in Kathmandu hotel on twin sharing basis with breakfast', 7),
('everest-base-camp', 'Airport transfer', 8),
('everest-base-camp', 'Insurance of staff and porters', 9),
('everest-base-camp', 'Equipment and clothing of staff and porters', 10),
('everest-base-camp', 'First aid kit carried by guide', 11),

('mardi-trek', 'Kathmandu–Pokhara by flight as per itinerary', 0),
('mardi-trek', 'Pokhara–Kande by sharing jeep', 1),
('mardi-trek', 'Siding–Pokhara by sharing jeep', 2),
('mardi-trek', '4 nights accommodation in tea house during trek', 3),
('mardi-trek', 'Breakfast, lunch and dinner during the trek', 4),
('mardi-trek', 'ACAP permit and TIMS', 5),
('mardi-trek', 'English-speaking guide during trek', 6),
('mardi-trek', 'Applicable government tax and service charge', 7),

('rani-mahal', 'Two-way transportation', 0),
('rani-mahal', 'Upper Mustang Restricted Area Permit (RAP)', 1),
('rani-mahal', 'Two meals a day (Breakfast and Dinner) during the journey', 2),
('rani-mahal', 'Applicable government taxes and service charges', 3),

('manang', '4 nights accommodation during the trip', 0),
('manang', 'All meals (Breakfast and Dinner) during the trip', 1),
('manang', 'Applicable government tax and service charge', 2),
('manang', 'Two-way transportation', 3);


-- ============================================================
-- EXCLUSIONS
-- ============================================================

INSERT INTO `package_exclusions` (`package_id`, `exclusion`, `display_order`)
VALUES
('everest-base-camp', 'Nepal visa fees', 0),
('everest-base-camp', 'International flight and airport tax', 1),
('everest-base-camp', 'Lunch and dinner in Kathmandu', 2),
('everest-base-camp', 'Personal expenses such as laundry, bar bills, internet, camera/mobile recharge, hot/cold shower, extra meals and snacks', 3),
('everest-base-camp', 'Personal gear and clothing', 4),
('everest-base-camp', 'Tips for guide, porter, driver and staff', 5),
('everest-base-camp', 'Personal insurance and medical expenses', 6),
('everest-base-camp', 'Emergency evacuation or rescue expenses', 7),
('everest-base-camp', 'Any other service not mentioned in price includes', 8),

('mardi-trek', 'Visa fee', 0),
('mardi-trek', 'Insurance', 1),
('mardi-trek', 'Personal expenses', 2),
('mardi-trek', 'Beverage, liquor and any kind of drinks', 3),
('mardi-trek', 'Tips', 4),
('mardi-trek', 'Extra costs from unforeseen incidents beyond control', 5),

('rani-mahal', 'Visa fee', 0),
('rani-mahal', 'Insurance', 1),
('rani-mahal', 'Beverage, liquor and any kind of drinks', 2),
('rani-mahal', 'Tips', 3),
('rani-mahal', 'Extra costs from unforeseen incidents beyond control', 4),

('manang', 'Visa fee', 0),
('manang', 'Insurance', 1),
('manang', 'Personal expenses', 2),
('manang', 'Beverage, liquor and any kind of drinks', 3),
('manang', 'Tips', 4),
('manang', 'Extra costs from unforeseen incidents beyond control', 5);


-- ============================================================
-- GALLERY
-- ============================================================

INSERT INTO `package_gallery` (`package_id`, `image_url`, `display_order`)
VALUES
('everest-base-camp', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80', 0),
('everest-base-camp', 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1000&q=80', 1),
('everest-base-camp', 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1000&q=80', 2),

('mardi-trek', 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80', 0),
('mardi-trek', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80', 1),
('mardi-trek', 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1000&q=80', 2),

('rani-mahal', 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80', 0),
('rani-mahal', 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1000&q=80', 1),
('rani-mahal', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80', 2),

('manang', 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1200&q=80', 0),
('manang', 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1000&q=80', 1),
('manang', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80', 2);


-- ============================================================
-- FAQS
-- ============================================================

INSERT INTO `package_faqs` (`package_id`, `question`, `answer`, `display_order`)
VALUES
('everest-base-camp',
 'What is included in the Everest Base Camp package?',
 'The supplied package includes lodge accommodation, guide, porter, trekking meals, domestic flights, permits, Kathmandu hotel nights, airport transfers and staff support.',
 0),

('everest-base-camp',
 'How long is the trek?',
 'The supplied itinerary is 15 days from arrival in Kathmandu through international departure.',
 1),

('everest-base-camp',
 'What is the price?',
 'The supplied price is USD 1,725 per person for 2 pax, USD 1,695 per person for 3–5 pax, and USD 1,635 per person for 6–9 pax, on twin sharing basis.',
 2),

('mardi-trek',
 'How much does the Mardi Trek cost?',
 'The supplied price is NPR 57,400 per person including Government Tax.',
 0),

('mardi-trek',
 'Is an extra day possible?',
 'Yes. The supplied itinerary says the trek can be extended one more day from Siding to Lwang via Ghalel before driving back to Pokhara.',
 1),

('rani-mahal',
 'How much is the Rani Mahal package?',
 'The supplied price is NPR 11,500 per person.',
 0),

('rani-mahal',
 'What is Rani Mahal known as?',
 'The supplied description says the palace is often called the Taj of Nepal because of its resemblance to the Taj Palace of India and its riverside setting.',
 1),

('manang',
 'How much is the Manang package?',
 'The supplied price is NPR 16,500 per person.',
 0),

('manang',
 'What is included?',
 'The supplied package includes four nights accommodation, breakfast and dinner, two-way transportation, and applicable government taxes and service charges.',
 1);

-- ============================================================
-- MIGRATIONS
-- ============================================================

-- Add is_featured column to packages table (if not exists)
-- Run this separately if the table already exists
-- ALTER TABLE `packages` ADD COLUMN `is_featured` BOOLEAN NOT NULL DEFAULT FALSE AFTER `status`;

-- Add index for featured packages
-- CREATE INDEX `idx_packages_featured` ON `packages`(`is_featured`);

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Verify 4 packages exist with correct status
-- SELECT id, title, price, currency, status FROM packages WHERE id IN ('everest-base-camp', 'mardi-trek', 'rani-mahal', 'manang');

-- Count child records per package
-- SELECT p.id, p.title, COUNT(DISTINCT i.id) as itinerary_days, COUNT(DISTINCT h.id) as highlights, COUNT(DISTINCT inc.id) as inclusions, COUNT(DISTINCT exc.id) as exclusions, COUNT(DISTINCT g.id) as gallery_images, COUNT(DISTINCT f.id) as faqs FROM packages p LEFT JOIN itinerary_days i ON i.package_id = p.id LEFT JOIN package_highlights h ON h.package_id = p.id LEFT JOIN package_inclusions inc ON inc.package_id = p.id LEFT JOIN package_exclusions exc ON exc.package_id = p.id LEFT JOIN package_gallery g ON g.package_id = p.id LEFT JOIN package_faqs f ON f.package_id = p.id WHERE p.id IN ('everest-base-camp', 'mardi-trek', 'rani-mahal', 'manang') GROUP BY p.id, p.title;

-- Verify no orphaned child records
-- SELECT 'itinerary_days' as table_name, COUNT(*) FROM itinerary_days WHERE package_id NOT IN (SELECT id FROM packages) UNION ALL SELECT 'package_highlights', COUNT(*) FROM package_highlights WHERE package_id NOT IN (SELECT id FROM packages) UNION ALL SELECT 'package_inclusions', COUNT(*) FROM package_inclusions WHERE package_id NOT IN (SELECT id FROM packages) UNION ALL SELECT 'package_exclusions', COUNT(*) FROM package_exclusions WHERE package_id NOT IN (SELECT id FROM packages) UNION ALL SELECT 'package_gallery', COUNT(*) FROM package_gallery WHERE package_id NOT IN (SELECT id FROM packages) UNION ALL SELECT 'package_faqs', COUNT(*) FROM package_faqs WHERE package_id NOT IN (SELECT id FROM packages);