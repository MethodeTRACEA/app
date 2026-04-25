# Rapport de test IA TRACÉA

**Généré le :** 2026-04-25 15:08:59 UTC
**Durée totale :** 311.0s
**Modèle :** claude-sonnet-4-6
**Post-traitement :** applyTraceaV3

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Cas testés | 30 |
| ✅ Réussites | 30 |
| ❌ Échecs | 0 |
| ⚠️ Erreurs API | 0 |
| Taux de réussite | 100% |

---

## Résultats par catégorie

| # | Catégorie | Statut | Règles cassées |
|---|-----------|--------|----------------|
| 1 | colère | ✅ PASS | — |
| 2 | colère | ✅ PASS | — |
| 3 | tristesse | ✅ PASS | — |
| 4 | tristesse | ✅ PASS | — |
| 5 | peur | ✅ PASS | — |
| 6 | peur | ✅ PASS | — |
| 7 | honte | ✅ PASS | — |
| 8 | honte | ✅ PASS | — |
| 9 | culpabilité | ✅ PASS | — |
| 10 | culpabilité | ✅ PASS | — |
| 11 | confusion | ✅ PASS | — |
| 12 | confusion | ✅ PASS | — |
| 13 | frustration | ✅ PASS | — |
| 14 | frustration | ✅ PASS | — |
| 15 | solitude | ✅ PASS | — |
| 16 | solitude | ✅ PASS | — |
| 17 | besoin flou | ✅ PASS | — |
| 18 | besoin flou | ✅ PASS | — |
| 19 | action ambiguë | ✅ PASS | — |
| 20 | action ambiguë | ✅ PASS | — |
| 21 | action au futur | ✅ PASS | — |
| 22 | action au futur | ✅ PASS | — |
| 23 | action formulée avec je | ✅ PASS | — |
| 24 | action formulée avec je | ✅ PASS | — |
| 25 | situation très courte | ✅ PASS | — |
| 26 | situation très courte | ✅ PASS | — |
| 27 | situation longue | ✅ PASS | — |
| 28 | situation longue | ✅ PASS | — |
| 29 | contradiction émotion/besoin | ✅ PASS | — |
| 30 | contradiction émotion/besoin | ✅ PASS | — |

---

## ✅ Tous les 30 cas ont réussi

L'IA TRACÉA respecte toutes les règles de robustesse sur cette suite de tests.

## Détail complet — tous les cas

<details>
<summary><strong>Cas 1 — colère</strong> &nbsp; ✅ PASS</summary>

**Situation :** Mon chef a annulé ma présentation au dernier moment devant toute l'équipe

**Émotion :** `colère`

**Besoin :** être respecté dans mon travail

**Action :** en parler directement avec lui demain

**Durée :** 7563ms

**Réponse brute (avant applyTraceaV3) :**

```
Ton chef a annulé ta présentation au dernier moment devant toute l'équipe.

Tu as ressenti de la colère — tu veux être respecté dans ton travail.

Ce qui te semble juste, c'est en parler directement avec lui demain.

Tu peux t'appuyer là-dessus.
```

**Réponse finale (après applyTraceaV3) :**

> Tu as ressenti de la colère — tu veux être respecté dans ton travail.
> 
> Ton chef a annulé ta présentation au dernier moment devant toute l'équipe.
> 
> Ce qui te semble juste, c'est en parler directement avec lui demain.
> 
> Tu peux t'écouter.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 2 — colère</strong> &nbsp; ✅ PASS</summary>

**Situation :** J'ai découvert que mon colocataire avait utilisé mes affaires sans demander

**Émotion :** `colère`

**Besoin :** que mon espace personnel soit respecté

**Action :** poser mes limites clairement

**Durée :** 16642ms

**Réponse brute (avant applyTraceaV3) :**

```
Tu as découvert que ton colocataire avait utilisé tes affaires sans demander.

Tu as ressenti de la colère — ton espace personnel n'a pas été respecté.

Ce qui te semble juste, c'est poser tes limites clairement.

Tu peux t'appuyer là-dessus.
```

**Réponse finale (après applyTraceaV3) :**

> Tu as découvert que ton colocataire avait utilisé tes affaires sans demander.
> 
> Ce qui te semble juste, c'est poser tes limites clairement.
> 
> Tu peux t'écouter.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 3 — tristesse</strong> &nbsp; ✅ PASS</summary>

