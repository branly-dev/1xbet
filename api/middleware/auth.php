<?php
function getJwtSecret() {
    return getenv('JWT_SECRET') ?: 'cameroon_exam_secret_key_2024'; // Default for dev, but can be overridden
}

function generateToken($userId) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'user_id' => $userId,
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60)
    ]);

    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, getJwtSecret(), true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function validateToken() {
    $headers = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
        $jwt = $matches[1];
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) === 3) {
            $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
            $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
            $signatureProvided = $tokenParts[2];

            $base64UrlHeader = $tokenParts[0];
            $base64UrlPayload = $tokenParts[1];
            $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, getJwtSecret(), true);
            $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

            if ($base64UrlSignature === $signatureProvided) {
                $payloadData = json_decode($payload, true);
                if ($payloadData['exp'] > time()) {
                    return $payloadData['user_id'];
                }
            }
        }
    }
    header('HTTP/1.0 401 Unauthorized');
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}
