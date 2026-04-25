# Rapport d'évaluation qualitative IA TRACÉA

**Généré le :** 2026-04-25 14:50:59 UTC
**Durée totale :** 246.0s
**Juge :** claude-sonnet-4-6 (température 0)
**Cas évalués :** 30/30

---

## Résumé global

| Dimension | Score moyen | Visualisation |
|-----------|-------------|---------------|
| Justesse émotionnelle | **6.6/10** | `███████░░░  6.6` |
| Impact | **6.6/10** | `███████░░░  6.6` |
| Lisibilité | **7.5/10** | `████████░░  7.5` |
| **Score global** | **6.9/10** | `███████░░░  6.9` |

### Distribution des scores globaux

| Plage | Cas | Proportion |
|-------|-----|------------|
| < 6 | 3 | ███░░░░░░░ 10% |
| 6–7 | 7 | ███████░░░ 23% |
| 7–8 | 16 | ████████████████ 53% |
| 8–9 | 3 | ███░░░░░░░ 10% |
| ≥ 9 | 1 | █░░░░░░░░░ 3% |

### Scores par émotion

| Émotion | Score moyen | Cas |
|---------|-------------|-----|
| peur | 6.4/10 | 4 |
| solitude | 6.5/10 | 2 |
| colère | 6.7/10 | 4 |
| culpabilité | 6.7/10 | 2 |
| tristesse | 6.8/10 | 6 |
| frustration | 6.9/10 | 5 |
| honte | 7.5/10 | 2 |
| confusion | 7.6/10 | 5 |

---

## Problèmes détectés

| Problème | Occurrences | Fréquence |
|----------|-------------|-----------|
| `[object Object]` | 55 | 183% des cas |
| `ton_plat` | 5 | 17% des cas |
| `perte_information` | 3 | 10% des cas |
| `phrase_inutile` | 3 | 10% des cas |
| `manque_précision` | 1 | 3% des cas |

---

## Cas faibles — score < 7/10 (10)

### Cas 28 — situation longue | **5/10**

**Situation :** Ma relation de couple traverse une phase très difficile depuis un an. Nous vivons ensemble mais nous nous éloignons de plus en plus. Chaque tentative de communication finit en dispute. Les silences sont devenus la norme. Je ne dors plus bien. Je pense parfois à la séparation mais j'ai aussi peur de faire une erreur irréparable. Nous partageons un appartement, des amis communs, des projets. Je ne sais plus vraiment ce que je veux.

**Réponse TRACÉA :**

> Ta relation traverse une phase très difficile depuis un an, et tu ne sais plus vraiment ce que tu veux.
> 
> Tu ressens de la confusion.
> 
> Ce qui te semble juste, c'est consulter un thérapeute de couple pour y voir plus clair.
> 
> Ça peut rester comme ça.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | Confusion nommée mais ton trop neutre pour l'ampleur du vécu |
| Impact | 4/10 | Peu de reconnaissance réelle, miroir trop superficiel et distant |
| Lisibilité | 6/10 | Phrases courtes mais structure mécanique et froide |

**Problèmes :** `[object Object]`, `[object Object]`, `[object Object]`, `[object Object]`

---

### Cas 29 — contradiction émotion/besoin | **5.3/10**

**Situation :** J'ai enfin reçu la promotion que je demandais depuis deux ans

**Réponse TRACÉA :**

> Tu as enfin reçu la promotion que tu demandais depuis deux ans.
> 
> Ce qui te semble juste, c'est dresser une liste de tes forces et de tes premiers objectifs.
> 
> Tu peux ralentir.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 4/10 | La peur n'est pas nommée ni reflétée dans le ton. |
| Impact | 5/10 | Le besoin de prouver est absent, reconnaissance incomplète. |
| Lisibilité | 7/10 | Phrases courtes, fluides, structure claire et légère. |

**Problèmes :** `[object Object]`, `[object Object]`, `[object Object]`, `[object Object]`

---

### Cas 3 — tristesse | **5.7/10**

**Situation :** Mon meilleur ami a déménagé à l'autre bout de la France ce week-end

**Réponse TRACÉA :**

> Ton meilleur ami a déménagé à l'autre bout de la France ce week-end.
> 
> Tu ressens de la tristesse.
> 
> Ce qui te semble juste, c'est lui envoyer un message ce soir.
> 
> Ça a sa place.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | Tristesse nommée mais non incarnée, ton trop neutre et distant |
| Impact | 5/10 | Besoin de maintenir le lien absent, reconnaissance trop superficielle |
| Lisibilité | 7/10 | Phrases courtes et claires, mais structure répétitive et mécanique |

