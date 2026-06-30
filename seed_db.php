<?php
// seed_db.php
require_once 'api/config/database.php';

$exams = [
    ['BAC Session 2023', 'Mathématiques', 'BAC', 2023, 'Contenu de l\'épreuve de maths BAC 2023...'],
    ['Probatoire Session 2023', 'Physique', 'Probatoire', 2023, 'Contenu de l\'épreuve de physique Probatoire 2023...'],
    ['BEPC Session 2023', 'Français', 'BEPC', 2023, 'Contenu de l\'épreuve de français BEPC 2023...'],
    ['BAC Session 2022', 'Philosophie', 'BAC', 2022, 'Contenu de l\'épreuve de philo BAC 2022...'],
];

$stmt = $pdo->prepare("INSERT INTO exams (title, subject, level, year, content) VALUES (?, ?, ?, ?, ?)");

foreach ($exams as $exam) {
    $stmt->execute($exam);
}

echo "Database seeded successfully.\n";
