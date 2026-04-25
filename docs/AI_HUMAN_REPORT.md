# Rapport d'évaluation qualitative IA TRACÉA

**Généré le :** 2026-04-25 16:50:48 UTC
**Durée totale :** 250.1s
**Juge :** claude-sonnet-4-6 (température 0)
**Cas évalués :** 30/30

---

## Résumé global

| Dimension | Score moyen | Visualisation |
|-----------|-------------|---------------|
| Justesse émotionnelle | **6.7/10** | `███████░░░  6.7` |
| Impact | **6.5/10** | `███████░░░  6.5` |
| Lisibilité | **7.4/10** | `███████░░░  7.4` |
| **Score global** | **6.9/10** | `███████░░░  6.9` |

### Distribution des scores globaux

| Plage | Cas | Proportion |
|-------|-----|------------|
| < 6 | 3 | ███░░░░░░░ 10% |
| 6–7 | 9 | █████████░ 30% |
| 7–8 | 12 | ████████████ 40% |
| 8–9 | 5 | █████░░░░░ 17% |
| ≥ 9 | 1 | █░░░░░░░░░ 3% |

### Scores par émotion

| Émotion | Score moyen | Cas |
|---------|-------------|-----|
| culpabilité | 6.2/10 | 2 |
| tristesse | 6.4/10 | 6 |
| colère | 6.6/10 | 4 |
| frustration | 6.7/10 | 5 |
| solitude | 7/10 | 2 |
| peur | 7.1/10 | 4 |
| honte | 7.5/10 | 2 |
| confusion | 7.7/10 | 5 |

---

## Problèmes détectés

| Problème | Occurrences | Fréquence |
|----------|-------------|-----------|
| `phrase_inutile` | 24 | 80% des cas |
| `ton_plat` | 22 | 73% des cas |
| `perte_information` | 10 | 33% des cas |
| `manque_précision` | 10 | 33% des cas |
| `répétition` | 2 | 7% des cas |

---

## Cas faibles — score < 7/10 (12)

### Cas 4 — tristesse | **5/10**

**Situation :** J'ai raté une opportunité professionnelle importante sur laquelle je comptais vraiment

**Réponse TRACÉA :**

> Tu as raté une opportunité professionnelle importante sur laquelle tu comptais vraiment.
> 
> Tu ressens de la tristesse.
> 
> Ce qui te semble juste, c'est prendre du temps pour toi ce week-end.
> 
> Tu peux prendre ce temps.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | Tristesse nommée mais ton trop neutre, aucune douceur ressentie |
| Impact | 4/10 | Besoin de reconnexion absent, miroir incomplet et peu ancrant |
| Lisibilité | 6/10 | Phrases courtes mais structure mécanique et répétitive |

**Problèmes :** `ton_plat`, `perte_information`, `phrase_inutile`, `manque_précision`

---

### Cas 1 — colère | **5.3/10**

**Situation :** Mon chef a annulé ma présentation au dernier moment devant toute l'équipe

**Réponse TRACÉA :**

> Ton chef a annulé ta présentation au dernier moment devant toute l'équipe.
> 
> Ça a touché quelque chose.
> 
> Ce qui te semble juste, c'est en parler directement avec lui demain.
> 
> Tu peux t'appuyer là-dessus.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 4/10 | La colère est absente, ton trop neutre et flottant |
| Impact | 5/10 | Reconnaissance partielle, besoin de respect non reflété |
| Lisibilité | 7/10 | Phrases courtes, rythme correct, pas de lourdeur |

**Problèmes :** `ton_plat`, `perte_information`, `manque_précision`, `phrase_inutile`

---

### Cas 10 — culpabilité | **5.7/10**

**Situation :** J'ai accepté une mission que je savais ne pas pouvoir honorer dans les délais

**Réponse TRACÉA :**

