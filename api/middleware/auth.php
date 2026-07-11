<?php
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'your-super-secret-key-123');

function base64UrlEncode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

function base64UrlDecode($data) {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
}

function generateJWT($userId) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'user_id' => $userId,
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ]);

    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode($payload);

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64UrlEncode($signature);

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function validateJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;

    list($header, $payload, $signature) = $parts;

    $validSignature = hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true);
    if (!hash_equals(base64UrlEncode($validSignature), $signature)) return false;

    $payloadData = json_decode(base64UrlDecode($payload), true);
    if ($payloadData['exp'] < time()) return false;

    return $payloadData['user_id'];
}

function getBearerToken() {
    $headers = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
        return $matches[1];
    }
    return null;
}
