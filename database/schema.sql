-- 2/ Schéma BDD (MySQL/MariaDB)

CREATE DATABASE IF NOT EXISTS logistique_locale CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE logistique_locale;

-- Table des utilisateurs (Commerçants, Livreurs, Admins)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE, -- Pour Mobile Money
    role ENUM('merchant', 'driver', 'admin') NOT NULL,
    rating_avg DECIMAL(3,2) DEFAULT 5.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_phone (phone_number)
) ENGINE=InnoDB;

-- Table des missions de livraison
CREATE TABLE missions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    merchant_id INT NOT NULL,
    driver_id INT DEFAULT NULL,
    status ENUM('pending', 'accepted', 'picked_up', 'delivered', 'cancelled', 'disputed') DEFAULT 'pending',

    -- Détails marchandises
    cargo_type VARCHAR(100) NOT NULL,
    description TEXT,

    -- Localisation (Format simplifié pour l'exemple)
    pickup_address TEXT NOT NULL,
    pickup_lat DECIMAL(10, 8),
    pickup_lng DECIMAL(11, 8),
    delivery_address TEXT NOT NULL,
    delivery_lat DECIMAL(10, 8),
    delivery_lng DECIMAL(11, 8),

    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XAF', -- Franc CFA (Afrique Centrale) ou XOF

    -- Photos de preuve
    photo_before VARCHAR(255),
    photo_after VARCHAR(255),

    pickup_time DATETIME,
    delivery_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (merchant_id) REFERENCES users(id),
    FOREIGN KEY (driver_id) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_merchant (merchant_id),
    INDEX idx_driver (driver_id)
) ENGINE=InnoDB;

-- Table des transactions Mobile Money
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mission_id INT NOT NULL,
    user_id INT NOT NULL, -- Celui qui paie (Commerçant)
    amount DECIMAL(10, 2) NOT NULL,
    provider ENUM('MTN', 'ORANGE') NOT NULL,
    external_transaction_id VARCHAR(100) UNIQUE, -- ID de l'opérateur
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (mission_id) REFERENCES missions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Table des notations bidirectionnelles
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mission_id INT NOT NULL,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    score TINYINT NOT NULL CHECK (score BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_rating (mission_id, from_user_id),
    FOREIGN KEY (mission_id) REFERENCES missions(id),
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Table des litiges
CREATE TABLE disputes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mission_id INT NOT NULL,
    reported_by_id INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('open', 'resolved', 'closed') DEFAULT 'open',
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (mission_id) REFERENCES missions(id),
    FOREIGN KEY (reported_by_id) REFERENCES users(id)
) ENGINE=InnoDB;
