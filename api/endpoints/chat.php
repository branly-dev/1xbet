<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

handleCors();
$userId = authenticate();

$pdo = getDatabaseConnection();
$data = json_decode(file_get_contents('php://input'), true);

$message = $data['message'] ?? '';
$examId = $data['exam_id'] ?? null;
$subjectId = $data['subject_id'] ?? null;
$language = $data['language'] ?? 'fr';

if (!$message) {
    http_response_code(400);
    echo json_encode(['error' => 'Message is required']);
    exit;
}

// Mock AI Response fallback
$response = "Ceci est une réponse simulée pour l'examen et la matière sélectionnés. Dans une version de production, ceci serait connecté à un modèle de langage (comme GPT-4) avec un corpus de connaissances sur les examens camerounais.";

if ($language === 'en') {
    $response = "This is a simulated response for the selected exam and subject. In a production version, this would be connected to a language model (like GPT-4) with a corpus of knowledge on Cameroonian exams.";
}

// In a real implementation, you'd use CURL to call an AI API here
// if (getenv('AI_API_KEY')) { ... }

$stmt = $pdo->prepare("INSERT INTO chat_history (user_id, exam_id, subject_id, message, response, language) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->execute([$userId, $examId, $subjectId, $message, $response, $language]);

header('Content-Type: application/json');
echo json_encode(['response' => $response]);
