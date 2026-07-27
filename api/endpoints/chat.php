<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

handleCors();
$user = getAuthUser();
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$db = getDatabaseConnection();
$data = json_decode(file_get_contents('php://input'), true);

$message = $data['message'] ?? '';
$examId = $data['exam_id'] ?? 0;
$subjectId = $data['subject_id'] ?? 0;
$language = $data['language'] ?? 'fr';

if (!$message || !$examId || !$subjectId) {
    http_response_code(400);
    echo json_encode(['error' => 'Message, exam_id and subject_id are required']);
    exit;
}

$stmt = $db->prepare("SELECT * FROM exams WHERE id = ?");
$stmt->execute([$examId]);
$exam = $stmt->fetch();

$stmt = $db->prepare("SELECT * FROM subjects WHERE id = ?");
$stmt->execute([$subjectId]);
$subject = $stmt->fetch();

if (!$exam || !$subject) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Invalid exam_id or subject_id']);
    exit;
}

$examName = ($language === 'fr') ? $exam['name_fr'] : $exam['name_en'];
$subjectName = ($language === 'fr') ? $subject['name_fr'] : $subject['name_en'];

$apiKey = getenv('OPENAI_API_KEY');
$response = "";

if ($apiKey) {
    $prompt = "You are a Cameroonian exam assistant for $examName in the subject $subjectName.
               The student asks: '$message'.
               Provide a helpful, educational response in " . ($language === 'fr' ? "French" : "English") . ".";

    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'model' => 'gpt-3.5-turbo',
        'messages' => [['role' => 'user', 'content' => $prompt]]
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);

    $res = curl_exec($ch);
    $resData = json_decode($res, true);
    $response = $resData['choices'][0]['message']['content'] ?? "";
    curl_close($ch);
}

if (empty($response)) {
    if ($language === 'fr') {
        $response = "En tant qu'assistant pour l'examen " . $examName . " en " . $subjectName . ", je peux vous aider. Votre question était: '" . $message . "'. Voici une explication détaillée pour vous aider à réussir (Mode hors-ligne/Démo).";
    } else {
        $response = "As an assistant for the " . $examName . " exam in " . $subjectName . ", I can help you. Your question was: '" . $message . "'. Here is a detailed explanation to help you succeed (Offline/Demo mode).";
    }
}

$stmt = $db->prepare("INSERT INTO chat_history (user_id, exam_id, subject_id, message, response, language) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->execute([$user['id'], $examId, $subjectId, $message, $response, $language]);

header('Content-Type: application/json');
echo json_encode(['response' => $response]);
