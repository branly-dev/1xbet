<?php
// api/endpoints/exams.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../config/database.php';
require_once '../middleware/auth.php';

// Optional: validateJWT(); // Enable if authentication is required for exams list

$db = getDatabaseConnection();

try {
    $stmt = $db->query("SELECT * FROM exams");
    $exams = $stmt->fetchAll();

    foreach ($exams as &$exam) {
        $stmtSub = $db->prepare("SELECT * FROM subjects WHERE exam_id = ?");
        $stmtSub->execute([$exam['id']]);
        $exam['subjects'] = $stmtSub->fetchAll();
    }

    echo json_encode($exams);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch exams']);
}
