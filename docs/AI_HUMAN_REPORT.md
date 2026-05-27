# Rapport d'évaluation qualitative IA TRACÉA

**Généré le :** 2026-04-25 18:35:31 UTC
**Durée totale :** 244.7s
**Juge :** claude-sonnet-4-6 (température 0)
**Cas évalués :** 30/30

---

## Résumé global

| Dimension | Score moyen | Visualisation |
|-----------|-------------|---------------|
| Justesse émotionnelle | **7/10** | `███████░░░  7.0` |
| Impact | **6.6/10** | `███████░░░  6.6` |
| Lisibilité | **7.5/10** | `████████░░  7.5` |
| **Score global** | **7/10** | `███████░░░  7.0` |

### Distribution des scores globaux

| Plage | Cas | Proportion |
|-------|-----|------------|
| < 6 | 0 | ░░░░░░░░░░ 0% |
| 6–7 | 10 | ██████████ 33% |
| 7–8 | 15 | ███████████████ 50% |
| 8–9 | 4 | ████░░░░░░ 13% |
| ≥ 9 | 1 | █░░░░░░░░░ 3% |

### Scores par émotion

| Émotion | Score moyen | Cas |
|---------|-------------|-----|
| honte | 6.5/10 | 2 |
| colère | 6.9/10 | 4 |
| tristesse | 6.9/10 | 6 |
| frustration | 6.9/10 | 5 |
| peur | 7/10 | 4 |
| solitude | 7/10 | 2 |
| culpabilité | 7.2/10 | 2 |
| confusion | 7.6/10 | 5 |

---

## Problèmes détectés

| Problème | Occurrences | Fréquence |
|----------|-------------|-----------|
| `phrase_inutile` | 24 | 80% des cas |
| `ton_plat` | 21 | 70% des cas |
| `perte_information` | 9 | 30% des cas |
| `manque_précision` | 6 | 20% des cas |
| `répétition` | 4 | 13% des cas |

---

## Cas faibles — score < 7/10 (10)

### Cas 1 — colère | **6/10**

**Situation :** Mon chef a annulé ma présentation au dernier moment devant toute l'équipe

**Réponse TRACÉA :**

> Tu as ressenti de la colère — tu veux être respecté dans ton travail.
> 
> Ton chef a annulé ta présentation au dernier moment devant toute l'équipe.
> 
> Ça touche quelque chose.
> 
> Ce qui te semble juste, c'est en parler directement avec lui demain.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Colère nommée mais ton trop neutre, pas assez ancré |
| Impact | 5/10 | Reconnaissance faible, phrase vague affaiblit le miroir |
| Lisibilité | 7/10 | Phrases courtes mais une phrase creuse nuit au rythme |

**Problèmes :** `phrase_inutile`, `ton_plat`, `manque_précision`

---

### Cas 8 — honte | **6/10**

**Situation :** J'ai fait une erreur visible devant toute mon équipe lors de la réunion de direction

**Réponse TRACÉA :**

> Tu as ressenti de la honte.
> 
> Tu as fait une erreur visible devant toute ton équipe lors de la réunion de direction.
> 
> C'est difficile à montrer.
> 
> Ce qui te semble juste, c'est t'accorder de la compassion.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Honte nommée mais ton trop neutre, manque de délicatesse |
| Impact | 5/10 | Besoin de ne pas s'écraser absent, miroir incomplet |
| Lisibilité | 7/10 | Phrases courtes, fluides, mais structure mécanique et froide |

**Problèmes :** `ton_plat`, `perte_information`, `phrase_inutile`

---

### Cas 11 — confusion | **6/10**

**Situation :** Je reçois des messages contradictoires de mon manager concernant les priorités du projet

**Réponse TRACÉA :**

> Tu reçois des messages contradictoires de ton manager concernant les priorités du projet.
> 
> C'est flou — tu ressens de la confusion, et tu as besoin d'une direction claire.
> 
> Ce qui te semble juste, c'est demander une réunion de clarification cette semaine.
> 
> Ça peut rester comme ça.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Confusion présente mais ton manque de flottement caractéristique |
| Impact | 6/10 | Action bien formulée comme intention, reconnaissance un peu froide |
| Lisibilité | 5/10 | Dernière phrase creuse, rythme inégal entre les paragraphes |