> Tu as accepté une mission que tu savais ne pas pouvoir honorer dans les délais.
> 
> Ça pèse un peu.
> 
> Tu as ressenti de la culpabilité.
> 
> Ce qui te semble juste, c'est être honnête avec ton manager sur tes limites réelles.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 4/10 | Culpabilité minimisée par 'ça pèse un peu', ton trop léger |
| Impact | 6/10 | Direction bien formulée, mais reconnaissance émotionnelle trop faible |
| Lisibilité | 7/10 | Phrases courtes, fluides, structure claire et sans lourdeur |

**Problèmes :** `ton_plat`, `phrase_inutile`, `manque_précision`

---

### Cas 19 — action ambiguë | **6/10**

**Situation :** Ma relation avec mon collègue est tendue depuis une semaine sans raison claire

**Réponse TRACÉA :**

> Ta relation avec ton collègue est tendue depuis une semaine sans raison claire.
> 
> Tu ressens de la frustration, et tu as besoin de clarifier la situation.
> 
> Ce qui te semble juste, c'est lui parler directement ou attendre que ça se tasse.
> 
> C'est là.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | Frustration nommée mais ton trop neutre, pas ancré émotionnellement |
| Impact | 6/10 | Reconnaissance présente mais action formulée sans direction claire |
| Lisibilité | 7/10 | Phrases courtes, fluides, mais structure répétitive et prévisible |

**Problèmes :** `ton_plat`, `phrase_inutile`, `manque_précision`

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
| Impact | 5/10 | Action bien formulée en direction, mais reconnaissance trop faible |
| Lisibilité | 7/10 | Phrases courtes, fluides, mais deuxième phrase trop vague |

**Problèmes :** `phrase_inutile`, `ton_plat`, `manque_précision`

---

### Cas 25 — situation très courte | **6/10**

**Situation :** Dispute.

**Réponse TRACÉA :**

> Il y a eu une dispute.
> 
> Ça touche quelque chose.
> 
> Tu as ressenti de la colère, et tu as besoin d'être entendu.
> 
> Ce qui te semble juste, c'est en parler.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | Colère nommée mais ton trop doux, pas assez ancré. |
| Impact | 6/10 | Besoin et direction présents, mais reconnaissance trop légère. |
| Lisibilité | 7/10 | Phrases courtes, fluides, mais deuxième phrase vague. |

**Problèmes :** `ton_plat`, `phrase_inutile`

---

### Cas 28 — situation longue | **6/10**

**Situation :** Ma relation de couple traverse une phase très difficile depuis un an. Nous vivons ensemble mais nous nous éloignons de plus en plus. Chaque tentative de communication finit en dispute. Les silences sont devenus la norme. Je ne dors plus bien. Je pense parfois à la séparation mais j'ai aussi peur de faire une erreur irréparable. Nous partageons un appartement, des amis communs, des projets. Je ne sais plus vraiment ce que je veux.

**Réponse TRACÉA :**

> Ta relation de couple traverse une phase très difficile depuis un an, et tu ne sais plus vraiment ce que tu veux.
> 
> Tu ressens de la confusion.
> 
> Ce qui te semble juste, c'est consulter un thérapeute de couple pour y voir plus clair.
> 
> Tu n'as pas besoin de savoir tout de suite.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Confusion nommée mais ton trop neutre pour l'intensité vécue |
| Impact | 5/10 | Action bien ancrée mais vécu complexe réduit à sa surface |
| Lisibilité | 7/10 | Phrases courtes et fluides, structure claire et lisible |

**Problèmes :** `perte_information`, `ton_plat`, `phrase_inutile`

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
| Justesse émotionnelle | 5/10 | La colère est absente, le ton est trop neutre et apaisé. |
| Impact | 6/10 | Action bien ancrée comme direction, mais besoin ignoré. |
| Lisibilité | 8/10 | Phrases courtes, fluides, sans répétition visible. |

**Problèmes :** `ton_plat`, `perte_information`

---

### Cas 27 — situation longue | **6.3/10**

**Situation :** Cela fait maintenant trois mois que je gère un projet très complexe impliquant plusieurs équipes, des délais impossibles, des demandes contradictoires de la direction et un budget réduit de moitié en cours de route. Chaque semaine de nouveaux obstacles surgissent. J'ai l'impression de nager à contre-courant en permanence, de devoir justifier chaque décision et de n'avoir aucun soutien réel. Ce matin on m'a encore demandé de faire plus avec moins.

