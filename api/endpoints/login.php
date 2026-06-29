<?php
// api/endpoints/login.php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

if (empty($username) || empty($password)) {
    echo json_encode(['error' => 'Identifiants requis']);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    $token = generate_token($user['id'], $user['username']);
    echo json_encode([
        'message' => 'Connexion réussie',
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username']
        ]
    ]);
} else {
    header('HTTP/1.0 401 Unauthorized');
    echo json_encode(['error' => 'Identifiants incorrects']);
}
?>
