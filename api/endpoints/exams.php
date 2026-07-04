<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../config/database.php';

$db = getDatabaseConnection();

$exams = $db->query("SELECT * FROM exams")->fetchAll();
foreach ($exams as &$exam) {
    $stmt = $db->prepare("SELECT * FROM subjects WHERE exam_id = ?");
    $stmt->execute([$exam['id']]);
    $exam['subjects'] = $stmt->fetchAll();
}

echo json_encode($exams);
