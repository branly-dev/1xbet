<?php
class Database {
    public $conn;
    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("sqlite:" . __DIR__ . "/../../database/database.sqlite");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
?>
