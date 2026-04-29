# TRACÉA — Motion Tokens V1

## 1. Objectif

Ce document définit les tokens motion de TRACÉA.

But :
- standardiser les durées
- standardiser les easing
- préparer une future centralisation dans globals.css
- éviter les incohérences visuelles

Ce document ne modifie pas encore le code.
Il sert de référence avant implémentation.

---

## 2. Tokens de durée

### Micro-interactions

- --motion-fast: 150ms
- --motion-base: 200ms
- --motion-medium: 250ms

Usage :
- boutons
- inputs
- sélection
- feedback léger

---

### Transitions UI

- --motion-slow: 400ms
- --motion-screen: 500ms
- --motion-screen-long: 600ms

Usage :
- transitions d'écran
- apparition de contenu
- reveal progressif

---

### Cycles physiologiques

- --motion-breathe-short: 3s
- --motion-breathe-base: 4s
- --motion-breathe-long: 6s

Usage :
- respiration
- ancrage
- exercices corporels

---

### Patterns spéciaux

- --motion-pulse: 2s

Usage :
- micro-feedback doux et répétitif, uniquement si nécessaire.

- --motion-stagger: 100ms

Usage :
- délais progressifs entre éléments révélés.

Notes :
- Les delays reveal actuels de 0.1s à 0.6s correspondent à des multiples de `--motion-stagger`.
- Le token `--motion-pulse` couvre l'animation `pulse-gentle` existante.
- `prefers-reduced-motion` est à prévoir en V2, pas à implémenter maintenant.

---

## 3. Tokens d'easing

- --ease-standard: ease-in-out
- --ease-out: ease-out
- --ease-soft: cubic-bezier(0.4, 0, 0.2, 1)
- --ease-linear: linear

---

## 4. Règles d'utilisation

### Micro-interactions

- utiliser motion-fast à motion-medium
- utiliser ease-out ou ease-standard
- jamais de délai

---

### Transitions d'écran

- utiliser motion-screen
- utiliser ease-standard
- combiner avec fade + léger déplacement vertical

---

### Cycles respiratoires

- utiliser motion-breathe-base ou long
- utiliser ease-linear ou easing très doux
- animation en boucle stable

---

## 5. Mapping avec l'existant

Keyframes existantes :

- fade-in → transitions écran
- fade-up → transitions écran
- pulse-gentle → micro feedback
- breathe → cycles respiratoires
- reveal → apparition progressive

Objectif futur :
- connecter ces keyframes aux tokens
- éviter les durées hardcodées

---

## 6. Règles de cohérence

- une seule animation principale par écran
- ne pas cumuler plusieurs animations fortes
- éviter les durées différentes pour un même type d'interaction
- ne jamais accélérer brutalement
- ne jamais créer d'effet surprenant

---

## 7. Ce qui est interdit

- durées arbitraires non référencées
- easing custom non validé
- animations rapides (<150ms)
- animations longues hors respiration (>600ms)
- effets visuels décoratifs

---

## 8. Étape suivante (non implémentée)

Avant toute modification du code :

1. audit de globals.css
2. audit des transitions inline
3. identification des incohérences
4. patch minimal de centralisation des tokens

---

## 9. État réel après audit globals.css

Après lecture de `src/app/globals.css` :

- 5 keyframes existantes : `fadeUp`, `fadeIn`, `pulse-gentle`, `breatheIn`, `revealText`
- 11 classes `animate-*` existantes (incluant `animate-reveal-delay-1..6`)
- absence actuelle de tokens CSS motion dans `:root`
- cohérence globale estimée bonne (~80 % alignée avec les tokens documentés ci-dessus)
- centralisation à faire plus tard, progressivement

Aucune modification n'a encore été faite dans le code.
La centralisation se fera après audit complet, composant par composant.

---

## 10. Résumé

Les motion tokens TRACÉA V1 permettent :

- cohérence visuelle
- stabilité émotionnelle
- réduction du chaos dans le code

Ils préparent une implémentation progressive sans refactor massif.
