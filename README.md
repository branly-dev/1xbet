# Marché Camerounais - Mobile Money & Local Commerce Platform

Une plateforme marketplace complète et robuste ciblant le Cameroun et l'Afrique subsaharienne, optimisée pour des bandes passantes limitées et des paiements dominés par le Mobile Money (Orange Money, MTN MoMo / Moov Money).

L'application prend en compte la faible culture numérique grâce à une interface bilingue français / anglais simple, des textes d'accessibilité (taille de police >= 18px, padding >= 15px) et un mode hors-ligne ("offline-first") performant sur application mobile.

## Fonctionnalités Principales

- **Bilinguisme Intégral** : Français et Anglais gérés de manière fluide sur toutes les interfaces (Web et Mobile) et notifications.
- **Acteurs & Dashboards** :
  - **Acheteur** : Recherche simplifiée par catégories, prix, et mots-clés sémantiques. Passage de commande rapide, processus de paiement Mobile Money avec webhooks automatisés, et système de notation/évaluation des vendeurs.
  - **Vendeur** : Publication rapide d'annonces de produits (plantains, miel sauvage d'Obala, poivre de Penja, etc.), gestion d'état des commandes (en attente, expédié, payé, complété), et évaluation des acheteurs.
  - **Administrateur** : Suspension d'utilisateurs frauduleux, modération des annonces signalées assistée par l'intelligence artificielle Gemini, et résolution rapide des litiges commerciaux.
- **Optimisations de Bande Passante** : Mode faible bande passante (low-bandwidth) configurable éliminant ou compressant le chargement d'images lourdes pour réduire les données cellulaires.
- **Intégrations IA (Gemini)** :
  - Recherche intelligente sémantique intégrée pour proposer d'excellentes recommandations de produits d'alimentation et vêtements locaux.
  - Outil de vérification et modération de contenu pour bloquer les tentatives de fraude, drogues, ou armes de manière automatisée.
- **Notifications & Automatisation (n8n)** : Scénarios n8n pour router des SMS et e-mails sur des événements clés (nouvelles commandes, paiements reçus).

---

## Architecture de l'application

```text
├── api/
│   ├── config/
│   │   └── database.php       <-- Connexions DB et CORS helpers
│   ├── middleware/
│   │   └── auth.php           <-- Validation JWT personnalisée et Base64Url
│   └── endpoints/
│       ├── auth.php           <-- Inscription & Connexion unifiées
│       ├── products.php       <-- Produits, compression d'images & recherche Gemini
│       ├── orders.php         <-- Gestion de commandes & Décrémentation de stock
│       ├── payments.php       <-- Webhooks Orange Money, MTN MoMo, Moov Money
│       ├── messages.php       <-- Messagerie interne Acheteur <-> Vendeur
│       ├── ratings.php        <-- Notations et avis des utilisateurs
│       ├── disputes.php       <-- Litiges acheteur/vendeur
│       └── admin.php          <-- Modération des utilisateurs, annonces et IA Gemini
│
├── database/
│   ├── schema.sql             <-- Schéma SQL complet (users, products, orders, etc.)
│   └── database.sqlite        <-- Base de données locale de développement
│
├── web/
│   └── public/
│       ├── index.html         <-- Frontend web réactif zero-build
│       └── js/
│           ├── App.js         <-- Composant principal React, dashboards et modales
│           ├── Chat.js        <-- Messagerie temps réel
│           ├── Login.js       <-- Connexion / Inscription bilingue
│           └── translations.js<-- Fichier de traduction centralisé (FR/EN)
│
├── mobile/
│   ├── package.json           <-- Dépendances Expo React Native
│   └── src/
│       ├── App.js             <-- Écrans mobiles, file d'attente hors-ligne & synchronisation
│       ├── config.js          <-- Configurations API mobile
│       ├── translations.js    <-- Traductions bilingues mobiles
│       └── screens/
│           ├── Login.js       <-- Écran d'authentification accessible (>= 18px, >= 15px)
│           └── Chat.js        <-- Chat de messagerie avec mise en attente offline
│
└── n8n/
    └── workflows.json         <-- Flux n8n pour SMS, e-mails et modération IA Gemini
```

---

## Comment lancer le projet localement ?

### 1. Initialiser la Base de Données
Initialisez le schéma et insérez les jeux de données d'exemples (utilisateurs tests de rôles différents, produits traditionnels de Foumban, Obala et Penja) :
```bash
php setup_db.php
php seed_db.php
```

### 2. Démarrer le Serveur Backend
Démarrez le serveur Web intégré de PHP sur le port 8000 :
```bash
php -S 127.0.0.1:8000
```

### 3. Accéder au site Web
Ouvrez simplement votre navigateur à l'adresse suivante :
`http://127.0.0.1:8000/web/public/index.html`

Pour tester les différents rôles, connectez-vous avec :
- **Acheteur** : `acheteur@marketplace.cm` (mot de passe : `password123`)
- **Vendeur** : `vendeur@marketplace.cm` (mot de passe : `password123`)
- **Administrateur** : `admin@marketplace.cm` (mot de passe : `password123`)

---

## Intégration Mobile Money & Webhooks

Le système dispose d'une gestion complète et sécurisée des paiements :
- **Initiation** : L'acheteur sélectionne l'opérateur (`Orange Money`, `MTN MoMo` ou `Moov Money`), son numéro de téléphone, et lance le paiement.
- **Sécurité** : Les informations confidentielles ou les codes PIN ne sont jamais stockés en base de données.
- **Webhook** : Une API Webhook `POST /api/endpoints/payments.php?webhook=1` reçoit la validation automatique de l'opérateur et met à jour instantanément la commande à l'état `payé`, débloquant l'expédition et notifiant le vendeur.