**Problèmes :** `phrase_inutile`, `ton_plat`

---

### Cas 19 — action ambiguë | **6/10**

**Situation :** Ma relation avec mon collègue est tendue depuis une semaine sans raison claire

**Réponse TRACÉA :**

> Ta relation avec ton collègue est tendue depuis une semaine sans raison claire.
> 
> Tu ressens de la frustration et tu as besoin de clarifier la situation.
> 
> Ce qui te semble juste, c'est lui parler directement ou attendre que ça se tasse.
> 
> C'est là.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | Frustration nommée mais ton trop neutre, sans ancrage émotionnel |
| Impact | 6/10 | Action bien reflétée, mais sentiment d'être reconnu reste faible |
| Lisibilité | 7/10 | Phrases courtes et claires, structure lisible sans lourdeur |

**Problèmes :** `ton_plat`, `phrase_inutile`

---

### Cas 21 — action au futur | **6/10**

**Situation :** J'ai eu une dispute avec mon frère ce matin avant le travail

**Réponse TRACÉA :**

> Tu as ressenti de la colère — et le besoin que vous puissiez vous parler vraiment sans vous agresser.
> 
> Tu as eu une dispute avec ton frère ce matin avant le travail.
> 
> Ça touche quelque chose.
> 
> Ce qui te semble juste, c'est l'appeler demain soir quand tu seras plus calme.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Colère nommée mais ton trop doux, pas assez ancré |
| Impact | 7/10 | Besoin et action bien reflétés, reconnaissance présente |
| Lisibilité | 5/10 | Phrase vague au centre, structure fragmentée et flottante |

**Problèmes :** `phrase_inutile`, `ton_plat`, `répétition`

---

### Cas 23 — action formulée avec je | **6/10**

**Situation :** Mon ami m'a exclu d'un projet commun sans aucune explication

**Réponse TRACÉA :**

> Ton ami t'a exclu d'un projet commun sans aucune explication.
> 
> Ça fait quelque chose.
> 
> Tu as ressenti de la tristesse, et tu as besoin de comprendre ce qui s'est passé entre vous.
> 
> Ce qui te semble juste, c'est lui envoyer un message pour qu'on se retrouve.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Tristesse nommée mais ton trop neutre, manque de douceur |
| Impact | 5/10 | Action bien formulée en intention, reconnaissance trop légère |
| Lisibilité | 7/10 | Phrases courtes, mais structure répétitive et mécanique |

**Problèmes :** `phrase_inutile`, `ton_plat`, `manque_précision`

---

### Cas 29 — contradiction émotion/besoin | **6/10**

**Situation :** J'ai enfin reçu la promotion que je demandais depuis deux ans

**Réponse TRACÉA :**

> Tu as enfin reçu la promotion que tu demandais depuis deux ans.
> 
> Tu ressens de la peur, et le besoin de prouver que tu mérites cette promotion.
> 
> Ce qui te semble juste, c'est dresser une liste de tes forces et de tes premiers objectifs.
> 
> Tu peux ralentir.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | Peur nommée mais ton non adapté, manque de stabilité sécurisante |
| Impact | 6/10 | Action bien reflétée, mais reconnaissance émotionnelle trop superficielle |
| Lisibilité | 7/10 | Phrases courtes, fluides, mais structure répétitive et mécanique |

**Problèmes :** `ton_plat`, `phrase_inutile`, `répétition`

---

### Cas 9 — culpabilité | **6.3/10**

**Situation :** J'ai complètement oublié l'anniversaire de ma sœur cette année

**Réponse TRACÉA :**

> Tu as complètement oublié l'anniversaire de ta sœur cette année.
> 
> Tu ressens de la culpabilité, et le besoin de réparer ce que tu as négligé.
> 
> Ce qui te semble juste, c'est l'appeler aujourd'hui et lui offrir quelque chose de sincère.
> 
> Tu peux rester avec toi.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Culpabilité présente mais ton trop neutre pour cette émotion |
| Impact | 6/10 | Action bien ancrée comme direction, reconnaissance un peu froide |
| Lisibilité | 6/10 | Dernière phrase vague et déconnectée du reste |

