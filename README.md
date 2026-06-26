# Plateforme de Logistique Locale

Cette plateforme connecte les petits commerçants et artisans avec des livreurs indépendants en Afrique subsaharienne.

## Stack Technique
- **Backend** : PHP 8.3+ (natif)
- **Base de données** : MySQL / MariaDB
- **Frontend Web** : React
- **Mobile** : React Native + Expo
- **Authentification** : JWT

## Installation

### 1. Base de données
1. Assurez-vous d'avoir MySQL/MariaDB installé.
2. Importez le schéma de base de données :
   ```bash
   mysql -u root -p < database/schema.sql
   ```

### 2. Backend (API)
1. Configurez vos accès à la base de données dans `api/config/db.php`.
2. Lancez un serveur PHP local pour tester l'API :
   ```bash
   php -S localhost:8000 -t .
   ```
3. L'API sera accessible via `http://localhost:8000/api/endpoints/`.

### 3. Tests de l'API
Vous pouvez tester l'authentification avec un outil comme Postman ou cURL :
```bash
curl -X POST http://localhost:8000/api/endpoints/auth.php \
     -H "Content-Type: application/json" \
     -d '{"phone_number": "237600000000", "password": "votre_mot_de_passe"}'
```

## Structure du projet
- `api/` : Code source du backend PHP.
- `database/` : Scripts SQL pour la structure des données.
- `docs/` : Documentation détaillée (Analyse, Architecture, Business Model, Wireframes).

## Sécurité
Le système utilise des jetons JWT. En production, assurez-vous de remplacer la clé secrète dans `api/middleware/auth.php` et d'utiliser une bibliothèque robuste comme `firebase/php-jwt`.
