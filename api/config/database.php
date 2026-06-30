<?php
// api/config/database.php

$db_path = __DIR__ . '/../../database/app.sqlite';

try {
    $pdo = new PDO("sqlite:$db_path");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // Avoid disclosing the full error/path in production
    error_log($e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    die(json_encode(['error' => 'Erreur de connexion à la base de données']));
}
