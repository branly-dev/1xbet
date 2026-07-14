<?php
// api/middleware/auth.php

function getJwtSecret() {
    $secret = getenv('JWT_SECRET');
    if (!$secret) {
        // In production, this should throw an error or be set via environment
        return 'dangerously_insecure_dev_secret_change_me';
    }
    return $secret;
}

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
        'exp' => time() + (24 * 60 * 60)
    ]);

    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode($payload);

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, getJwtSecret(), true);
    $base64UrlSignature = base64UrlEncode($signature);

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function validateJWT() {
    $headers = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
        $jwt = $matches[1];
        $parts = explode('.', $jwt);
        if (count($parts) === 3) {
            $header = $parts[0];
            $payload = $parts[1];
            $signature = $parts[2];

            $validSignature = base64UrlEncode(hash_hmac('sha256', $header . "." . $payload, getJwtSecret(), true));

            if (hash_equals($validSignature, $signature)) {
                $decodedPayload = json_decode(base64UrlDecode($payload), true);
                if ($decodedPayload['exp'] > time()) {
                    return $decodedPayload['user_id'];
                }
            }
        }
    }
    return null;
}
