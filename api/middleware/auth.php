<?php
// api/middleware/auth.php

function generateJWT($userId) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode(['user_id' => $userId, 'exp' => time() + 3600]);

    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

    $secret = getenv('JWT_SECRET') ?: 'default_secret_key';
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function authenticate() {
    $headers = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
        $jwt = $matches[1];
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) === 3) {
            $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1])), true);
            if ($payload && isset($payload['user_id']) && $payload['exp'] > time()) {
                return $payload['user_id'];
            }
        }
    }
    header('HTTP/1.0 401 Unauthorized');
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}
?>
