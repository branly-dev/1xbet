<?php
// api/endpoints/register.php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? '';
$password = $input['password'] ?? '';
$full_name = $input['full_name'] ?? '';

if (empty($username) || empty($password)) {
    echo json_encode(['error' => 'Champs obligatoires manquants']);
    exit;
}

$hashed_password = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("INSERT INTO users (username, password, full_name) VALUES (?, ?, ?)");
    $stmt->execute([$username, $hashed_password, $full_name]);
    echo json_encode(['message' => 'Utilisateur créé avec succès']);
} catch (PDOException $e) {
    header('HTTP/1.0 400 Bad Request');
    echo json_encode(['error' => 'Erreur lors de la création ou utilisateur déjà existant']);
}
?>
