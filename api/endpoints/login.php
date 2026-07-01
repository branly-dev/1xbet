<?php
// api/endpoints/login.php
require_once __DIR__ . '/../middleware/auth.php';
$pdo = require_once __DIR__ . '/../config/database.php';

handleCORS();

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Nom d\'utilisateur et mot de passe requis']);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$data['username']]);
$user = $stmt->fetch();

if ($user && password_verify($data['password'], $user['password'])) {
    $token = generateJWT(['user_id' => $user['id'], 'username' => $user['username']]);
    echo json_encode(['token' => $token, 'username' => $user['username']]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Identifiants invalides']);
}
