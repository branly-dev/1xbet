<?php
require_once __DIR__ . '/../config/database.php';

handleCors();

$pdo = getDatabaseConnection();

$exams = $pdo->query("SELECT * FROM exams")->fetchAll();
foreach ($exams as &$exam) {
    $stmt = $pdo->prepare("SELECT * FROM subjects WHERE exam_id = ?");
    $stmt->execute([$exam['id']]);
    $exam['subjects'] = $stmt->fetchAll();
}

header('Content-Type: application/json');
echo json_encode($exams);