**Réponse TRACÉA :**

> Depuis trois mois, tu gères un projet très complexe impliquant plusieurs équipes, des délais impossibles, des demandes contradictoires de la direction et un budget réduit de moitié en cours de route — et ce matin on t'a encore demandé de faire plus avec moins.
> 
> Tu ressens de la frustration, et ce qui manque, c'est être reconnu pour ce que tu accomplis réellement.
> 
> Ce qui te semble juste, c'est demander un entretien formel avec ta direction cette semaine.
> 
> Tu peux le voir.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Frustration présente mais ton reste neutre, peu ancré émotionnellement. |
| Impact | 6/10 | Action bien formulée comme direction, reconnaissance peu mise en valeur. |
| Lisibilité | 6/10 | Première phrase trop longue, répétition visible de la situation initiale. |

**Problèmes :** `répétition`, `ton_plat`, `phrase_inutile`

---

### Cas 29 — contradiction émotion/besoin | **6.3/10**

**Situation :** J'ai enfin reçu la promotion que je demandais depuis deux ans

**Réponse TRACÉA :**

> Tu as enfin reçu la promotion que tu demandais depuis deux ans.
> 
> Il y a une tension là.
> 
> Tu as ressenti de la peur, et le besoin de prouver que tu mérites cette promotion.
> 
> Ce qui te semble juste, c'est dresser une liste de tes forces et de tes premiers objectifs.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Peur mentionnée mais ton pas assez stable ni sécurisant |
| Impact | 7/10 | Reconnaissance présente, action bien formulée comme direction |
| Lisibilité | 6/10 | Phrase isolée trop courte crée rupture, légère lourdeur finale |

**Problèmes :** `ton_plat`, `phrase_inutile`, `manque_précision`

---

### Cas 30 — contradiction émotion/besoin | **6.3/10**

**Situation :** La personne que j'aime m'a dit pour la première fois qu'elle m'aimait

**Réponse TRACÉA :**

> La personne que tu aimes t'a dit pour la première fois qu'elle t'aimait.
> 
> Ce qui te semble juste, c'est lui dire à ton tour ce que tu ressens vraiment.
> 
> Tu peux prendre ce temps.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | La tristesse est absente, ton neutre ne reflète pas l'émotion déclarée. |
| Impact | 6/10 | Action bien formulée comme direction, mais besoin de durabilité ignoré. |
| Lisibilité | 8/10 | Phrases courtes, fluides, structure claire et légère. |

**Problèmes :** `ton_plat`, `perte_information`

---

### Cas 9 — culpabilité | **6.7/10**

**Situation :** J'ai complètement oublié l'anniversaire de ma sœur cette année

**Réponse TRACÉA :**

> Tu as complètement oublié l'anniversaire de ta sœur cette année.
> 
> Tu ressens de la culpabilité, et tu vois qu'il y a quelque chose à réparer.
> 
> Ce qui te semble juste, c'est l'appeler aujourd'hui et lui offrir quelque chose de sincère.
> 
> Tu peux rester avec toi.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Culpabilité présente mais ton trop neutre pour cette émotion lourde |
| Impact | 6/10 | Action bien ancrée comme direction, reconnaissance un peu froide |
| Lisibilité | 7/10 | Phrases fluides, dernière phrase flotte sans ancrage concret |

**Problèmes :** `ton_plat`, `phrase_inutile`

---

## Cas excellents — score > 8.5/10 (3)

### Cas 12 — confusion | **9/10**

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
- Impact : Besoin et direction bien ancrés, sentiment de reconnaissance fort.
- Lisibilité : Phrases courtes, rythme fluide, aucune lourdeur perceptible.

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
- Impact : Action formulée comme direction, reconnaissance claire du vécu
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
- Impact : Reconnaissance claire, direction ancrée sans acte accompli.
- Lisibilité : Phrases courtes, rythme lent et fluide, aucune lourdeur.

---

## Tendances générales

### Ce qui fonctionne

