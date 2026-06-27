# Assistant IA Examens Cameroun

Plateforme complète (Web & Mobile) pour accompagner les élèves camerounais dans la préparation de leurs examens (BAC, Probatoire, BEPC).

## Structure du projet

- `api/` : Backend en PHP natif.
  - `config/` : Connexion à la base de données.
  - `middleware/` : Authentification JWT.
  - `endpoints/` : Logique métier (Chat, Login, Register).
- `web/` : Application Web React.
- `mobile/` : Application Mobile React Native (Expo).
- `database/` : Schéma SQL et base de données SQLite.

## Installation Rapide

1.  **Initialisation de la base de données** :
    ```bash
    php setup_db.php
    ```

2.  **Lancer le serveur API** :
    ```bash
    php -S localhost:8000
    ```

3.  **Lancer le Web** :
    ```bash
    cd web && npm install && npm start
    ```

4.  **Lancer le Mobile** :
    ```bash
    cd mobile && npm install && npx expo start
    ```
    *Note: Pour tester sur un appareil réel, changez `localhost` par votre IP locale dans `mobile/App.js`.*

## Sécurité

Le secret JWT peut être configuré via la variable d'environnement `JWT_SECRET`.