**Problèmes :** `ton_plat`, `perte_information`, `phrase_inutile`

---

### Cas 10 — culpabilité | **6/10**

**Situation :** J'ai accepté une mission que je savais ne pas pouvoir honorer dans les délais

**Réponse TRACÉA :**

> Tu as accepté une mission que tu savais ne pas pouvoir honorer dans les délais.
> 
> Tu as ressenti de la culpabilité.
> 
> Ce qui te semble juste, c'est être honnête avec ton manager sur tes limites réelles.
> 
> Ça a du sens.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Culpabilité nommée mais ton trop neutre pour cette émotion |
| Impact | 5/10 | Action bien formulée comme direction mais reconnaissance trop faible |
| Lisibilité | 7/10 | Phrases courtes et claires, structure lisible mais mécanique |

**Problèmes :** `[object Object]`, `[object Object]`, `[object Object]`

---

### Cas 15 — solitude | **6/10**

**Situation :** Je suis dans une nouvelle ville depuis 6 mois et je n'ai toujours pas de vrais amis

**Réponse TRACÉA :**

> Tu es dans une nouvelle ville depuis 6 mois et tu n'as toujours pas de vrais amis.
> 
> Tu ressens de la solitude, et tu as besoin de créer des liens authentiques.
> 
> Ce qui te semble juste, c'est t'inscrire à une activité de groupe cette semaine.
> 
> Ça a du sens.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | Solitude nommée mais non incarnée, ton trop neutre et plat |
| Impact | 6/10 | Action bien formulée comme direction, reconnaissance trop mécanique |
| Lisibilité | 7/10 | Phrases courtes et claires, structure lisible mais répétitive |

**Problèmes :** `ton_plat`, `phrase_inutile`

---

### Cas 2 — colère | **6.3/10**

**Situation :** J'ai découvert que mon colocataire avait utilisé mes affaires sans demander

**Réponse TRACÉA :**

> Tu as découvert que ton colocataire avait utilisé tes affaires sans demander.
> 
> Ce qui te semble juste, c'est poser tes limites clairement.
> 
> Tu peux t'écouter.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | La colère est absente, ton trop neutre pour cette émotion |
| Impact | 6/10 | Action bien formulée comme direction, besoin non reflété |
| Lisibilité | 8/10 | Phrases courtes et fluides, structure claire |

**Problèmes :** `ton_plat`, `perte_information`

---

### Cas 6 — peur | **6.3/10**

**Situation :** J'ai reçu des résultats médicaux inquiétants à discuter avec mon médecin

**Réponse TRACÉA :**

> Tu as reçu des résultats médicaux inquiétants à discuter avec ton médecin.
> 
> Ce qui te semble juste, c'est appeler le cabinet médical ce matin.
> 
> Tu peux ralentir.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | La peur est absente, le mot n'est jamais reflété |
| Impact | 6/10 | Action bien ancrée comme direction, mais reconnaissance émotionnelle faible |
| Lisibilité | 8/10 | Phrases courtes, fluides, rythme adapté à la peur |

**Problèmes :** `[object Object]`, `[object Object]`, `[object Object]`

---

### Cas 14 — frustration | **6.3/10**

**Situation :** Je prépare ce projet depuis des mois et il est constamment repoussé sans explication

**Réponse TRACÉA :**

> Tu prépares ce projet depuis des mois et il est constamment repoussé sans explication.
> 
> Tu ressens de la frustration — que ton travail soit reconnu à sa juste valeur.
> 
> Ce qui te semble juste, c'est exprimer clairement ce que cette situation te coûte.
> 
> Tu peux le voir.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Frustration nommée mais ton trop neutre, manque de mordant lucide |
| Impact | 7/10 | Action bien formulée comme direction, reconnaissance présente mais faible |
| Lisibilité | 6/10 | Phrase finale trop courte et creuse, structure un peu mécanique |

**Problèmes :** `ton_plat`, `phrase_inutile`

---

### Cas 21 — action au futur | **6.3/10**

**Situation :** J'ai eu une dispute avec mon frère ce matin avant le travail

**Réponse TRACÉA :**

> Tu as eu une dispute avec ton frère ce matin avant le travail.
> 
> Ce qui te semble juste, c'est l'appeler demain soir quand tu seras plus calme.
> 
> Tu peux t'appuyer là-dessus.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | La colère est absente, ton trop neutre pour cette émotion |
| Impact | 6/10 | Action bien ancrée comme direction, besoin réel non reflété |
| Lisibilité | 8/10 | Phrases courtes, fluides, structure claire et légère |

