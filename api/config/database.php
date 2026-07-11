<?php
function getDatabaseConnection() {
    $dbFile = __DIR__ . '/../../database/database.sqlite';
    try {
        $pdo = new PDO('sqlite:' . $dbFile);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        header('Content-Type: application/json', true, 500);
        echo json_encode(['error' => 'Database connection failed. Please contact administrator.']);
        exit;
    }
}
