<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") { exit; }
// api/endpoints/login.php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

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
    $token = generateToken($user['id']);
    echo json_encode([
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'full_name' => $user['full_name'],
            'level' => $user['level']
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Identifiants invalides']);
}
