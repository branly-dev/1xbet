# Assistant IA - Examens Camerounais

Cet assistant est conçu pour aider les élèves camerounais à préparer les examens du BAC, Probatoire et BEPC.

## Structure du Projet

- `api/` : Backend en PHP natif.
- `web/` : Frontend Web (HTML/JS/CSS).
- `mobile/` : Structure de l'application mobile (React Native).
- `database/` : Schéma et base de données SQLite.

## Installation et Lancement

### 1. Initialisation de la Base de Données
Assurez-vous d'avoir PHP 8+ installé.
```bash
php setup_db.php
```

### 2. Lancer le Serveur Backend et Web
```bash
php -S localhost:8000 -t .
```
- **Web** : Ouvrez votre navigateur sur `http://localhost:8000/web/public/index.html`
- **API** : Les points d'entrée sont disponibles sous `/api/endpoints/`

### 3. Application Mobile
Le code se trouve dans le dossier `mobile/`. Il s'agit d'une structure React Native prête à être intégrée dans un projet Expo.

## Fonctionnalités
- **Authentification** : Inscription et connexion sécurisées (JWT).
- **IA Tutorat** : Chat en français adapté au type d'examen.
- **Paiements** : Simulation de paiements via MTN MoMo et Orange Money.
- **Offline-First** : Support de la synchronisation locale sur mobile.