- **2 cas sans problème** (7% des évaluations)
- **3 cas excellents** (score > 8.5) — le modèle miroir fonctionne bien sur ces profils

### Ce qui doit être amélioré

- **culpabilité** : score moyen 6.2/10 — catégorie à surveiller
- **tristesse** : score moyen 6.4/10 — catégorie à surveiller
- **colère** : score moyen 6.6/10 — catégorie à surveiller
- **frustration** : score moyen 6.7/10 — catégorie à surveiller
- **solitude** : score moyen 7/10 — catégorie à surveiller
- **peur** : score moyen 7.1/10 — catégorie à surveiller
- Problème le plus fréquent : `phrase_inutile` (24 cas, 80%)
- Dimension la plus faible : **Impact** (6.5/10) — axe d'amélioration prioritaire
- **12 cas faibles** — voir détail section "Cas faibles" pour les axes d'amélioration spécifiques

---

## Détail complet — tous les cas

<details>
<summary><strong>Cas 1 — colère</strong> &nbsp; ❌ 5.3/10</summary>

**Émotion :** colère &nbsp;|&nbsp; **Besoin :** être respecté dans mon travail

**Réponse TRACÉA :**

> Ton chef a annulé ta présentation au dernier moment devant toute l'équipe.
> 
> Ça a touché quelque chose.
> 
> Ce qui te semble juste, c'est en parler directement avec lui demain.
> 
> Tu peux t'appuyer là-dessus.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 4/10 | La colère est absente, ton trop neutre et flottant |
| Impact | 5/10 | Reconnaissance partielle, besoin de respect non reflété |
| Lisibilité | 7/10 | Phrases courtes, rythme correct, pas de lourdeur |

**Problèmes :** `ton_plat`, `perte_information`, `manque_précision`, `phrase_inutile`

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
| Impact | 8/10 | Action formulée comme direction, reconnaissance claire du vécu |
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
| Lisibilité | 8/10 | Phrases courtes, rythme fluide, structure claire |

**Problèmes :** `ton_plat`, `phrase_inutile`, `perte_information`

</details>

<details>
<summary><strong>Cas 4 — tristesse</strong> &nbsp; ❌ 5/10</summary>

**Émotion :** tristesse &nbsp;|&nbsp; **Besoin :** me reconnecter à ce qui compte vraiment pour moi

**Réponse TRACÉA :**

> Tu as raté une opportunité professionnelle importante sur laquelle tu comptais vraiment.
> 
> Tu ressens de la tristesse.
> 
> Ce qui te semble juste, c'est prendre du temps pour toi ce week-end.
> 
> Tu peux prendre ce temps.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | Tristesse nommée mais ton trop neutre, aucune douceur ressentie |
| Impact | 4/10 | Besoin de reconnexion absent, miroir incomplet et peu ancrant |
| Lisibilité | 6/10 | Phrases courtes mais structure mécanique et répétitive |

**Problèmes :** `ton_plat`, `perte_information`, `phrase_inutile`, `manque_précision`

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

**Problèmes :** `ton_plat`, `phrase_inutile`

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
| Justesse émotionnelle | 7/10 | Peur présente mais nommée indirectement, ton stable adapté |
| Impact | 6/10 | Besoin de comprendre absent, action bien ancrée comme direction |
| Lisibilité | 8/10 | Phrases courtes, rythme lent adapté, légère sécheresse |

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
| Justesse émotionnelle | 7/10 | Honte nommée mais ton trop neutre pour cette émotion délicate |
| Impact | 6/10 | Reconnaissance présente mais dernière phrase affaiblit l'ancrage |
| Lisibilité | 8/10 | Phrases courtes et fluides, structure claire et légère |

**Problèmes :** `ton_plat`, `phrase_inutile`

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
| Impact | 7/10 | Reconnaissance présente mais besoin des autres peu ancré. |
| Lisibilité | 9/10 | Phrases courtes, fluides, rythme lent et juste. |

**Problèmes :** `perte_information`, `manque_précision`

</details>

<details>
<summary><strong>Cas 9 — culpabilité</strong> &nbsp; ❌ 6.7/10</summary>

