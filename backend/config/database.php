<?php
/**
 * Database Configuration
 *
 * Centralized PDO connection for MySQL/MariaDB (XAMPP)
 * Uses environment variables with sensible defaults for local development
 */

// Load environment variables from .env if it exists
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#')) continue;
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            if (!array_key_exists($key, $_SERVER) && !array_key_exists($key, $_ENV)) {
                putenv("$key=$value");
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }
    }
}

/**
 * Get database configuration from environment with defaults
 */
function getDatabaseConfig(): array
{
    return [
        'host' => $_ENV['DB_HOST'] ?? $_SERVER['DB_HOST'] ?? 'localhost',
        'port' => (int)($_ENV['DB_PORT'] ?? $_SERVER['DB_PORT'] ?? 3306),
        'dbname' => $_ENV['DB_NAME'] ?? $_SERVER['DB_NAME'] ?? 'drishya_travels',
        'username' => $_ENV['DB_USER'] ?? $_SERVER['DB_USER'] ?? 'root',
        'password' => $_ENV['DB_PASS'] ?? $_SERVER['DB_PASS'] ?? '',
        'charset' => 'utf8mb4',
        'options' => [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        ],
    ];
}

/**
 * Create and return a PDO instance
 *
 * @return PDO
 * @throws PDOException
 */
function getDatabaseConnection(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $config = getDatabaseConfig();
        $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['dbname']};charset={$config['charset']}";

        try {
            $pdo = new PDO($dsn, $config['username'], $config['password'], $config['options']);
        } catch (PDOException $e) {
            // In production, log this error instead of exposing details
            error_log("Database connection failed: " . $e->getMessage());
            throw new PDOException("Database connection failed", 0, $e);
        }
    }

    return $pdo;
}

/**
 * Execute a SELECT query and return all results
 *
 * @param string $sql
 * @param array $params
 * @return array
 */
function dbSelect(string $sql, array $params = []): array
{
    $pdo = getDatabaseConnection();
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

/**
 * Execute a SELECT query and return a single result
 *
 * @param string $sql
 * @param array $params
 * @return array|false
 */
function dbSelectOne(string $sql, array $params = []): array|false
{
    $pdo = getDatabaseConnection();
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetch() ?: false;
}

/**
 * Execute an INSERT query and return the last insert ID
 *
 * @param string $sql
 * @param array $params
 * @return int|string
 */
function dbInsert(string $sql, array $params = []): int|string
{
    $pdo = getDatabaseConnection();
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $pdo->lastInsertId();
}

/**
 * Execute an UPDATE/DELETE query and return affected rows
 *
 * @param string $sql
 * @param array $params
 * @return int
 */
function dbExecute(string $sql, array $params = []): int
{
    $pdo = getDatabaseConnection();
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->rowCount();
}

/**
 * Execute a query within a transaction
 *
 * @param callable $callback Function that receives PDO and returns a value
 * @return mixed
 * @throws Exception
 */
function dbTransaction(callable $callback): mixed
{
    $pdo = getDatabaseConnection();
    $pdo->beginTransaction();
    try {
        $result = $callback($pdo);
        $pdo->commit();
        return $result;
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}