# Maquettes & Flux Utilisateurs - JuristeIA Cameroun

Ce document décrit les écrans clés et l'expérience utilisateur (UX) pour le Web et le Mobile.

## 1. Onboarding & Choix du Système Juridique
- **Écran** : Sélection de la région ou du système.
- **Fonctionnalité** : L'utilisateur choisit sa localisation. Si Région du Nord-Ouest ou Sud-Ouest -> Common Law. Autre -> Civil Law.
- **Bascule de Langue** : Un bouton flottant (Drapeau FR/EN) est accessible partout.

## 2. Écran de Chat (Cœur de l'application)
- **Header** : Nom de l'assistant + Bouton "Parler à un avocat" (en rouge/contrasté).
- **Zone de messages** :
    - Message IA : Bulles structurées avec sections (Analyse, Textes applicables, Risques).
    - Sources : Liens cliquables vers les articles de loi.
- **Footer (Important)** :
    - Disclaimer persistant : "IA consultative. Ne remplace pas un avocat."
    - Champ de saisie avec icône Micro (Vocal vers Texte pour l'accessibilité).

## 3. Fiches Juridiques (Mode Offline)
- **Recherche** : Barre de recherche par mot-clé (ex: "Licenciement", "Héritage").
- **Fiches** : Titre, résumé en langage simple, "Le saviez-vous ?", et textes de loi.
- **Action** : Bouton "Télécharger pour consultation hors-ligne".

## 4. Générateur de Documents
- **Catalogue** : Grille de modèles (Contrat de bail, Mise en demeure, etc.).
- **Assistant de remplissage** : Formulaire étape par étape (ex: Étape 1 : Identité, Étape 2 : Durée du bail, Étape 3 : Montant du loyer).
- **Preview** : Visualisation en temps réel du document généré.
- **Export** : Boutons "Télécharger PDF" et "Envoyer par WhatsApp".

## 5. Annuaire des Professionnels
- **Filtres** : Ville (Douala, Yaoundé, Bamenda...), Spécialité (Foncier, Famille...).
- **Fiche Pro** : Photo, nom, barreau d'inscription, bouton "Prendre RDV".
- **Flux de paiement** : Overlay Mobile Money après confirmation du créneau.

## Flux Utilisateur Type : "Litige Locatif"
1. L'utilisateur ouvre le chat et décrit son problème de loyer impayé.
2. L'IA demande s'il est le bailleur ou le locataire et s'il a un contrat écrit.
3. L'IA fournit une analyse basée sur la loi camerounaise (Civil Law).
4. L'IA suggère de générer une "Mise en demeure de payer".
5. L'utilisateur clique sur le lien, remplit le formulaire, paie par MoMo, et télécharge son PDF.
6. L'IA propose une liste d'huissiers à proximité pour signifier l'acte.