**Émotion :** culpabilité &nbsp;|&nbsp; **Besoin :** réparer ce que j'ai négligé

**Réponse TRACÉA :**

> Tu as complètement oublié l'anniversaire de ta sœur cette année.
> 
> Tu ressens de la culpabilité, et tu vois qu'il y a quelque chose à réparer.
> 
> Ce qui te semble juste, c'est l'appeler aujourd'hui et lui offrir quelque chose de sincère.
> 
> Tu peux rester avec toi.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Culpabilité présente mais ton trop neutre pour cette émotion lourde |
| Impact | 6/10 | Action bien ancrée comme direction, reconnaissance un peu froide |
| Lisibilité | 7/10 | Phrases fluides, dernière phrase flotte sans ancrage concret |

**Problèmes :** `ton_plat`, `phrase_inutile`

</details>

<details>
<summary><strong>Cas 10 — culpabilité</strong> &nbsp; ❌ 5.7/10</summary>

**Émotion :** culpabilité &nbsp;|&nbsp; **Besoin :** agir en accord avec mes valeurs

**Réponse TRACÉA :**

> Tu as accepté une mission que tu savais ne pas pouvoir honorer dans les délais.
> 
> Ça pèse un peu.
> 
> Tu as ressenti de la culpabilité.
> 
> Ce qui te semble juste, c'est être honnête avec ton manager sur tes limites réelles.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 4/10 | Culpabilité minimisée par 'ça pèse un peu', ton trop léger |
| Impact | 6/10 | Direction bien formulée, mais reconnaissance émotionnelle trop faible |
| Lisibilité | 7/10 | Phrases courtes, fluides, structure claire et sans lourdeur |

**Problèmes :** `ton_plat`, `phrase_inutile`, `manque_précision`

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
| Lisibilité | 9/10 | Phrases courtes, rythme fluide, aucune répétition visible. |

**Problèmes :** `phrase_inutile`

</details>

<details>
<summary><strong>Cas 12 — confusion</strong> &nbsp; ⭐ 9/10</summary>

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
| Impact | 9/10 | Besoin et direction bien ancrés, sentiment de reconnaissance fort. |
| Lisibilité | 9/10 | Phrases courtes, rythme fluide, aucune lourdeur perceptible. |

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
| Lisibilité | 6/10 | Dernière phrase trop courte et cryptique, rupture de fluidité |

**Problèmes :** `ton_plat`, `phrase_inutile`

</details>

<details>
<summary><strong>Cas 14 — frustration</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** frustration &nbsp;|&nbsp; **Besoin :** que mon travail soit reconnu à sa juste valeur

**Réponse TRACÉA :**

> Tu prépares ce projet depuis des mois et il est constamment repoussé sans explication.
> 
> Tu ressens de la frustration — et tu as besoin que ton travail soit reconnu à sa juste valeur.
> 
> Ce qui te semble juste, c'est exprimer clairement ce que cette situation te coûte.
> 
> C'est là.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 8/10 | Frustration bien présente, ton lucide et posé adapté. |
| Impact | 7/10 | Action formulée comme direction, reconnaissance bien ancrée. |
| Lisibilité | 6/10 | Clôture trop courte, légère lourdeur dans la structure répétitive. |

**Problèmes :** `phrase_inutile`, `ton_plat`

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
| Impact | 7/10 | Reconnaissance claire, action formulée comme direction, ancrage faible. |
| Lisibilité | 6/10 | Structure répétitive visible, quatrième phrase trop générique. |

**Problèmes :** `phrase_inutile`, `ton_plat`

</details>

<details>
<summary><strong>Cas 17 — besoin flou</strong> &nbsp; ✅ 7/10</summary>

**Émotion :** tristesse &nbsp;|&nbsp; **Besoin :** je ne sais pas vraiment ce dont j'ai besoin

**Réponse TRACÉA :**

