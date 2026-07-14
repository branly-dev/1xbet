<?php
// api/config/database.php
function getDbConnection() {
    $dbPath = __DIR__ . '/../../database/database.sqlite';
    try {
        return new SQLite3($dbPath);
    } catch (Exception $e) {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }
}
