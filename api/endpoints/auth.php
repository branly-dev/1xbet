<?php
// api/endpoints/auth.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

$db = getDbConnection();

if ($action === 'register') {
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $db->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->bindValue(1, $username);
    $stmt->bindValue(2, $hashedPassword);

    try {
        $stmt->execute();
        echo json_encode(['message' => 'User registered successfully']);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Username already exists']);
    }
} elseif ($action === 'login') {
    $stmt = $db->prepare("SELECT id, password FROM users WHERE username = ?");
    $stmt->bindValue(1, $username);
    $result = $stmt->execute();
    $user = $result->fetchArray(SQLITE3_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        $token = generateJWT($user['id']);
        echo json_encode(['token' => $token, 'username' => $username]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid action']);
}
