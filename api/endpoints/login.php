<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
include_once '../config/db.php';
include_once '../middleware/auth.php';
$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));
if(!empty($data->username) && !empty($data->password)){
    $query = "SELECT id, username, password FROM users WHERE username = :username LIMIT 0,1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":username", $data->username);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if($row){
        if(password_verify($data->password, $row['password'])){
            $token = AuthMiddleware::generateToken($row['id']);
            http_response_code(200);
            echo json_encode(array(
                "message" => "Connexion réussie.",
                "jwt" => $token,
                "username" => $row['username']
            ));
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Identifiants invalides."));
        }
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "Utilisateur non trouvé."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Données incomplètes."));
}
?>
