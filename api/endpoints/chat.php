<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../config/database.php';
require_once '../middleware/auth.php';

$token = getBearerToken();
$userId = validateJWT($token);

if (!$userId) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$pdo = getDatabaseConnection();
$data = json_decode(file_get_contents("php://input"), true);

$message = $data['message'] ?? '';
$examId = $data['exam_id'] ?? 0;
$subjectId = $data['subject_id'] ?? 0;
$language = $data['language'] ?? 'fr';

if (!$message || !$examId || !$subjectId) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// AI Mock/Integration
$apiKey = getenv('OPENAI_API_KEY');
$aiResponse = "";

if ($apiKey) {
    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    $payload = json_encode([
        'model' => 'gpt-3.5-turbo',
        'messages' => [
            ['role' => 'system', 'content' => "Tu es un assistant pédagogique pour les examens camerounais. Réponds en " . ($language === 'fr' ? 'français' : 'anglais') . "."],
            ['role' => 'user', 'content' => $message]
        ]
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);
    $result = curl_exec($ch);
    $responseDecoded = json_decode($result, true);
    $aiResponse = $responseDecoded['choices'][0]['message']['content'] ?? "Désolé, je ne peux pas répondre pour le moment.";
    curl_close($ch);
} else {
    // Mock response
    $aiResponse = ($language === 'fr' ? "Ceci est une réponse simulée pour: " : "This is a mock response for: ") . $message;
}

// Save to chat history
$stmt = $pdo->prepare("INSERT INTO chat_history (user_id, exam_id, subject_id, message, response, language) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->execute([$userId, $examId, $subjectId, $message, $aiResponse, $language]);

echo json_encode(['response' => $aiResponse]);
