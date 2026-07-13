<?php
// api/endpoints/chat.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../config/database.php';
require_once '../middleware/auth.php';

$userData = validateJWT();
$input = json_decode(file_get_contents('php://input'), true);

$message = $input['message'] ?? '';
$examId = $input['exam_id'] ?? null;
$subjectId = $input['subject_id'] ?? null;
$language = $input['language'] ?? 'fr';

if (empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Message is required']);
    exit;
}

$db = getDatabaseConnection();

// Get exam and subject names for context
$examName = "";
$subjectName = "";
if ($examId) {
    $stmt = $db->prepare("SELECT name_fr, name_en FROM exams WHERE id = ?");
    $stmt->execute([$examId]);
    $exam = $stmt->fetch();
    $examName = ($language === 'fr') ? $exam['name_fr'] : $exam['name_en'];
}
if ($subjectId) {
    $stmt = $db->prepare("SELECT name_fr, name_en FROM subjects WHERE id = ?");
    $stmt->execute([$subjectId]);
    $subject = $stmt->fetch();
    $subjectName = ($language === 'fr') ? $subject['name_fr'] : $subject['name_en'];
}

$apiKey = getenv('OPENAI_API_KEY');
$response = "";

if ($apiKey) {
    // OpenAI Integration
    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    $systemPrompt = "You are an AI assistant specialized in Cameroonian exams (BAC, Probatoire, BEPC).
                     The student is preparing for the " . $examName . " exam in " . $subjectName . ".
                     Provide helpful, educational, and encouraging advice in " . ($language === 'fr' ? 'French' : 'English') . ".";

    $postData = [
        'model' => 'gpt-3.5-turbo',
        'messages' => [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $message]
        ]
    ];

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);

    $apiResult = curl_exec($ch);
    if ($apiResult) {
        $decoded = json_decode($apiResult, true);
        $response = $decoded['choices'][0]['message']['content'] ?? "";
    }
    curl_close($ch);
}

if (empty($response)) {
    // Fallback Mock Response
    if ($language === 'fr') {
        $response = "En tant qu'assistant pour le " . $examName . " en " . $subjectName . ", je vous suggère de vous concentrer sur les annales des 5 dernières années concernant '" . $message . "'.";
    } else {
        $response = "As an assistant for the " . $examName . " in " . $subjectName . ", I suggest you focus on the past papers of the last 5 years regarding '" . $message . "'.";
    }
}

// Save to history
try {
    $stmt = $db->prepare("INSERT INTO chat_history (user_id, exam_id, subject_id, message, response, language) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$userData['id'], $examId, $subjectId, $message, $response, $language]);

    echo json_encode(['response' => $response]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save chat history']);
}
