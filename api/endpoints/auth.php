<?php
/**
 * Auth API Endpoint (Registration and Login)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

header('Content-Type: application/json');
handleCors();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON input']);
        exit();
    }

    $action = isset($input['action']) ? $input['action'] : '';

    if ($action === 'register') {
        $nom = isset($input['nom']) ? trim($input['nom']) : '';
        $email = isset($input['email']) ? trim($input['email']) : '';
        $telephone = isset($input['telephone']) ? trim($input['telephone']) : '';
        $password = isset($input['password']) ? $input['password'] : '';
        $role = isset($input['role']) ? $input['role'] : 'acheteur';
        $langue = isset($input['langue']) ? $input['langue'] : 'fr';

        if (empty($nom) || empty($email) || empty($telephone) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'All fields (nom, email, telephone, password) are required']);
            exit();
        }

        if (!in_array($role, ['acheteur', 'vendeur', 'admin'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid role selected']);
            exit();
        }

        if (!in_array($langue, ['fr', 'en'])) {
            $langue = 'fr';
        }

        $db = getDatabaseConnection();

        // Check if email already exists
        $stmt_check = $db->prepare("SELECT id FROM users WHERE email = :email");
        $stmt_check->execute(['email' => $email]);
        if ($stmt_check->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Email already registered']);
            exit();
        }

        $password_hash = password_hash($password, PASSWORD_BCRYPT);

        try {
            $stmt_insert = $db->prepare("INSERT INTO users (nom, email, telephone, mot_de_passe_hash, role, langue, statut) VALUES (:nom, :email, :telephone, :password_hash, :role, :langue, 'actif')");
            $stmt_insert->execute([
                'nom' => $nom,
                'email' => $email,
                'telephone' => $telephone,
                'password_hash' => $password_hash,
                'role' => $role,
                'langue' => $langue
            ]);

            $userId = $db->lastInsertId();

            // Generate JWT Token
            $payload = [
                'id' => $userId,
                'nom' => $nom,
                'email' => $email,
                'role' => $role,
                'langue' => $langue,
                'iat' => time(),
                'exp' => time() + (24 * 60 * 60) // 24 hours
            ];
            $token = generateJWT($payload);

            http_response_code(201);
            echo json_encode([
                'message' => 'User registered successfully',
                'token' => $token,
                'user' => [
                    'id' => $userId,
                    'nom' => $nom,
                    'email' => $email,
                    'role' => $role,
                    'langue' => $langue
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
        }

    } elseif ($action === 'login') {
        $email = isset($input['email']) ? trim($input['email']) : '';
        $password = isset($input['password']) ? $input['password'] : '';

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            exit();
        }

        $db = getDatabaseConnection();
        $stmt = $db->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['mot_de_passe_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
            exit();
        }

        if ($user['statut'] === 'suspendu') {
            http_response_code(403);
            echo json_encode(['error' => 'Your account has been suspended. Please contact support.']);
            exit();
        }

        // Generate JWT Token
        $payload = [
            'id' => $user['id'],
            'nom' => $user['nom'],
            'email' => $user['email'],
            'role' => $user['role'],
            'langue' => $user['langue'],
            'iat' => time(),
            'exp' => time() + (24 * 60 * 60) // 24 hours
        ];
        $token = generateJWT($payload);

        http_response_code(200);
        echo json_encode([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'nom' => $user['nom'],
                'email' => $user['email'],
                'role' => $user['role'],
                'langue' => $user['langue']
            ]
        ]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or missing action. Use register or login.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
