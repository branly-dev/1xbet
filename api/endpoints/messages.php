<?php
/**
 * Messages API Endpoint for Seller-Buyer Internal Chat
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

header('Content-Type: application/json');
handleCors();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDatabaseConnection();

$user = requireAuth();

if ($method === 'GET') {
    // Return chat list or specific conversation
    $with_id = isset($_GET['with_id']) ? intval($_GET['with_id']) : 0;

    if ($with_id > 0) {
        // Fetch direct conversation
        $stmt = $db->prepare("SELECT m.*, u1.nom as expediteur_nom, u2.nom as destinataire_nom FROM messages m JOIN users u1 ON m.expediteur_id = u1.id JOIN users u2 ON m.destinataire_id = u2.id WHERE (m.expediteur_id = :uid AND m.destinataire_id = :with_id) OR (m.expediteur_id = :with_id AND m.destinataire_id = :uid) ORDER BY m.cree_le ASC");
        $stmt->execute([
            'uid' => $user['id'],
            'with_id' => $with_id
        ]);

        // Mark all messages as read
        $stmt_read = $db->prepare("UPDATE messages SET lu = 1 WHERE expediteur_id = :with_id AND destinataire_id = :uid");
        $stmt_read->execute([
            'with_id' => $with_id,
            'uid' => $user['id']
        ]);

        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } else {
        // Fetch user chat summary (list of contacts)
        $stmt = $db->prepare("SELECT DISTINCT u.id, u.nom, u.role, u.email FROM users u JOIN messages m ON (m.expediteur_id = u.id OR m.destinataire_id = u.id) WHERE u.id != :uid AND (m.expediteur_id = :uid OR m.destinataire_id = :uid)");
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

    $destinataire_id = isset($input['destinataire_id']) ? intval($input['destinataire_id']) : 0;
    $contenu = isset($input['contenu']) ? trim($input['contenu']) : '';

    if ($destinataire_id <= 0 || empty($contenu)) {
        http_response_code(400);
        echo json_encode(['error' => 'Recipient ID and message content are required']);
        exit();
    }

    try {
        $stmt_insert = $db->prepare("INSERT INTO messages (expediteur_id, destinataire_id, contenu, lu) VALUES (:expediteur_id, :destinataire_id, :contenu, 0)");
        $stmt_insert->execute([
            'expediteur_id' => $user['id'],
            'destinataire_id' => $destinataire_id,
            'contenu' => $contenu
        ]);

        http_response_code(201);
        echo json_encode([
            'message' => 'Message sent successfully',
            'id' => $db->lastInsertId()
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Could not send message: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
