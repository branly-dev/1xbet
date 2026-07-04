<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$userId = validateToken();

$input = json_decode(file_get_contents('php://input'), true);
$message = strtolower($input['message'] ?? '');
$exam_id = $input['exam_id'] ?? 'BAC';
$subject_id = $input['subject_id'] ?? 'Général';
$language = $input['language'] ?? 'fr';

if (empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Message is required']);
    exit;
}

// Simulated Intelligent Responses based on keywords
$response = "";
if (strpos($message, 'salut') !== false || strpos($message, 'bonjour') !== false || strpos($message, 'hello') !== false) {
    $response = ($language === 'fr') ? "Bonjour ! Je suis votre assistant pour le $exam_id. Comment puis-je vous aider aujourd'hui en $subject_id ?" : "Hello! I am your assistant for $exam_id. How can I help you today in $subject_id?";
} elseif (strpos($message, 'conseil') !== false || strpos($message, 'révision') !== false || strpos($message, 'tips') !== false) {
    $response = ($language === 'fr') ? "Pour le $exam_id en $subject_id, je vous conseille de pratiquer sur les anciennes épreuves des 5 dernières années." : "For $exam_id in $subject_id, I advise you to practice on old papers from the last 5 years.";
} elseif (strpos($message, 'date') !== false || strpos($message, 'quand') !== false) {
    $response = ($language === 'fr') ? "Les dates officielles des examens sont généralement publiées par le MINESEC. Restez attentif aux annonces de fin d'année scolaire." : "Official exam dates are usually published by MINESEC. Stay tuned for end-of-school-year announcements.";
} else {
    $response = ($language === 'fr') ? "C'est une excellente question pour votre préparation au $exam_id ($subject_id). Souhaitez-vous des exercices pratiques à ce sujet ?" : "That's an excellent question for your $exam_id preparation ($subject_id). Would you like some practice exercises on this topic?";
}

echo json_encode([
    'response' => $response,
    'status' => 'success'
]);
