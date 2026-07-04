<?php
$dbFile = __DIR__ . '/database/database.sqlite';

try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $exams = [
        ['name' => 'BAC', 'description' => 'Baccalauréat de l\'Enseignement Secondaire Général'],
        ['name' => 'Probatoire', 'description' => 'Examen du Probatoire'],
        ['name' => 'BEPC', 'description' => 'Brevet d\'Études du Premier Cycle']
    ];

    $subjects = [
        'BAC' => ['Mathématiques', 'Physique', 'Chimie', 'Philosophie', 'Histoire-Géo', 'Anglais', 'Français'],
        'Probatoire' => ['Mathématiques', 'Physique', 'Chimie', 'Histoire-Géo', 'Anglais', 'Français'],
        'BEPC' => ['Mathématiques', 'Physique-Chimie-Technologie', 'SVT', 'Histoire-Géo', 'Anglais', 'Français']
    ];

    $stmtExam = $db->prepare("INSERT OR IGNORE INTO exams (name, description) VALUES (?, ?)");
    $stmtSubject = $db->prepare("INSERT OR IGNORE INTO subjects (exam_id, name) VALUES (?, ?)");

    foreach ($exams as $exam) {
        $stmtExam->execute([$exam['name'], $exam['description']]);
        $examId = $db->lastInsertId();

        if (!$examId) {
            $s = $db->prepare("SELECT id FROM exams WHERE name = ?");
            $s->execute([$exam['name']]);
            $examId = $s->fetchColumn();
        }

        foreach ($subjects[$exam['name']] as $subject) {
            $stmtSubject->execute([$examId, $subject]);
        }
    }

    echo "Database seeded successfully.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