**Problèmes :** `[object Object]`, `[object Object]`, `[object Object]`

---

### Cas 4 — tristesse | **6.7/10**

**Situation :** J'ai raté une opportunité professionnelle importante sur laquelle je comptais vraiment

**Réponse TRACÉA :**

> Tu as raté une opportunité professionnelle importante sur laquelle tu comptais vraiment.
> 
> Tu ressens de la tristesse, et le besoin de te reconnecter à ce qui compte vraiment pour toi.
> 
> Ce qui te semble juste, c'est prendre du temps pour toi ce week-end.
> 
> Ça a sa place.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Tristesse nommée mais ton trop neutre, peu de douceur ressentie |
| Impact | 7/10 | Vécu bien reflété, direction posée sans acte accompli |
| Lisibilité | 7/10 | Phrases courtes, structure claire, légère répétition visible |

**Problèmes :** `[object Object]`, `[object Object]`, `[object Object]`

---

## Cas excellents — score > 8.5/10 (2)

### Cas 12 — confusion | **9.3/10**

**Situation :** Je ne sais plus si je veux vraiment rester dans cette relation

**Réponse TRACÉA :**

> Tu ne sais plus si tu veux vraiment rester dans cette relation.
> 
> C'est flou.
> 
> Ce qui te semble juste, c'est prendre quelques jours sans pression pour toi.
> 
> Tu n'as pas besoin de savoir tout de suite.

**Pourquoi ça fonctionne :**

- Justesse : Ton flottant et ouvert, parfaitement adapté à la confusion déclarée.
- Impact : Vécu reconnu, direction ancrée sans acte accompli, espace préservé.
- Lisibilité : Phrases courtes, rythme fluide, aucune lourdeur ni répétition.

### Cas 18 — besoin flou | **8.7/10**

**Situation :** Je me sens épuisé sans raison apparente depuis une semaine

**Réponse TRACÉA :**

> Tu te sens épuisé(e) sans raison apparente depuis une semaine.
> 
> C'est flou.
> 
> Ce qui te semble juste, c'est te reposer et voir ce qui émerge.
> 
> Ça peut rester comme ça.

**Pourquoi ça fonctionne :**

- Justesse : Ton flottant et ouvert, parfaitement adapté à la confusion.
- Impact : Reconnaissance claire, direction bien posée comme intention.
- Lisibilité : Phrases courtes, rythme lent et fluide, aucune lourdeur.

---

## Tendances générales

### Ce qui fonctionne

- **Lisibilité** (7.5/10)
- **2 cas sans problème** (7% des évaluations)
- **2 cas excellents** (score > 8.5) — le modèle miroir fonctionne bien sur ces profils

### Ce qui doit être amélioré

- **peur** : score moyen 6.4/10 — catégorie à surveiller
- **solitude** : score moyen 6.5/10 — catégorie à surveiller
- **colère** : score moyen 6.7/10 — catégorie à surveiller
- **culpabilité** : score moyen 6.7/10 — catégorie à surveiller
- **tristesse** : score moyen 6.8/10 — catégorie à surveiller
- **frustration** : score moyen 6.9/10 — catégorie à surveiller
- Problème le plus fréquent : `[object Object]` (55 cas, 183%)
- Dimension la plus faible : **Impact** (6.6/10) — axe d'amélioration prioritaire
- **10 cas faibles** — voir détail section "Cas faibles" pour les axes d'amélioration spécifiques

---

## Détail complet — tous les cas

<details>
<summary><strong>Cas 1 — colère</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** colère &nbsp;|&nbsp; **Besoin :** être respecté dans mon travail

**Réponse TRACÉA :**

> Tu as ressenti de la colère — tu veux être respecté dans ton travail.
> 
> Ton chef a annulé ta présentation au dernier moment devant toute l'équipe.
> 
> Ce qui te semble juste, c'est en parler directement avec lui demain.
> 
> Tu peux t'écouter.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Colère nommée mais ton trop neutre, pas assez ancré |
| Impact | 7/10 | Reconnaissance présente, action bien formulée comme direction |
| Lisibilité | 8/10 | Phrases courtes, fluides, structure claire et lisible |

