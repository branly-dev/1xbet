# Assistant d'Examen Camerounais (AI Exam Assistant)

Un assistant IA complet adapté aux examens camerounais (BAC, Probatoire, BEPC), disponible sur Web et Mobile.

## Structure du Projet

- `api/`: Backend PHP (JWT Auth, OpenAI integration).
- `web/`: Frontend Web (React, Tailwind, Babel standalone).
- `mobile/`: Frontend Mobile (React Native, Expo).
- `database/`: Schéma et base de données SQLite.

## Installation et Configuration

### 1. Backend (API)
- Assurez-vous que PHP 8.x est installé.
- Configurez les permissions d'écriture pour le dossier `database/` afin que SQLite puisse fonctionner.
- Initialisez la base de données :
  ```bash
  php setup_db.php
  php seed_db.php
  ```
- Pour utiliser l'IA, définissez votre clé API OpenAI :
  ```bash
  export OPENAI_API_KEY='votre-cle-api'
  ```

### 2. Frontend Web
- Serveur recommandé : Utilisez le serveur PHP intégré à la racine du projet.
  ```bash
  php -S localhost:8000 -t .
  ```
- Accédez à l'application web via : `http://localhost:8000/web/public/index.html`

### 3. Frontend Mobile
- Allez dans le dossier mobile : `cd mobile`
- Installez les dépendances : `npm install`
- Lancez Expo : `npx expo start`
- Note : Pour tester sur un émulateur Android, l'API URL est configurée sur `10.0.2.2:8000`. Modifiez `mobile/src/config.js` pour d'autres environnements.

## Fonctionnalités
- Authentification (Inscription/Connexion).
- Support bilingue (Français/Anglais).
- Sélection d'examens (BAC, Probatoire, BEPC) et de matières.
- Chat interactif avec une IA pédagogique.
- Mode Démo/Hors-ligne si aucune clé API n'est fournie.

## Sécurité
- Mots de passe hachés avec `password_hash`.
- Authentification sécurisée via JWT.
- Protection contre les injections SQL (Requêtes préparées).
