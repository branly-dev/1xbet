<?php
require_once 'api/config/database.php';

$pdo = getDatabaseConnection();

$exams = [
    'BAC' => ['Mathématiques', 'Physique', 'Chimie', 'SVT', 'Philosophie', 'Histoire-Géo', 'Anglais', 'Français'],
    'Probatoire' => ['Mathématiques', 'Physique', 'Chimie', 'SVT', 'Histoire-Géo', 'Anglais', 'Français'],
    'BEPC' => ['Mathématiques', 'Physique-Chimie-Technologie', 'SVT', 'Histoire-Géo', 'Anglais', 'Français', 'ECM']
];

foreach ($exams as $examName => $subjects) {
    $stmt = $pdo->prepare("INSERT INTO exams (name) VALUES (?)");
    $stmt->execute([$examName]);
    $examId = $pdo->lastInsertId();

    foreach ($subjects as $subjectName) {
        $stmt = $pdo->prepare("INSERT INTO subjects (exam_id, name) VALUES (?, ?)");
        $stmt->execute([$examId, $subjectName]);
    }
}

echo "Database seeded successfully.\n";
?>