**Problèmes :** `ton_plat`, `phrase_inutile`

---

### Cas 25 — situation très courte | **6.7/10**

**Situation :** Dispute.

**Réponse TRACÉA :**

> Tu as vécu une dispute.
> 
> Tu as ressenti de la colère, et tu as besoin d'être entendu.
> 
> Ce qui te semble juste, c'est en parler.
> 
> Tu peux t'appuyer là-dessus.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Colère nommée mais ton trop neutre, pas assez ancré |
| Impact | 6/10 | Reconnaissance présente mais dernière phrase vague et faible |
| Lisibilité | 8/10 | Phrases courtes, fluides, structure claire et lisible |

**Problèmes :** `ton_plat`, `phrase_inutile`

---

### Cas 27 — situation longue | **6.7/10**

**Situation :** Cela fait maintenant trois mois que je gère un projet très complexe impliquant plusieurs équipes, des délais impossibles, des demandes contradictoires de la direction et un budget réduit de moitié en cours de route. Chaque semaine de nouveaux obstacles surgissent. J'ai l'impression de nager à contre-courant en permanence, de devoir justifier chaque décision et de n'avoir aucun soutien réel. Ce matin on m'a encore demandé de faire plus avec moins.

**Réponse TRACÉA :**

> Depuis trois mois, tu gères un projet très complexe impliquant plusieurs équipes, des délais impossibles, des demandes contradictoires de la direction et un budget réduit de moitié en cours de route — et ce matin on t'a encore demandé de faire plus avec moins.
> 
> Tu ressens de la frustration, et ce dont tu as besoin, c'est d'être reconnu(e) pour ce que tu accomplis réellement.
> 
> Ce qui te semble juste, c'est demander un entretien formel avec ta direction cette semaine.
> 
> C'est là.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Frustration présente mais ton reste neutre, manque d'ancrage émotionnel |
| Impact | 7/10 | Action bien formulée comme direction, reconnaissance clairement reflétée |
| Lisibilité | 6/10 | Première phrase trop longue, accumulation lourde à lire |

**Problèmes :** `ton_plat`, `répétition`, `phrase_inutile`

---

## Cas excellents — score > 8.5/10 (3)

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

- Justesse : Ton flottant et ouvert, parfaitement adapté à la confusion.
- Impact : Reconnaissance claire, direction ancrée sans acte accompli.
- Lisibilité : Phrases courtes, rythme fluide, aucune lourdeur visible.

### Cas 2 — colère | **8.7/10**

**Situation :** J'ai découvert que mon colocataire avait utilisé mes affaires sans demander

**Réponse TRACÉA :**

> Tu as découvert que ton colocataire avait utilisé tes affaires sans demander.
> 
> Ça ne passe pas.
> 
> Ce qui te semble juste, c'est poser tes limites clairement.
> 
> Tu peux t'écouter.

**Pourquoi ça fonctionne :**

- Justesse : Ton direct et ancré, colère bien présente sans surcharge
- Impact : Reconnaissance claire, action formulée comme direction juste
- Lisibilité : Phrases courtes, rythme efficace, aucune lourdeur visible

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

- Justesse : Ton flottant et ouvert, parfaitement adapté à la confusion déclarée.
- Impact : Reconnaissance claire, direction bien posée comme intention ouverte.
- Lisibilité : Phrases courtes, rythme lent et fluide, aucune lourdeur visible.

---

## Tendances générales

### Ce qui fonctionne

- **Lisibilité** (7.5/10)
- **2 cas sans problème** (7% des évaluations)
- **3 cas excellents** (score > 8.5) — le modèle miroir fonctionne bien sur ces profils

### Ce qui doit être amélioré