**Problèmes :** `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 2 — colère</strong> &nbsp; ❌ 6.3/10</summary>

**Émotion :** colère &nbsp;|&nbsp; **Besoin :** que mon espace personnel soit respecté

**Réponse TRACÉA :**

> Tu as découvert que ton colocataire avait utilisé tes affaires sans demander.
> 
> Ce qui te semble juste, c'est poser tes limites clairement.
> 
> Tu peux t'écouter.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | La colère est absente, ton trop neutre pour cette émotion |
| Impact | 6/10 | Action bien formulée comme direction, besoin non reflété |
| Lisibilité | 8/10 | Phrases courtes et fluides, structure claire |

**Problèmes :** `ton_plat`, `perte_information`

</details>

<details>
<summary><strong>Cas 3 — tristesse</strong> &nbsp; ❌ 5.7/10</summary>

**Émotion :** tristesse &nbsp;|&nbsp; **Besoin :** maintenir ce lien malgré la distance

**Réponse TRACÉA :**

> Ton meilleur ami a déménagé à l'autre bout de la France ce week-end.
> 
> Tu ressens de la tristesse.
> 
> Ce qui te semble juste, c'est lui envoyer un message ce soir.
> 
> Ça a sa place.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | Tristesse nommée mais non incarnée, ton trop neutre et distant |
| Impact | 5/10 | Besoin de maintenir le lien absent, reconnaissance trop superficielle |
| Lisibilité | 7/10 | Phrases courtes et claires, mais structure répétitive et mécanique |

**Problèmes :** `ton_plat`, `perte_information`, `phrase_inutile`

</details>

<details>
<summary><strong>Cas 4 — tristesse</strong> &nbsp; ❌ 6.7/10</summary>

**Émotion :** tristesse &nbsp;|&nbsp; **Besoin :** me reconnecter à ce qui compte vraiment pour moi

**Réponse TRACÉA :**

> Tu as raté une opportunité professionnelle importante sur laquelle tu comptais vraiment.
> 
> Tu ressens de la tristesse, et le besoin de te reconnecter à ce qui compte vraiment pour toi.
> 
> Ce qui te semble juste, c'est prendre du temps pour toi ce week-end.
> 
> Ça a sa place.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Tristesse nommée mais ton trop neutre, peu de douceur ressentie |
| Impact | 7/10 | Vécu bien reflété, direction posée sans acte accompli |
| Lisibilité | 7/10 | Phrases courtes, structure claire, légère répétition visible |

**Problèmes :** `[object Object]`, `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 5 — peur</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** peur &nbsp;|&nbsp; **Besoin :** me sentir suffisamment préparé

**Réponse TRACÉA :**

> Tu dois donner une conférence devant 200 personnes la semaine prochaine.
> 
> Tu as ressenti de la peur, et tu as besoin de te sentir suffisamment préparé.
> 
> Ce qui te semble juste, c'est faire une répétition avec un ami de confiance.
> 
> Tu peux ralentir.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Peur nommée mais ton insuffisamment sécurisant et ancré |
| Impact | 7/10 | Action bien reflétée comme direction, reconnaissance correcte |
| Lisibilité | 8/10 | Phrases courtes et fluides, structure claire et légère |

**Problèmes :** `ton_plat`

</details>

<details>
<summary><strong>Cas 6 — peur</strong> &nbsp; ❌ 6.3/10</summary>

**Émotion :** peur &nbsp;|&nbsp; **Besoin :** comprendre ce qui se passe vraiment

**Réponse TRACÉA :**

> Tu as reçu des résultats médicaux inquiétants à discuter avec ton médecin.
> 
> Ce qui te semble juste, c'est appeler le cabinet médical ce matin.
> 
> Tu peux ralentir.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | La peur est absente, le mot n'est jamais reflété |
| Impact | 6/10 | Action bien ancrée comme direction, mais reconnaissance émotionnelle faible |
| Lisibilité | 8/10 | Phrases courtes, fluides, rythme adapté à la peur |

**Problèmes :** `[object Object]`, `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 7 — honte</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** honte &nbsp;|&nbsp; **Besoin :** réparer ce lien important

**Réponse TRACÉA :**

> Tu as dit quelque chose de vraiment blessant à ta mère lors d'une dispute.
> 
> Tu ressens de la honte, et tu veux réparer ce lien important.
> 
> Ce qui te semble juste, c'est t'excuser sincèrement dès ce soir.
> 
> Tu peux rester avec toi.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Honte nommée mais ton trop neutre pour cette émotion délicate |
| Impact | 6/10 | Dernière phrase abstraite, affaiblit l'ancrage de l'action |
| Lisibilité | 8/10 | Phrases courtes et fluides, structure claire et lisible |

**Problèmes :** `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 8 — honte</strong> &nbsp; ✅ 8/10</summary>

**Émotion :** honte &nbsp;|&nbsp; **Besoin :** ne pas me laisser écraser par le regard des autres

**Réponse TRACÉA :**

