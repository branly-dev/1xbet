<?php
$secret = getenv('JWT_SECRET') ?: 'your-very-secure-secret-key';

function base64UrlEncode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

function base64UrlDecode($data) {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(str_replace(['-','_'], ['+', '/'], $data));
}

function generateJWT($payload) {
    global $secret;
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode(json_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = base64UrlEncode($signature);
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyJWT($token) {
    global $secret;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;

    list($header, $payload, $signature) = $parts;
    $validSignature = base64UrlEncode(hash_hmac('sha256', $header . "." . $payload, $secret, true));

    if (!hash_equals($validSignature, $signature)) return false;

    $decodedPayload = json_decode(base64UrlDecode($payload), true);
    if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) return false;

    return $decodedPayload;
}

function getAuthUser() {
    $headers = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
        return verifyJWT($matches[1]);
    }
    return false;
}