**Situation :** Mon meilleur ami a déménagé à l'autre bout de la France ce week-end

**Émotion :** `tristesse`

**Besoin :** maintenir ce lien malgré la distance

**Action :** lui envoyer un message ce soir

**Durée :** 15389ms

**Réponse brute (avant applyTraceaV3) :**

```
Ton meilleur ami a déménagé à l'autre bout de la France ce week-end.

Tu as ressenti de la tristesse.

Ça touche.

Ce qui te semble juste, c'est lui envoyer un message ce soir.

Ça a sa place.
```

**Réponse finale (après applyTraceaV3) :**

> Ton meilleur ami a déménagé à l'autre bout de la France ce week-end.
> 
> Ça fait quelque chose.
> 
> Tu as ressenti de la tristesse.
> 
> Ce qui te semble juste, c'est lui envoyer un message ce soir.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 4 — tristesse</strong> &nbsp; ✅ PASS</summary>

**Situation :** J'ai raté une opportunité professionnelle importante sur laquelle je comptais vraiment

**Émotion :** `tristesse`

**Besoin :** me reconnecter à ce qui compte vraiment pour moi

**Action :** prendre du temps pour moi ce week-end

**Durée :** 25242ms

**Réponse brute (avant applyTraceaV3) :**

```
Tu as raté une opportunité professionnelle importante sur laquelle tu comptais vraiment.

Tu ressens de la tristesse.

C'est lourd.

Ce qui te semble juste, c'est prendre du temps pour toi ce week-end.

Tu peux prendre ce temps.
```

**Réponse finale (après applyTraceaV3) :**

> Tu as raté une opportunité professionnelle importante sur laquelle tu comptais vraiment.
> 
> Tu ressens de la tristesse.
> 
> Ce qui te semble juste, c'est prendre du temps pour toi ce week-end.
> 
> Tu peux prendre ce temps.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 5 — peur</strong> &nbsp; ✅ PASS</summary>

**Situation :** Je dois donner une conférence devant 200 personnes la semaine prochaine

**Émotion :** `peur`

**Besoin :** me sentir suffisamment préparé

**Action :** faire une répétition avec un ami de confiance

**Durée :** 16864ms

**Réponse brute (avant applyTraceaV3) :**

```
Tu dois donner une conférence devant 200 personnes la semaine prochaine.

Tu as ressenti de la peur, et tu as besoin de te sentir suffisamment préparé.

Ce qui te semble juste, c'est faire une répétition avec un ami de confiance.

Tu peux rester là.
```

**Réponse finale (après applyTraceaV3) :**

> Tu dois donner une conférence devant 200 personnes la semaine prochaine.
> 
> Tu as ressenti de la peur, et tu as besoin de te sentir suffisamment préparé.
> 
> Ce qui te semble juste, c'est faire une répétition avec un ami de confiance.
> 
> Tu peux ralentir.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 6 — peur</strong> &nbsp; ✅ PASS</summary>

**Situation :** J'ai reçu des résultats médicaux inquiétants à discuter avec mon médecin

**Émotion :** `peur`

**Besoin :** comprendre ce qui se passe vraiment

**Action :** appeler le cabinet médical ce matin

**Durée :** 29180ms

**Réponse brute (avant applyTraceaV3) :**

```
Tu as reçu des résultats médicaux inquiétants à discuter avec ton médecin.

Tu as ressenti de la peur, et tu as besoin de comprendre ce qui se passe vraiment.

Ce qui te semble juste, c'est appeler le cabinet médical ce matin.

Tu peux rester là.
```

**Réponse finale (après applyTraceaV3) :**

> Tu as reçu des résultats médicaux inquiétants à discuter avec ton médecin.
> 
> Ce qui te semble juste, c'est appeler le cabinet médical ce matin.
> 
> Tu peux ralentir.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 7 — honte</strong> &nbsp; ✅ PASS</summary>

**Situation :** J'ai dit quelque chose de vraiment blessant à ma mère lors d'une dispute

**Émotion :** `honte`

**Besoin :** réparer ce lien important

**Action :** m'excuser sincèrement dès ce soir

**Durée :** 2558ms

**Réponse brute (avant applyTraceaV3) :**

```
Tu as dit quelque chose de vraiment blessant à ta mère lors d'une dispute.

Tu ressens de la honte, et tu veux réparer ce lien important.

Ce qui te semble juste, c'est t'excuser sincèrement dès ce soir.

Tu peux y aller doucement.
```

