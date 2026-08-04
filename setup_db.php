<?php
/**
 * Database Initializer for Cameroon Marketplace Platform
 * Initializes SQLite database.
 */

$db_dir = __DIR__ . '/database';
if (!is_dir($db_dir)) {
    mkdir($db_dir, 0777, true);
}

$db_path = $db_dir . '/database.sqlite';
try {
    $db = new PDO('sqlite:' . $db_path);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = file_get_contents(__DIR__ . '/database/schema.sql');
    if ($sql === false) {
        throw new Exception("Could not read database/schema.sql");
    }

    $db->exec($sql);
    echo "Database schema initialized successfully in $db_path\n";
} catch (Exception $e) {
    echo "Error initializing database: " . $e->getMessage() . "\n";
    exit(1);
}
