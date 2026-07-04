<?php
$dbFile = __DIR__ . '/database/database.sqlite';
$schemaFile = __DIR__ . '/database/schema.sql';

try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = file_get_contents($schemaFile);
    $db->exec($sql);

    echo "Database initialized successfully.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