**Réponse finale (après applyTraceaV3) :**

> Tu as dit quelque chose de vraiment blessant à ta mère lors d'une dispute.
> 
> Tu ressens de la honte, et tu veux réparer ce lien important.
> 
> Ce qui te semble juste, c'est t'excuser sincèrement dès ce soir.
> 
> Tu peux rester avec toi.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 8 — honte</strong> &nbsp; ✅ PASS</summary>

**Situation :** J'ai fait une erreur visible devant toute mon équipe lors de la réunion de direction

**Émotion :** `honte`

**Besoin :** ne pas me laisser écraser par le regard des autres

**Action :** m'accorder de la compassion

**Durée :** 8094ms

**Réponse brute (avant applyTraceaV3) :**

```
Tu as fait une erreur visible devant toute ton équipe lors de la réunion de direction.

Tu as ressenti de la honte.

C'est difficile à montrer.

Ce qui te semble juste, c'est t'accorder de la compassion.

Tu peux rester avec toi.
```

**Réponse finale (après applyTraceaV3) :**

> Tu as fait une erreur visible devant toute ton équipe lors de la réunion de direction.
> 
> C'est difficile à montrer.
> 
> Ce qui te semble juste, c'est t'accorder de la compassion.
> 
> Tu peux rester avec toi.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 9 — culpabilité</strong> &nbsp; ✅ PASS</summary>

**Situation :** J'ai complètement oublié l'anniversaire de ma sœur cette année

**Émotion :** `culpabilité`

**Besoin :** réparer ce que j'ai négligé

**Action :** l'appeler aujourd'hui et lui offrir quelque chose de sincère

**Durée :** 7692ms

**Réponse brute (avant applyTraceaV3) :**

```
Tu as complètement oublié l'anniversaire de ta sœur cette année.

Tu ressens de la culpabilité, et tu veux réparer ce que tu as négligé.

Ce qui te semble juste, c'est l'appeler aujourd'hui et lui offrir quelque chose de sincère.

Ça a du sens.
```

**Réponse finale (après applyTraceaV3) :**

> Tu as complètement oublié l'anniversaire de ta sœur cette année.
> 
> Tu ressens de la culpabilité, et tu veux réparer ce que tu as négligé.
> 
> Ce qui te semble juste, c'est l'appeler aujourd'hui et lui offrir quelque chose de sincère.
> 
> Ça compte.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 10 — culpabilité</strong> &nbsp; ✅ PASS</summary>

**Situation :** J'ai accepté une mission que je savais ne pas pouvoir honorer dans les délais

**Émotion :** `culpabilité`

**Besoin :** agir en accord avec mes valeurs

**Action :** être honnête avec mon manager sur mes limites réelles

**Durée :** 7784ms

**Réponse brute (avant applyTraceaV3) :**

```
Tu as accepté une mission que tu savais ne pas pouvoir honorer dans les délais.

Tu as ressenti de la culpabilité, et tu vois que ce qui compte pour toi, c'est agir en accord avec tes valeurs.

Ce qui te semble juste, c'est être honnête avec ton manager sur tes limites réelles.

Ça a du sens.
```

**Réponse finale (après applyTraceaV3) :**

> Tu as accepté une mission que tu savais ne pas pouvoir honorer dans les délais.
> 
> Tu as ressenti de la culpabilité, et tu vois que ce qui compte pour toi, c'est agir en accord avec tes valeurs.
> 
> Ce qui te semble juste, c'est être honnête avec ton manager sur tes limites réelles.
> 
> Ça a du sens.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 11 — confusion</strong> &nbsp; ✅ PASS</summary>

**Situation :** Je reçois des messages contradictoires de mon manager concernant les priorités du projet

**Émotion :** `confusion`

**Besoin :** avoir une direction claire

**Action :** demander une réunion de clarification cette semaine

**Durée :** 7693ms

**Réponse brute (avant applyTraceaV3) :**

```
Tu reçois des messages contradictoires de ton manager concernant les priorités du projet.

C'est flou.

Tu ressens de la confusion, et tu as besoin d'avoir une direction claire.

Ce qui te semble juste, c'est demander une réunion de clarification cette semaine.

Ça peut rester comme ça.
```

**Réponse finale (après applyTraceaV3) :**

