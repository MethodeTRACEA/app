# Décisions clés

_Date : 2026-04-11_

## Produit
- TRACÉA = outil de régulation émotionnelle rapide, non thérapeutique
- corps avant mental
- double architecture produit verrouillée : flow court + flow long
- l’objectif n’est pas de prouver que l’utilisateur va mieux, mais de retrouver un peu d’espace et un geste faisable

## UX
- 1 écran = 1 action
- 1 question = 1 intention
- simplicité maximale
- zéro surcharge inutile
- sortie douce toujours possible
- UX > IA

## IA
- accompagner, pas analyser
- pas d’interprétation psychologique
- pas de mirror intermédiaire dans le flow long
- IA visible uniquement en synthèse finale dans le parcours long
- mémoire future uniquement descriptive, jamais interprétative

## Traversée courte
- V1 gelée
- cible primaire : très activé / confus / faible bande passante
- sortie finale sobre et rapide
- lien discret vers le parcours long

## Parcours long
- V2 resserrée
- 6 étapes conservées
- intro clarifiée
- traverser séparé en sous-phases
- aligner simplifié
- intégration supprimée
- micro-réception légère injectée
- synthèse finale renforcée

## Technique
- Next.js
- Supabase
- Vercel
- Claude Code
- table tracea_events active

## Branding / design
- sombre, incarné, minimaliste
- pas d’effets gadgets
- présence chaude, sobre, contenante

## Ce qui est réellement implémenté
- auth
- flow court stable
- flow long presque stabilisé
- historique
- résumé IA
- tracking session_start / step_complete / session_end
- rate limiting
- logging IA

## Ce qui n’est pas finalisé
- paiement
- validation terrain V1
- métriques produit consolidées
- mémoire légère TRACÉA
- module 0 renforcé
- exploitation réelle des données
