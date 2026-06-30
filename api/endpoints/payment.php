<?php
// api/endpoints/payment.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") { exit; }
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$user_id = verifyToken();
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['amount']) || !isset($data['provider'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Montant et fournisseur (MTN ou Orange) requis']);
    exit;
}

$amount = (float)$data['amount'];
$provider = strtoupper($data['provider']);

if (!in_array($provider, ['MTN', 'ORANGE'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Fournisseur invalide. Utilisez MTN ou ORANGE.']);
    exit;
}

// Simulate communication with Mobile Money API
$status = 'completed';
$transaction_id = 'CMR_' . $provider . '_' . bin2hex(random_bytes(4));

$stmt = $pdo->prepare("INSERT INTO payments (user_id, amount, provider, status, transaction_id) VALUES (?, ?, ?, ?, ?)");
$stmt->execute([$user_id, $amount, $provider, $status, $transaction_id]);

echo json_encode([
    'success' => true,
    'message' => "Paiement de $amount XAF réussi via $provider",
    'transaction_id' => $transaction_id,
    'status' => $status
]);
