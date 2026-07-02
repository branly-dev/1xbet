<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

$userData = authenticate();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $message = $data['message'] ?? '';
    $exam = $data['exam'] ?? 'BAC';
    $subject = $data['subject'] ?? 'Général';

    if (!$message) {
        http_response_code(400);
        echo json_encode(['error' => 'Message vide']);
        exit;
    }

    $openai_api_key = getenv('OPENAI_API_KEY');
    $response = "";

    if ($openai_api_key) {
        $ch = curl_init('https://api.openai.com/v1/chat/completions');
        $payload = json_encode([
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                ['role' => 'system', 'content' => "Tu es un tuteur expert pour les examens camerounais ($exam). Aide l'élève en $subject. Réponds en français de manière pédagogique."],
                ['role' => 'user', 'content' => $message]
            ]
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $openai_api_key
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $result = curl_exec($ch);
        $resultData = json_decode($result, true);
        $response = $resultData['choices'][0]['message']['content'] ?? "Désolé, je ne peux pas répondre pour le moment.";
        curl_close($ch);
    } else {
        // Mock response for development
        $response = "Ceci est une réponse simulée (MOCK) pour l'examen $exam en $subject. ";
        $response .= "Vous avez demandé : \"$message\". ";
        $response .= "En tant que tuteur camerounais, je vous conseille de bien réviser vos leçons et de pratiquer les anciens sujets.";
    }

    // Save to history
    $stmt = $pdo->prepare("INSERT INTO chat_history (user_id, message, response) VALUES (?, ?, ?)");
    $stmt->execute([$userData['user_id'], $message, $response]);

    echo json_encode(['response' => $response]);
}
?>
