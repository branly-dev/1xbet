# 1/ Analyse des besoins

La plateforme vise à résoudre le problème du "dernier kilomètre" pour les petits commerçants et artisans en Afrique subsaharienne en les connectant à des livreurs indépendants via une application mobile et web simple.

## Acteurs clés
- **Commerçant / Artisan** : Besoin de fiabilité, de suivi et de preuves de livraison.
- **Livreur indépendant** : Besoin d'optimiser ses trajets et de garantir son paiement.
- **Administrateur** : Besoin de visibilité sur les flux et de résolution rapide des conflits.

## Contraintes et Solutions
- **Faible connectivité** :
    - Approche "Offline-first" pour le mobile (React Native + SQLite/AsyncStorage).
    - Synchronisation automatique dès que le réseau est rétabli.
- **Paiements** :
    - Intégration exclusive de Mobile Money (MTN, Orange).
    - Système de séquestre (escrow) : le paiement est bloqué jusqu'à confirmation de la livraison.
- **Expérience Utilisateur (UX)** :
    - Interface en français simple, iconographie forte pour pallier l'illettrisme numérique partiel.
    - Flux de travail linéaire : Publier -> Accepter -> Livrer -> Noter.
- **Sécurité et Confiance** :
    - Notation bidirectionnelle.
    - Preuves photos obligatoires au départ et à l'arrivée pour la gestion des litiges.
