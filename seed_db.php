<?php
// seed_db.php
require_once __DIR__ . '/api/config/database.php';

$exams = ['BAC', 'Probatoire', 'BEPC'];
$subjects = [
    'BAC' => ['Mathématiques', 'Physique', 'Chimie', 'SVT', 'Philosophie', 'Anglais', 'Français'],
    'Probatoire' => ['Mathématiques', 'Physique', 'Chimie', 'SVT', 'Histoire-Géo', 'Anglais', 'Français'],
    'BEPC' => ['Mathématiques', 'Physique-Chimie-Technologie', 'SVT', 'Histoire-Géo-ECM', 'Anglais', 'Français']
];

try {
    foreach ($exams as $exam_name) {
        $stmt = $pdo->prepare("INSERT INTO exams (name) VALUES (?)");
        $stmt->execute([$exam_name]);
        $exam_id = $pdo->lastInsertId();

        foreach ($subjects[$exam_name] as $subject_name) {
            $stmt = $pdo->prepare("INSERT INTO subjects (exam_id, name) VALUES (?, ?)");
            $stmt->execute([$exam_id, $subject_name]);
        }
    }
    echo "Données de test insérées avec succès.\n";
} catch (PDOException $e) {
    echo "Erreur lors du seeding : " . $e->getMessage() . "\n";
}
?>
