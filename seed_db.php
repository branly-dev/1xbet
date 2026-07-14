<?php
// seed_db.php
$db = new SQLite3(__DIR__ . '/database/database.sqlite');

$exams = [
    ['BAC', 'Baccalauréat', 'Baccalaureate'],
    ['PROB', 'Probatoire', 'Probationary'],
    ['BEPC', 'BEPC', 'GCE O-Level']
];

foreach ($exams as $exam) {
    $stmt = $db->prepare("INSERT INTO exams (name_fr, name_en) VALUES (?, ?)");
    $stmt->bindValue(1, $exam[1]);
    $stmt->bindValue(2, $exam[2]);
    $stmt->execute();
    $examId = $db->lastInsertRowID();

    $subjects = [
        ['Mathématiques', 'Mathematics'],
        ['Physique', 'Physics'],
        ['Français', 'French'],
        ['Anglais', 'English'],
        ['Histoire', 'History']
    ];

    foreach ($subjects as $sub) {
        $stmt = $db->prepare("INSERT INTO subjects (exam_id, name_fr, name_en) VALUES (?, ?, ?)");
        $stmt->bindValue(1, $examId);
        $stmt->bindValue(2, $sub[0]);
        $stmt->bindValue(3, $sub[1]);
        $stmt->execute();
    }
}

echo "Database seeded successfully.\n";
