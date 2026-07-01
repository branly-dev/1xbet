<?php
// setup_db.php
$pdo = require 'api/config/database.php';
$schema = file_get_contents('database/schema.sql');
$pdo->exec($schema);
echo "Database setup successfully.\n";
