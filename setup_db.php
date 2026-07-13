<?php
// setup_db.php
require_once 'api/config/database.php';

$dbPath = __DIR__ . '/database/database.sqlite';
if (!file_exists(__DIR__ . '/database')) {
    mkdir(__DIR__ . '/database', 0777, true);
}

try {
    $db = new PDO("sqlite:" . $dbPath);
    $schema = file_get_contents(__DIR__ . '/database/schema.sql');
    $db->exec($schema);
    echo "Database and schema initialized successfully.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
