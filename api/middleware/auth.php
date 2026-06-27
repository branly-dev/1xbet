<?php
class AuthMiddleware {
    private static function getSecretKey() {
        return getenv('JWT_SECRET') ?: "cameroon_exam_assistant_secret_fallback";
    }

    public static function generateToken($user_id) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode(['user_id' => $user_id, 'exp' => time() + 3600]);
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::getSecretKey(), true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }
    public static function authenticate() {
        $headers = $_SERVER;
        $authHeader = isset($headers['HTTP_AUTHORIZATION']) ? $headers['HTTP_AUTHORIZATION'] : null;
        if (!$authHeader) {
            http_response_code(401);
            echo json_encode(["message" => "Accès refusé. Token manquant."]);
            exit();
        }
        $token = str_replace('Bearer ', '', $authHeader);
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            http_response_code(401);
            echo json_encode(["message" => "Token invalide."]);
            exit();
        }
        list($header, $payload, $signature) = $parts;
        $validSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(hash_hmac('sha256', $header . "." . $payload, self::getSecretKey(), true)));
        if ($signature !== $validSignature) {
            http_response_code(401);
            echo json_encode(["message" => "Token invalide (signature)."]);
            exit();
        }
        $decodedPayload = json_decode(base64_decode($payload), true);
        if ($decodedPayload['exp'] < time()) {
            http_response_code(401);
            echo json_encode(["message" => "Token expiré."]);
            exit();
        }
        return $decodedPayload['user_id'];
    }
}
?>
