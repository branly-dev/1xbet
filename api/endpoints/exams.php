<?php
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getDb();

$results = $db->query("SELECT id, name, description FROM exams");
$exams = [];

while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
    $examId = $row['id'];
    $subjectResults = $db->query("SELECT id, name FROM subjects WHERE exam_id = $examId");
    $subjects = [];
    while ($subjectRow = $subjectResults->fetchArray(SQLITE3_ASSOC)) {
        $subjects[] = $subjectRow;
    }
    $row['subjects'] = $subjects;
    $exams[] = $row;
}

header('Content-Type: application/json');
echo json_encode($exams);
?>
