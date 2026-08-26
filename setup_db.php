<?php
$dbFile = 'database/database.sqlite';
if (file_exists($dbFile)) {
    unlink($dbFile);
}
$db = new SQLite3($dbFile);
$schema = file_get_contents('database/schema.sql');
$db->exec($schema);
echo "Database initialized successfully.\n";
?>
