<?php
/**
 * Disputes API Endpoint
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

header('Content-Type: application/json');
handleCors();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDatabaseConnection();

$user = requireAuth();

if ($method === 'GET') {
    // List disputes. If admin, see all. If not, see user's disputes.
    if ($user['role'] === 'admin') {
        $stmt = $db->prepare("SELECT d.*, o.montant as order_montant, u.nom as ouvert_par_nom FROM disputes d JOIN orders o ON d.order_id = o.id JOIN users u ON d.ouvert_par_id = u.id ORDER BY d.cree_le DESC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } else {
        $stmt = $db->prepare("SELECT d.*, o.montant as order_montant FROM disputes d JOIN orders o ON d.order_id = o.id WHERE d.ouvert_par_id = :uid ORDER BY d.cree_le DESC");
        $stmt->execute(['uid' => $user['id']]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON input']);
        exit();
    }

    $order_id = isset($input['order_id']) ? intval($input['order_id']) : 0;
    $description = isset($input['description']) ? trim($input['description']) : '';

    if ($order_id <= 0 || empty($description)) {
        http_response_code(400);
        echo json_encode(['error' => 'Order ID and dispute description are required']);
        exit();
    }

    // Verify order exists and user belongs to it
    $stmt_order = $db->prepare("SELECT * FROM orders WHERE id = :id");
    $stmt_order->execute(['id' => $order_id]);
    $order = $stmt_order->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        http_response_code(404);
        echo json_encode(['error' => 'Order not found']);
        exit();
    }

    if ($order['acheteur_id'] !== $user['id'] && $order['vendeur_id'] !== $user['id']) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized to open dispute on this order']);
        exit();
    }

    try {
        $stmt_insert = $db->prepare("INSERT INTO disputes (order_id, ouvert_par_id, statut, description) VALUES (:order_id, :ouvert_par_id, 'ouvert', :description)");
        $stmt_insert->execute([
            'order_id' => $order_id,
            'ouvert_par_id' => $user['id'],
            'description' => $description
        ]);

        http_response_code(201);
        echo json_encode([
            'message' => 'Dispute opened successfully',
            'id' => $db->lastInsertId()
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Could not open dispute: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