- **honte** : score moyen 6.5/10 — catégorie à surveiller
- **colère** : score moyen 6.9/10 — catégorie à surveiller
- **tristesse** : score moyen 6.9/10 — catégorie à surveiller
- **frustration** : score moyen 6.9/10 — catégorie à surveiller
- **peur** : score moyen 7/10 — catégorie à surveiller
- **solitude** : score moyen 7/10 — catégorie à surveiller
- **culpabilité** : score moyen 7.2/10 — catégorie à surveiller
- Problème le plus fréquent : `phrase_inutile` (24 cas, 80%)
- Dimension la plus faible : **Impact** (6.6/10) — axe d'amélioration prioritaire
- **10 cas faibles** — voir détail section "Cas faibles" pour les axes d'amélioration spécifiques

---

## Détail complet — tous les cas

<details>
<summary><strong>Cas 1 — colère</strong> &nbsp; ❌ 6/10</summary>

**Émotion :** colère &nbsp;|&nbsp; **Besoin :** être respecté dans mon travail

**Réponse TRACÉA :**

> Tu as ressenti de la colère — tu veux être respecté dans ton travail.
> 
> Ton chef a annulé ta présentation au dernier moment devant toute l'équipe.
> 
> Ça touche quelque chose.
> 
> Ce qui te semble juste, c'est en parler directement avec lui demain.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Colère nommée mais ton trop neutre, pas assez ancré |
| Impact | 5/10 | Reconnaissance faible, phrase vague affaiblit le miroir |
| Lisibilité | 7/10 | Phrases courtes mais une phrase creuse nuit au rythme |

**Problèmes :** `phrase_inutile`, `ton_plat`, `manque_précision`

</details>

<details>
<summary><strong>Cas 2 — colère</strong> &nbsp; ⭐ 8.7/10</summary>

**Émotion :** colère &nbsp;|&nbsp; **Besoin :** que mon espace personnel soit respecté

**Réponse TRACÉA :**

> Tu as découvert que ton colocataire avait utilisé tes affaires sans demander.
> 
> Ça ne passe pas.
> 
> Ce qui te semble juste, c'est poser tes limites clairement.
> 
> Tu peux t'écouter.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 9/10 | Ton direct et ancré, colère bien présente sans surcharge |
| Impact | 8/10 | Reconnaissance claire, action formulée comme direction juste |
| Lisibilité | 9/10 | Phrases courtes, rythme efficace, aucune lourdeur visible |

**Problèmes :** `phrase_inutile`

</details>

<details>
<summary><strong>Cas 3 — tristesse</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** tristesse &nbsp;|&nbsp; **Besoin :** maintenir ce lien malgré la distance

**Réponse TRACÉA :**

> Ton meilleur ami a déménagé à l'autre bout de la France ce week-end.
> 
> Ça fait quelque chose.
> 
> Tu as ressenti de la tristesse.
> 
> Ce qui te semble juste, c'est lui envoyer un message ce soir.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Tristesse présente mais effleurée, pas vraiment incarnée |
| Impact | 6/10 | Reconnaissance faible, action bien posée comme direction |
| Lisibilité | 8/10 | Phrases courtes, rythme fluide, structure propre |

**Problèmes :** `ton_plat`, `phrase_inutile`, `perte_information`

</details>

<details>
<summary><strong>Cas 4 — tristesse</strong> &nbsp; ✅ 7/10</summary>

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
| Justesse émotionnelle | 7/10 | Tristesse présente mais ton trop neutre, manque de douceur |
| Impact | 6/10 | Action bien formulée comme direction, reconnaissance un peu froide |
| Lisibilité | 8/10 | Phrases courtes et fluides, structure claire et légère |

**Problèmes :** `ton_plat`, `phrase_inutile`

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
<summary><strong>Cas 6 — peur</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** peur &nbsp;|&nbsp; **Besoin :** comprendre ce qui se passe vraiment

**Réponse TRACÉA :**

> Tu as reçu des résultats médicaux inquiétants à discuter avec ton médecin.
> 
> Il y a une tension là.
> 
> Ce qui te semble juste, c'est appeler le cabinet médical ce matin.
> 
> Tu peux ralentir.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Ton stable et sécurisant, mais la peur reste peu nommée |
| Impact | 6/10 | Action bien ancrée, besoin de comprendre absent du miroir |
| Lisibilité | 8/10 | Phrases courtes, rythme fluide, légère fragmentation finale |

