# Assistant IA pour les Examens au Cameroun (BAC, Probatoire, BEPC)

Un assistant complet conçu pour accompagner les élèves camerounais dans leurs révisions pour les examens officiels, disponible sur Web et Mobile.

## Fonctionnalités
- **Bilingue** : Support complet du Français et de l'Anglais.
- **Multi-plateforme** : Application Web responsive et application Mobile (React Native).
- **IA de révision** : Assistant conversationnel capable d'aider sur les programmes officiels.
- **Sécurisé** : Authentification via JWT.
- **Hors-ligne** : Structure conçue pour supporter la synchronisation locale (SQLite/AsyncStorage).

## Architecture
- **Backend** : API PHP ultra-légère avec base de données SQLite.
- **Frontend Web** : React (chargement CDN pour une intégration rapide).
- **Mobile** : React Native / Expo.
- **Base de données** : SQLite (tables users, exams, subjects, chat_history).

## Installation

### Prérequis
- PHP 8.x
- Serveur local (ex: Apache, Nginx ou serveur PHP intégré)

### Étapes
1. **Initialiser la base de données** :
   ```bash
   php setup_db.php
   php seed_db.php
   ```
2. **Lancer le serveur API** :
   ```bash
   php -S localhost:8000 -t .
   ```
3. **Accès Web** :
   Ouvrez `web/public/index.html` dans votre navigateur ou via `http://localhost:8000/web/public/index.html`.

## API Endpoints
- `POST /api/endpoints/auth.php` : Inscription et Connexion.
- `GET /api/endpoints/exams.php` : Liste des examens et matières.
- `POST /api/endpoints/chat.php` : Interaction avec l'assistant IA.

## Licence
Propriété du projet Exam Assistant Cameroun.
