<?php
// api/endpoints/subjects.php
require_once __DIR__ . '/../middleware/auth.php';
$pdo = require_once __DIR__ . '/../config/database.php';

handleCORS();

$exam_id = $_GET['exam_id'] ?? null;

if ($exam_id) {
    $stmt = $pdo->prepare("SELECT * FROM subjects WHERE exam_id = ?");
    $stmt->execute([$exam_id]);
} else {
    $stmt = $pdo->query("SELECT * FROM subjects");
}

$subjects = $stmt->fetchAll();

echo json_encode($subjects);