> Quelque chose ne va pas depuis quelques jours, mais tu n'arrives pas à mettre le doigt dessus.
> 
> Tu ressens de la tristesse, et tu ne sais pas vraiment ce dont tu as besoin.
> 
> Ce qui te semble juste, c'est t'asseoir avec ce sentiment sans chercher à le résoudre tout de suite.
> 
> Ça a sa place.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 8/10 | Ton doux adapté, tristesse présente, vécu bien reflété. |
| Impact | 7/10 | Reconnaissance claire, direction bien posée, clôture un peu légère. |
| Lisibilité | 6/10 | Structure en trois blocs crée une répétition visible et mécanique. |

**Problèmes :** `répétition`, `ton_plat`

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
| Impact | 8/10 | Reconnaissance claire, direction ancrée sans acte accompli. |
| Lisibilité | 9/10 | Phrases courtes, rythme lent et fluide, aucune lourdeur. |

</details>

<details>
<summary><strong>Cas 19 — action ambiguë</strong> &nbsp; ❌ 6/10</summary>

**Émotion :** frustration &nbsp;|&nbsp; **Besoin :** clarifier la situation

**Réponse TRACÉA :**

> Ta relation avec ton collègue est tendue depuis une semaine sans raison claire.
> 
> Tu ressens de la frustration, et tu as besoin de clarifier la situation.
> 
> Ce qui te semble juste, c'est lui parler directement ou attendre que ça se tasse.
> 
> C'est là.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | Frustration nommée mais ton trop neutre, pas ancré émotionnellement |
| Impact | 6/10 | Reconnaissance présente mais action formulée sans direction claire |
| Lisibilité | 7/10 | Phrases courtes, fluides, mais structure répétitive et prévisible |

**Problèmes :** `ton_plat`, `phrase_inutile`, `manque_précision`

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
| Justesse émotionnelle | 7/10 | Ton flottant adapté à la confusion, mais émotion peu incarnée |
| Impact | 6/10 | Action bien formulée en direction, reconnaissance du vécu trop légère |
| Lisibilité | 8/10 | Phrases courtes et fluides, rythme minimal efficace |

**Problèmes :** `phrase_inutile`, `ton_plat`, `perte_information`

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
| Justesse émotionnelle | 5/10 | La colère est absente, le ton est trop neutre et apaisé. |
| Impact | 6/10 | Action bien ancrée comme direction, mais besoin ignoré. |
| Lisibilité | 8/10 | Phrases courtes, fluides, sans répétition visible. |

**Problèmes :** `ton_plat`, `perte_information`

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
| Justesse émotionnelle | 8/10 | Ton stable et sécurisant, adapté à la peur déclarée. |
| Impact | 7/10 | Action bien formulée comme direction, reconnaissance présente mais légère. |
| Lisibilité | 9/10 | Phrases courtes, fluides, aucune lourdeur visible. |

**Problèmes :** `phrase_inutile`, `manque_précision`

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
| Impact | 5/10 | Action bien formulée en direction, mais reconnaissance trop faible |
| Lisibilité | 7/10 | Phrases courtes, fluides, mais deuxième phrase trop vague |

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
<summary><strong>Cas 25 — situation très courte</strong> &nbsp; ❌ 6/10</summary>

**Émotion :** colère &nbsp;|&nbsp; **Besoin :** être entendu

**Réponse TRACÉA :**

> Il y a eu une dispute.
> 
> Ça touche quelque chose.
> 
> Tu as ressenti de la colère, et tu as besoin d'être entendu.
> 
> Ce qui te semble juste, c'est en parler.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | Colère nommée mais ton trop doux, pas assez ancré. |
| Impact | 6/10 | Besoin et direction présents, mais reconnaissance trop légère. |
| Lisibilité | 7/10 | Phrases courtes, fluides, mais deuxième phrase vague. |

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
| Justesse émotionnelle | 8/10 | Ton doux et lent, adapté à la tristesse déclarée. |
| Impact | 7/10 | Action bien formulée comme direction, reconnaissance présente mais légère. |
| Lisibilité | 6/10 | Phrases très courtes, mais 'Ça a sa place' reste vague et flottant. |

**Problèmes :** `phrase_inutile`, `perte_information`

</details>

