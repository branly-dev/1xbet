<?php
// api/endpoints/transactions.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/db.php';
include_once '../middleware/auth.php';

$userData = AuthMiddleware::validateJWT();
$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $action = $data->action ?? '';

    if ($action == 'pay') {
        // Simulation d'initiation de paiement Mobile Money
        $query = "INSERT INTO payments SET mission_id = :mid, user_id = :uid, amount = :amt, provider = :prov, status = 'pending'";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":mid", $data->mission_id);
        $stmt->bindParam(":uid", $userData['id']);
        $stmt->bindParam(":amt", $data->amount);
        $stmt->bindParam(":prov", $data->provider);

        if ($stmt->execute()) {
            echo json_encode(["message" => "Paiement initié. Veuillez confirmer sur votre téléphone.", "payment_id" => $db->lastInsertId()]);
        }
    }
    elseif ($action == 'rate') {
        // Soumission d'une note
        $query = "INSERT INTO ratings SET mission_id = :mid, from_user_id = :fid, to_user_id = :tid, score = :score, comment = :txt";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":mid", $data->mission_id);
        $stmt->bindParam(":fid", $userData['id']);
        $stmt->bindParam(":tid", $data->to_user_id);
        $stmt->bindParam(":score", $data->score);
        $stmt->bindParam(":txt", $data->comment);

        if ($stmt->execute()) {
            echo json_encode(["message" => "Note enregistrée."]);
        }
    }
}
