<?php
// api/middleware/auth.php

function getJWTSecret() {
    return getenv('JWT_SECRET') ?: 'cameroon_exam_secret_123';
}

function base64UrlEncode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

function generateJWT($payload) {
    $header = base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload['iat'] = time();
    $payload['exp'] = time() + (24 * 60 * 60); // 24 hours expiration
    $payload = base64UrlEncode(json_encode($payload));
    $signature = base64UrlEncode(hash_hmac('sha256', "$header.$payload", getJWTSecret(), true));
    return "$header.$payload.$signature";
}

function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    list($header, $payload, $signature) = $parts;
    $validSignature = base64UrlEncode(hash_hmac('sha256', "$header.$payload", getJWTSecret(), true));
    if ($signature !== $validSignature) return false;
    $data = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
    if (isset($data['exp']) && $data['exp'] < time()) return false;
    return $data;
}

function authenticate() {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        $payload = verifyJWT($token);
        if ($payload) {
            return $payload;
        }
    }
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['error' => 'Non autorisé ou session expirée']);
    exit;
}

function handleCORS() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        exit;
    }
}
