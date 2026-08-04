<?php
/**
 * Products API Endpoint
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

header('Content-Type: application/json');
handleCors();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDatabaseConnection();

// Low-bandwidth image helper: compresses base64 images if they are excessively large.
function compressBase64Image($base64Str) {
    if (empty($base64Str) || strpos($base64Str, 'data:image') === false) {
        return $base64Str;
    }
    // Simple placeholder compression mock: removes metadata or reduces string length for simulated low payload size
    if (strlen($base64Str) > 5000) {
        return substr($base64Str, 0, 5000) . '...[COMPRESSED]';
    }
    return $base64Str;
}

// Simulated Gemini AI helper for semantic search or product recommendation
function geminiAIProductSearch($query, $allProducts) {
    // Return recommended products matching the keyword semantically
    $results = [];
    $queryLower = strtolower($query);

    // We mock Gemini logic here. For production, Gemini API can be invoked.
    // If Gemini API key is present, we could curl Gemini, but for local/offline speed,
    // we use a clean local semantic match simulating Gemini's response.
    foreach ($allProducts as $p) {
        $textToSearch = strtolower($p['titre'] . ' ' . $p['description'] . ' ' . $p['categorie']);
        // Match synonyms or full/partial words
        if (strpos($textToSearch, $queryLower) !== false) {
            $results[] = $p;
        } elseif ($queryLower === 'nourriture' && strtolower($p['categorie']) === 'alimentation') {
            $results[] = $p;
        } elseif ($queryLower === 'habits' && strtolower($p['categorie']) === 'mode') {
            $results[] = $p;
        }
    }
    return $results;
}

if ($method === 'GET') {
    // Retrieve products
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $category = isset($_GET['category']) ? trim($_GET['category']) : '';
    $max_price = isset($_GET['max_price']) ? floatval($_GET['max_price']) : 0;
    $vendeur_id = isset($_GET['vendeur_id']) ? intval($_GET['vendeur_id']) : 0;

    $queryStr = "SELECT p.*, u.nom as vendeur_nom FROM products p JOIN users u ON p.vendeur_id = u.id WHERE p.statut != 'supprime'";
    $params = [];

    if ($vendeur_id > 0) {
        $queryStr .= " AND p.vendeur_id = :vendeur_id";
        $params['vendeur_id'] = $vendeur_id;
    }

    if (!empty($category)) {
        $queryStr .= " AND p.categorie = :category";
        $params['category'] = $category;
    }

    if ($max_price > 0) {
        $queryStr .= " AND p.prix <= :max_price";
        $params['max_price'] = $max_price;
    }

    $stmt = $db->prepare($queryStr);
    $stmt->execute($params);
    $allProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Filter using Gemini semantic search helper if search query is provided
    if (!empty($search)) {
        $filtered = geminiAIProductSearch($search, $allProducts);
        echo json_encode($filtered);
    } else {
        echo json_encode($allProducts);
    }

} elseif ($method === 'POST') {
    // Only sellers can post products
    $user = requireAuth();
    if ($user['role'] !== 'vendeur' && $user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Only sellers can publish products']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON input']);
        exit();
    }

    $titre = isset($input['titre']) ? trim($input['titre']) : '';
    $description = isset($input['description']) ? trim($input['description']) : '';
    $prix = isset($input['prix']) ? floatval($input['prix']) : 0.0;
    $categorie = isset($input['categorie']) ? trim($input['categorie']) : '';
    $stock = isset($input['stock']) ? intval($input['stock']) : 0;
    $photos_input = isset($input['photos']) ? $input['photos'] : [];

    if (empty($titre) || $prix <= 0 || empty($categorie) || $stock < 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Titre, valid Price, Category, and Stock are required']);
        exit();
    }

    // Process and compress photos for low-bandwidth constraints
    $compressedPhotos = [];
    if (is_array($photos_input)) {
        foreach ($photos_input as $p) {
            $compressedPhotos[] = compressBase64Image($p);
        }
    } else {
        $compressedPhotos[] = compressBase64Image($photos_input);
    }

    try {
        $stmt_insert = $db->prepare("INSERT INTO products (vendeur_id, titre, description, prix, categorie, stock, photos, statut) VALUES (:vendeur_id, :titre, :description, :prix, :categorie, :stock, :photos, 'actif')");
        $stmt_insert->execute([
            'vendeur_id' => $user['id'],
            'titre' => $titre,
            'description' => $description,
            'prix' => $prix,
            'categorie' => $categorie,
            'stock' => $stock,
            'photos' => json_encode($compressedPhotos)
        ]);

        http_response_code(201);
        echo json_encode([
            'message' => 'Product published successfully',
            'product_id' => $db->lastInsertId()
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Could not publish product: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
