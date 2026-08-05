<?php
/**
 * Payments REST endpoint & Operator Webhooks (Orange Money, MTN MoMo, Moov Money)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

header('Content-Type: application/json');
handleCors();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDatabaseConnection();

// This endpoint serves 2 purposes:
// 1. Buyers requesting to make a payment ("Effectuer un paiement") via POST (Requires Auth)
// 2. Mobile Money Webhook callbacks from operators to confirm transaction via POST with a query parameter like ?webhook=1 (No Auth required for operator callback)

$isWebhook = isset($_GET['webhook']) ? true : false;

if ($isWebhook) {
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Webhook requires POST']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid webhook payload']);
        exit();
    }

    // Typical payment callback parameters
    $operator = isset($input['operator']) ? strtolower($input['operator']) : '';
    $ref = isset($input['transaction_reference']) ? $input['transaction_reference'] : '';
    $status = isset($input['status']) ? strtolower($input['status']) : ''; // 'success' or 'failed'
    $order_id = isset($input['order_id']) ? intval($input['order_id']) : 0;
    $amount = isset($input['amount']) ? floatval($input['amount']) : 0.0;

    if (empty($operator) || empty($ref) || empty($status) || $order_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Incomplete webhook data']);
        exit();
    }

    // Journal/Log transaction - we secure mobile money credentials by never storing them, only the transaction status and logs.
    error_log("[MOBILE MONEY WEBHOOK] Operator: $operator, Ref: $ref, Status: $status, Order: $order_id, Amount: $amount");

    try {
        $db->beginTransaction();

        // 1. Update order status if successful
        if ($status === 'success') {
            $stmt_order = $db->prepare("UPDATE orders SET statut = 'paye' WHERE id = :order_id");
            $stmt_order->execute(['order_id' => $order_id]);

            // 2. Insert or update transaction payment info
            $stmt_pay = $db->prepare("INSERT INTO payments (order_id, operateur, reference_transaction, statut, montant) VALUES (:order_id, :operateur, :reference_transaction, 'complete', :montant)");
            $stmt_pay->execute([
                'order_id' => $order_id,
                'operateur' => $operator,
                'reference_transaction' => $ref,
                'montant' => $amount
            ]);

            // 3. Notify buyer and seller
            $stmt_find_users = $db->prepare("SELECT acheteur_id, vendeur_id FROM orders WHERE id = :order_id");
            $stmt_find_users->execute(['order_id' => $order_id]);
            $order_users = $stmt_find_users->fetch(PDO::FETCH_ASSOC);

            if ($order_users) {
                // SMS/Email logs
                $buyer_msg = "Votre paiement de $amount FCFA a ete valide pour la commande #$order_id.";
                $seller_msg = "Paiement de $amount FCFA recu pour la commande #$order_id. Vous pouvez desormais proceder a l expedition.";

                $stmt_notif = $db->prepare("INSERT INTO notifications (user_id, type, canal, contenu, statut) VALUES (:user_id, 'paiement_recu', 'sms', :contenu, 'en_attente')");
                $stmt_notif->execute(['user_id' => $order_users['acheteur_id'], 'contenu' => $buyer_msg]);
                $stmt_notif->execute(['user_id' => $order_users['vendeur_id'], 'contenu' => $seller_msg]);
            }
        } else {
            $stmt_pay = $db->prepare("INSERT INTO payments (order_id, operateur, reference_transaction, statut, montant) VALUES (:order_id, :operateur, :reference_transaction, 'echoue', :montant)");
            $stmt_pay->execute([
                'order_id' => $order_id,
                'operateur' => $operator,
                'reference_transaction' => $ref,
                'montant' => $amount
            ]);
        }

        $db->commit();
        echo json_encode(['message' => 'Webhook received and processed successfully']);

    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        http_response_code(500);
        echo json_encode(['error' => 'Webhook handling failed: ' . $e->getMessage()]);
    }

} else {
    // Normal Payment endpoint (requires buyer authentication)
    $user = requireAuth();

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON input']);
            exit();
        }

        $order_id = isset($input['order_id']) ? intval($input['order_id']) : 0;
        $operator = isset($input['operator']) ? strtolower($input['operator']) : ''; // orange, momo, moov
        $phone_number = isset($input['phone_number']) ? trim($input['phone_number']) : '';

        if ($order_id <= 0 || empty($operator) || empty($phone_number)) {
            http_response_code(400);
            echo json_encode(['error' => 'Order ID, Operator and payment Phone Number are required']);
            exit();
        }

        if (!in_array($operator, ['orange', 'momo', 'moov'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Unsupported mobile money operator']);
            exit();
        }

        // Retrieve order details
        $stmt_order = $db->prepare("SELECT * FROM orders WHERE id = :id AND acheteur_id = :acheteur_id");
        $stmt_order->execute([
            'id' => $order_id,
            'acheteur_id' => $user['id']
        ]);
        $order = $stmt_order->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found or unauthorized']);
            exit();
        }

        // Generate mock transaction reference
        $tx_ref = strtoupper($operator) . '-' . uniqid();

        try {
            // Save initial payment intent
            $stmt_pay = $db->prepare("INSERT INTO payments (order_id, operateur, reference_transaction, statut, montant) VALUES (:order_id, :operateur, :reference_transaction, 'initie', :montant)");
            $stmt_pay->execute([
                'order_id' => $order_id,
                'operateur' => $operator,
                'reference_transaction' => $tx_ref,
                'montant' => $order['montant']
            ]);

            // In simulated flow, we return the payment URI or status.
            // Under production, we hit MTN MoMo API, Orange Money API, or Moov Money API.
            // Here, we provide simulated automatic background validation instructions for local testing.
            echo json_encode([
                'message' => 'Payment initiated successfully. Please approve the prompt on your phone.',
                'operator' => $operator,
                'reference_transaction' => $tx_ref,
                'montant' => $order['montant'],
                'simulation_webhook_payload' => [
                    'operator' => $operator,
                    'transaction_reference' => $tx_ref,
                    'status' => 'success',
                    'order_id' => $order_id,
                    'amount' => $order['montant']
                ]
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Payment initiation failed: ' . $e->getMessage()]);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}
