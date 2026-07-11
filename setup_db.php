<?php
$dbFile = __DIR__ . '/database/database.sqlite';
$schemaFile = __DIR__ . '/database/schema.sql';

try {
    $pdo = new PDO('sqlite:' . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = file_get_contents($schemaFile);
    $pdo->exec($sql);

    echo "Database initialized successfully.\n";
} catch (PDOException $e) {
    die("Error initializing database: " . $e->getMessage() . "\n");
}