**Problèmes :** `perte_information`, `phrase_inutile`, `manque_précision`

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
| Justesse émotionnelle | 7/10 | Honte nommée mais ton insuffisamment délicat et minimal |
| Impact | 6/10 | Dernière phrase abstraite, affaiblit l'ancrage de l'action |
| Lisibilité | 8/10 | Phrases courtes, fluides, structure claire et lisible |

**Problèmes :** `phrase_inutile`, `ton_plat`

</details>

<details>
<summary><strong>Cas 8 — honte</strong> &nbsp; ❌ 6/10</summary>

**Émotion :** honte &nbsp;|&nbsp; **Besoin :** ne pas me laisser écraser par le regard des autres

**Réponse TRACÉA :**

> Tu as ressenti de la honte.
> 
> Tu as fait une erreur visible devant toute ton équipe lors de la réunion de direction.
> 
> C'est difficile à montrer.
> 
> Ce qui te semble juste, c'est t'accorder de la compassion.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Honte nommée mais ton trop neutre, manque de délicatesse |
| Impact | 5/10 | Besoin de ne pas s'écraser absent, miroir incomplet |
| Lisibilité | 7/10 | Phrases courtes, fluides, mais structure mécanique et froide |

**Problèmes :** `ton_plat`, `perte_information`, `phrase_inutile`

</details>

<details>
<summary><strong>Cas 9 — culpabilité</strong> &nbsp; ❌ 6.3/10</summary>

**Émotion :** culpabilité &nbsp;|&nbsp; **Besoin :** réparer ce que j'ai négligé

**Réponse TRACÉA :**

> Tu as complètement oublié l'anniversaire de ta sœur cette année.
> 
> Tu ressens de la culpabilité, et le besoin de réparer ce que tu as négligé.
> 
> Ce qui te semble juste, c'est l'appeler aujourd'hui et lui offrir quelque chose de sincère.
> 
> Tu peux rester avec toi.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Culpabilité présente mais ton trop neutre pour cette émotion |
| Impact | 6/10 | Action bien ancrée comme direction, reconnaissance un peu froide |
| Lisibilité | 6/10 | Dernière phrase vague et déconnectée du reste |

**Problèmes :** `ton_plat`, `phrase_inutile`

</details>

<details>
<summary><strong>Cas 10 — culpabilité</strong> &nbsp; ✅ 8/10</summary>

**Émotion :** culpabilité &nbsp;|&nbsp; **Besoin :** agir en accord avec mes valeurs

**Réponse TRACÉA :**

> Tu as accepté une mission que tu savais ne pas pouvoir honorer dans les délais.
> 
> Ça pèse.
> 
> Ce qui te semble juste, c'est être honnête avec ton manager sur tes limites réelles.
> 
> Tu peux y aller doucement.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 8/10 | Culpabilité bien présente, ton doux adapté, rien de déformé. |
| Impact | 7/10 | Action ancrée comme direction, besoin de valeurs absent du miroir. |
| Lisibilité | 9/10 | Phrases courtes, rythme fluide, aucune lourdeur visible. |

**Problèmes :** `perte_information`

</details>

<details>
<summary><strong>Cas 11 — confusion</strong> &nbsp; ❌ 6/10</summary>

**Émotion :** confusion &nbsp;|&nbsp; **Besoin :** avoir une direction claire

**Réponse TRACÉA :**

> Tu reçois des messages contradictoires de ton manager concernant les priorités du projet.
> 
> C'est flou — tu ressens de la confusion, et tu as besoin d'une direction claire.
> 
> Ce qui te semble juste, c'est demander une réunion de clarification cette semaine.
> 
> Ça peut rester comme ça.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Confusion présente mais ton manque de flottement caractéristique |
| Impact | 6/10 | Action bien formulée comme intention, reconnaissance un peu froide |
| Lisibilité | 5/10 | Dernière phrase creuse, rythme inégal entre les paragraphes |

**Problèmes :** `phrase_inutile`, `ton_plat`

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
| Justesse émotionnelle | 9/10 | Ton flottant et ouvert, parfaitement adapté à la confusion. |
| Impact | 9/10 | Reconnaissance claire, direction ancrée sans acte accompli. |
| Lisibilité | 10/10 | Phrases courtes, rythme fluide, aucune lourdeur visible. |

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

