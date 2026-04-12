# TRACÉA — Design System complet

_Date : 2026-04-04_

---

## 1. Objectif

Créer un design system TRACÉA :
- cohérent
- premium
- sobre
- mobile first
- traduisible en composants Next.js / Tailwind
- aligné avec l’expérience émotionnelle de l’application

TRACÉA n’est pas une app bien-être générique.
TRACÉA est un espace de régulation émotionnelle en temps réel, centré corps avant mental, avec une expérience simple, lente, contenante et sans surcharge.

---

## 2. ADN visuel

TRACÉA doit donner une sensation de :
- sécurité
- profondeur
- chaleur
- lenteur
- respiration
- clarté progressive

Le visuel ne doit jamais voler l’attention.
Il doit soutenir l’expérience intérieure.

### TRACÉA est
- chaude
- contenante
- immersive
- minimaliste
- organique
- premium sobre

### TRACÉA n’est pas
- flashy
- froide
- startup standard
- ultra-tech
- pastel wellness banal
- spirituelle kitsch

---

## 3. Palette officielle

### Fonds
- Brun nuit profond : `#231916`
- Terracotta sombre : `#6E4332`
- Brun brume : `#4B352D`

### Lumière
- Doré doux : `#D6A56A`
- Beige lumière : `#E8D8C7`
- Crème fumée : `#CDB9A4`

### Soutien
- Sauge profond discret : `#6E7D6D`
- Bronze doux : `#A7774F`

### Règles couleur
- 80% tons sombres chauds
- 15% beige / doré
- 5% accents secondaires
- jamais de blanc pur agressif
- jamais d’orange saturé
- jamais de bleu froid dominant

---

## 4. Dégradés et lumière

### Dégradé principal
- `#1F1715`
- `#3A2923`
- `#6B4636`

### Halo
Utiliser un halo doré très diffus, jamais néon.

### Interdits
- glow agressif
- gradient flashy
- ombre bleue
- lumière très contrastée

---

## 5. Matière visuelle

Le fond doit suggérer :
- montagnes brumeuses
- vallées diffuses
- couches organiques
- paysage intérieur

Toujours ajouter un voile sombre léger derrière le contenu pour préserver la lisibilité.

---

## 6. Typographie

### Police recommandée
- Inter

### Hiérarchie
- Titre écran : 36–44 px / poids 500–600
- Question principale : 20–24 px / poids 400–500
- Texte courant : 16–18 px / poids 400
- Aide / micro-guidage : 13–15 px / poids 400 / opacité réduite

### Règles typo
- phrases courtes
- jamais de bloc dense
- beaucoup d’air
- jamais de surcharge

---

## 7. Structure d’écran

Chaque écran suit toujours cette structure :

1. Header léger
2. Titre étape
3. Question principale
4. Interaction principale
5. Aide discrète
6. CTA principal
7. Sortie douce

### Spacing
- padding horizontal : 24 px
- espacement entre blocs : 20–28 px
- marges hautes généreuses

---

## 8. Header

### Contenu
- Étape X / 6
- logo TRACÉA
- Quitter / sortie douce

### Style
- discret
- fin
- non dominant

### Barre de progression
- fine
- doré doux
- sans effet agressif

---

## 9. Boutons

### Bouton principal
- très arrondi
- fond chaud lumineux
- texte lisible
- ombre très douce
- hauteur 56–60 px
- radius 20–28 px

### Bouton secondaire
- fond translucide
- contour bronze doux
- texte beige / crème

### Sélection
- bordure dorée légère
- fond un peu plus lumineux
- jamais criard

---

## 10. Champs et choix

### Champ texte
- capsule large
- beige translucide ou brun clair voilé
- icône discrète
- placeholder doux

### Options / chips
- arrondies
- régulières
- lisibles
- 2 ou 3 colonnes max sur mobile

### Cartes
- léger flou
- contour fin
- relief doux

---

## 11. Icônes

