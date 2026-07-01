<?php
// api/endpoints/chat.php
require_once __DIR__ . '/../middleware/auth.php';
$pdo = require_once __DIR__ . '/../config/database.php';

handleCORS();
$user = authenticate();

$data = json_decode(file_get_contents('php://input'), true);
$message = $data['message'] ?? '';
$exam_id = $data['exam_id'] ?? null;
$subject_id = $data['subject_id'] ?? null;

if (empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Le message est vide']);
    exit;
}

// Fetch context names
$exam_name = "examen camerounais";
if ($exam_id) {
    $stmt = $pdo->prepare("SELECT name FROM exams WHERE id = ?");
    $stmt->execute([$exam_id]);
    $exam = $stmt->fetch();
    if ($exam) $exam_name = $exam['name'];
}

$subject_name = "toutes matières";
if ($subject_id) {
    $stmt = $pdo->prepare("SELECT name FROM subjects WHERE id = ?");
    $stmt->execute([$subject_id]);
    $subject = $stmt->fetch();
    if ($subject) $subject_name = $subject['name'];
}

$apiKey = getenv('OPENAI_API_KEY');
$responseContent = "";

if ($apiKey) {
    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);
    $postData = [
        'model' => 'gpt-3.5-turbo',
        'messages' => [
            ['role' => 'system', 'content' => "Tu es un assistant pédagogique expert pour les examens du Cameroun ($exam_name, $subject_name). Aide les élèves avec des explications claires et en français."],
            ['role' => 'user', 'content' => $message]
        ]
    ];
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
    $apiResponse = curl_exec($ch);
    $apiResponseData = json_decode($apiResponse, true);
    $responseContent = $apiResponseData['choices'][0]['message']['content'] ?? "Désolé, je ne peux pas répondre pour le moment.";
    curl_close($ch);
} else {
    // Context-aware mock fallback
    $responseContent = "En tant qu'expert pour le $exam_name en $subject_name au Cameroun, je peux vous dire que pour votre question : '$message', il est important de maîtriser les concepts clés du programme officiel de l'OBC ou du GCE Board. Comment puis-je approfondir ce point avec vous ?";
}

// Save to history
$stmt = $pdo->prepare("INSERT INTO chat_history (user_id, message, response, exam_id, subject_id) VALUES (?, ?, ?, ?, ?)");
$stmt->execute([$user['user_id'], $message, $responseContent, $exam_id, $subject_id]);

echo json_encode(['response' => $responseContent]);
