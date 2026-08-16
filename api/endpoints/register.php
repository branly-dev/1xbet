<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
include_once '../config/db.php';
$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));
if(!empty($data->username) && !empty($data->password)){
    $username = $data->username;
    $password = password_hash($data->password, PASSWORD_BCRYPT);
    $exam_type_id = isset($data->exam_type_id) ? $data->exam_type_id : null;
    $query = "INSERT INTO users (username, password, preferred_exam_type_id) VALUES (:username, :password, :exam_type_id)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":username", $username);
    $stmt->bindParam(":password", $password);
    $stmt->bindParam(":exam_type_id", $exam_type_id);
    try {
        if($stmt->execute()){
            http_response_code(201);
            echo json_encode(array("message" => "Utilisateur créé avec succès."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Impossible de créer l'utilisateur."));
        }
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(array("message" => "Erreur: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Données incomplètes."));
}
?>
