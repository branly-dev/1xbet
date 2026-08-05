-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telephone TEXT NOT NULL,
    mot_de_passe_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('acheteur', 'vendeur', 'admin')),
    langue TEXT NOT NULL DEFAULT 'fr' CHECK(langue IN ('fr', 'en')),
    statut TEXT NOT NULL DEFAULT 'actif' CHECK(statut IN ('actif', 'suspendu')),
    cree_le DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: products
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendeur_id INTEGER NOT NULL,
    titre TEXT NOT NULL,
    description TEXT,
    prix REAL NOT NULL,
    categorie TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    photos TEXT, -- JSON array of compressed base64 images or urls
    statut TEXT NOT NULL DEFAULT 'actif' CHECK(statut IN ('actif', 'signale', 'valide', 'supprime')),
    cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(vendeur_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: orders
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    acheteur_id INTEGER NOT NULL,
    vendeur_id INTEGER NOT NULL,
    produit_id INTEGER NOT NULL,
    quantite INTEGER NOT NULL DEFAULT 1,
    statut TEXT NOT NULL DEFAULT 'en_attente' CHECK(statut IN ('en_attente', 'paye', 'expedie', 'complete', 'annule')),
    montant REAL NOT NULL,
    cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(acheteur_id) REFERENCES users(id),
    FOREIGN KEY(vendeur_id) REFERENCES users(id),
    FOREIGN KEY(produit_id) REFERENCES products(id)
);

-- Table: payments
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    operateur TEXT NOT NULL CHECK(operateur IN ('orange', 'momo', 'moov')),
    reference_transaction TEXT NOT NULL,
    statut TEXT NOT NULL DEFAULT 'initie' CHECK(statut IN ('initie', 'complete', 'echoue')),
    montant REAL NOT NULL,
    cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(order_id) REFERENCES orders(id)
);

-- Table: messages
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expediteur_id INTEGER NOT NULL,
    destinataire_id INTEGER NOT NULL,
    contenu TEXT NOT NULL,
    lu INTEGER NOT NULL DEFAULT 0 CHECK(lu IN (0, 1)),
    cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(expediteur_id) REFERENCES users(id),
    FOREIGN KEY(destinataire_id) REFERENCES users(id)
);

-- Table: ratings
CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    auteur_id INTEGER NOT NULL,
    cible_id INTEGER NOT NULL,
    order_id INTEGER NOT NULL,
    note INTEGER NOT NULL CHECK(note >= 1 AND note <= 5),
    commentaire TEXT,
    cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(auteur_id) REFERENCES users(id),
    FOREIGN KEY(cible_id) REFERENCES users(id),
    FOREIGN KEY(order_id) REFERENCES orders(id)
);

-- Table: disputes
CREATE TABLE IF NOT EXISTS disputes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    ouvert_par_id INTEGER NOT NULL,
    statut TEXT NOT NULL DEFAULT 'ouvert' CHECK(statut IN ('ouvert', 'resolu', 'ferme')),
    description TEXT NOT NULL,
    resolution TEXT,
    cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(ouvert_par_id) REFERENCES users(id)
);

-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- e.g., 'nouvelle_commande', 'paiement_recu', 'nouveau_message'
    canal TEXT NOT NULL CHECK(canal IN ('sms', 'email')),
    contenu TEXT NOT NULL,
    statut TEXT NOT NULL DEFAULT 'en_attente' CHECK(statut IN ('en_attente', 'envoye', 'echoue')),
    envoye_le DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
