# Roadmap de Développement - JuristeIA Cameroun

Le projet est divisé en 4 phases majeures suivant une méthodologie Agile.

## Phase 1 : Fondations & RAG (Sprint 1-2) - "Le Cœur de l'IA"
- **Objectif** : Avoir un agent IA qui répond correctement aux questions juridiques camerounaises.
- **Tâches** :
    - Mise en place du Backend (PHP 8+ natif) et DB (PostgreSQL + pgvector).
    - Collecte et indexation des textes de loi prioritaires (Code du Travail, Code Civil, OHADA).
    - Développement du pipeline RAG avec Claude API.
    - Création du System Prompt bilingue.
    - **Validation Juridique** : Test de l'IA par un panel de juristes.

## Phase 2 : MVP Web & Mobile (Sprint 3-4) - "L'Expérience Utilisateur"
- **Objectif** : Permettre l'accès à l'IA et aux fiches hors-ligne.
- **Tâches** :
    - Interface de Chat (Web + React Native).
    - Système d'authentification par SMS OTP.
    - Module de recherche et consultation de fiches juridiques.
    - Implémentation du cache local pour le mode offline (SQLite).
    - Disclaimer légal et bouton "Parler à un avocat".

## Phase 3 : Services à Valeur Ajoutée (Sprint 5-6) - "La Monétisation"
- **Objectif** : Génération de documents et mise en relation.
- **Tâches** :
    - Moteur de génération de PDF à partir de templates.
    - Intégration des APIs Mobile Money (MTN/Orange).
    - Annuaire des professionnels avec filtres géographiques.
    - Système de prise de rendez-vous.

## Phase 4 : Échelle & Conformité (Sprint 7+) - "La Consolidation"
- **Objectif** : Finalisation et lancement officiel.
- **Tâches** :
    - Audit de conformité aux données personnelles (loi camerounaise 2010/012).
    - Enrichissement de la base de données (Common Law & Jurisprudence).
    - Dashboard Admin pour la modération et la mise à jour éditoriale.
    - Lancement d'une phase de Beta fermée.

## Indicateurs de Succès (KPIs)
- Précision des réponses IA (évaluée par des experts).
- Nombre de documents générés avec succès.
- Temps de réponse moyen du support pro.
- Taux de satisfaction utilisateur (NPS).
