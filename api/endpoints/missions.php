<?php
// api/endpoints/missions.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/db.php';
include_once '../middleware/auth.php';

$userData = AuthMiddleware::validateJWT();
$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Liste des missions disponibles pour les livreurs ou historique pour commerçants
        $query = "SELECT * FROM missions WHERE status = 'pending' ORDER BY created_at DESC";
        if ($userData['role'] == 'merchant') {
            $query = "SELECT * FROM missions WHERE merchant_id = :mid ORDER BY created_at DESC";
        }

        $stmt = $db->prepare($query);
        if ($userData['role'] == 'merchant') {
            $stmt->bindParam(":mid", $userData['id']);
        }
        $stmt->execute();
        $missions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($missions);
        break;

    case 'POST':
        // Création d'une mission (Commerçant uniquement)
        if ($userData['role'] !== 'merchant') {
            http_response_code(403);
            echo json_encode(["message" => "Action non autorisée."]);
            break;
        }

        $data = json_decode(file_get_contents("php://input"));
        $query = "INSERT INTO missions SET
            merchant_id = :mid, cargo_type = :type, pickup_address = :p_addr,
            delivery_address = :d_addr, price = :price, status = 'pending'";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":mid", $userData['id']);
        $stmt->bindParam(":type", $data->cargo_type);
        $stmt->bindParam(":p_addr", $data->pickup_address);
        $stmt->bindParam(":d_addr", $data->delivery_address);
        $stmt->bindParam(":price", $data->price);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Mission créée avec succès.", "id" => $db->lastInsertId()]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Erreur lors de la création."]);
        }
        break;
}
