<?php
/**
 * Database Initializer for Cameroon Marketplace Platform
 * Initializes database (MySQL/MariaDB for WampServer, or fallback SQLite).
 */

require_once __DIR__ . '/api/config/database.php';

$db_dir = __DIR__ . '/database';
if (!is_dir($db_dir)) {
    mkdir($db_dir, 0777, true);
}

try {
    $db = getDatabaseConnection();

    // Read clean MySQL-compatible SQL queries
    $sql = file_get_contents(__DIR__ . '/database/schema.sql');
    if ($sql === false) {
        throw new Exception("Could not read database/schema.sql");
    }

    // Convert SQL schema for compatibility depending on PDO driver
    $driver_name = $db->getAttribute(PDO::ATTR_DRIVER_NAME);
    if ($driver_name === 'sqlite') {
        // Run as-is
        $db->exec($sql);
        echo "SQLite Database schema initialized successfully!\n";
    } else {
        // MySQL compatibility replacements
        $sql_mysql = str_replace('AUTOINCREMENT', 'AUTO_INCREMENT', $sql);
        $sql_mysql = str_replace('DATETIME DEFAULT CURRENT_TIMESTAMP', 'DATETIME DEFAULT CURRENT_TIMESTAMP', $sql_mysql);

        // Execute queries separatedly or directly
        $db->exec($sql_mysql);
        echo "MySQL/WampServer Database schema initialized successfully!\n";
    }

} catch (Exception $e) {
    echo "Error initializing database: " . $e->getMessage() . "\n";
    exit(1);
}
