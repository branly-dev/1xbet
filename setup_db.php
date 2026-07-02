<?php
require_once 'api/config/db.php';

$sql = file_get_contents('database/schema.sql');

try {
    $pdo->exec($sql);
    echo "Database setup successfully.\n";
} catch (PDOException $e) {
    echo "Error setting up database: " . $e->getMessage() . "\n";
}
?>
