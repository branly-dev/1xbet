<?php
$dbFile = __DIR__ . '/database/database.sqlite';

try {
    $pdo = new PDO('sqlite:' . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Clear existing data
    $pdo->exec("DELETE FROM subjects");
    $pdo->exec("DELETE FROM exams");

    $exams = [
        ['name' => 'BAC', 'subjects' => ['Mathématiques', 'Physique', 'Philosophie', 'Français', 'Anglais']],
        ['name' => 'Probatoire', 'subjects' => ['Mathématiques', 'Physique', 'Chimie', 'Histoire-Géo']],
        ['name' => 'BEPC', 'subjects' => ['Mathématiques', 'SVT', 'Français', 'Anglais']]
    ];

    foreach ($exams as $examData) {
        $stmt = $pdo->prepare("INSERT INTO exams (name) VALUES (?)");
        $stmt->execute([$examData['name']]);
        $examId = $pdo->lastInsertId();

        foreach ($examData['subjects'] as $subjectName) {
            $stmt = $pdo->prepare("INSERT INTO subjects (exam_id, name) VALUES (?, ?)");
            $stmt->execute([$examId, $subjectName]);
        }
    }

    echo "Database seeded successfully.\n";
} catch (PDOException $e) {
    die("Error seeding database: " . $e->getMessage() . "\n");
}
