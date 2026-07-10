<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

handleCORS();
$user = authenticate();

$pdo = getDatabaseConnection();
$data = json_decode(file_get_contents('php://input'), true);

$message = $data['message'] ?? '';
$exam_id = $data['exam_id'] ?? null;
$subject_id = $data['subject_id'] ?? null;
$language = $data['language'] ?? 'fr';

if (!$message) {
    http_response_code(400);
    echo json_encode(['error' => 'Message is required']);
    exit;
}

// Mock AI Response for Cameroonian Exams
$response = "";
if ($language === 'fr') {
    $response = "En tant qu'assistant IA pour les examens camerounais, je peux vous aider avec " . $message . ". C'est un sujet important pour le " . ($exam_id ? "l'examen sélectionné" : "votre examen") . ".";
} else {
    $response = "As an AI assistant for Cameroonian exams, I can help you with " . $message . ". This is an important topic for your " . ($exam_id ? "selected exam" : "exam") . ".";
}

// Save to history
$stmt = $pdo->prepare("INSERT INTO chat_history (user_id, message, response, exam_id, subject_id, language) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->execute([$user['user_id'], $message, $response, $exam_id, $subject_id, $language]);

header('Content-Type: application/json');
echo json_encode(['response' => $response]);
?>
