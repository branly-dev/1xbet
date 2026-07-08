# Architecture API - JuristeIA Cameroun

L'API est conçue suivant les principes REST, sécurisée par JWT, avec une attention particulière à la gestion des numéros de téléphone et à l'intégration de l'IA (RAG).

## Configuration Générale
- **Base URL** : `https://api.juristeia.cm/v1`
- **Authentification** : Header `Authorization: Bearer <JWT>`
- **Format** : JSON

## Endpoints

### 1. Authentification & Profil (`/auth`)
- `POST /auth/register` : Inscription avec numéro de téléphone (enclenche l'envoi d'un OTP).
- `POST /auth/verify-otp` : Vérification du code et génération du JWT.
- `GET /auth/me` : Récupère le profil de l'utilisateur connecté.
- `PATCH /auth/preferences` : Met à jour la langue (FR/EN) et le système juridique (Civil/Common Law).

### 2. Agent IA & Chat (`/chat`)
- `POST /chat/sessions` : Créer une nouvelle session de conversation.
- `GET /chat/sessions` : Liste des conversations passées.
- `POST /chat/sessions/:id/messages` : Envoyer un message à l'IA.
  - *Note* : Ce endpoint déclenche le pipeline RAG (Recherche -> Augmentation -> Génération).
- `GET /chat/sessions/:id/messages` : Historique des messages d'une session.
- `GET /chat/sessions/:id/export` : Génère un PDF de la conversation.

### 3. Base de Connaissances & Recherche (`/knowledge`)
- `GET /knowledge/search` : Recherche plein texte dans les textes de loi et fiches pratiques.
- `GET /knowledge/articles/:id` : Consulter une fiche spécifique.
- `GET /knowledge/sync` : Utilisé par le mobile pour télécharger les fiches pour le mode offline.

### 4. Documents (`/documents`)
- `GET /documents/templates` : Liste les modèles disponibles (bail, mise en demeure, etc.).
- `POST /documents/generate` : Prend un `template_id` et les données du formulaire pour générer un PDF/Word.
- `GET /documents/my-docs` : Liste les documents générés par l'utilisateur.

### 5. Annuaire & Professionnels (`/directory`)
- `GET /directory/professionals` : Recherche par ville, spécialité et type (avocat, notaire, huissier).
- `GET /directory/professionals/:id` : Profil détaillé.
- `POST /directory/appointments` : Demande de rendez-vous.

### 6. Paiements (`/payments`)
- `POST /payments/momo/initiate` : Initie une requête de débit (MTN MoMo API).
- `POST /payments/om/initiate` : Initie une requête de débit (Orange Money API).
- `POST /payments/webhook` : Callback pour la confirmation du paiement par l'opérateur.
- `GET /payments/status/:transaction_id` : Vérification manuelle du statut.

## Architecture de l'Agent IA (RAG Pipeline)
1. **Embedding** : La question de l'utilisateur est convertie en vecteur.
2. **Retrieval** : Recherche dans la base `legal_knowledge` (PostgreSQL `pgvector` ou Pinecone) filtrée par le système juridique de l'utilisateur.
3. **Prompt Construction** : Injection des textes de loi trouvés + System Prompt (règles de droit camerounais).
4. **Generation** : Appel au LLM (Claude/GPT-4).
5. **Post-processing** : Ajout des liens vers les documents sources et disclaimer légal.
