<?php
// api/endpoints/chat.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$userId = validateJWT();
if (!$userId) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$message = $data['message'] ?? '';
$examId = $data['exam_id'] ?? null;
$subjectId = $data['subject_id'] ?? null;
$language = $data['language'] ?? 'fr';

// AI Assistant Logic
// To use a real LLM, set your API key and uncomment the integration below
$apiKey = getenv('AI_API_KEY');
$response = "";

if ($apiKey) {
    // Example integration with an LLM (e.g. OpenAI)
    /*
    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'model' => 'gpt-3.5-turbo',
        'messages' => [['role' => 'user', 'content' => $message]]
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);
    $res = curl_exec($ch);
    $json = json_decode($res, true);
    $response = $json['choices'][0]['message']['content'] ?? "Erreur de connexion à l'IA.";
    */
    $response = "[Mode IA Activé] Réponse simulée pour: " . $message;
} else {
    // Fallback Mock for development
    if ($language === 'fr') {
        $response = "En tant qu'assistant IA pour les examens au Cameroun, je suis là pour vous aider. Concernant votre question sur '" . $message . "', voici quelques pistes de révision basées sur le programme officiel (Note: Configurez AI_API_KEY pour des réponses dynamiques).";
    } else {
        $response = "As an AI assistant for Cameroonian exams, I'm here to help. Regarding your question about '" . $message . "', here are some revision points based on the official curriculum (Note: Configure AI_API_KEY for dynamic responses).";
    }
}

$db = getDbConnection();
$stmt = $db->prepare("INSERT INTO chat_history (user_id, exam_id, subject_id, message, response, language) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bindValue(1, $userId);
$stmt->bindValue(2, $examId);
$stmt->bindValue(3, $subjectId);
$stmt->bindValue(4, $message);
$stmt->bindValue(5, $response);
$stmt->bindValue(6, $language);
$stmt->execute();

echo json_encode(['response' => $response]);
