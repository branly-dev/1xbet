<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    if ($username && $password) {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        try {
            $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
            $stmt->execute([$username, $hashedPassword]);
            echo json_encode(['message' => 'Utilisateur créé avec succès']);
        } catch (PDOException $e) {
            http_response_code(400);
            echo json_encode(['error' => 'Nom d\'utilisateur déjà pris']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Données incomplètes']);
    }
}
?>
