<?php
$dbFile = __DIR__ . '/database/database.sqlite';
$schemaFile = __DIR__ . '/database/schema.sql';

if (!file_exists(__DIR__ . '/database')) {
    mkdir(__DIR__ . '/database', 0777, true);
}

try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = file_get_contents($schemaFile);
    $db->exec($sql);

    echo "Database setup successfully.\n";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
