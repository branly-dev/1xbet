# Assistant IA pour Examens Camerounais

Assistant complet pour BAC, Probatoire et BEPC (Web & Mobile).

## Architecture & Sécurité

- **Backend** : PHP natif avec authentification **JWT (HMAC-SHA256)**.
- **AI** : Intégration flexible via `api/config/ai.php` (OpenAI / Mock).
- **Mobile** : React Native (Expo) avec support **Offline-first** (AsyncStorage).
- **Web** : React modularisé.

## Installation

### 1. Base de données
```bash
php setup_db.php
php seed_db.php
```

### 2. Backend & API
```bash
php -S localhost:8000 -t .
```

### 3. Frontend Web
Voir `web/BUILD.md` pour les instructions de build. Pour une démo rapide, ouvrez `web/public/index.html`.

### 4. Mobile
```bash
cd mobile
npm install
npm start
```

## Sécurité
- Les tokens JWT sont signés. Changez le `JWT_SECRET` dans vos variables d'environnement.
- Les mots de passe sont hachés avec `password_hash()`.

## Langue
Interface 100% en **Français** pour les élèves du Cameroun.
