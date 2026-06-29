<?php
// api/endpoints/subjects.php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

$exam_id = $_GET['exam_id'] ?? null;

if (!$exam_id) {
    header('HTTP/1.0 400 Bad Request');
    echo json_encode(['error' => 'ID de l\'examen manquant']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM subjects WHERE exam_id = ?");
    $stmt->execute([$exam_id]);
    $subjects = $stmt->fetchAll();
    echo json_encode($subjects);
} catch (PDOException $e) {
    header('HTTP/1.0 500 Internal Server Error');
    echo json_encode(['error' => 'Erreur lors de la récupération des matières']);
}
?>
