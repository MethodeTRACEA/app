# TRACÉA — Overview Projet

_Date : 2026-04-11_

TRACÉA est une application SaaS de régulation émotionnelle en temps réel.

## Objectif utilisateur
- revenir au corps
- clarifier un peu l’état interne
- retrouver un minimum de marge de manœuvre
- poser un geste faisable maintenant ou garder un repère concret

## Positionnement
- outil de régulation émotionnelle brève
- non thérapeutique
- usage à la demande
- approche corps avant mental
- IA accompagnante, secondaire, non interprétative

## Architecture produit actuelle
TRACÉA repose sur 2 flows distincts.

### 1. Traversée courte — V1 gelée
Usage : forte activation, faible tolérance cognitive, besoin immédiat.

Finalité :
- réduire un peu la charge
- revenir vite au corps
- trouver un prochain pas simple

Caractéristiques :
- entrée immédiate
- très peu de texte
- auto-advance
- pas de contexte initial
- synthèse finale minimale

### 2. Parcours long — V1 quasi stabilisée
Usage : activation modérée, plus de disponibilité mentale, besoin de traversée plus structurée.

Finalité :
- dérouler la méthode complète TRACÉA en 6 étapes
- aller du ressenti vers un besoin, puis vers un geste aligné
- donner une synthèse finale claire et utile

Caractéristiques :
- progression explicite
- 6 étapes réelles
- micro-réception légère
- synthèse finale enrichie
- IA visible uniquement en sortie finale

## Structure produit
- Landing page
- Start / cadrage
- Auth
- App
  - traversée courte
  - parcours long
  - historique
  - ressources
  - profil
  - onboarding
  - admin

## Modèle économique
- 1 session gratuite
- abonnement ensuite
- paiement non encore implémenté

## Tracking réel en place
Une première couche de tracking produit a été ajoutée :
- tracea_events
- session_start
- step_complete
- session_end

Objectif : mesurer la complétion et repérer les points de friction réels.

## État réel
- application fonctionnelle
- auth active
- historique présent
- flows court et long utilisables
- tracking cœur démarré
- UX fortement stabilisée
- paiement absent
- validation terrain encore à faire