> Tu as fait une erreur visible devant toute ton équipe lors de la réunion de direction.
> 
> C'est difficile à montrer.
> 
> Ce qui te semble juste, c'est t'accorder de la compassion.
> 
> Tu peux rester avec toi.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 8/10 | Ton délicat et minimal, bien adapté à la honte. |
| Impact | 7/10 | Besoin reflété, mais action reste très vague et flottante. |
| Lisibilité | 9/10 | Phrases courtes, fluides, aucune lourdeur perceptible. |

**Problèmes :** `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 9 — culpabilité</strong> &nbsp; ✅ 7.3/10</summary>

**Émotion :** culpabilité &nbsp;|&nbsp; **Besoin :** réparer ce que j'ai négligé

**Réponse TRACÉA :**

> Tu as complètement oublié l'anniversaire de ta sœur cette année.
> 
> Tu ressens de la culpabilité, et tu veux réparer ce que tu as négligé.
> 
> Ce qui te semble juste, c'est l'appeler aujourd'hui et lui offrir quelque chose de sincère.
> 
> Ça compte.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 8/10 | Culpabilité bien présente, ton délicat et adapté à l'émotion. |
| Impact | 7/10 | Action ancrée comme direction, reconnaissance claire mais finale faible. |
| Lisibilité | 7/10 | Fluide et court, mais structure répétitive visible entre les phrases. |

**Problèmes :** `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 10 — culpabilité</strong> &nbsp; ❌ 6/10</summary>

**Émotion :** culpabilité &nbsp;|&nbsp; **Besoin :** agir en accord avec mes valeurs

**Réponse TRACÉA :**

> Tu as accepté une mission que tu savais ne pas pouvoir honorer dans les délais.
> 
> Tu as ressenti de la culpabilité.
> 
> Ce qui te semble juste, c'est être honnête avec ton manager sur tes limites réelles.
> 
> Ça a du sens.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Culpabilité nommée mais ton trop neutre pour cette émotion |
| Impact | 5/10 | Action bien formulée comme direction mais reconnaissance trop faible |
| Lisibilité | 7/10 | Phrases courtes et claires, structure lisible mais mécanique |

**Problèmes :** `[object Object]`, `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 11 — confusion</strong> &nbsp; ✅ 8/10</summary>

**Émotion :** confusion &nbsp;|&nbsp; **Besoin :** avoir une direction claire

**Réponse TRACÉA :**

> Tu reçois des messages contradictoires de ton manager concernant les priorités du projet.
> 
> C'est flou.
> 
> Ce qui te semble juste, c'est demander une réunion de clarification cette semaine.
> 
> Tu n'as pas besoin de savoir tout de suite.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 8/10 | Ton flottant bien adapté à la confusion, vécu respecté. |
| Impact | 7/10 | Action ancrée comme intention, mais dernière phrase dilue l'ancrage. |
| Lisibilité | 9/10 | Phrases courtes, rythme fluide, aucune lourdeur visible. |

**Problèmes :** `[object Object]`

</details>

<details>
<summary><strong>Cas 12 — confusion</strong> &nbsp; ⭐ 9.3/10</summary>

**Émotion :** confusion &nbsp;|&nbsp; **Besoin :** du temps et de l'espace pour y voir plus clair

**Réponse TRACÉA :**

> Tu ne sais plus si tu veux vraiment rester dans cette relation.
> 
> C'est flou.
> 
> Ce qui te semble juste, c'est prendre quelques jours sans pression pour toi.
> 
> Tu n'as pas besoin de savoir tout de suite.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 9/10 | Ton flottant et ouvert, parfaitement adapté à la confusion déclarée. |
| Impact | 9/10 | Vécu reconnu, direction ancrée sans acte accompli, espace préservé. |
| Lisibilité | 10/10 | Phrases courtes, rythme fluide, aucune lourdeur ni répétition. |

</details>

<details>
<summary><strong>Cas 13 — frustration</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** frustration &nbsp;|&nbsp; **Besoin :** être entendu et que les choses avancent concrètement

**Réponse TRACÉA :**

> Le même problème technique revient chaque semaine depuis deux mois malgré tes signalements.
> 
> Tu ressens de la frustration — et le besoin d'être entendu et que les choses avancent concrètement.
> 
> Ce qui te semble juste, c'est escalader directement au niveau supérieur.
> 
> C'est là.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Frustration nommée mais ton trop neutre pour l'émotion déclarée |
| Impact | 8/10 | Action bien formulée comme direction, besoin clairement reflété |
| Lisibilité | 6/10 | Phrase finale trop courte et cryptique, rupture de fluidité |

**Problèmes :** `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 14 — frustration</strong> &nbsp; ❌ 6.3/10</summary>

