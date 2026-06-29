<?php
// api/endpoints/chat.php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
$ai_config = require_once __DIR__ . '/../config/ai.php';

header('Content-Type: application/json');

$user = verify_token();

$input = json_decode(file_get_contents('php://input'), true);
$message = $input['message'] ?? '';
$exam = $input['exam'] ?? 'BAC';

if (empty($message)) {
    echo json_encode(['error' => 'Message vide']);
    exit;
}

$response = "";

if ($ai_config['ai_provider'] === 'openai') {
    // Exemple d'intégration OpenAI (nécessite une clé API valide)
    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $ai_config['api_key']
    ]);
    $payload = json_encode([
        'model' => $ai_config['model'],
        'messages' => [
            ['role' => 'system', 'content' => $ai_config['system_prompt'] . " L'élève prépare le $exam."],
            ['role' => 'user', 'content' => $message]
        ]
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    $result = curl_exec($ch);
    $data = json_decode($result, true);
    $response = $data['choices'][0]['message']['content'] ?? "Erreur de connexion à l'IA.";
    curl_close($ch);
} else {
    // Mode Mock par défaut
    $response = "[Mode Simulation - $exam] Réponse pédagogique adaptée : " . $message;
}

// Sauvegarder dans l'historique
$stmt = $pdo->prepare("INSERT INTO chat_history (user_id, message, response) VALUES (?, ?, ?)");
$stmt->execute([$user['user_id'], $message, $response]);

echo json_encode([
    'response' => $response,
    'timestamp' => date('Y-m-d H:i:s')
]);
?>