**Problèmes :** `ton_plat`, `phrase_inutile`

</details>

<details>
<summary><strong>Cas 14 — frustration</strong> &nbsp; ✅ 7.7/10</summary>

**Émotion :** frustration &nbsp;|&nbsp; **Besoin :** que mon travail soit reconnu à sa juste valeur

**Réponse TRACÉA :**

> Tu prépares ce projet depuis des mois et il est constamment repoussé sans explication.
> 
> Ça bloque.
> 
> Ce qui te semble juste, c'est exprimer clairement ce que cette situation te coûte.
> 
> Tu peux le voir.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 8/10 | Ton lucide et posé, bien adapté à la frustration déclarée. |
| Impact | 7/10 | Action bien formulée comme direction, besoin de reconnaissance absent. |
| Lisibilité | 8/10 | Phrases courtes et fluides, rythme efficace et bien dosé. |

**Problèmes :** `perte_information`, `phrase_inutile`

</details>

<details>
<summary><strong>Cas 15 — solitude</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** solitude &nbsp;|&nbsp; **Besoin :** créer des liens authentiques

**Réponse TRACÉA :**

> Tu es dans une nouvelle ville depuis 6 mois et tu n'as toujours pas de vrais amis.
> 
> Tu ressens de la solitude, et tu as besoin de créer des liens authentiques.
> 
> Ce qui te semble juste, c'est t'inscrire à une activité de groupe cette semaine.
> 
> Ça a sa place.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Solitude nommée mais non incarnée, ton trop neutre et plat |
| Impact | 7/10 | Action bien formulée comme direction, reconnaissance présente mais froide |
| Lisibilité | 8/10 | Phrases courtes et fluides, structure claire sans lourdeur |

**Problèmes :** `ton_plat`, `phrase_inutile`, `manque_précision`

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
> Tu peux t'appuyer là-dessus.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 8/10 | Solitude bien présente, ton doux adapté, aucune déformation. |
| Impact | 7/10 | Action ancrée comme direction, reconnaissance claire mais sobre. |
| Lisibilité | 6/10 | Structure répétitive visible, dernière phrase trop générique. |

**Problèmes :** `phrase_inutile`, `ton_plat`

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
| Lisibilité | 7/10 | Phrases courtes, mais structure très proche du paraphrasage brut. |

**Problèmes :** `ton_plat`, `répétition`

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
| Justesse émotionnelle | 9/10 | Ton flottant et ouvert, parfaitement adapté à la confusion déclarée. |
| Impact | 8/10 | Reconnaissance claire, direction bien posée comme intention ouverte. |
| Lisibilité | 9/10 | Phrases courtes, rythme lent et fluide, aucune lourdeur visible. |

</details>

<details>
<summary><strong>Cas 19 — action ambiguë</strong> &nbsp; ❌ 6/10</summary>

**Émotion :** frustration &nbsp;|&nbsp; **Besoin :** clarifier la situation

**Réponse TRACÉA :**

> Ta relation avec ton collègue est tendue depuis une semaine sans raison claire.
> 
> Tu ressens de la frustration et tu as besoin de clarifier la situation.
> 
> Ce qui te semble juste, c'est lui parler directement ou attendre que ça se tasse.
> 
> C'est là.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | Frustration nommée mais ton trop neutre, sans ancrage émotionnel |
| Impact | 6/10 | Action bien reflétée, mais sentiment d'être reconnu reste faible |
| Lisibilité | 7/10 | Phrases courtes et claires, structure lisible sans lourdeur |

**Problèmes :** `ton_plat`, `phrase_inutile`

</details>

<details>
<summary><strong>Cas 20 — action ambiguë</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** confusion &nbsp;|&nbsp; **Besoin :** prendre la bonne décision pour moi

**Réponse TRACÉA :**

> Tu dois choisir entre deux offres d'emploi très différentes avant vendredi.
> 
> C'est flou.
> 
> Ce qui te semble juste, c'est faire une liste de critères ou en parler à quelqu'un de confiance.
> 
> Ça peut rester comme ça.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Ton flottant adapté, mais confusion peu incarnée dans la réponse |
| Impact | 6/10 | Action reflétée mais dernière phrase affaiblit l'ancrage de direction |
| Lisibilité | 8/10 | Phrases courtes, fluides, rythme bien dosé |

