# 6/ Plan de développement (Agile)

Le projet sera découpé en 4 sprints de 2 semaines chacun.

## Sprint 1 : Fondations & API (MVP)
- Configuration de l'environnement PHP/MySQL.
- Implémentation du système d'authentification (JWT).
- Création des tables de base de données.
- Endpoints CRUD de base pour les missions.

## Sprint 2 : Expérience Mobile (Marchand & Livreur)
- Développement de l'application React Native.
- Gestion du mode offline (SQLite local).
- Interface de création de mission et liste des missions.
- Intégration de la géolocalisation.

## Sprint 3 : Paiements & Sécurité
- Intégration des APIs MTN MoMo et Orange Money.
- Gestion des preuves photo (Upload images).
- Système de notation bidirectionnelle.
- Système de notifications Push (Firebase Cloud Messaging).

## Sprint 4 : Administration & Polissage
- Dashboard administrateur (React Web).
- Module de gestion des litiges.
- Export PDF des reçus (Dompdf en PHP).
- Tests utilisateurs en conditions réelles (Beta test).
