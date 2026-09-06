<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$userId = authenticate();
if (!$userId) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$db = (new Database())->getDb();
$data = json_decode(file_get_contents("php://input"), true);

$message = $data['message'] ?? '';
$examId = $data['exam_id'] ?? null;
$subjectId = $data['subject_id'] ?? null;
$language = $data['language'] ?? 'fr';

$apiKey = getenv('OPENAI_API_KEY');

if ($apiKey) {
    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);

    $prompt = "Tu es un assistant pédagogique pour les examens camerounais. Réponds en " . ($language == 'fr' ? 'français' : 'anglais') . ". Question: " . $message;

    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'model' => 'gpt-3.5-turbo',
        'messages' => [['role' => 'user', 'content' => $prompt]]
    ]));

    $res = curl_exec($ch);
    $resData = json_decode($res, true);
    $response = $resData['choices'][0]['message']['content'] ?? "Erreur de connexion à l'IA.";
    curl_close($ch);
} else {
    // Mock fallback with context awareness
    $translations = [
        'fr' => "Désolé, la clé API IA n'est pas configurée. Voici une aide simulée pour votre question: '$message'.",
        'en' => "Sorry, the AI API key is not configured. Here is a simulated help for your question: '$message'."
    ];
    $response = $translations[$language] ?? $translations['fr'];
}

$stmt = $db->prepare("INSERT INTO messages (user_id, exam_id, subject_id, message, response, language) VALUES (:user_id, :exam_id, :subject_id, :message, :response, :language)");
$stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
$stmt->bindValue(':exam_id', $examId, SQLITE3_INTEGER);
$stmt->bindValue(':subject_id', $subjectId, SQLITE3_INTEGER);
$stmt->bindValue(':message', $message, SQLITE3_TEXT);
$stmt->bindValue(':response', $response, SQLITE3_TEXT);
$stmt->bindValue(':language', $language, SQLITE3_TEXT);

if ($stmt->execute()) {
    echo json_encode(['response' => $response]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save message']);
}
?>
