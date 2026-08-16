<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
include_once '../config/db.php';
include_once '../middleware/auth.php';
$database = new Database();
$db = $database->getConnection();
$user_id = AuthMiddleware::authenticate();
$data = json_decode(file_get_contents("php://input"));
if(!empty($data->message)){
    $user_message = $data->message;
    $subject_id = isset($data->subject_id) ? $data->subject_id : null;
    $response = "Je suis votre assistant IA pour les examens camerounais. ";
    if (stripos($user_message, 'math') !== false) {
        $response .= "En mathématiques (BAC/Probatoire), concentrez-vous sur les études de fonctions, les suites numériques et les probabilités. Avez-vous une question spécifique sur un exercice ?";
    } elseif (stripos($user_message, 'physique') !== false) {
        $response .= "Pour la physique, maîtrisez bien les lois de Newton et l'électromagnétisme. C'est souvent au programme du BAC C et D.";
    } elseif (stripos($user_message, 'histoire') !== false || stripos($user_message, 'géo') !== false) {
        $response .= "En Histoire-Géo, n'oubliez pas de réviser la décolonisation de l'Afrique et les atouts économiques du Cameroun.";
    } else {
        $response .= "Comment puis-je vous aider dans vos révisions pour le BAC, le Probatoire ou le BEPC aujourd'hui ?";
    }
    $query = "INSERT INTO chat_history (user_id, message, response, subject_id) VALUES (:user_id, :message, :response, :subject_id)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $user_id);
    $stmt->bindParam(":message", $user_message);
    $stmt->bindParam(":response", $response);
    $stmt->bindParam(":subject_id", $subject_id);
    if($stmt->execute()){
        http_response_code(200);
        echo json_encode(array(
            "response" => $response,
            "timestamp" => date('Y-m-d H:i:s')
        ));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Erreur lors de l'enregistrement de la conversation."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Message vide."));
}
?>
