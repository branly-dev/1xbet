<?php
// api/middleware/auth.php

// Note: Dans une implémentation réelle, utilisez une bibliothèque comme firebase/php-jwt.
// Ici, nous simulons la validation pour illustrer l'architecture.

class AuthMiddleware {
    private static $secret_key = "VOTRE_CLE_SECRETE_SUPER_SECURISEE";

    public static function validateJWT() {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;

        if (!$authHeader) {
            http_response_code(401);
            echo json_encode(["message" => "Accès refusé. Jeton manquant."]);
            exit();
        }

        $token = str_replace("Bearer ", "", $authHeader);

        try {
            // Simulation de décodage JWT
            $decoded = self::simulateDecode($token);
            return $decoded;
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(["message" => "Jeton invalide ou expiré."]);
            exit();
        }
    }

    private static function simulateDecode($token) {
        // En production, vérifiez la signature et l'expiration
        $data = json_decode(base64_decode(explode('.', $token)[1] ?? ''), true);
        if (!$data) throw new Exception("Invalid Token");
        return $data;
    }
}
