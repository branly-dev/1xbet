<?php
/**
 * Database configuration & CORS helper.
 * Supports both SQLite (local development / testing) and MySQL / MariaDB (WampServer production / local).
 */

if (!function_exists('handleCors')) {
    function handleCors() {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
}

// Ensure CORS is set on initial load if running in server context
if (isset($_SERVER['REQUEST_METHOD'])) {
    handleCors();
}

function getDatabaseConnection() {
    // MySQL (WampServer) settings prioritized via env or fallback defaults
    $mysql_host = getenv('DB_HOST') ?: 'localhost';
    $mysql_user = getenv('DB_USER') ?: 'root';
    $mysql_pass = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : ''; // WampServer default is usually empty string ''
    $mysql_db   = getenv('DB_NAME') ?: 'marketplace';

    // Toggle database driver: Use SQLite if DB_DRIVER is explicitly set to 'sqlite' or if mysql extension isn't loaded
    $driver = getenv('DB_DRIVER') ?: 'sqlite';

    try {
        if ($driver === 'mysql' || !file_exists(dirname(dirname(__DIR__)) . '/database/database.sqlite')) {
            $dsn = "mysql:host=$mysql_host;dbname=$mysql_db;charset=utf8mb4";
            $db = new PDO($dsn, $mysql_user, $mysql_pass);
        } else {
            // Default SQLite connection
            $db_path = dirname(dirname(__DIR__)) . '/database/database.sqlite';
            $db = new PDO('sqlite:' . $db_path);
        }
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $db;
    } catch (Exception $e) {
        // Fallback to SQLite if MySQL connection fails in fallback environments
        try {
            $db_path = dirname(dirname(__DIR__)) . '/database/database.sqlite';
            $db = new PDO('sqlite:' . $db_path);
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $db;
        } catch (Exception $sqlite_ex) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit();
        }
    }
}
