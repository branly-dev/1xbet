<?php
// api/endpoints/exams.php
require_once __DIR__ . '/../middleware/auth.php';
$pdo = require_once __DIR__ . '/../config/database.php';

handleCORS();

$stmt = $pdo->query("SELECT * FROM exams");
$exams = $stmt->fetchAll();

echo json_encode($exams);
