<?php
$dbFile = __DIR__ . '/database/database.sqlite';

try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Clear existing data
    $db->exec("DELETE FROM subjects");
    $db->exec("DELETE FROM exams");

    $exams = [
        ['name_en' => 'Baccalauréat', 'name_fr' => 'Baccalauréat', 'type' => 'BAC'],
        ['name_en' => 'Probatoire', 'name_fr' => 'Probatoire', 'type' => 'Probatoire'],
        ['name_en' => 'BEPC', 'name_fr' => 'BEPC', 'type' => 'BEPC'],
    ];

    foreach ($exams as $exam) {
        $stmt = $db->prepare("INSERT INTO exams (name_en, name_fr, type) VALUES (?, ?, ?)");
        $stmt->execute([$exam['name_en'], $exam['name_fr'], $exam['type']]);
        $examId = $db->lastInsertId();

        $subjects = [
            ['name_en' => 'Mathematics', 'name_fr' => 'Mathématiques'],
            ['name_en' => 'Physics', 'name_fr' => 'Physique'],
            ['name_en' => 'Chemistry', 'name_fr' => 'Chimie'],
            ['name_en' => 'Biology', 'name_fr' => 'SVT'],
            ['name_en' => 'History', 'name_fr' => 'Histoire'],
            ['name_en' => 'Geography', 'name_fr' => 'Géographie'],
            ['name_en' => 'English', 'name_fr' => 'Anglais'],
            ['name_en' => 'French', 'name_fr' => 'Français'],
        ];

        foreach ($subjects as $subject) {
            $stmt = $db->prepare("INSERT INTO subjects (exam_id, name_en, name_fr) VALUES (?, ?, ?)");
            $stmt->execute([$examId, $subject['name_en'], $subject['name_fr']]);
        }
    }

    echo "Database seeded successfully.\n";
} catch (PDOException $e) {
    echo "Seeding failed: " . $e->getMessage() . "\n";
}