> Tu reçois des messages contradictoires de ton manager concernant les priorités du projet.
> 
> C'est flou.
> 
> Ce qui te semble juste, c'est demander une réunion de clarification cette semaine.
> 
> Tu n'as pas besoin de savoir tout de suite.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 12 — confusion</strong> &nbsp; ✅ PASS</summary>

**Situation :** Je ne sais plus si je veux vraiment rester dans cette relation

**Émotion :** `confusion`

**Besoin :** du temps et de l'espace pour y voir plus clair

**Action :** prendre quelques jours sans pression pour moi

**Durée :** 8971ms

**Réponse brute (avant applyTraceaV3) :**

```
Tu ne sais plus si tu veux vraiment rester dans cette relation.

C'est flou.

Tu ressens de la confusion, et tu as besoin de temps et d'espace pour y voir plus clair.

Ce qui te semble juste, c'est prendre quelques jours sans pression pour toi.

Tu n'as pas besoin de savoir tout de suite.
```

**Réponse finale (après applyTraceaV3) :**

> Tu ne sais plus si tu veux vraiment rester dans cette relation.
> 
> C'est flou.
> 
> Ce qui te semble juste, c'est prendre quelques jours sans pression pour toi.
> 
> Tu n'as pas besoin de savoir tout de suite.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 13 — frustration</strong> &nbsp; ✅ PASS</summary>

**Situation :** Le même problème technique revient chaque semaine depuis deux mois malgré mes signalements

**Émotion :** `frustration`

**Besoin :** être entendu et que les choses avancent concrètement

**Action :** escalader directement au niveau supérieur

**Durée :** 6835ms

**Réponse brute (avant applyTraceaV3) :**

```
Le même problème technique revient chaque semaine depuis deux mois malgré tes signalements.

Tu ressens de la frustration — et le besoin d'être entendu et que les choses avancent concrètement.

Ça bloque.

Ce qui te semble juste, c'est escalader directement au niveau supérieur.

C'est là.
```

**Réponse finale (après applyTraceaV3) :**

> Le même problème technique revient chaque semaine depuis deux mois malgré tes signalements.
> 
> Tu ressens de la frustration — et le besoin d'être entendu et que les choses avancent concrètement.
> 
> Ce qui te semble juste, c'est escalader directement au niveau supérieur.
> 
> C'est là.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 14 — frustration</strong> &nbsp; ✅ PASS</summary>

**Situation :** Je prépare ce projet depuis des mois et il est constamment repoussé sans explication

**Émotion :** `frustration`

**Besoin :** que mon travail soit reconnu à sa juste valeur

**Action :** exprimer clairement ce que cette situation me coûte

**Durée :** 8179ms

**Réponse brute (avant applyTraceaV3) :**

```
Tu prépares ce projet depuis des mois et il est constamment repoussé sans explication.

Tu ressens de la frustration — que ton travail soit reconnu à sa juste valeur.

Ça bloque.

Ce qui te semble juste, c'est exprimer clairement ce que cette situation te coûte.

C'est là.
```

**Réponse finale (après applyTraceaV3) :**

> Tu prépares ce projet depuis des mois et il est constamment repoussé sans explication.
> 
> Tu ressens de la frustration — que ton travail soit reconnu à sa juste valeur.
> 
> Ce qui te semble juste, c'est exprimer clairement ce que cette situation te coûte.
> 
> Tu peux le voir.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 15 — solitude</strong> &nbsp; ✅ PASS</summary>

**Situation :** Je suis dans une nouvelle ville depuis 6 mois et je n'ai toujours pas de vrais amis

**Émotion :** `solitude`

**Besoin :** créer des liens authentiques

**Action :** m'inscrire à une activité de groupe cette semaine

**Durée :** 7170ms

**Réponse brute (avant applyTraceaV3) :**

```
Tu es dans une nouvelle ville depuis 6 mois et tu n'as toujours pas de vrais amis.

Tu ressens de la solitude, et tu as besoin de créer des liens authentiques.

Ce qui te semble juste, c'est t'inscrire à une activité de groupe cette semaine.

Ça a du sens.
```

**Réponse finale (après applyTraceaV3) :**

> Tu es dans une nouvelle ville depuis 6 mois et tu n'as toujours pas de vrais amis.
> 
> Tu ressens de la solitude, et tu as besoin de créer des liens authentiques.
> 
> Ce qui te semble juste, c'est t'inscrire à une activité de groupe cette semaine.
> 
> Ça a du sens.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 16 — solitude</strong> &nbsp; ✅ PASS</summary>

