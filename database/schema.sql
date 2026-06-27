-- Script de création pour MySQL (WAMP/XAMPP)
CREATE DATABASE IF NOT EXISTS exam_assistant;
USE exam_assistant;

CREATE TABLE IF NOT EXISTS exam_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_type_id INT,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (exam_type_id) REFERENCES exam_types(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    preferred_exam_type_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (preferred_exam_type_id) REFERENCES exam_types(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    subject_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
) ENGINE=InnoDB;

-- Données initiales
INSERT IGNORE INTO exam_types (id, name) VALUES
(1, 'BAC'), (2, 'Probatoire'), (3, 'BEPC'), (4, 'CEP'), (5, 'GCE A Level'), (6, 'GCE O Level');

INSERT IGNORE INTO subjects (exam_type_id, name) VALUES
(1, 'Mathématiques'), (1, 'Physique'), (1, 'Chimie'), (1, 'SVT'), (1, 'Philosophie'),
(2, 'Mathématiques'), (2, 'Physique'), (2, 'Français'), (2, 'Histoire-Géo'),
(3, 'Mathématiques'), (3, 'Français'), (3, 'Anglais'), (3, 'Sciences');
