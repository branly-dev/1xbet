<?php
// api/endpoints/assistant/chat.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

$userId = authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$message = $data['message'] ?? '';

if (empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Message is empty']);
    exit;
}

// Fetch user's exam type for context
$stmt = $pdo->prepare("SELECT exam_type FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();
$examType = $user['exam_type'] ?? 'BAC';

// Mock AI Logic in French
$responses = [
    "Comment puis-je t'aider pour ton examen de $examType ?",
    "C'est une excellente question pour le $examType. Voici une explication simple...",
    "N'oublie pas de réviser tes leçons de mathématiques pour le $examType.",
    "En tant qu'assistant IA, je suis là pour t'accompagner vers la réussite de ton $examType."
];
$mockResponse = $responses[array_rand($responses)];

// Store in chat history
$stmt = $pdo->prepare("INSERT INTO chat_history (user_id, message, response) VALUES (?, ?, ?)");
$stmt->execute([$userId, $message, $mockResponse]);

echo json_encode(['response' => $mockResponse]);
?>
