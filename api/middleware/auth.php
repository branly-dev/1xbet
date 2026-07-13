<?php
// api/middleware/auth.php

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

function getJwtSecret() {
    $secret = getenv('JWT_SECRET');
    if (!$secret) {
        // Warning: Using default secret for development only.
        // In production, set the JWT_SECRET environment variable.
        return 'cameroon_exam_assistant_dev_secret_2024';
    }
    return $secret;
}

function generateJWT($userId, $username) {
    $secret = getJwtSecret();

    $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
    $payload = json_encode([
        'id' => $userId,
        'username' => $username,
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ]);

    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode($payload);

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = base64UrlEncode($signature);

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function validateJWT() {
    $headers = $_SERVER;
    $authHeader = $headers['HTTP_AUTHORIZATION'] ?? '';

    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $authHeader = $requestHeaders['Authorization'] ?? '';
    }

    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) === 3) {
            $header = $tokenParts[0];
            $payload = $tokenParts[1];
            $signature = $tokenParts[2];

            $secret = getJwtSecret();
            $validSignature = base64UrlEncode(hash_hmac('sha256', $header . "." . $payload, $secret, true));

            if (hash_equals($validSignature, $signature)) {
                $decodedPayload = json_decode(base64UrlDecode($payload), true);
                if ($decodedPayload['exp'] > time()) {
                    return $decodedPayload;
                }
            }
        }
    }

    header('Content-Type: application/json');
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}
