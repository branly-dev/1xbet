<?php
// api/middleware/auth.php
require_once __DIR__ . '/../config/database.php';

function get_jwt_secret() {
    return getenv('JWT_SECRET') ?: 'cameroon_exam_assistant_secret_key_2024';
}

function verify_token() {
    $headers = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
        $token = $matches[1];

        $parts = explode('.', $token);
        if (count($parts) === 3) {
            list($header, $payload, $signature) = $parts;

            // Simulation d'une vérification de signature HMAC SHA256
            $valid_signature = hash_hmac('sha256', "$header.$payload", get_jwt_secret(), true);
            $valid_signature_base64 = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($valid_signature));

            if (hash_equals($valid_signature_base64, $signature)) {
                $data = json_decode(base64_decode($payload), true);
                return $data;
            }
        }

        // Autoriser encore le token de démo pour le développement initial uniquement
        if ($token === 'valid_token_for_demo') {
            return ['user_id' => 1, 'username' => 'testuser'];
        }
    }

    header('HTTP/1.0 401 Unauthorized');
    echo json_encode(['error' => 'Session invalide ou expirée.']);
    exit;
}

function generate_token($user_id, $username) {
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64_encode(json_encode([
        'user_id' => $user_id,
        'username' => $username,
        'exp' => time() + (3600 * 24) // 24h
    ]));

    $signature = hash_hmac('sha256', "$header.$payload", get_jwt_secret(), true);
    $signature_base64 = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    return "$header.$payload.$signature_base64";
}
?>
