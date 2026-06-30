<?php
// api/endpoints/chat.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") { exit; }
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
$ai_config = require __DIR__ . '/../config/ai.php';

$user_id = verifyToken();
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['message'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Message requis']);
    exit;
}

$message = $data['message'];
$response = "";

if ($ai_config['provider'] === 'openai' && !empty($ai_config['api_key'])) {
    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'model' => $ai_config['model'],
        'messages' => [
            ['role' => 'system', 'content' => $ai_config['system_prompt']],
            ['role' => 'user', 'content' => $message]
        ]
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $ai_config['api_key']
    ]);
    $api_res = curl_exec($ch);
    $result = json_decode($api_res, true);
    curl_close($ch);

    if (isset($result['choices'][0]['message']['content'])) {
        $response = $result['choices'][0]['message']['content'];
    } else {
        $response = "Erreur de l'IA: " . ($result['error']['message'] ?? 'Inconnue');
    }
} else {
    // Advanced mock for local testing
    if (stripos($message, 'math') !== false) {
        $response = "Pour les mathématiques au BAC, concentre-toi sur les fonctions et les probabilités. As-tu un exercice spécifique ?";
    } elseif (stripos($message, 'physique') !== false) {
        $response = "En physique, assure-toi de bien comprendre les lois de Newton pour le Probatoire.";
    } elseif (stripos($message, 'conseil') !== false) {
        $response = "Mon conseil : révise au moins 2 heures par jour et utilise les annales des 5 dernières années.";
    } else {
        $response = "[Mode Simulation] C'est une bonne question pour ton examen. Peux-tu me donner plus de détails ?";
    }
}

$stmt = $pdo->prepare("INSERT INTO chat_history (user_id, message, response) VALUES (?, ?, ?)");
$stmt->execute([$user_id, $message, $response]);

echo json_encode(['response' => $response]);
