<?php
// api/endpoints/register.php
require_once __DIR__ . '/../middleware/auth.php';
$pdo = require_once __DIR__ . '/../config/database.php';

handleCORS();

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Nom d\'utilisateur et mot de passe requis']);
    exit;
}

$username = $data['username'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->execute([$username, $password]);
    echo json_encode(['message' => 'Utilisateur créé avec succès']);
} catch (PDOException $e) {
    http_response_code(400);
    echo json_encode(['error' => 'Nom d\'utilisateur déjà pris']);
}