**Émotion :** frustration &nbsp;|&nbsp; **Besoin :** que mon travail soit reconnu à sa juste valeur

**Réponse TRACÉA :**

> Tu prépares ce projet depuis des mois et il est constamment repoussé sans explication.
> 
> Tu ressens de la frustration — que ton travail soit reconnu à sa juste valeur.
> 
> Ce qui te semble juste, c'est exprimer clairement ce que cette situation te coûte.
> 
> Tu peux le voir.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Frustration nommée mais ton trop neutre, manque de mordant lucide |
| Impact | 7/10 | Action bien formulée comme direction, reconnaissance présente mais faible |
| Lisibilité | 6/10 | Phrase finale trop courte et creuse, structure un peu mécanique |

**Problèmes :** `ton_plat`, `phrase_inutile`

</details>

<details>
<summary><strong>Cas 15 — solitude</strong> &nbsp; ❌ 6/10</summary>

**Émotion :** solitude &nbsp;|&nbsp; **Besoin :** créer des liens authentiques

**Réponse TRACÉA :**

> Tu es dans une nouvelle ville depuis 6 mois et tu n'as toujours pas de vrais amis.
> 
> Tu ressens de la solitude, et tu as besoin de créer des liens authentiques.
> 
> Ce qui te semble juste, c'est t'inscrire à une activité de groupe cette semaine.
> 
> Ça a du sens.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | Solitude nommée mais non incarnée, ton trop neutre et plat |
| Impact | 6/10 | Action bien formulée comme direction, reconnaissance trop mécanique |
| Lisibilité | 7/10 | Phrases courtes et claires, structure lisible mais répétitive |

**Problèmes :** `ton_plat`, `phrase_inutile`

</details>

<details>
<summary><strong>Cas 16 — solitude</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** solitude &nbsp;|&nbsp; **Besoin :** être vraiment vu et entendu par quelqu'un

**Réponse TRACÉA :**

> Même entouré(e) de tes proches lors des fêtes, tu te sens profondément incompris(e).
> 
> Tu ressens de la solitude, et le besoin d'être vraiment vu(e) et entendu(e) par quelqu'un.
> 
> Ce qui te semble juste, c'est avoir une vraie conversation avec une personne de confiance.
> 
> Ça compte.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 8/10 | Solitude bien présente, ton doux adapté, aucune déformation. |
| Impact | 7/10 | Action bien formulée comme direction, reconnaissance claire mais sobre. |
| Lisibilité | 6/10 | Structure en trois phrases parallèles crée une légère lourdeur visible. |

**Problèmes :** `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 17 — besoin flou</strong> &nbsp; ✅ 7.3/10</summary>

**Émotion :** tristesse &nbsp;|&nbsp; **Besoin :** je ne sais pas vraiment ce dont j'ai besoin

**Réponse TRACÉA :**

> Quelque chose ne va pas depuis quelques jours, mais tu n'arrives pas à mettre le doigt dessus.
> 
> Tu ressens de la tristesse, sans savoir vraiment ce dont tu as besoin.
> 
> Ce qui te semble juste, c'est t'asseoir avec ce sentiment sans chercher à le résoudre tout de suite.
> 
> Ça a sa place.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 8/10 | Ton doux et lent, adapté à la tristesse floue déclarée. |
| Impact | 7/10 | Action bien formulée comme intention, reconnaissance présente mais légère. |
| Lisibilité | 7/10 | Phrases courtes, mais dernière phrase trop vague et peu ancrée. |

**Problèmes :** `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 18 — besoin flou</strong> &nbsp; ⭐ 8.7/10</summary>

**Émotion :** confusion &nbsp;|&nbsp; **Besoin :** (vide)

**Réponse TRACÉA :**

> Tu te sens épuisé(e) sans raison apparente depuis une semaine.
> 
> C'est flou.
> 
> Ce qui te semble juste, c'est te reposer et voir ce qui émerge.
> 
> Ça peut rester comme ça.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 9/10 | Ton flottant et ouvert, parfaitement adapté à la confusion. |
| Impact | 8/10 | Reconnaissance claire, direction bien posée comme intention. |
| Lisibilité | 9/10 | Phrases courtes, rythme lent et fluide, aucune lourdeur. |

</details>

<details>
<summary><strong>Cas 19 — action ambiguë</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** frustration &nbsp;|&nbsp; **Besoin :** clarifier la situation

**Réponse TRACÉA :**

