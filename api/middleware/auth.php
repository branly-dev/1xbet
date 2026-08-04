<?php
/**
 * JWT Authentication and validation middleware.
 */

require_once __DIR__ . '/../config/database.php';

function getJwtSecret() {
    return getenv('JWT_SECRET') ?: 'dangerously_insecure_dev_secret_change_me_1234567890';
}

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

function generateJWT($payload) {
    $secret = getJwtSecret();
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);

    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode(json_encode($payload));

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = base64UrlEncode($signature);

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyJWT($token) {
    $secret = getJwtSecret();
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }

    list($header, $payload, $signature) = $parts;

    $validSignature = hash_hmac('sha256', $header . "." . $payload, $secret, true);
    $validSignatureEncoded = base64UrlEncode($validSignature);

    if (!hash_equals($validSignatureEncoded, $signature)) {
        return false;
    }

    $decodedPayload = json_decode(base64UrlDecode($payload), true);
    if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
        return false; // Token expired
    }

    return $decodedPayload;
}

function requireAuth() {
    handleCors();
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

    if (empty($authHeader) && isset($headers['authorization'])) {
        $authHeader = $headers['authorization'];
    }

    if (empty($authHeader)) {
        http_response_code(401);
        echo json_encode(['error' => 'Authorization header missing']);
        exit();
    }

    $token = null;
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
    } else {
        $token = $authHeader;
    }

    $userData = verifyJWT($token);
    if (!$userData) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit();
    }

    return $userData;
}
