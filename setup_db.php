<?php
require_once 'api/config/database.php';

$dbPath = 'database/database.sqlite';
if (file_exists($dbPath)) {
    unlink($dbPath);
}

$pdo = getDatabaseConnection();
$schema = file_get_contents('database/schema.sql');
$pdo->exec($schema);

echo "Database initialized successfully.\n";
?>
