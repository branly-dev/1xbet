<?php
// api/endpoints/auth/register.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username'], $data['password'], $data['exam_type'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$username = $data['username'];
$password = password_hash($data['password'], PASSWORD_BCRYPT);
$exam_type = $data['exam_type'];

try {
    $stmt = $pdo->prepare("INSERT INTO users (username, password, exam_type) VALUES (?, ?, ?)");
    $stmt->execute([$username, $password, $exam_type]);
    echo json_encode(['message' => 'User registered successfully']);
} catch (PDOException $e) {
    http_response_code(400);
    echo json_encode(['error' => 'User already exists or database error']);
}
?>
