# JuristeIA Cameroun - Assistant Juridique Intelligent

JuristeIA est une plateforme d'aide à la décision juridique conçue spécifiquement pour le contexte camerounais. Elle combine la puissance de l'Intelligence Artificielle (RAG - Retrieval-Augmented Generation) avec la rigueur du droit camerounais (Civil Law, Common Law et OHADA).

## 🎯 Objectifs
- **Simplifier** l'accès à l'information juridique.
- **Orienter** les utilisateurs vers les bons professionnels (avocats, notaires, huissiers).
- **Faciliter** la rédaction de documents juridiques simples.
- **Respecter** la dualité juridique camerounaise.

## 🏗️ Structure du Projet
- `/api` : Backend PHP 8+ (API REST native).
- `/web` : Application Web React + Tailwind CSS.
- `/mobile` : Application Mobile React Native + Expo.
- `/docs` : Documentation de conception, architecture et spécifications légales.
  - [Schéma de base de données](./docs/db_schema.md)
  - [Architecture API](./docs/api_architecture.md)
  - [Maquettes & UX](./docs/wireframes.md)
  - [System Prompt de l'IA](./docs/system_prompt.md)
  - [Roadmap de développement](./docs/roadmap.md)
  - [Checklist de validation juridique](./docs/legal_validation.md)

## 🛠️ Stack Technique
- **Backend** : PHP 8+ (sans framework pour une portabilité maximale).
- **Base de données** : PostgreSQL + pgvector (recherche sémantique).
- **IA** : Claude API (Anthropic) avec pipeline RAG.
- **Frontend** : React (Web) & React Native (Mobile).
- **Paiement** : APIs MTN MoMo & Orange Money.

## ⚠️ Avertissement Légal
JuristeIA est un outil pédagogique et d'orientation. Il ne fournit pas de conseil juridique personnalisé et ne remplace en aucun cas un avocat inscrit au Barreau du Cameroun. Les réponses générées par l'IA ne sont pas opposables.

## 🚦 Démarrage Rapide
1. Consultez le dossier `/docs` pour comprendre l'architecture.
2. Configurez votre environnement PHP pour le dossier `/api`.
3. Installez les dépendances React dans `/web` et `/mobile`.
