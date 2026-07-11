<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../config/database.php';
$pdo = getDatabaseConnection();

$stmt = $pdo->query("SELECT * FROM exams");
$exams = $stmt->fetchAll();

foreach ($exams as &$exam) {
    $stmt = $pdo->prepare("SELECT * FROM subjects WHERE exam_id = ?");
    $stmt->execute([$exam['id']]);
    $exam['subjects'] = $stmt->fetchAll();
}

echo json_encode($exams);
