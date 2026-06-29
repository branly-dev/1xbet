<?php
// api/endpoints/exams.php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT * FROM exams");
    $exams = $stmt->fetchAll();
    echo json_encode($exams);
} catch (PDOException $e) {
    header('HTTP/1.0 500 Internal Server Error');
    echo json_encode(['error' => 'Erreur lors de la récupération des examens']);
}
?>
