<?php
/**
 * Admin Action Endpoint (User Moderation, Content Moderation, Dispute Resolution with Gemini support)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

header('Content-Type: application/json');
handleCors();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDatabaseConnection();

$user = requireAuth();

if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Admin role required']);
    exit();
}

// Simple Gemini AI mock content reviewer assisting with automated content moderation
function geminiAIContentModeration($text) {
    $textLower = strtolower($text);
    $badwords = ['fraude', 'drogue', 'arme', 'arnaque', 'hack', 'scam', 'fraud', 'drugs', 'weapons'];

    // Check flags
    foreach ($badwords as $word) {
        if (strpos($textLower, $word) !== false) {
            return [
                'approved' => false,
                'reason' => "Contient un mot interdit signale par l IA: '$word'",
                'confidence' => '0.98'
            ];
        }
    }
    return [
        'approved' => true,
        'reason' => "Analyse par l IA Gemini: Aucun contenu suspect detecte.",
        'confidence' => '0.95'
    ];
}

if ($method === 'GET') {
    // List all users or specific metrics
    $action = isset($_GET['action']) ? $_GET['action'] : 'users';

    if ($action === 'users') {
        $stmt = $db->prepare("SELECT id, nom, email, telephone, role, langue, statut, cree_le FROM users ORDER BY cree_le DESC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($action === 'products') {
        // Return products including flagged items
        $stmt = $db->prepare("SELECT p.*, u.nom as vendeur_nom FROM products p JOIN users u ON p.vendeur_id = u.id ORDER BY p.cree_le DESC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
    }

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON input']);
        exit();
    }

    $action = isset($input['action']) ? $input['action'] : '';

    if ($action === 'moderate_user') {
        $target_user_id = isset($input['user_id']) ? intval($input['user_id']) : 0;
        $nouveau_statut = isset($input['statut']) ? $input['statut'] : ''; // 'actif', 'suspendu'

        if ($target_user_id <= 0 || !in_array($nouveau_statut, ['actif', 'suspendu'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid user_id and statut (actif/suspendu) are required']);
            exit();
        }

        try {
            $stmt = $db->prepare("UPDATE users SET statut = :statut WHERE id = :id");
            $stmt->execute(['statut' => $nouveau_statut, 'id' => $target_user_id]);
            echo json_encode(['message' => 'User status updated successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Could not update user: ' . $e->getMessage()]);
        }

    } elseif ($action === 'moderate_product') {
        $product_id = isset($input['product_id']) ? intval($input['product_id']) : 0;
        $nouveau_statut = isset($input['statut']) ? $input['statut'] : ''; // 'actif', 'signale', 'valide', 'supprime'

        if ($product_id <= 0 || !in_array($nouveau_statut, ['actif', 'signale', 'valide', 'supprime'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid product_id and statut are required']);
            exit();
        }

        try {
            $stmt = $db->prepare("UPDATE products SET statut = :statut WHERE id = :id");
            $stmt->execute(['statut' => $nouveau_statut, 'id' => $product_id]);
            echo json_encode(['message' => 'Product status updated successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Could not update product: ' . $e->getMessage()]);
        }

    } elseif ($action === 'gemini_verify_product') {
        // Run simulated Gemini check on a specific product's text
        $product_id = isset($input['product_id']) ? intval($input['product_id']) : 0;
        if ($product_id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid product_id is required']);
            exit();
        }

        $stmt = $db->prepare("SELECT * FROM products WHERE id = :id");
        $stmt->execute(['id' => $product_id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            exit();
        }

        $content_to_check = $product['titre'] . " " . $product['description'];
        $gemini_result = geminiAIContentModeration($content_to_check);

        // If not approved, we auto-flag the product in the database
        if (!$gemini_result['approved']) {
            $stmt_flag = $db->prepare("UPDATE products SET statut = 'signale' WHERE id = :id");
            $stmt_flag->execute(['id' => $product_id]);
        }

        echo json_encode([
            'product_id' => $product_id,
            'statut_produit' => $gemini_result['approved'] ? $product['statut'] : 'signale',
            'gemini_analysis' => $gemini_result
        ]);

    } elseif ($action === 'resolve_dispute') {
        $dispute_id = isset($input['dispute_id']) ? intval($input['dispute_id']) : 0;
        $resolution = isset($input['resolution']) ? trim($input['resolution']) : '';
        $nouveau_statut = isset($input['statut']) ? $input['statut'] : 'resolu'; // 'resolu', 'ferme'

        if ($dispute_id <= 0 || empty($resolution) || !in_array($nouveau_statut, ['resolu', 'ferme'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid dispute_id, resolution note, and statut are required']);
            exit();
        }

        try {
            $stmt = $db->prepare("UPDATE disputes SET statut = :statut, resolution = :resolution WHERE id = :id");
            $stmt->execute([
                'statut' => $nouveau_statut,
                'resolution' => $resolution,
                'id' => $dispute_id
            ]);
            echo json_encode(['message' => 'Dispute resolved successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Could not resolve dispute: ' . $e->getMessage()]);
        }

    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or missing admin action']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
