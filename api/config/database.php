<?php
// api/config/database.php

function getDatabaseConnection() {
    $databasePath = getenv('DB_PATH') ?: __DIR__ . '/../../database/database.sqlite';

    try {
        $db = new PDO("sqlite:" . $databasePath);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $db;
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }
}