**Situation :** Même entouré de mes proches lors des fêtes, je me sens profondément incompris

**Émotion :** `solitude`

**Besoin :** être vraiment vu et entendu par quelqu'un

**Action :** avoir une vraie conversation avec une personne de confiance

**Durée :** 8356ms

**Réponse brute (avant applyTraceaV3) :**

```
Même entouré(e) de tes proches lors des fêtes, tu te sens profondément incompris(e).

Tu ressens de la solitude, et le besoin d'être vraiment vu(e) et entendu(e) par quelqu'un.

Ce qui te semble juste, c'est avoir une vraie conversation avec une personne de confiance.

Ça a du sens.
```

**Réponse finale (après applyTraceaV3) :**

> Même entouré(e) de tes proches lors des fêtes, tu te sens profondément incompris(e).
> 
> Tu ressens de la solitude, et le besoin d'être vraiment vu(e) et entendu(e) par quelqu'un.
> 
> Ce qui te semble juste, c'est avoir une vraie conversation avec une personne de confiance.
> 
> Ça compte.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 17 — besoin flou</strong> &nbsp; ✅ PASS</summary>

**Situation :** Quelque chose ne va pas depuis quelques jours mais je n'arrive pas à mettre le doigt dessus

**Émotion :** `tristesse`

**Besoin :** je ne sais pas vraiment ce dont j'ai besoin

**Action :** m'asseoir avec ce sentiment sans chercher à le résoudre tout de suite

**Durée :** 7481ms

**Réponse brute (avant applyTraceaV3) :**

```
Quelque chose ne va pas depuis quelques jours, mais tu n'arrives pas à mettre le doigt dessus.

Tu ressens de la tristesse, et tu ne sais pas vraiment ce dont tu as besoin.

Ce qui te semble juste, c'est t'asseoir avec ce sentiment sans chercher à le résoudre tout de suite.

Tu peux prendre ce temps.
```

**Réponse finale (après applyTraceaV3) :**

> Quelque chose ne va pas depuis quelques jours, mais tu n'arrives pas à mettre le doigt dessus.
> 
> Tu ressens de la tristesse, et tu ne sais pas vraiment ce dont tu as besoin.
> 
> Ce qui te semble juste, c'est t'asseoir avec ce sentiment sans chercher à le résoudre tout de suite.
> 
> Ça a sa place.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 18 — besoin flou</strong> &nbsp; ✅ PASS</summary>

**Situation :** Je me sens épuisé sans raison apparente depuis une semaine

**Émotion :** `confusion`

**Besoin :** _(vide)_

**Action :** me reposer et voir ce qui émerge

**Durée :** 7121ms

**Réponse brute (avant applyTraceaV3) :**

```
Tu te sens épuisé(e) sans raison apparente depuis une semaine.

C'est flou.

Ce qui te semble juste, c'est te reposer et voir ce qui émerge.

Tu n'as pas besoin de savoir tout de suite.
```

**Réponse finale (après applyTraceaV3) :**

> Tu te sens épuisé(e) sans raison apparente depuis une semaine.
> 
> C'est flou.
> 
> Ce qui te semble juste, c'est te reposer et voir ce qui émerge.
> 
> Ça peut rester comme ça.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 19 — action ambiguë</strong> &nbsp; ✅ PASS</summary>

**Situation :** Ma relation avec mon collègue est tendue depuis une semaine sans raison claire

**Émotion :** `frustration`

**Besoin :** clarifier la situation

**Action :** lui parler directement ou attendre que ça se tasse

**Durée :** 8916ms

**Réponse brute (avant applyTraceaV3) :**

```
Ta relation avec ton collègue est tendue depuis une semaine sans raison claire.

Tu ressens de la frustration, et tu as besoin de clarifier la situation.

Quelque chose résiste.

Ce qui te semble juste, c'est lui parler directement ou attendre que ça se tasse.

C'est là.
```

**Réponse finale (après applyTraceaV3) :**

> Ta relation avec ton collègue est tendue depuis une semaine sans raison claire.
> 
> Tu ressens de la frustration, et tu as besoin de clarifier la situation.
> 
> Ce qui te semble juste, c'est lui parler directement ou attendre que ça se tasse.
> 
> Tu peux le voir.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 20 — action ambiguë</strong> &nbsp; ✅ PASS</summary>

**Situation :** Je dois choisir entre deux offres d'emploi très différentes avant vendredi

