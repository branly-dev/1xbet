<?php
// api/endpoints/payments/process.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

$userId = authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['amount'], $data['provider'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing amount or provider']);
    exit;
}

$amount = $data['amount'];
$provider = $data['provider']; // MTN or Orange

if (!in_array($provider, ['MTN', 'Orange'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid provider. Must be MTN or Orange']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO payments (user_id, amount, provider, status) VALUES (?, ?, ?, 'completed')");
    $stmt->execute([$userId, $amount, $provider]);

    echo json_encode([
        'status' => 'success',
        'message' => "Paiement de $amount FCFA via $provider réussi.",
        'transaction_id' => uniqid('TXN_')
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Payment processing failed']);
}
?>
