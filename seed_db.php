<?php
// seed_db.php
$pdo = require 'api/config/database.php';

$exams = ['BAC', 'Probatoire', 'BEPC'];
$subjects = [
    'BAC' => ['Mathématiques', 'Physique', 'Chimie', 'SVT', 'Philosophie', 'Histoire-Géo'],
    'Probatoire' => ['Mathématiques', 'Physique', 'Chimie', 'SVT', 'Français', 'Anglais'],
    'BEPC' => ['Mathématiques', 'Physique-Chimie-Technologie', 'SVT', 'Français', 'Anglais', 'Histoire-Géo-ECM']
];

foreach ($exams as $exam) {
    $stmt = $pdo->prepare("INSERT INTO exams (name) VALUES (?)");
    $stmt->execute([$exam]);
    $exam_id = $pdo->lastInsertId();

    foreach ($subjects[$exam] as $subject) {
        $stmt = $pdo->prepare("INSERT INTO subjects (exam_id, name) VALUES (?, ?)");
        $stmt->execute([$exam_id, $subject]);
    }
}

echo "Database seeded successfully.\n";
