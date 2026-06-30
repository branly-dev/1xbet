<?php
// api/middleware/auth.php

function getJWTSecret() {
    $secret = getenv('JWT_SECRET');
    if (!$secret) {
        // In a real production environment, this should throw an exception or exit
        // For the sake of this setup, we'll use a placeholder but warn it's not for production
        return 'change_this_secret_in_production_env';
    }
    return $secret;
}

function generateToken($user_id) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode(['user_id' => $user_id, 'exp' => time() + (3600 * 24)]);

    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, getJWTSecret(), true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyToken() {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) === 3) {
            $header = $tokenParts[0];
            $payload = $tokenParts[1];
            $signature = $tokenParts[2];

            $validSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(hash_hmac('sha256', $header . "." . $payload, getJWTSecret(), true)));

            if (hash_equals($validSignature, $signature)) { // Use hash_equals for timing attack protection
                $payloadData = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
                if ($payloadData && isset($payloadData['exp']) && $payloadData['exp'] > time()) {
                    return $payloadData['user_id'];
                }
            }
        }
    }

    header('HTTP/1.0 401 Unauthorized');
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Non autorisé ou token invalide']);
    exit;
}
