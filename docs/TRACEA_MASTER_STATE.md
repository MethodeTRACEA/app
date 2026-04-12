# TRACÉA — État maître consolidé

_Date : 2026-04-11_

## 1. Statut global
TRACÉA est une application SaaS de régulation émotionnelle en temps réel, centrée sur le corps, destinée à aider une personne activée à retrouver un peu de stabilité et un geste faisable.

Le positionnement reste non thérapeutique :
- outil de régulation brève
- pas thérapie
- pas coaching
- pas diagnostic

## 2. Doctrine produit verrouillée
TRACÉA est :
- un outil de récupération émotionnelle rapide
- un système guidé adaptable à l’état de la personne
- une expérience corps → besoin → geste

TRACÉA n’est pas :
- une thérapie
- un espace d’analyse
- une IA qui interprète la personne

Principes :
- 1 écran = 1 action
- 1 question = 1 intention
- zéro surcharge inutile
- priorité au corps
- toujours garder une sortie douce
- UX pilote ; IA reste secondaire et sobre

## 3. Architecture actuelle
### Mode 1 — Traversée courte
- forte activation
- besoin immédiat
- faible bande passante
- V1 gelée

### Mode 2 — Parcours long
- activation modérée
- plus de disponibilité mentale
- besoin de traversée plus structurée
- V1 quasi stabilisée

## 4. Point stratégique
TRACÉA est désormais un produit à double flow.
Le risque principal n’est plus l’idée.
Le risque principal devient :
- confusion entre flows
- mauvaise bascule
- doublons fonctionnels
- manque de preuve réelle

## 5. État réel des flows
### Flow court
- testé sur plusieurs profils
- cohérent
- sobre
- utile
- gelé V1

### Flow long
- largement resserré
- utilisable
- plus de bug bloquant
- encore en phase de finition produit légère

## 6. Tracking produit
Première couche active :
- tracea_events
- session_start
- step_complete
- session_end

Objectif :
- mesurer complétion
- repérer points de chute
- comparer court et long

## 7. Priorité actuelle
1. lire les données réelles
2. lancer le protocole terrain V1
3. consolider les derniers détails du long selon usage réel
4. construire mémoire légère et historique utile

## 8. Statut honnête
TRACÉA ne doit plus se réinventer.
TRACÉA doit maintenant :
- se prouver
- se mesurer
- se stabiliser
- apprendre de ses usages réels