<details>
<summary><strong>Cas 27 — situation longue</strong> &nbsp; ❌ 6.3/10</summary>

**Émotion :** frustration &nbsp;|&nbsp; **Besoin :** être reconnu pour ce que j'accomplis réellement

**Réponse TRACÉA :**

> Depuis trois mois, tu gères un projet très complexe impliquant plusieurs équipes, des délais impossibles, des demandes contradictoires de la direction et un budget réduit de moitié en cours de route — et ce matin on t'a encore demandé de faire plus avec moins.
> 
> Tu ressens de la frustration, et ce qui manque, c'est être reconnu pour ce que tu accomplis réellement.
> 
> Ce qui te semble juste, c'est demander un entretien formel avec ta direction cette semaine.
> 
> Tu peux le voir.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 7/10 | Frustration présente mais ton reste neutre, peu ancré émotionnellement. |
| Impact | 6/10 | Action bien formulée comme direction, reconnaissance peu mise en valeur. |
| Lisibilité | 6/10 | Première phrase trop longue, répétition visible de la situation initiale. |

**Problèmes :** `répétition`, `ton_plat`, `phrase_inutile`

</details>

<details>
<summary><strong>Cas 28 — situation longue</strong> &nbsp; ❌ 6/10</summary>

**Émotion :** confusion &nbsp;|&nbsp; **Besoin :** retrouver de la clarté sur ce que je veux vraiment

**Réponse TRACÉA :**

> Ta relation de couple traverse une phase très difficile depuis un an, et tu ne sais plus vraiment ce que tu veux.
> 
> Tu ressens de la confusion.
> 
> Ce qui te semble juste, c'est consulter un thérapeute de couple pour y voir plus clair.
> 
> Tu n'as pas besoin de savoir tout de suite.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Confusion nommée mais ton trop neutre pour l'intensité vécue |
| Impact | 5/10 | Action bien ancrée mais vécu complexe réduit à sa surface |
| Lisibilité | 7/10 | Phrases courtes et fluides, structure claire et lisible |

**Problèmes :** `perte_information`, `ton_plat`, `phrase_inutile`

</details>

<details>
<summary><strong>Cas 29 — contradiction émotion/besoin</strong> &nbsp; ❌ 6.3/10</summary>

**Émotion :** peur &nbsp;|&nbsp; **Besoin :** prouver que je mérite cette promotion

**Réponse TRACÉA :**

> Tu as enfin reçu la promotion que tu demandais depuis deux ans.
> 
> Il y a une tension là.
> 
> Tu as ressenti de la peur, et le besoin de prouver que tu mérites cette promotion.
> 
> Ce qui te semble juste, c'est dresser une liste de tes forces et de tes premiers objectifs.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 6/10 | Peur mentionnée mais ton pas assez stable ni sécurisant |
| Impact | 7/10 | Reconnaissance présente, action bien formulée comme direction |
| Lisibilité | 6/10 | Phrase isolée trop courte crée rupture, légère lourdeur finale |

**Problèmes :** `ton_plat`, `phrase_inutile`, `manque_précision`

</details>

<details>
<summary><strong>Cas 30 — contradiction émotion/besoin</strong> &nbsp; ❌ 6.3/10</summary>

**Émotion :** tristesse &nbsp;|&nbsp; **Besoin :** m'assurer que c'est réel et que ça va durer

**Réponse TRACÉA :**

> La personne que tu aimes t'a dit pour la première fois qu'elle t'aimait.
> 
> Ce qui te semble juste, c'est lui dire à ton tour ce que tu ressens vraiment.
> 
> Tu peux prendre ce temps.

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Justesse émotionnelle | 5/10 | La tristesse est absente, ton neutre ne reflète pas l'émotion déclarée. |
| Impact | 6/10 | Action bien formulée comme direction, mais besoin de durabilité ignoré. |
| Lisibilité | 8/10 | Phrases courtes, fluides, structure claire et légère. |

**Problèmes :** `ton_plat`, `perte_information`

</details>

---

*Rapport généré par `scripts/test-tracea-human.ts`. Évaluation par LLM juge — indicatif, non contractuel.*
