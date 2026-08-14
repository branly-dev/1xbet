<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

handleCors();
$db = getDatabaseConnection();

header('Content-Type: application/json');

$stmt = $db->query("SELECT * FROM exams");
$exams = $stmt->fetchAll();

foreach ($exams as &$exam) {
    $stmt = $db->prepare("SELECT * FROM subjects WHERE exam_id = ?");
    $stmt->execute([$exam['id']]);
    $exam['subjects'] = $stmt->fetchAll();
}

echo json_encode($exams);
