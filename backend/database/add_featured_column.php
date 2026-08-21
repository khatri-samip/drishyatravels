<?php
/**
 * Migration: Add is_featured column to packages table
 */
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDatabaseConnection();

    // Check if column already exists
    $stmt = $pdo->query("SHOW COLUMNS FROM `packages` LIKE 'is_featured'");
    if ($stmt->fetch()) {
        echo "Column 'is_featured' already exists.\n";
        exit(0);
    }

    // Add the column
    $pdo->exec("ALTER TABLE `packages` ADD COLUMN `is_featured` BOOLEAN NOT NULL DEFAULT FALSE AFTER `status`");
    echo "Successfully added 'is_featured' column to packages table.\n";

    // Add index
    $pdo->exec("CREATE INDEX `idx_packages_featured` ON `packages`(`is_featured`)");
    echo "Successfully created index on is_featured column.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}