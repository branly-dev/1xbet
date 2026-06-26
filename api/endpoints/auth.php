<?php
// api/endpoints/auth.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->phone_number) && !empty($data->password)) {
    $query = "SELECT id, full_name, password_hash, role FROM users WHERE phone_number = :phone LIMIT 0,1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":phone", $data->phone_number);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (password_verify($data->password, $row['password_hash'])) {

            // Génération simplifiée d'un JWT (simulé)
            $payload = [
                "id" => $row['id'],
                "full_name" => $row['full_name'],
                "role" => $row['role'],
                "exp" => time() + 3600
            ];
            $jwt = base64_encode(json_encode(["alg"=>"HS256","typ"=>"JWT"])) . "." . base64_encode(json_encode($payload)) . ".signature_simulee";

            http_response_code(200);
            echo json_encode([
                "message" => "Connexion réussie",
                "jwt" => $jwt,
                "role" => $row['role'],
                "user" => [
                    "id" => $row['id'],
                    "full_name" => $row['full_name']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Mot de passe incorrect."]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Utilisateur non trouvé."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Données incomplètes."]);
}