**Problèmes :** `phrase_inutile`, `manque_précision`, `perte_information`

</details>

<details>
<summary><strong>Cas 21 — action au futur</strong> &nbsp; ❌ 6/10</summary>

**Émotion :** colère &nbsp;|&nbsp; **Besoin :** qu'on puisse se parler vraiment sans s'agresser

**Réponse TRACÉA :**

> Tu as ressenti de la colère — et le besoin que vous puissiez vous parler vraiment sans vous agresser.
> 
> Tu as eu une dispute avec ton frère ce matin avant le travail.
> 
> Ça touche quelque chose.
> 
> Ce qui te semble juste, c'est l'appeler demain soir quand tu seras plus calme.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Colère nommée mais ton trop doux, pas assez ancré |
| Impact | 7/10 | Besoin et action bien reflétés, reconnaissance présente |
| Lisibilité | 5/10 | Phrase vague au centre, structure fragmentée et flottante |

**Problèmes :** `phrase_inutile`, `ton_plat`, `répétition`

</details>

<details>
<summary><strong>Cas 22 — action au futur</strong> &nbsp; ✅ 8/10</summary>

**Émotion :** peur &nbsp;|&nbsp; **Besoin :** trouver une direction qui correspond à qui je suis

**Réponse TRACÉA :**

> Tu traverses une période de transition professionnelle difficile et incertaine.
> 
> Ça serre un peu.
> 
> Tu as ressenti de la peur, et tu cherches à trouver une direction qui correspond à qui tu es.
> 
> Ce qui te semble juste, c'est contacter un coach professionnel la semaine prochaine.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Peur présente mais effleurée, pas vraiment incarnée dans le ton |
| Impact | 8/10 | Reconnaissance claire, action bien formulée comme direction future |
| Lisibilité | 9/10 | Phrases courtes, rythme fluide, aucune lourdeur visible |

**Problèmes :** `ton_plat`, `phrase_inutile`

</details>

<details>
<summary><strong>Cas 23 — action formulée avec je</strong> &nbsp; ❌ 6/10</summary>

**Émotion :** tristesse &nbsp;|&nbsp; **Besoin :** comprendre ce qui s'est passé entre nous

**Réponse TRACÉA :**

> Ton ami t'a exclu d'un projet commun sans aucune explication.
> 
> Ça fait quelque chose.
> 
> Tu as ressenti de la tristesse, et tu as besoin de comprendre ce qui s'est passé entre vous.
> 
> Ce qui te semble juste, c'est lui envoyer un message pour qu'on se retrouve.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Tristesse nommée mais ton trop neutre, manque de douceur |
| Impact | 5/10 | Action bien formulée en intention, reconnaissance trop légère |
| Lisibilité | 7/10 | Phrases courtes, mais structure répétitive et mécanique |

**Problèmes :** `phrase_inutile`, `ton_plat`, `manque_précision`

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
| Lisibilité | 8/10 | Phrases courtes et fluides, structure claire et légère |

**Problèmes :** `ton_plat`, `phrase_inutile`

</details>

<details>
<summary><strong>Cas 25 — situation très courte</strong> &nbsp; ❌ 6.7/10</summary>

**Émotion :** colère &nbsp;|&nbsp; **Besoin :** être entendu

**Réponse TRACÉA :**

> Tu as vécu une dispute.
> 
> Tu as ressenti de la colère, et tu as besoin d'être entendu.
> 
> Ce qui te semble juste, c'est en parler.
> 
> Tu peux t'appuyer là-dessus.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Colère nommée mais ton trop neutre, pas assez ancré |
| Impact | 6/10 | Reconnaissance présente mais dernière phrase vague et faible |
| Lisibilité | 8/10 | Phrases courtes, fluides, structure claire et lisible |

**Problèmes :** `ton_plat`, `phrase_inutile`

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
| Impact | 7/10 | Reconnaissance présente, action bien formulée comme direction. |
| Lisibilité | 6/10 | Phrases très courtes, mais 'Ça a sa place' reste vague et flottant. |

