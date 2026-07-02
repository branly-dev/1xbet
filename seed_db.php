<?php
require_once 'api/config/db.php';

$exams = ['BAC', 'Probatoire', 'BEPC'];
$subjects = [
    'BAC' => ['Mathématiques', 'Physique', 'Chimie', 'SVT', 'Philosophie', 'Histoire', 'Géographie', 'Anglais', 'Français'],
    'Probatoire' => ['Mathématiques', 'Physique', 'Chimie', 'SVT', 'Histoire', 'Géographie', 'Anglais', 'Français'],
    'BEPC' => ['Mathématiques', 'Physique-Chimie-Technologie', 'SVT', 'Histoire-Géographie-ECM', 'Anglais', 'Français']
];

try {
    foreach ($exams as $examName) {
        $stmt = $pdo->prepare("INSERT INTO exams (name) VALUES (?)");
        $stmt->execute([$examName]);
        $examId = $pdo->lastInsertId();

        foreach ($subjects[$examName] as $subjectName) {
            $stmt = $pdo->prepare("INSERT INTO subjects (exam_id, name) VALUES (?, ?)");
            $stmt->execute([$examId, $subjectName]);
        }
    }
    echo "Database seeded successfully.\n";
} catch (PDOException $e) {
    echo "Error seeding database: " . $e->getMessage() . "\n";
}
?>
