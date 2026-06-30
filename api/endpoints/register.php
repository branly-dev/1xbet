<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") { exit; }
// api/endpoints/register.php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Nom d\'utilisateur et mot de passe requis']);
    exit;
}

$username = $data['username'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);
$full_name = $data['full_name'] ?? '';
$level = $data['level'] ?? '';

try {
    $stmt = $pdo->prepare("INSERT INTO users (username, password, full_name, level) VALUES (?, ?, ?, ?)");
    $stmt->execute([$username, $password, $full_name, $level]);
    echo json_encode(['message' => 'Utilisateur créé avec succès']);
} catch (PDOException $e) {
    http_response_code(400);
    echo json_encode(['error' => 'L\'utilisateur existe déjà ou erreur de base de données']);
}
