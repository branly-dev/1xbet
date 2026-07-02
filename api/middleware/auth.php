<?php
// Simple JWT-like implementation for demonstration purposes without external dependencies
function generate_jwt($payload, $secret = null) {
    if (!$secret) $secret = getenv('JWT_SECRET') ?: 'dev_fallback_secret_key_123';
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verify_jwt($jwt, $secret = null) {
    if (!$secret) $secret = getenv('JWT_SECRET') ?: 'dev_fallback_secret_key_123';
    $tokenParts = explode('.', $jwt);
    if (count($tokenParts) !== 3) return false;
    $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
    $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
    $signatureProvided = $tokenParts[2];
    $base64UrlHeader = $tokenParts[0];
    $base64UrlPayload = $tokenParts[1];
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    if ($base64UrlSignature === $signatureProvided) {
        $payloadData = json_decode($payload, true);
        if (isset($payloadData['exp']) && $payloadData['exp'] < time()) return false;
        return $payloadData;
    }
    return false;
}

function handle_cors() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit;
    }
}

function authenticate() {
    handle_cors();
    $headers = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
        $token = $matches[1];
        $payload = verify_jwt($token);
        if ($payload) return $payload;
    }
    http_response_code(401);
    echo json_encode(['error' => 'Non autorisé']);
    exit;
}
?>
