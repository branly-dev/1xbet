# Assistant IA d'Examen Camerounais (BAC, Probatoire, BEPC) - Web & Mobile

Ce projet propose une solution complète d'**Assistant d'Examen alimenté par l'IA** spécifiquement adapté au système éducatif camerounais (préparation aux examens du Baccalauréat, Probatoire, et BEPC).

L'écosystème comprend un **serveur backend PHP léger**, une **base de données SQLite**, une **application web interactive en React (architecture sans build)**, et une **application mobile native développée avec React Native et Expo**.

---

## 🌟 Fonctionnalités Clés

- **Support Bilingue (Français & Anglais) :** Une internationalisation complète intégrée tant sur le web que sur le mobile pour soutenir le bilinguisme officiel du Cameroun.
- **Accessibilité Maximale :** Conçu spécifiquement pour les utilisateurs à faible littératie numérique (polices d'écriture d'au moins 18px, espacements généreux de 15px minimum pour les zones cliquables, et navigation simplifiée).
- **Assistant IA Contextuel (RAG & OpenAI) :** Capacité à répondre précisément selon l'examen choisi (BAC, Probatoire, BEPC) et la matière sélectionnée (Mathématiques, Physique, Chimie, SVT, Histoire, etc.).
- **Mode Hors-ligne / Démo :** En cas d'absence de connexion internet ou de clé d'API, un fallback intelligent simule les réponses d'un tuteur académique pour garantir la continuité de l'apprentissage.
- **Sécurité Renforcée :**
  - Authentification sécurisée par JWT (JSON Web Tokens) avec expiration de 24h et clés sécurisées.
  - Chiffrement des mots de passe avec l'algorithme `password_hash` et `password_verify`.
  - Protection contre les attaques de timing lors de la vérification de la signature JWT via `hash_equals`.
  - Gestion stricte et sécurisée des en-têtes CORS pour les requêtes Cross-Origin et les requêtes préliminaires `OPTIONS`.

---

## 🏗️ Architecture du Projet

Le projet est structuré comme suit :

```text
├── api/                       # API Backend PHP
│   ├── config/
│   │   └── database.php       # Configuration PDO SQLite & Helper CORS
│   ├── middleware/
│   │   └── auth.php           # Middleware JWT (génération, vérification, encodage)
│   └── endpoints/
│       ├── auth.php           # Endpoint d'Inscription et de Connexion unique
│       ├── chat.php           # Endpoint de chat IA (Intégration OpenAI & Fallback)
│       └── exams.php          # Endpoint listant les examens et matières associées
│
├── database/                  # Base de données
│   ├── schema.sql             # Définition des tables (users, exams, subjects, chat_history)
│   └── database.sqlite        # Fichier SQLite local (généré automatiquement)
│
├── web/                       # Application Web React
│   └── public/
│       ├── js/
│       │   ├── App.js         # Composant principal et gestion d'état React
│       │   ├── Chat.js        # Interface de discussion et filtres de sélection
│       │   ├── Login.js       # Formulaire d'authentification et inscription
│       │   └── translations.js# Fichier centralisé des traductions bilingues
│       └── index.html         # Point d'entrée web (Babel Standalone & Tailwind CSS CDN)
│
├── mobile/                    # Application Mobile Expo / React Native
│   ├── src/
│   │   ├── screens/
│   │   │   ├── Chat.js        # Écran de Chat avec sélecteurs natifs (Picker)
│   │   │   └── Login.js       # Écran d'authentification mobile adapté aux petits écrans
│   │   ├── App.js             # Gestion de l'état global et du sélecteur de langue
│   │   ├── config.js          # Configuration des adresses IP d'API (Android / iOS)
│   │   └── translations.js    # Fichier de traductions mobiles
│   └── package.json           # Dépendances mobiles Expo
│
├── setup_db.php               # Script d'initialisation de la base de données
├── seed_db.php                # Script de peuplement de la base de données (BAC, Probatoire, BEPC)
└── README.md                  # Documentation du projet (ce fichier)
```

---

## ⚙️ Installation et Configuration

### 1. Prérequis
- **PHP 8.0+** avec l'extension `pdo_sqlite` activée.
- **Node.js** (v18+) et **npm** (pour le développement mobile).
- Un appareil Android/iOS avec l'application **Expo Go** (pour tester l'application mobile sur appareil physique).

### 2. Initialisation de la Base de Données
Exécutez les scripts suivants à la racine du projet pour créer le schéma SQLite et pré-remplir les tables avec les examens officiels camerounais et leurs matières :

```bash
# Crée le dossier database et la structure des tables
php setup_db.php

# Insère les examens (BAC, Probatoire, BEPC) et les matières associées
php seed_db.php
```

### 3. Configuration des variables d'environnement (Optionnel)
Vous pouvez configurer les variables d'environnement suivantes dans votre environnement d'exécution pour activer l'IA OpenAI et sécuriser l'authentification :
- `OPENAI_API_KEY` : Clé API OpenAI (pour utiliser GPT-3.5-turbo au lieu du mode de démonstration).
- `JWT_SECRET` : Clé secrète de signature des jetons de connexion (valeur sécurisée par défaut fournie pour le développement).

---

## 🚀 Lancement des Serveurs

### 1. Serveur Backend (API) et Frontend Web
Démarrez le serveur de développement PHP intégré depuis la racine du projet :

```bash
php -S localhost:8000 -t .
```

- **API REST :** Accessible à l'adresse `http://localhost:8000/api/endpoints/`
- **Application Web :** Accessible directement depuis votre navigateur à l'adresse [http://localhost:8000/web/public/index.html](http://localhost:8000/web/public/index.html)

### 2. Application Mobile Expo
Déplacez-vous dans le répertoire `mobile/` :

```bash
cd mobile
```

Configurez l'adresse IP de votre machine dans le fichier `mobile/src/config.js` pour permettre à votre téléphone portable physique ou à votre émulateur de communiquer avec votre serveur PHP local (remplacez par exemple `10.0.2.2` par l'IP de votre réseau local si vous utilisez Expo Go).

Installez les dépendances et démarrez le serveur Metro d'Expo :

```bash
npm install
npm start
```

Scannez le QR Code affiché dans votre terminal avec l'application **Expo Go** de votre téléphone portable pour démarrer l'application instantanément !

---

## 🧪 Spécifications Techniques & Tests de Vérification

### Validation de la base de données SQLite
Les requêtes SQLite s'effectuent sur le fichier `database/database.sqlite`. Les relations sont définies selon les clés étrangères reliant les examens (`exams`), les matières (`subjects`) et l'historique des discussions (`chat_history`).

### Validation de l'Interface Web
L'interface de l'application Web utilise React avec Babel en direct, évitant ainsi l'étape de compilation complexe pour un prototypage ultra-rapide. Elle intègre :
1. Un formulaire d'authentification et de création de compte bilingue.
2. Un sélecteur d'examen mettant à jour dynamiquement la liste des matières disponibles correspondantes.
3. Un chat interactif préservant le contexte d'apprentissage.

---

## 📄 Licence
Ce projet est distribué sous licence libre d'utilisation pour le développement et l'apprentissage académique au Cameroun et ailleurs.
