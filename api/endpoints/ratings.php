<?php
/**
 * Ratings API Endpoint
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

header('Content-Type: application/json');
handleCors();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDatabaseConnection();

$user = requireAuth();

if ($method === 'GET') {
    // Get ratings for target/user
    $target_id = isset($_GET['target_id']) ? intval($_GET['target_id']) : 0;
    if ($target_id <= 0) {
        $target_id = $user['id'];
    }

    $stmt = $db->prepare("SELECT r.*, u.nom as auteur_nom FROM ratings r JOIN users u ON r.auteur_id = u.id WHERE r.cible_id = :cible_id ORDER BY r.cree_le DESC");
    $stmt->execute(['cible_id' => $target_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON input']);
        exit();
    }

    $order_id = isset($input['order_id']) ? intval($input['order_id']) : 0;
    $note = isset($input['note']) ? intval($input['note']) : 0;
    $commentaire = isset($input['commentaire']) ? trim($input['commentaire']) : '';

    if ($order_id <= 0 || $note < 1 || $note > 5) {
        http_response_code(400);
        echo json_encode(['error' => 'Order ID and rating note (1-5) are required']);
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

    // Determine target/recipient of the rating
    $cible_id = 0;
    if ($user['role'] === 'acheteur' && $order['acheteur_id'] === $user['id']) {
        $cible_id = $order['vendeur_id'];
    } elseif ($user['role'] === 'vendeur' && $order['vendeur_id'] === $user['id']) {
        $cible_id = $order['acheteur_id'];
    } else {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized to rate this order']);
        exit();
    }

    try {
        $stmt_insert = $db->prepare("INSERT INTO ratings (auteur_id, cible_id, order_id, note, commentaire) VALUES (:auteur_id, :cible_id, :order_id, :note, :commentaire)");
        $stmt_insert->execute([
            'auteur_id' => $user['id'],
            'cible_id' => $cible_id,
            'order_id' => $order_id,
            'note' => $note,
            'commentaire' => $commentaire
        ]);

        http_response_code(201);
        echo json_encode([
            'message' => 'Rating submitted successfully',
            'id' => $db->lastInsertId()
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Could not submit rating: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