**Problèmes :** `phrase_inutile`, `perte_information`

</details>

<details>
<summary><strong>Cas 27 — situation longue</strong> &nbsp; ❌ 6.7/10</summary>

**Émotion :** frustration &nbsp;|&nbsp; **Besoin :** être reconnu pour ce que j'accomplis réellement

**Réponse TRACÉA :**

> Depuis trois mois, tu gères un projet très complexe impliquant plusieurs équipes, des délais impossibles, des demandes contradictoires de la direction et un budget réduit de moitié en cours de route — et ce matin on t'a encore demandé de faire plus avec moins.
> 
> Tu ressens de la frustration, et ce dont tu as besoin, c'est d'être reconnu(e) pour ce que tu accomplis réellement.
> 
> Ce qui te semble juste, c'est demander un entretien formel avec ta direction cette semaine.
> 
> C'est là.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Frustration présente mais ton reste neutre, manque d'ancrage émotionnel |
| Impact | 7/10 | Action bien formulée comme direction, reconnaissance clairement reflétée |
| Lisibilité | 6/10 | Première phrase trop longue, accumulation lourde à lire |

**Problèmes :** `ton_plat`, `répétition`, `phrase_inutile`

</details>

<details>
<summary><strong>Cas 28 — situation longue</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** confusion &nbsp;|&nbsp; **Besoin :** retrouver de la clarté sur ce que je veux vraiment

**Réponse TRACÉA :**

> Ta relation traverse une phase très difficile depuis un an, et tu ne sais plus vraiment ce que tu veux.
> 
> C'est flou.
> 
> Ce qui te semble juste, c'est consulter un thérapeute de couple pour y voir plus clair.
> 
> Ça peut rester comme ça.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Ton flottant adapté, mais richesse émotionnelle du vécu absente |
| Impact | 6/10 | Action bien ancrée comme direction, reconnaissance trop superficielle |
| Lisibilité | 8/10 | Phrases courtes, fluides, rythme bien dosé |

**Problèmes :** `perte_information`, `ton_plat`, `phrase_inutile`

</details>

<details>
<summary><strong>Cas 29 — contradiction émotion/besoin</strong> &nbsp; ❌ 6/10</summary>

**Émotion :** peur &nbsp;|&nbsp; **Besoin :** prouver que je mérite cette promotion

**Réponse TRACÉA :**

> Tu as enfin reçu la promotion que tu demandais depuis deux ans.
> 
> Tu ressens de la peur, et le besoin de prouver que tu mérites cette promotion.
> 
> Ce qui te semble juste, c'est dresser une liste de tes forces et de tes premiers objectifs.
> 
> Tu peux ralentir.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | Peur nommée mais ton non adapté, manque de stabilité sécurisante |
| Impact | 6/10 | Action bien reflétée, mais reconnaissance émotionnelle trop superficielle |
| Lisibilité | 7/10 | Phrases courtes, fluides, mais structure répétitive et mécanique |

**Problèmes :** `ton_plat`, `phrase_inutile`, `répétition`

</details>

<details>
<summary><strong>Cas 30 — contradiction émotion/besoin</strong> &nbsp; ✅ 7.3/10</summary>

**Émotion :** tristesse &nbsp;|&nbsp; **Besoin :** m'assurer que c'est réel et que ça va durer

**Réponse TRACÉA :**

> La personne que tu aimes t'a dit pour la première fois qu'elle t'aimait.
> 
> C'est lourd.
> 
> Ce qui te semble juste, c'est lui dire à ton tour ce que tu ressens vraiment.
> 
> Tu peux prendre ce temps.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Ton doux présent mais 'c'est lourd' dévie vers la peur |
| Impact | 7/10 | Action bien en direction, besoin de durée absent du miroir |
| Lisibilité | 9/10 | Phrases courtes, rythme lent, bien adapté à la tristesse |

**Problèmes :** `manque_précision`, `perte_information`

</details>

---

*Rapport généré par `scripts/test-tracea-human.ts`. Évaluation par LLM juge — indicatif, non contractuel.*
