CREATE TABLE IF NOT EXISTS exam_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_type_id INT,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (exam_type_id) REFERENCES exam_types(id)
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    preferred_exam_type_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (preferred_exam_type_id) REFERENCES exam_types(id)
);

CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INT,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    subject_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

INSERT INTO exam_types (name) VALUES ('BAC'), ('Probatoire'), ('BEPC'), ('CEP'), ('GCE A Level'), ('GCE O Level');
INSERT INTO subjects (exam_type_id, name) VALUES
(1, 'Mathématiques'), (1, 'Physique'), (1, 'Chimie'), (1, 'SVT'), (1, 'Philosophie'),
(2, 'Mathématiques'), (2, 'Physique'), (2, 'Français'), (2, 'Histoire-Géo'),
(3, 'Mathématiques'), (3, 'Français'), (3, 'Anglais'), (3, 'Sciences');
