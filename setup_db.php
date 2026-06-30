<?php
// setup_db.php
require_once 'api/config/database.php';

$schema = file_get_contents('database/schema.sql');
$pdo->exec($schema);

echo "Database initialized successfully.\n";
