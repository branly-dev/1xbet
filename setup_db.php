<?php
// Setup script for the Exam Assistant Database
require_once 'api/config/db.php';

$dbFile = 'database/database.sqlite';
if (file_exists($dbFile)) {
    unlink($dbFile);
    echo "Existing database deleted.\n";
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $sql = file_get_contents('database/schema.sql');
    $db->exec($sql);

    echo "Database created and seeded successfully.\n";
} catch (Exception $e) {
    echo "Error setting up database: " . $e->getMessage() . "\n";
}
?>
