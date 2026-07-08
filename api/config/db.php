<?php
/**
 * Configuration de la connexion à la base de données PostgreSQL
 * Utilise les variables d'environnement pour la sécurité.
 */

$host = getenv('DB_HOST') ?: 'localhost';
$port = getenv('DB_PORT') ?: '5432';
$dbname = getenv('DB_NAME') ?: 'juristeia_db';
$user = getenv('DB_USER') ?: 'postgres';
$pass = getenv('DB_PASS') ?: '';

header('Content-Type: application/json; charset=utf-8');

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
    $pdo = new PDO($dsn, $user, $pass);

    // Configuration de PDO pour la sécurité et la performance
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

} catch (PDOException $e) {
    // Retourne une erreur JSON propre au lieu de die()
    http_response_code(500);
    echo json_encode([
        "error" => "Database connection failed",
        "message" => "Une erreur interne est survenue lors de la connexion à la base de données."
    ]);
    exit;
}
