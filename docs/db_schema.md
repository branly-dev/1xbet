# Schéma de la Base de Données - JuristeIA Cameroun

Ce document décrit la structure de la base de données pour l'application d'aide à la décision juridique.

## Diagramme (ERD - Mermaid)

```mermaid
erDiagram
    USER ||--o{ CHAT_SESSION : starts
    USER ||--o{ USER_DOCUMENT : generates
    USER ||--o{ PAYMENT : makes
    USER ||--o{ APPOINTMENT : books
    PROFESSIONAL ||--|| USER : is
    PROFESSIONAL ||--o{ APPOINTMENT : receives
    CHAT_SESSION ||--o{ CHAT_MESSAGE : contains
    DOCUMENT_TEMPLATE ||--o{ USER_DOCUMENT : based_on

    USER {
        uuid id PK
        string phone_number UK
        string full_name
        enum role "user, pro, admin"
        enum preferred_language "fr, en"
        enum legal_system "civil_law, common_law"
        datetime created_at
    }

    CHAT_SESSION {
        uuid id PK
        uuid user_id FK
        string title
        enum legal_system
        string domain
        datetime created_at
    }

    CHAT_MESSAGE {
        uuid id PK
        uuid session_id FK
        enum sender "user, ai"
        text content
        json metadata "sources, citations"
        datetime created_at
    }

    LEGAL_KNOWLEDGE {
        uuid id PK
        string title
        text content "Vecteur / Markdown"
        enum type "text_of_law, guide, faq"
        string domain "foncier, travail, famille, ohada, etc."
        enum legal_system "civil, common, both"
        enum language "fr, en"
        boolean is_validated
    }

    DOCUMENT_TEMPLATE {
        uuid id PK
        string name
        string description
        string category
        json variables_schema
        string file_path_template
    }

    USER_DOCUMENT {
        uuid id PK
        uuid user_id FK
        uuid template_id FK
        json data_filled
        string pdf_url
        datetime created_at
    }

    PROFESSIONAL {
        uuid id PK
        uuid user_id FK
        enum type "avocat, notaire, huissier"
        string registration_number
        string city
        string specialty
        text bio
        boolean is_verified
    }

    PAYMENT {
        uuid id PK
        uuid user_id FK
        decimal amount
        enum provider "MTN_MOMO, ORANGE_MONEY"
        string transaction_id UK
        enum status "pending, completed, failed"
        string reference_type "appointment, document, premium"
        datetime created_at
    }

    APPOINTMENT {
        uuid id PK
        uuid user_id FK
        uuid professional_id FK
        datetime scheduled_at
        enum status "requested, confirmed, cancelled, completed"
        uuid payment_id FK
    }
```

## Détails des Tables

### 1. `users`
Stocke les informations d'identification. La vérification se fait par SMS OTP sur le `phone_number`.
- `legal_system` : Déterminé lors de l'onboarding (ex: Région du Littoral -> Civil Law, Région du Sud-Ouest -> Common Law).

### 2. `chat_sessions` & `chat_messages`
Historique des échanges avec l'IA.
- Les métadonnées des messages stockent les références aux textes de loi utilisés par le RAG.

### 3. `legal_knowledge`
La base de connaissances pour le RAG.
- `is_validated` : Champ CRITIQUE. Indique si le contenu a été revu par un juriste camerounais.

### 4. `document_templates`
Modèles de documents (ex: contrat de bail).
- `variables_schema` définit les champs à remplir par l'utilisateur.

### 5. `professionals`
Annuaire des experts agréés. Seuls les comptes avec `role = 'pro'` y sont liés.

### 6. `payments`
Suivi des transactions Mobile Money.
