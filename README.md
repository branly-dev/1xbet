# Assistant IA pour les Examens Camerounais

Ce projet est un assistant pédagogique conçu pour aider les élèves camerounais à préparer le **BAC**, le **Probatoire** et le **BEPC**.

## Architecture
- **Backend**: API PHP native avec SQLite.
- **Web**: Interface React (située dans `/web`).
- **Mobile**: Application React Native / Expo (située dans `/mobile`).

## Installation et Configuration

### 1. Backend
- Assurez-vous d'avoir PHP 8+ installé.
- Initialisez la base de données :
  ```bash
  php setup_db.php
  php seed_db.php
  ```
- Configurez les variables d'environnement (ou utilisez un fichier `.env`) :
  - `JWT_SECRET`: Une clé secrète forte pour les tokens.
  - `AI_PROVIDER`: `openai`, `mistral` ou `mock`.
  - `AI_API_KEY`: Votre clé API pour le fournisseur choisi.

### 2. Web
- Allez dans le dossier `/web`.
- Installez les dépendances : `npm install`.
- Lancez l'application : `npm start`.

### 3. Mobile
- Allez dans le dossier `/mobile`.
- Installez les dépendances : `npm install`.
- Lancez Expo : `npx expo start`.

## Fonctionnalités
- Chatbot IA spécialisé dans le programme scolaire camerounais.
- Consultation des anciennes épreuves.
- Mode hors-ligne pour l'application mobile.
- Paiement par Mobile Money (MTN MoMo, Orange Money) pour les fonctionnalités premium.
