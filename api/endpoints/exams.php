<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") { exit; }
// api/endpoints/exams.php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

verifyToken();

$level = $_GET['level'] ?? null;
$subject = $_GET['subject'] ?? null;

$query = "SELECT * FROM exams WHERE 1=1";
$params = [];

if ($level) {
    $query .= " AND level = ?";
    $params[] = $level;
}
if ($subject) {
    $query .= " AND subject = ?";
    $params[] = $subject;
}

$stmt = $pdo->prepare($query);
$stmt->execute($params);
$exams = $stmt->fetchAll();

echo json_encode($exams);
