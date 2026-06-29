<?php
// api/endpoints/payment.php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

header('Content-Type: application/json');

$user = verify_token();

$input = json_decode(file_get_contents('php://input'), true);
$amount = $input['amount'] ?? 0;
$provider = $input['provider'] ?? ''; // MTN ou Orange
$phone_number = $input['phone_number'] ?? '';

if (empty($amount) || !in_array($provider, ['MTN', 'Orange']) || empty($phone_number)) {
    header('HTTP/1.0 400 Bad Request');
    echo json_encode(['error' => 'Données de paiement incomplètes ou fournisseur invalide']);
    exit;
}

// Simulation du processus de paiement Mobile Money
$transaction_id = 'TXN' . uniqid();
$status = 'success'; // Simulation d'un succès automatique

try {
    $stmt = $pdo->prepare("INSERT INTO payments (user_id, amount, provider, status, transaction_id) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$user['user_id'], $amount, $provider, $status, $transaction_id]);

    echo json_encode([
        'message' => 'Paiement effectué avec succès via ' . $provider,
        'transaction_id' => $transaction_id,
        'status' => $status
    ]);
} catch (PDOException $e) {
    header('HTTP/1.0 500 Internal Server Error');
    echo json_encode(['error' => 'Erreur lors de l\'enregistrement du paiement']);
}
?>
