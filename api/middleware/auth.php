<?php
function getJwtSecret() {
    return getenv('JWT_SECRET') ?: 'dangerously_insecure_dev_secret_change_me';
}

function base64UrlEncode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

function base64UrlDecode($data) {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $padlen = 4 - $remainder;
        $data .= str_repeat('=', $padlen);
    }
    return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
}

function generateToken($userId) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'user_id' => $userId,
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60)
    ]);

    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode($payload);

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, getJwtSecret(), true);
    $base64UrlSignature = base64UrlEncode($signature);

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function authenticate() {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) === 3) {
            $header = $tokenParts[0];
            $payload = $tokenParts[1];
            $signature = $tokenParts[2];

            $validSignature = base64UrlEncode(hash_hmac('sha256', $header . "." . $payload, getJwtSecret(), true));

            if (hash_equals($validSignature, $signature)) {
                $payloadData = json_decode(base64UrlDecode($payload), true);
                if ($payloadData['exp'] > time()) {
                    return $payloadData['user_id'];
                }
            }
        }
    }
    header('Content-Type: application/json');
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}