> Ta relation avec ton collègue est tendue depuis une semaine sans raison claire.
> 
> Tu ressens de la frustration, et tu veux clarifier la situation.
> 
> Ce qui te semble juste, c'est lui parler directement ou attendre que ça se tasse.
> 
> C'est là.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Frustration nommée mais ton trop neutre, peu incarné |
| Impact | 7/10 | Reconnaissance présente, action bien formulée comme direction |
| Lisibilité | 8/10 | Phrases courtes, fluides, structure claire et lisible |

**Problèmes :** `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 20 — action ambiguë</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** confusion &nbsp;|&nbsp; **Besoin :** prendre la bonne décision pour moi

**Réponse TRACÉA :**

> Tu dois choisir entre deux offres d'emploi très différentes avant vendredi.
> 
> C'est flou — tu ressens de la confusion face à ce que serait la bonne décision pour toi.
> 
> Ce qui te semble juste, c'est faire une liste de critères ou en parler à quelqu'un de confiance.
> 
> Ça peut rester comme ça.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Confusion présente mais ton trop neutre, manque de flottement réel |
| Impact | 6/10 | Action bien formulée comme direction, reconnaissance un peu faible |
| Lisibilité | 8/10 | Phrases courtes et fluides, bonne structure générale |

**Problèmes :** `[object Object]`, `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 21 — action au futur</strong> &nbsp; ❌ 6.3/10</summary>

**Émotion :** colère &nbsp;|&nbsp; **Besoin :** qu'on puisse se parler vraiment sans s'agresser

**Réponse TRACÉA :**

> Tu as eu une dispute avec ton frère ce matin avant le travail.
> 
> Ce qui te semble juste, c'est l'appeler demain soir quand tu seras plus calme.
> 
> Tu peux t'appuyer là-dessus.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | La colère est absente, ton trop neutre pour cette émotion |
| Impact | 6/10 | Action bien ancrée comme direction, besoin réel non reflété |
| Lisibilité | 8/10 | Phrases courtes, fluides, structure claire et légère |

**Problèmes :** `[object Object]`, `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 22 — action au futur</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** peur &nbsp;|&nbsp; **Besoin :** trouver une direction qui correspond à qui je suis

**Réponse TRACÉA :**

> Tu traverses une période de transition professionnelle difficile et incertaine.
> 
> Tu as ressenti de la peur, et tu cherches à trouver une direction qui correspond à qui tu es.
> 
> Ce qui te semble juste, c'est contacter un coach professionnel la semaine prochaine.
> 
> Tu peux rester là.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Peur nommée mais ton trop neutre pour une émotion intense |
| Impact | 7/10 | Action bien formulée comme direction, reconnaissance présente mais froide |
| Lisibilité | 8/10 | Phrases courtes, fluides, structure claire et sans lourdeur |

**Problèmes :** `[object Object]`, `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 23 — action formulée avec je</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** tristesse &nbsp;|&nbsp; **Besoin :** comprendre ce qui s'est passé entre nous

**Réponse TRACÉA :**

> Ton ami t'a exclu d'un projet commun sans aucune explication.
> 
> Tu as ressenti de la tristesse, et tu as besoin de comprendre ce qui s'est passé entre vous.
> 
> Ce qui te semble juste, c'est lui envoyer un message pour qu'on se retrouve.
> 
> Ça a sa place.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Tristesse nommée mais ton trop neutre, peu de douceur ressentie |
| Impact | 7/10 | Action bien formulée comme direction, reconnaissance présente mais froide |
| Lisibilité | 8/10 | Phrases courtes et fluides, structure claire et lisible |

**Problèmes :** `[object Object]`, `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 24 — action formulée avec je</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** frustration &nbsp;|&nbsp; **Besoin :** me ressourcer vraiment

**Réponse TRACÉA :**

> Tu es épuisé(e) par la surcharge de travail accumulée ce mois-ci.
> 
> Tu ressens de la frustration, et le besoin de te ressourcer vraiment.
> 
> Ce qui te semble juste, c'est prendre une journée pour toi sans obligation.
> 
> C'est là.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Frustration nommée mais ton trop neutre pour cette émotion |
| Impact | 6/10 | Action bien ancrée comme direction, reconnaissance un peu froide |
| Lisibilité | 8/10 | Phrases courtes et fluides, structure claire et lisible |

**Problèmes :** `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 25 — situation très courte</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** colère &nbsp;|&nbsp; **Besoin :** être entendu

**Réponse TRACÉA :**

> Il y a eu une dispute.
> 
> Ça pousse.
> 
> Ce qui te semble juste, c'est en parler.
> 
> Tu peux t'appuyer là-dessus.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Ton direct présent mais émotion colère peu incarnée |
| Impact | 6/10 | Besoin d'être entendu absent, action ancrée mais flottante |
| Lisibilité | 8/10 | Phrases courtes, rythme fluide, aucune répétition visible |

