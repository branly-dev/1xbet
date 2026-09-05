<?php
$db = new SQLite3('database/database.sqlite');

$db->exec("INSERT INTO exams (name, description) VALUES ('BAC', 'Baccalauréat de l''enseignement secondaire')");
$db->exec("INSERT INTO exams (name, description) VALUES ('Probatoire', 'Examen du Probatoire')");
$db->exec("INSERT INTO exams (name, description) VALUES ('BEPC', 'Brevet d''Etudes du Premier Cycle')");

$exams = $db->query("SELECT id, name FROM exams");
while ($exam = $exams->fetchArray(SQLITE3_ASSOC)) {
    if ($exam['name'] == 'BAC') {
        $db->exec("INSERT INTO subjects (exam_id, name) VALUES ({$exam['id']}, 'Mathématiques')");
        $db->exec("INSERT INTO subjects (exam_id, name) VALUES ({$exam['id']}, 'Physique')");
        $db->exec("INSERT INTO subjects (exam_id, name) VALUES ({$exam['id']}, 'Philosophie')");
    } elseif ($exam['name'] == 'Probatoire') {
        $db->exec("INSERT INTO subjects (exam_id, name) VALUES ({$exam['id']}, 'Mathématiques')");
        $db->exec("INSERT INTO subjects (exam_id, name) VALUES ({$exam['id']}, 'Chimie')");
        $db->exec("INSERT INTO subjects (exam_id, name) VALUES ({$exam['id']}, 'Histoire-Géo')");
    } elseif ($exam['name'] == 'BEPC') {
        $db->exec("INSERT INTO subjects (exam_id, name) VALUES ({$exam['id']}, 'Français')");
        $db->exec("INSERT INTO subjects (exam_id, name) VALUES ({$exam['id']}, 'Anglais')");
        $db->exec("INSERT INTO subjects (exam_id, name) VALUES ({$exam['id']}, 'SVT')");
    }
}

echo "Database seeded successfully.\n";
?>
