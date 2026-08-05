<?php
/**
 * Database Seeder for Cameroon Marketplace Platform
 * Creates test accounts (acheteur, vendeur, admin), test products, orders, and messages.
 */

$db_path = __DIR__ . '/database/database.sqlite';
if (!file_exists($db_path)) {
    echo "Database file does not exist. Run setup_db.php first.\n";
    exit(1);
}

try {
    $db = new PDO('sqlite:' . $db_path);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Clear existing tables
    $db->exec("DELETE FROM users");
    $db->exec("DELETE FROM products");
    $db->exec("DELETE FROM orders");
    $db->exec("DELETE FROM payments");
    $db->exec("DELETE FROM messages");
    $db->exec("DELETE FROM ratings");
    $db->exec("DELETE FROM disputes");
    $db->exec("DELETE FROM notifications");

    // Insert Default Users
    $password_hash = password_hash('password123', PASSWORD_BCRYPT);

    $users = [
        [
            'nom' => 'Jean-Pierre Ngué',
            'email' => 'acheteur@marketplace.cm',
            'telephone' => '+237670000001',
            'mot_de_passe_hash' => $password_hash,
            'role' => 'acheteur',
            'langue' => 'fr',
            'statut' => 'actif'
        ],
        [
            'nom' => 'Amadou Diallo',
            'email' => 'vendeur@marketplace.cm',
            'telephone' => '+237690000002',
            'mot_de_passe_hash' => $password_hash,
            'role' => 'vendeur',
            'langue' => 'fr',
            'statut' => 'actif'
        ],
        [
            'nom' => 'Sonia Ngo',
            'email' => 'vendeur2@marketplace.cm',
            'telephone' => '+237680000004',
            'mot_de_passe_hash' => $password_hash,
            'role' => 'vendeur',
            'langue' => 'en',
            'statut' => 'actif'
        ],
        [
            'nom' => 'Platform Administrator',
            'email' => 'admin@marketplace.cm',
            'telephone' => '+237650000003',
            'mot_de_passe_hash' => $password_hash,
            'role' => 'admin',
            'langue' => 'fr',
            'statut' => 'actif'
        ]
    ];

    $stmt_user = $db->prepare("INSERT INTO users (nom, email, telephone, mot_de_passe_hash, role, langue, statut) VALUES (:nom, :email, :telephone, :mot_de_passe_hash, :role, :langue, :statut)");
    foreach ($users as $user) {
        $stmt_user->execute($user);
    }

    // Retrieve buyer and seller IDs
    $stmt_find_buyer = $db->prepare("SELECT id FROM users WHERE email = 'acheteur@marketplace.cm'");
    $stmt_find_buyer->execute();
    $buyer_id = $stmt_find_buyer->fetch(PDO::FETCH_ASSOC)['id'];

    $stmt_find_seller = $db->prepare("SELECT id FROM users WHERE email = 'vendeur@marketplace.cm'");
    $stmt_find_seller->execute();
    $seller_id = $stmt_find_seller->fetch(PDO::FETCH_ASSOC)['id'];

    $stmt_find_seller2 = $db->prepare("SELECT id FROM users WHERE email = 'vendeur2@marketplace.cm'");
    $stmt_find_seller2->execute();
    $seller2_id = $stmt_find_seller2->fetch(PDO::FETCH_ASSOC)['id'];

    // Insert Default Products
    $products = [
        [
            'vendeur_id' => $seller_id,
            'titre' => 'Plantains du Moungo (Régime)',
            'description' => 'Gros régimes de plantains mûrs ou non mûrs en provenance directe du Moungo. Idéal pour vos rôtis de plantains ou pilets.',
            'prix' => 4500.0,
            'categorie' => 'Alimentation',
            'stock' => 20,
            'photos' => json_encode(['plantains.jpg']),
            'statut' => 'actif'
        ],
        [
            'vendeur_id' => $seller_id,
            'titre' => 'Miel Pur d Obala (1L)',
            'description' => 'Miel sauvage d Obala, naturel et pur à 100%. Récolté artisanalement dans le strict respect de la nature.',
            'prix' => 6000.0,
            'categorie' => 'Alimentation',
            'stock' => 15,
            'photos' => json_encode(['miel.jpg']),
            'statut' => 'actif'
        ],
        [
            'vendeur_id' => $seller2_id,
            'titre' => 'Kaba Ngondo Traditionnel',
            'description' => 'Traditional custom-made Sawa dress (Kaba Ngondo). High quality African wax print fabric, comfortable and elegant.',
            'prix' => 15000.0,
            'categorie' => 'Mode',
            'stock' => 5,
            'photos' => json_encode(['kaba.jpg']),
            'statut' => 'actif'
        ],
        [
            'vendeur_id' => $seller2_id,
            'titre' => 'Poivre de Penja Noir (500g)',
            'description' => 'Penja black pepper, globally renowned for its unique aroma and sharp flavor. Protected Geographical Indication.',
            'prix' => 8000.0,
            'categorie' => 'Alimentation',
            'stock' => 50,
            'photos' => json_encode(['penja.jpg']),
            'statut' => 'actif'
        ]
    ];

    $stmt_prod = $db->prepare("INSERT INTO products (vendeur_id, titre, description, prix, categorie, stock, photos, statut) VALUES (:vendeur_id, :titre, :description, :prix, :categorie, :stock, :photos, :statut)");
    foreach ($products as $prod) {
        $stmt_prod->execute($prod);
    }

    // Insert a Test Message
    $messages = [
        [
            'expediteur_id' => $buyer_id,
            'destinataire_id' => $seller_id,
            'contenu' => 'Bonjour Amadou, le miel d Obala est-il encore disponible ?',
            'lu' => 0
        ],
        [
            'expediteur_id' => $seller_id,
            'destinataire_id' => $buyer_id,
            'contenu' => 'Oui Jean-Pierre, il m en reste quelques bouteilles de 1L. Tu en veux combien ?',
            'lu' => 1
        ]
    ];

    $stmt_msg = $db->prepare("INSERT INTO messages (expediteur_id, destinataire_id, contenu, lu) VALUES (:expediteur_id, :destinataire_id, :contenu, :lu)");
    foreach ($messages as $msg) {
        $stmt_msg->execute($msg);
    }

    echo "Database seeded successfully!\n";

} catch (Exception $e) {
    echo "Error seeding database: " . $e->getMessage() . "\n";
    exit(1);
}
