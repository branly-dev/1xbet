<?php
// api/endpoints/auth.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../config/database.php';
require_once '../middleware/auth.php';

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';
$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Username and password required']);
    exit;
}

$db = getDatabaseConnection();

if ($action === 'register') {
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    try {
        $stmt = $db->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $stmt->execute([$username, $hashedPassword]);
        $userId = $db->lastInsertId();
        $token = generateJWT($userId, $username);
        echo json_encode(['token' => $token, 'username' => $username]);
    } catch (PDOException $e) {
        http_response_code(409);
        echo json_encode(['error' => 'Username already exists']);
    }
} elseif ($action === 'login') {
    $stmt = $db->prepare("SELECT id, password FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $token = generateJWT($user['id'], $username);
        echo json_encode(['token' => $token, 'username' => $username]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid action']);
}
