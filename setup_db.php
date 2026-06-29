<?php
// setup_db.php
$db_file = 'database/database.sqlite';

try {
    $pdo = new PDO("sqlite:$db_file");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $schema = file_get_contents('database/schema.sql');
    $pdo->exec($schema);

    echo "Base de données initialisée avec succès.\n";
} catch (PDOException $e) {
    echo "Erreur : " . $e->getMessage() . "\n";
}
?>
