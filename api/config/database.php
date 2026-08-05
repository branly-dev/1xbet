<?php
/**
 * Database configuration & CORS helper.
 * Supports both SQLite (local development / testing) and MySQL / MariaDB (WampServer production / local).
 * Includes automatic self-healing table initialization.
 */

if (!function_exists('handleCors')) {
    function handleCors() {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
}

// Ensure CORS is set on initial load if running in server context
if (isset($_SERVER['REQUEST_METHOD'])) {
    handleCors();
}

function getDatabaseConnection() {
    $mysql_host = getenv('DB_HOST') ?: 'localhost';
    $mysql_user = getenv('DB_USER') ?: 'root';
    $mysql_pass = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : ''; // WampServer default is usually empty string ''
    $mysql_db   = getenv('DB_NAME') ?: 'marketplace';
    $driver     = getenv('DB_DRIVER') ?: 'sqlite';

    $db = null;
    $is_sqlite = true;

    // Try connecting to MySQL if explicitly requested OR SQLite file does not exist
    $sqlite_file_path = dirname(dirname(__DIR__)) . '/database/database.sqlite';
    if ($driver === 'mysql' || !file_exists($sqlite_file_path)) {
        try {
            // First connect without DB to ensure database exists or create it
            $dsn_no_db = "mysql:host=$mysql_host;charset=utf8mb4";
            $temp_db = new PDO($dsn_no_db, $mysql_user, $mysql_pass);
            $temp_db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $temp_db->exec("CREATE DATABASE IF NOT EXISTS `$mysql_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci");

            // Now connect to the selected database
            $dsn = "mysql:host=$mysql_host;dbname=$mysql_db;charset=utf8mb4";
            $db = new PDO($dsn, $mysql_user, $mysql_pass);
            $is_sqlite = false;
        } catch (Exception $e) {
            // MySQL connection failed; fallback to SQLite
            $is_sqlite = true;
        }
    }

    if ($is_sqlite) {
        try {
            $db_dir = dirname(dirname(__DIR__)) . '/database';
            if (!is_dir($db_dir)) {
                mkdir($db_dir, 0777, true);
            }
            $db = new PDO('sqlite:' . $sqlite_file_path);
        } catch (Exception $e) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit();
        }
    }

    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Self-Healing Architecture: Check if database is empty / initialized
    try {
        $test_query = $db->query("SELECT 1 FROM users LIMIT 1");
    } catch (Exception $e) {
        // Tables do not exist. Automatically initialize schema!
        try {
            $schema_path = dirname(dirname(__DIR__)) . '/database/schema.sql';
            if (file_exists($schema_path)) {
                $sql = file_get_contents($schema_path);
                if ($is_sqlite) {
                    $db->exec($sql);
                } else {
                    $sql_mysql = str_replace('AUTOINCREMENT', 'AUTO_INCREMENT', $sql);
                    $db->exec($sql_mysql);
                }

                // Automatically seed default test users & products so verify works immediately
                $password_hash = password_hash('password123', PASSWORD_BCRYPT);

                // Compatibility insert helper
                $stmt_user = $db->prepare("INSERT INTO users (id, nom, email, telephone, mot_de_passe_hash, role, langue, statut) VALUES (:id, :nom, :email, :telephone, :pass, :role, :langue, 'actif')");
                $stmt_user->execute(['id' => 1, 'nom' => 'Jean-Pierre Ngué', 'email' => 'acheteur@marketplace.cm', 'telephone' => '+237670000001', 'pass' => $password_hash, 'role' => 'acheteur', 'langue' => 'fr']);
                $stmt_user->execute(['id' => 2, 'nom' => 'Amadou Diallo', 'email' => 'vendeur@marketplace.cm', 'telephone' => '+237690000002', 'pass' => $password_hash, 'role' => 'vendeur', 'langue' => 'fr']);
                $stmt_user->execute(['id' => 3, 'nom' => 'Sonia Ngo', 'email' => 'vendeur2@marketplace.cm', 'telephone' => '+237680000004', 'pass' => $password_hash, 'role' => 'vendeur', 'langue' => 'en']);
                $stmt_user->execute(['id' => 4, 'nom' => 'Platform Administrator', 'email' => 'admin@marketplace.cm', 'telephone' => '+237650000003', 'pass' => $password_hash, 'role' => 'admin', 'langue' => 'fr']);

                $stmt_prod = $db->prepare("INSERT INTO products (id, vendeur_id, titre, description, prix, categorie, stock, photos, statut) VALUES (:id, :v_id, :titre, :descr, :prix, :cat, :stock, :photos, 'actif')");
                $stmt_prod->execute(['id' => 1, 'v_id' => 2, 'titre' => 'Plantains du Moungo (Régime)', 'descr' => 'Gros régimes de plantains mûrs ou non mûrs.', 'prix' => 4500.0, 'cat' => 'Alimentation', 'stock' => 20, 'photos' => '["plantains.jpg"]']);
                $stmt_prod->execute(['id' => 2, 'v_id' => 2, 'titre' => 'Miel Pur d Obala (1L)', 'descr' => 'Miel sauvage d Obala.', 'prix' => 6000.0, 'cat' => 'Alimentation', 'stock' => 15, 'photos' => '["miel.jpg"]']);
            }
        } catch (Exception $init_ex) {
            // Fail silently or let standard errors handle it
        }
    }

    return $db;
}