Style :
- minimal
- fin
- organique

Icônes adaptées :
- goutte
- souffle
- cercle
- pause
- lumière
- geste

Éviter :
- emojis
- icônes bavardes
- style techno froid

---

## 12. Animations

### Recommandées
- fade doux
- léger slide vertical
- halo respirant lent
- pulsation lente sur l’écran respiration

### Durées
- entrée écran : 250–400 ms
- transition contenu : 180–250 ms
- respiration : 4–6 s

### Interdit
- bounce
- zoom brutal
- micro-animations gadget

---

## 13. Style par étape

### Étape 1 — Traverser
- ambiance la plus sombre
- sensation d’entrée intérieure

### Étape 2 — Reconnaître
- légère montée de clarté
- mise en forme simple

### Étape 3 — Ancrer
- étape la plus immersive
- peu de texte
- respiration visuelle réelle

### Étape 4 — Écouter
- plus ouverte
- sensation d’écoute et d’espace

### Étape 5 — Émerger
- plus de lumière
- direction concrète

### Étape 6 — Aligner
- la plus lumineuse
- passage au geste sans pression

### Écran final
- calme
- retenu
- fermeture douce

---

## 14. Composants officiels

À réutiliser partout :
- Header étape
- Progress bar
- Titre écran
- Question principale
- Champ capsule
- Chip de choix
- Carte de choix
- Bouton principal
- Bouton secondaire
- Texte aide
- Sortie douce
- Bloc respiration
- Résumé final

### Règle
Ne pas créer de nouveaux composants au feeling.

---

## 15. Design tokens

### Radius
- `radius-sm = 14px`
- `radius-md = 20px`
- `radius-lg = 28px`

### Spacing
- `space-xs = 8px`
- `space-sm = 12px`
- `space-md = 16px`
- `space-lg = 24px`
- `space-xl = 32px`

### Ombres
- `shadow-soft = 0 6px 20px rgba(0,0,0,0.18)`
- `shadow-glow = 0 0 30px rgba(214,165,106,0.12)`

### Blur
- `backdrop-blur = 10px à 14px`

### Border
- `1px solid rgba(232,216,199,0.16)`

---

## 16. Règles UX visuelles non négociables

- 1 écran = 1 action
- 1 question = 1 idée
- jamais trop de texte
- jamais trop de choix visibles
- toujours du vide
- toujours lisible avant d’être beau
- toujours une sortie douce
- toujours priorité au corps, pas au mental

---

## 17. Pièges à éviter

- trop d’orange
- saturation excessive
- fond beau mais texte illisible
- trop de blur
- trop d’effets premium
- trop de styles de boutons
- landing page déconnectée de l’app

---

## 18. Landing page

La landing doit reprendre exactement le même univers :
- fond brun chaud
- lumière dorée diffuse
- paysages brumeux
- typographie identique
- boutons identiques

La landing peut être un peu plus narrative.
Elle ne doit jamais devenir criarde.

---

## 19. Progression émotionnelle du design

Le design suit la logique du parcours :

- Étape 1 : densité
- Étape 2 : nomination
- Étape 3 : ralentissement
- Étape 4 : ouverture
- Étape 5 : direction
- Étape 6 : passage
- Final : apaisement retenu

Le design ne doit donc pas avoir la même intensité partout.
Il doit évoluer subtilement.

---

## 20. Priorités d’implémentation

### Phase 1
- palette
- typo
- boutons
- header
- structure d’écran

### Phase 2
- fond global
- voiles / overlays
- chips / cartes
- progress bar

### Phase 3
- animations
- respiration immersive
- cohérence des 6 étapes

### Phase 4
- landing page
- historique
- onboarding
- ressources

---

## 21. Règle finale

Avant chaque choix visuel, poser cette question :

**Est-ce que cet élément aide la personne à redescendre, ou est-ce qu’il ajoute du bruit ?**

Si ça ajoute du bruit, on enlève.