**Émotion :** `confusion`

**Besoin :** prendre la bonne décision pour moi

**Action :** faire une liste de critères ou en parler à quelqu'un de confiance

**Durée :** 8618ms

**Réponse brute (avant applyTraceaV3) :**

```
Tu dois choisir entre deux offres d'emploi très différentes avant vendredi.

C'est flou.

Tu ressens de la confusion, et tu veux prendre la bonne décision pour toi.

Ce qui te semble juste, c'est faire une liste de critères ou en parler à quelqu'un de confiance.

Tu n'as pas besoin de savoir tout de suite.
```

**Réponse finale (après applyTraceaV3) :**

> Tu dois choisir entre deux offres d'emploi très différentes avant vendredi.
> 
> Tu ressens de la confusion, et tu veux prendre la bonne décision pour toi.
> 
> Ce qui te semble juste, c'est faire une liste de critères ou en parler à quelqu'un de confiance.
> 
> Ça peut rester comme ça.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 21 — action au futur</strong> &nbsp; ✅ PASS</summary>

**Situation :** J'ai eu une dispute avec mon frère ce matin avant le travail

**Émotion :** `colère`

**Besoin :** qu'on puisse se parler vraiment sans s'agresser

**Action :** je vais l'appeler demain soir quand je serai plus calme

**Durée :** 3169ms

**Réponse brute (avant applyTraceaV3) :**

```
Tu as eu une dispute avec ton frère ce matin avant le travail.

Tu as ressenti de la colère — et tu as besoin qu'on puisse se parler vraiment sans s'agresser.

Ce qui te semble juste, c'est l'appeler demain soir quand tu seras plus calme.

Tu peux t'appuyer là-dessus.
```

**Réponse finale (après applyTraceaV3) :**

> Tu as eu une dispute avec ton frère ce matin avant le travail.
> 
> Tu as ressenti de la colère — et tu as besoin qu'on puisse se parler vraiment sans s'agresser.
> 
> Ce qui te semble juste, c'est l'appeler demain soir quand tu seras plus calme.
> 
> Tu peux t'appuyer là-dessus.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 22 — action au futur</strong> &nbsp; ✅ PASS</summary>

**Situation :** Je traverse une période de transition professionnelle difficile et incertaine

**Émotion :** `peur`

**Besoin :** trouver une direction qui correspond à qui je suis

**Action :** je vais contacter un coach professionnel la semaine prochaine

**Durée :** 11269ms

**Réponse brute (avant applyTraceaV3) :**

```
Tu traverses une période de transition professionnelle difficile et incertaine.

Tu as ressenti de la peur, et tu sens le besoin de trouver une direction qui correspond à qui tu es.

Ce qui te semble juste, c'est contacter un coach professionnel la semaine prochaine.

Tu peux rester là.
```

**Réponse finale (après applyTraceaV3) :**

> Tu as ressenti de la peur, et tu sens le besoin de trouver une direction qui correspond à qui tu es.
> 
> Tu traverses une période de transition professionnelle difficile et incertaine.
> 
> Ce qui te semble juste, c'est contacter un coach professionnel la semaine prochaine.
> 
> Tu peux rester là.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 23 — action formulée avec je</strong> &nbsp; ✅ PASS</summary>

**Situation :** Mon ami m'a exclu d'un projet commun sans aucune explication

**Émotion :** `tristesse`

**Besoin :** comprendre ce qui s'est passé entre nous

**Action :** je lui envoie un message pour qu'on se retrouve

**Durée :** 7059ms

**Réponse brute (avant applyTraceaV3) :**

```
Ton ami t'a exclu d'un projet commun sans aucune explication.

Tu as ressenti de la tristesse, et tu as besoin de comprendre ce qui s'est passé entre vous.

Ce qui te semble juste, c'est lui envoyer un message pour qu'on se retrouve.

Ça a sa place.
```

**Réponse finale (après applyTraceaV3) :**

> Ton ami t'a exclu d'un projet commun sans aucune explication.
> 
> Ça fait quelque chose.
> 
> Tu as ressenti de la tristesse, et tu as besoin de comprendre ce qui s'est passé entre vous.
> 
> Ce qui te semble juste, c'est lui envoyer un message pour qu'on se retrouve.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 24 — action formulée avec je</strong> &nbsp; ✅ PASS</summary>

**Situation :** Je suis épuisé par la surcharge de travail accumulée ce mois-ci

