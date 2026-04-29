# TRACÉA — Motion System V1

## 1. Intention fondamentale

La motion TRACÉA n'est pas décorative.
Elle est fonctionnelle, physiologique et régulatrice.

Objectifs :
- ralentir
- contenir
- guider sans brusquer
- accompagner la descente d'activation

La motion TRACÉA ne doit pas être :
- spectaculaire
- marketing
- démonstrative
- bruyante
- distrayante

Elle doit respecter les principes produit :
- priorité au corps
- zéro surcharge cognitive
- une seule intention par écran
- UX avant IA
- simplicité maximale

## 2. Principe central : motion = respiration

Toute animation TRACÉA doit suivre une logique respiratoire :
- apparition douce
- rythme prévisible
- lente montée
- pause possible
- descente calme

La motion doit aider l'utilisateur à sentir une continuité, pas attirer son attention.

## 3. Les 3 niveaux de motion

### A. Micro-interactions

Usage :
- boutons
- inputs
- chips
- états sélectionnés
- feedback tactile léger

Durée cible :
- 150ms à 250ms

Rôle :
- donner un retour immédiat
- ne jamais créer d'effet spectaculaire

### B. Transitions d'écran

Usage :
- arrivée d'un écran
- reveal de contenu
- changement de section

Durée cible :
- 400ms à 600ms

Rôle :
- maintenir la continuité émotionnelle
- éviter les ruptures brutales

### C. Cycles physiologiques

Usage :
- respiration
- ancrage
- exercices corporels

Durée cible :
- 3s à 6s

Rôle :
- soutenir la régulation
- créer un rythme stable et prévisible

## 4. Animations autorisées

Animations autorisées :
- fade-in
- fade-up léger
- reveal progressif
- pulse doux
- breathe lent

Animations interdites :
- bounce
- shake
- elastic
- spring agressif
- rotation décorative
- parallax
- zoom fort
- animations rapides ou nerveuses

## 5. Easing

Règles :
- ease-out pour les entrées
- ease-in-out pour les transitions
- linear ou ease-in-out très lent pour les cycles respiratoires

À éviter :
- ease-in brutal
- cubic-bezier complexes
- courbes trop dynamiques

## 6. Intensité visuelle

Amplitude maximale recommandée :
- translation verticale : 8px à 16px
- scale : 1 à 1.02 maximum
- opacity : 0 à 1 progressivement

À éviter :
- mouvements larges
- zooms visibles
- effets qui détournent l'attention
- plusieurs animations fortes en même temps

Exception — cycles physiologiques :
- Pour les micro-interactions et transitions UI, le scale doit rester entre 1 et 1.02.
- Pour les cycles physiologiques respiratoires, une amplitude plus large peut être acceptée si elle reste lente, douce, prévisible et non décorative.
- L'animation `breathe` existante avec scale jusqu'à 1.18 est tolérée en V1 car elle sert une intention respiratoire.

## 7. Signature motion par étape TRACÉA

### Traverser
Motion douce, lente, contenante.
Objectif : sécurité.

### Reconnaître
Motion stable, peu expressive.
Objectif : clarté.

### Ancrer
Motion respiratoire, régulière, prévisible.
Objectif : retour au corps.

### Conscientiser / Écouter
Motion très discrète.
Objectif : ne pas pousser l'analyse.

### Émerger
Motion d'ouverture lente.
Objectif : laisser apparaître un espace.

### Aligner
Motion sobre, posée, stable.
Objectif : soutenir le geste faisable.

## 8. Règles UX motion

- Une seule animation principale par écran.
- Ne pas animer plusieurs blocs importants simultanément.
- Ne jamais faire bouger un texte essentiel au moment où l'utilisateur doit le lire.
- Ne jamais utiliser la motion pour compenser une UX confuse.
- Si une animation attire trop l'attention, elle est trop forte.
- Si une animation accélère l'utilisateur, elle est mauvaise.
- Si une animation n'aide pas la régulation, elle est inutile.

## 9. Accessibilité motion

`prefers-reduced-motion` :
- Prévoir une future prise en compte de `prefers-reduced-motion`.
- Les animations infinies (`pulse-gentle`, `breathe`) devront pouvoir être réduites ou désactivées pour les utilisateurs sensibles au mouvement.
- Ne pas implémenter maintenant — seulement documenter.

Principe :
- Une motion accessible n'oblige jamais l'utilisateur à subir un mouvement qu'il ne tolère pas.
- Les cycles infinis doivent rester optionnels en V2.

## 10. État actuel connu

Stack actuelle :
- Framer Motion non installé
- CSS pur + Tailwind transitions
- keyframes existantes : fade-up, fade-in, pulse-gentle, breathe, reveal

Forces actuelles :
- motion douce
- cohérence respiratoire
- pas d'effet gadget dominant

Faiblesses actuelles :
- pas encore de tokens motion centralisés
- transitions parfois dispersées inline
- conventions mélangées selon les écrans

## 11. Décision V1

Pour la V1 :
- ne pas installer Framer Motion
- ne pas refactorer globalement
- documenter d'abord
- auditer ensuite
- tokeniser progressivement
- patcher uniquement après vérification du code existant

## 12. Règle de gouvernance

Avant tout changement motion :
1. vérifier le code existant
2. identifier le fichier exact
3. proposer un patch minimal
4. ne modifier qu'un périmètre clair
5. tester visuellement
6. ne jamais toucher à /start

## 13. Résumé

Motion TRACÉA V1 =
- lente
- stable
- prévisible
- respiratoire
- minimale
- contenante

TRACÉA ne cherche pas à impressionner.
TRACÉA cherche à aider le corps à revenir.
