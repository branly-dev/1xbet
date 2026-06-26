# 3/ Architecture API REST PHP

L'API est conçue en PHP 8+ natif, sans framework, en suivant une architecture modulaire et sécurisée par JWT.

## Structure des dossiers
- `/api/config/` : Configuration de la base de données (PDO).
- `/api/middleware/` : Filtres de sécurité (Authentification JWT).
- `/api/endpoints/` : Contrôleurs traitant les requêtes et retournant du JSON.

## Endpoints principaux
- `POST /auth.php` : Authentification et génération de jeton.
- `GET /missions.php` : Liste des missions disponibles (Livreur) ou historique (Marchand).
- `POST /missions.php` : Création d'une nouvelle demande de livraison.
- `POST /transactions.php` : Gestion des paiements (action=pay) et des notes (action=rate).

## Sécurité & Performance
- **JWT (JSON Web Token)** : Utilisé pour maintenir l'état de session sans état côté serveur (stateless).
- **PDO** : Utilisation systématique de requêtes préparées pour prévenir les injections SQL.
- **Headers CORS** : Configurés pour autoriser les requêtes venant du frontend React et de l'app mobile.