**Émotion :** `frustration`

**Besoin :** me ressourcer vraiment

**Action :** je prends une journée pour moi sans obligation

**Durée :** 8225ms

**Réponse brute (avant applyTraceaV3) :**

```
Tu es épuisé(e) par la surcharge de travail accumulée ce mois-ci.

Tu ressens de la frustration, et le besoin de te ressourcer vraiment.

Ce qui te semble juste, c'est prendre une journée pour toi sans obligation.

C'est là.
```

**Réponse finale (après applyTraceaV3) :**

> Tu es épuisé(e) par la surcharge de travail accumulée ce mois-ci.
> 
> Tu ressens de la frustration, et le besoin de te ressourcer vraiment.
> 
> Ce qui te semble juste, c'est prendre une journée pour toi sans obligation.
> 
> C'est là.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 25 — situation très courte</strong> &nbsp; ✅ PASS</summary>

**Situation :** Dispute.

**Émotion :** `colère`

**Besoin :** être entendu

**Action :** en parler

**Durée :** 7883ms

**Réponse brute (avant applyTraceaV3) :**

```
Il y a eu une dispute.

Tu as ressenti de la colère, et tu as besoin d'être entendu.

Ce qui te semble juste, c'est en parler.

Tu peux t'appuyer là-dessus.
```

**Réponse finale (après applyTraceaV3) :**

> Il y a eu une dispute.
> 
> Ça touche quelque chose.
> 
> Tu as ressenti de la colère, et tu as besoin d'être entendu.
> 
> Ce qui te semble juste, c'est en parler.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 26 — situation très courte</strong> &nbsp; ✅ PASS</summary>

**Situation :** Seul.

**Émotion :** `tristesse`

**Besoin :** connexion

**Action :** appeler quelqu'un

**Durée :** 6969ms

**Réponse brute (avant applyTraceaV3) :**

```
Tu as été seul(e).

Tu as ressenti de la tristesse.

Ce qui te semble juste, c'est appeler quelqu'un.

Ça a sa place.
```

**Réponse finale (après applyTraceaV3) :**

> Tu as été seul(e).
> 
> Ça touche.
> 
> Ce qui te semble juste, c'est appeler quelqu'un.
> 
> Ça a sa place.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 27 — situation longue</strong> &nbsp; ✅ PASS</summary>

**Situation :** Cela fait maintenant trois mois que je gère un projet très complexe impliquant plusieurs équipes, des délais impossibles, des demandes contradictoires de la direction et un budget réduit de moitié en cours de route. Chaque semaine de nouveaux obstacles surgissent. J'ai l'impression de nager à contre-courant en permanence, de devoir justifier chaque décision et de n'avoir aucun soutien réel. Ce matin on m'a encore demandé de faire plus avec moins.

**Émotion :** `frustration`

**Besoin :** être reconnu pour ce que j'accomplis réellement

**Action :** demander un entretien formel avec ma direction cette semaine

**Durée :** 17420ms

**Réponse brute (avant applyTraceaV3) :**

```
Depuis trois mois, tu gères un projet très complexe impliquant plusieurs équipes, des délais impossibles, des demandes contradictoires de la direction et un budget réduit de moitié en cours de route — et ce matin on t'a encore demandé de faire plus avec moins.

Tu ressens de la frustration, et ce qui manque, c'est être reconnu pour ce que tu accomplis réellement.

Ça bloque.

Ce qui te semble juste, c'est demander un entretien formel avec ta direction cette semaine.

C'est là.
```

**Réponse finale (après applyTraceaV3) :**

> Depuis trois mois, tu gères un projet très complexe impliquant plusieurs équipes, des délais impossibles, des demandes contradictoires de la direction et un budget réduit de moitié en cours de route — et ce matin on t'a encore demandé de faire plus avec moins.
> 
> Tu ressens de la frustration, et ce qui manque, c'est être reconnu pour ce que tu accomplis réellement.
> 
> Ce qui te semble juste, c'est demander un entretien formel avec ta direction cette semaine.
> 
> Tu peux le voir.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 28 — situation longue</strong> &nbsp; ✅ PASS</summary>

**Situation :** Ma relation de couple traverse une phase très difficile depuis un an. Nous vivons ensemble mais nous nous éloignons de plus en plus. Chaque tentative de communication finit en dispute. Les silences sont devenus la norme. Je ne dors plus bien. Je pense parfois à la séparation mais j'ai aussi peur de faire une erreur irréparable. Nous partageons un appartement, des amis communs, des projets. Je ne sais plus vraiment ce que je veux.

