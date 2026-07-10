<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

handleCORS();

$pdo = getDatabaseConnection();

$stmt = $pdo->query("SELECT * FROM exams");
$exams = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($exams as &$exam) {
    $stmt = $pdo->prepare("SELECT * FROM subjects WHERE exam_id = ?");
    $stmt->execute([$exam['id']]);
    $exam['subjects'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

header('Content-Type: application/json');
echo json_encode($exams);
?>
