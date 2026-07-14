<?php
// api/endpoints/exams.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once __DIR__ . '/../config/database.php';

$db = getDbConnection();

$examsResult = $db->query("SELECT * FROM exams");
$exams = [];

while ($exam = $examsResult->fetchArray(SQLITE3_ASSOC)) {
    $stmt = $db->prepare("SELECT * FROM subjects WHERE exam_id = ?");
    $stmt->bindValue(1, $exam['id']);
    $subjectsResult = $stmt->execute();
    $subjects = [];
    while ($subject = $subjectsResult->fetchArray(SQLITE3_ASSOC)) {
        $subjects[] = $subject;
    }
    $exam['subjects'] = $subjects;
    $exams[] = $exam;
}

echo json_encode($exams);
