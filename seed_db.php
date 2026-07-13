<?php
// seed_db.php
require_once 'api/config/database.php';

$db = getDatabaseConnection();

$exams = [
    ['BAC', 'Baccalauréat'],
    ['Probatoire', 'Probatoire'],
    ['BEPC', 'BEPC']
];

$subjects = [
    'BAC' => [['Mathématiques', 'Mathematics'], ['Physique', 'Physics'], ['Chimie', 'Chemistry'], ['Littérature', 'Literature']],
    'Probatoire' => [['Mathématiques', 'Mathematics'], ['Physique', 'Physics'], ['Informatique', 'Computer Science']],
    'BEPC' => [['Mathématiques', 'Mathematics'], ['Français', 'French'], ['Anglais', 'English']]
];

try {
    $db->beginTransaction();

    // Clear existing data
    $db->exec("DELETE FROM subjects");
    $db->exec("DELETE FROM exams");

    foreach ($exams as $examData) {
        $stmt = $db->prepare("INSERT INTO exams (name_fr, name_en) VALUES (?, ?)");
        $stmt->execute([$examData[0], $examData[1]]);
        $examId = $db->lastInsertId();

        if (isset($subjects[$examData[0]])) {
            foreach ($subjects[$examData[0]] as $subjectData) {
                $stmtSub = $db->prepare("INSERT INTO subjects (exam_id, name_fr, name_en) VALUES (?, ?, ?)");
                $stmtSub->execute([$examId, $subjectData[0], $subjectData[1]]);
            }
        }
    }

    $db->commit();
    echo "Database seeded successfully.\n";
} catch (Exception $e) {
    $db->rollBack();
    echo "Error: " . $e->getMessage() . "\n";
}