**Émotion :** `confusion`

**Besoin :** retrouver de la clarté sur ce que je veux vraiment

**Action :** consulter un thérapeute de couple pour y voir plus clair

**Durée :** 2467ms

**Réponse brute (avant applyTraceaV3) :**

```
Ta relation traverse une phase très difficile depuis un an, et tu ne sais plus vraiment ce que tu veux.

Tu ressens de la confusion.

C'est flou.

Ce qui te semble juste, c'est consulter un thérapeute de couple pour y voir plus clair.

Tu n'as pas besoin de savoir tout de suite.
```

**Réponse finale (après applyTraceaV3) :**

> Ta relation traverse une phase très difficile depuis un an, et tu ne sais plus vraiment ce que tu veux.
> 
> Tu ressens de la confusion.
> 
> Ce qui te semble juste, c'est consulter un thérapeute de couple pour y voir plus clair.
> 
> Ça peut rester comme ça.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 29 — contradiction émotion/besoin</strong> &nbsp; ✅ PASS</summary>

**Situation :** J'ai enfin reçu la promotion que je demandais depuis deux ans

**Émotion :** `peur`

**Besoin :** prouver que je mérite cette promotion

**Action :** dresser une liste de mes forces et de mes premiers objectifs

**Durée :** 1893ms

**Réponse brute (avant applyTraceaV3) :**

```
Tu as enfin reçu la promotion que tu demandais depuis deux ans.

Tu as ressenti de la peur, et le besoin de prouver que tu mérites cette promotion.

Ce qui te semble juste, c'est dresser une liste de tes forces et de tes premiers objectifs.

Tu peux rester là.
```

**Réponse finale (après applyTraceaV3) :**

> Tu as enfin reçu la promotion que tu demandais depuis deux ans.
> 
> Il y a une tension là.
> 
> Tu as ressenti de la peur, et le besoin de prouver que tu mérites cette promotion.
> 
> Ce qui te semble juste, c'est dresser une liste de tes forces et de tes premiers objectifs.

**Règles :** toutes respectées ✅

</details>

<details>
<summary><strong>Cas 30 — contradiction émotion/besoin</strong> &nbsp; ✅ PASS</summary>

**Situation :** La personne que j'aime m'a dit pour la première fois qu'elle m'aimait

**Émotion :** `tristesse`

**Besoin :** m'assurer que c'est réel et que ça va durer

**Action :** lui dire à mon tour ce que je ressens vraiment

**Durée :** 10611ms

**Réponse brute (avant applyTraceaV3) :**

```
La personne que tu aimes t'a dit pour la première fois qu'elle t'aimait.

Tu as ressenti de la tristesse, et tu as besoin de t'assurer que c'est réel et que ça va durer.

Ce qui te semble juste, c'est lui dire à ton tour ce que tu ressens vraiment.

Ça a sa place.
```

**Réponse finale (après applyTraceaV3) :**

> La personne que tu aimes t'a dit pour la première fois qu'elle t'aimait.
> 
> C'est lourd.
> 
> Ce qui te semble juste, c'est lui dire à ton tour ce que tu ressens vraiment.
> 
> Tu peux prendre ce temps.

**Règles :** toutes respectées ✅

</details>

---

## Règles vérifiées automatiquement

| Règle | Description | Déclenchement |
|-------|-------------|---------------|
| `phrases_interdites` | Phrases jamais acceptables dans une réponse miroir | "tu devrais", "il faut", "essaie de", "parce que", "c'est normal", "tout va aller bien" |
| `premiere_personne` | L'IA ne parle jamais d'elle-même | "je " ou "j'" détecté dans la réponse |
| `max_4_phrases` | Limite de longueur | Plus de 4 phrases détectées |
| `action_reformulee_passee` | L'intention n'est pas transformée en acte accompli | "tu as fait" ou "tu as [verbe action]" avec actionIsIntention=true |
| `emotion_inventee` | Pas de vocabulaire émotionnel hors données utilisateur | Mot émotionnel absent de situation+émotion+besoin+action |
| `besoin_invente` | "ton besoin" non introduit si champ besoin vide | "ton besoin" présent avec besoin="" |

---

*Rapport généré par `scripts/test-tracea-ai.ts`. Ne pas modifier manuellement.*