**Problèmes :** `perte_information`, `manque_précision`

</details>

<details>
<summary><strong>Cas 26 — situation très courte</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** tristesse &nbsp;|&nbsp; **Besoin :** connexion

**Réponse TRACÉA :**

> Tu as été seul(e).
> 
> Ça touche.
> 
> Ce qui te semble juste, c'est appeler quelqu'un.
> 
> Ça a sa place.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 8/10 | Ton doux et lent, adapté à la tristesse, sans surcharge. |
| Impact | 7/10 | Reconnaissance présente, action bien formulée comme intention. |
| Lisibilité | 6/10 | Phrases très courtes mais 'Ça a sa place' reste vague et flottant. |

**Problèmes :** `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 27 — situation longue</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** frustration &nbsp;|&nbsp; **Besoin :** être reconnu pour ce que j'accomplis réellement

**Réponse TRACÉA :**

> Tu nages à contre-courant depuis trois mois, avec des délais impossibles, des demandes contradictoires et un budget réduit de moitié en cours de route — et ce matin, on t'a encore demandé de faire plus avec moins.
> 
> Tu ressens de la frustration, et ce qui manque, c'est être reconnu pour ce que tu accomplis réellement.
> 
> Ce qui te semble juste, c'est demander un entretien formel avec ta direction cette semaine.
> 
> Tu peux le voir.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 8/10 | Frustration bien présente, ton lucide et posé, ancré dans le réel. |
| Impact | 7/10 | Action formulée comme direction, besoin de reconnaissance clairement reflété. |
| Lisibilité | 6/10 | Répétition visible de la phrase budget/délais, dernière phrase trop courte. |

**Problèmes :** `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 28 — situation longue</strong> &nbsp; ❌ 5/10</summary>

**Émotion :** confusion &nbsp;|&nbsp; **Besoin :** retrouver de la clarté sur ce que je veux vraiment

**Réponse TRACÉA :**

> Ta relation traverse une phase très difficile depuis un an, et tu ne sais plus vraiment ce que tu veux.
> 
> Tu ressens de la confusion.
> 
> Ce qui te semble juste, c'est consulter un thérapeute de couple pour y voir plus clair.
> 
> Ça peut rester comme ça.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | Confusion nommée mais ton trop neutre pour l'ampleur du vécu |
| Impact | 4/10 | Peu de reconnaissance réelle, miroir trop superficiel et distant |
| Lisibilité | 6/10 | Phrases courtes mais structure mécanique et froide |

**Problèmes :** `[object Object]`, `[object Object]`, `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 29 — contradiction émotion/besoin</strong> &nbsp; ❌ 5.3/10</summary>

**Émotion :** peur &nbsp;|&nbsp; **Besoin :** prouver que je mérite cette promotion

**Réponse TRACÉA :**

> Tu as enfin reçu la promotion que tu demandais depuis deux ans.
> 
> Ce qui te semble juste, c'est dresser une liste de tes forces et de tes premiers objectifs.
> 
> Tu peux ralentir.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 4/10 | La peur n'est pas nommée ni reflétée dans le ton. |
| Impact | 5/10 | Le besoin de prouver est absent, reconnaissance incomplète. |
| Lisibilité | 7/10 | Phrases courtes, fluides, structure claire et légère. |

**Problèmes :** `[object Object]`, `[object Object]`, `[object Object]`, `[object Object]`

</details>

<details>
<summary><strong>Cas 30 — contradiction émotion/besoin</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** tristesse &nbsp;|&nbsp; **Besoin :** m'assurer que c'est réel et que ça va durer

**Réponse TRACÉA :**

> Tu as ressenti de la tristesse, et tu as besoin de t'assurer que c'est réel et que ça va durer.
> 
> La personne que tu aimes t'a dit pour la première fois qu'elle t'aimait.
> 
> Ce qui te semble juste, c'est lui dire à ton tour ce que tu ressens vraiment.
> 
> Tu peux prendre ce temps.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Tristesse nommée mais ton trop neutre pour cette émotion |
| Impact | 7/10 | Action bien formulée comme direction, reconnaissance présente |
| Lisibilité | 8/10 | Phrases courtes, fluides, structure claire et aérée |

**Problèmes :** `[object Object]`, `[object Object]`, `[object Object]`

</details>

---

*Rapport généré par `scripts/test-tracea-human.ts`. Évaluation par LLM juge — indicatif, non contractuel.*
