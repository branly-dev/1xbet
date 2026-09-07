# Assistant IA aux Examens Nationaux Camerounais (BAC, Probatoire, BEPC)

Solution complète et bilingue (Français / Anglais) d'assistance IA dédiée aux révisions et à la préparation des examens nationaux du Cameroun (Baccalauréat, Probatoire, BEPC / GCE O-Level & A-Level).

## Architecture du Projet

- **Backend API (PHP / SQLite & MySQL)** :
  - `api/endpoints/auth.php` : Authentification et inscription avec tokens JWT et hashage de mots de passe (`password_hash`).
  - `api/endpoints/exams.php` : Arborescence des examens camerounais et matières associées (Mathématiques, Physique, Informatique, Chimie, SVT, Philosophie, Histoire, Anglais, Français).
  - `api/endpoints/chat.php` : Moteur d'assistance IA spécialisé pour la méthodologie des épreuves camerounaises avec mode repli (fallback simulation).
  - `api/middleware/auth.php` : Vérification et validation des tokens JWT.
  - `api/config/database.php` : Auto-initialisation et gestion multi-SGBD (SQLite / MySQL).

- **Frontend Web (React & Tailwind CSS)** :
  - `web/public/index.html` & `web/src/` : Interface utilisateur web moderne, responsive, à haut contraste et optimisée pour l'accessibilité.
  - Support bilingue instantané (FR/EN) et chat interactif avec choix de l'examen et de la matière.

- **Application Mobile (React Native / Expo)** :
  - `mobile/App.js` & `mobile/src/` : Application mobile multiplateforme avec design adapté aux critères d'accessibilité camerounais (tailles de police de 18px minimum et zones de touche de 15px+).

- **Bases de Données & Scripts de Test** :
  - `database/schema.sql` : Schéma de base de données relationnelle.
  - `setup_db.php` & `seed_db.php` : Initialisation et peuplement automatique des examens et matières.
  - `test_api.php` : Test d'intégration automatisé des endpoints backend.
  - `test_e2e_playwright.py` : Script de test d'interface de bout en bout (Playwright) vérifiant les parcours utilisateur clés.

## Préréquis & Lancement rapide

### 1. Initialiser la Base de Données
```bash
php setup_db.php
php seed_db.php
```

### 2. Démarrer le Serveur Backend PHP
```bash
php -S 127.0.0.1:8000 -t .
```

### 3. Exécuter la Suite de Tests Backend
```bash
php test_api.php
```

### 4. Exécuter les Tests E2E Web (Playwright)
```bash
python3 test_e2e_playwright.py
```

## Fonctionnalités Clés
- **Conformité au Système Éducatif Camerounais** : Soutien spécifique pour les séries Générales et Techniques du BAC, Probatoire et BEPC.
- **Bilinguisme Intégral** : Bascule fluide et instantanée entre le Français et l'Anglais.
- **Accessibilité & Faible Connectivité** : Interface légère, lisible et optimisée pour les débits internet réduits.
