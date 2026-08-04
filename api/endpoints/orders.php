<?php
/**
 * Orders API Endpoint
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

header('Content-Type: application/json');
handleCors();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDatabaseConnection();

$user = requireAuth();

if ($method === 'GET') {
    // Get orders depending on role
    if ($user['role'] === 'acheteur') {
        $stmt = $db->prepare("SELECT o.*, p.titre as produit_titre, p.photos as produit_photos, u.nom as vendeur_nom FROM orders o JOIN products p ON o.produit_id = p.id JOIN users u ON o.vendeur_id = u.id WHERE o.acheteur_id = :acheteur_id ORDER BY o.cree_le DESC");
        $stmt->execute(['acheteur_id' => $user['id']]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($user['role'] === 'vendeur') {
        $stmt = $db->prepare("SELECT o.*, p.titre as produit_titre, p.photos as produit_photos, u.nom as acheteur_nom, u.telephone as acheteur_tel FROM orders o JOIN products p ON o.produit_id = p.id JOIN users u ON o.acheteur_id = u.id WHERE o.vendeur_id = :vendeur_id ORDER BY o.cree_le DESC");
        $stmt->execute(['vendeur_id' => $user['id']]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($user['role'] === 'admin') {
        $stmt = $db->prepare("SELECT o.*, p.titre as produit_titre, u1.nom as acheteur_nom, u2.nom as vendeur_nom FROM orders o JOIN products p ON o.produit_id = p.id JOIN users u1 ON o.acheteur_id = u1.id JOIN users u2 ON o.vendeur_id = u2.id ORDER BY o.cree_le DESC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

} elseif ($method === 'POST') {
    // Acheteurs can place orders
    if ($user['role'] !== 'acheteur') {
        http_response_code(403);
        echo json_encode(['error' => 'Only buyers can place orders']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON input']);
        exit();
    }

    $produit_id = isset($input['produit_id']) ? intval($input['produit_id']) : 0;
    $quantite = isset($input['quantite']) ? intval($input['quantite']) : 1;

    if ($produit_id <= 0 || $quantite <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Valid product ID and quantity are required']);
        exit();
    }

    // Check product existence and stock
    $stmt_prod = $db->prepare("SELECT * FROM products WHERE id = :id AND statut = 'actif'");
    $stmt_prod->execute(['id' => $produit_id]);
    $product = $stmt_prod->fetch(PDO::FETCH_ASSOC);

    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found or inactive']);
        exit();
    }

    if ($product['stock'] < $quantite) {
        http_response_code(400);
        echo json_encode(['error' => 'Not enough stock available']);
        exit();
    }

    $montant = $product['prix'] * $quantite;
    $vendeur_id = $product['vendeur_id'];

    try {
        $db->beginTransaction();

        // Create order
        $stmt_order = $db->prepare("INSERT INTO orders (acheteur_id, vendeur_id, produit_id, quantite, statut, montant) VALUES (:acheteur_id, :vendeur_id, :produit_id, :quantite, 'en_attente', :montant)");
        $stmt_order->execute([
            'acheteur_id' => $user['id'],
            'vendeur_id' => $vendeur_id,
            'produit_id' => $produit_id,
            'quantite' => $quantite,
            'montant' => $montant
        ]);
        $order_id = $db->lastInsertId();

        // Decrement stock
        $stmt_stock = $db->prepare("UPDATE products SET stock = stock - :quantite WHERE id = :id");
        $stmt_stock->execute([
            'quantite' => $quantite,
            'id' => $produit_id
        ]);

        // Auto trigger internal notification / workflow
        $notification_msg = "Nouvelle commande #$order_id recue pour " . $product['titre'] . ". Montant: $montant FCFA.";
        $stmt_notif = $db->prepare("INSERT INTO notifications (user_id, type, canal, contenu, statut) VALUES (:user_id, 'nouvelle_commande', 'sms', :contenu, 'en_attente')");
        $stmt_notif->execute([
            'user_id' => $vendeur_id,
            'contenu' => $notification_msg
        ]);

        $db->commit();

        http_response_code(201);
        echo json_encode([
            'message' => 'Order placed successfully',
            'order_id' => $order_id,
            'montant' => $montant
        ]);

    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Could not place order: ' . $e->getMessage()]);
    }

} elseif ($method === 'PUT') {
    // Update order status (for example, seller accepting or dispatching)
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON input']);
        exit();
    }

    $order_id = isset($input['order_id']) ? intval($input['order_id']) : 0;
    $nouveau_statut = isset($input['statut']) ? $input['statut'] : '';

    if ($order_id <= 0 || empty($nouveau_statut)) {
        http_response_code(400);
        echo json_encode(['error' => 'Order ID and new status are required']);
        exit();
    }

    if (!in_array($nouveau_statut, ['en_attente', 'paye', 'expedie', 'complete', 'annule'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid order status']);
        exit();
    }

    // Verify ownership
    $stmt_check = $db->prepare("SELECT * FROM orders WHERE id = :id");
    $stmt_check->execute(['id' => $order_id]);
    $order = $stmt_check->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        http_response_code(404);
        echo json_encode(['error' => 'Order not found']);
        exit();
    }

    // Authorization: Vendeurs can dispatch/complete or cancel, Admins can do anything
    if ($user['role'] !== 'admin' && $order['vendeur_id'] !== $user['id'] && $order['acheteur_id'] !== $user['id']) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized action on this order']);
        exit();
    }

    try {
        $stmt_update = $db->prepare("UPDATE orders SET statut = :statut WHERE id = :id");
        $stmt_update->execute([
            'statut' => $nouveau_statut,
            'id' => $order_id
        ]);

        // Insert notification
        $stmt_notif = $db->prepare("INSERT INTO notifications (user_id, type, canal, contenu, statut) VALUES (:user_id, 'statut_commande', 'sms', :contenu, 'en_attente')");
        $stmt_notif->execute([
            'user_id' => $order['acheteur_id'],
            'contenu' => "Le statut de votre commande #$order_id est desormais: $nouveau_statut."
        ]);

        echo json_encode(['message' => 'Order status updated successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Could not update order status: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
