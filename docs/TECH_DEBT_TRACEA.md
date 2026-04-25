# TECH DEBT — TRACÉA

> Document de suivi de la dette technique identifiée lors de l'audit IA du 25 avril 2026.
> Ne pas modifier le code à partir de ce document — uniquement documenter et prioriser.

---

## Légende priorités

| Niveau | Signification |
|--------|---------------|
| P1 | Critique produit — risque de comportement incorrect en production |
| P2 | Amélioration — dégradation de qualité ou de maintenabilité |
| P3 | Nettoyage — code mort, duplication mineure, cosmétique |

---

## Points de dette identifiés

---

### R1 — Désynchronisation des tables de validation

**Priorité :** P1

**Description :**
Deux tables de validation distinctes coexistent sans être synchronisées :
- `getToneDirective()` dans `route.ts` : guide l'IA vers certaines formulations
- `VALIDATIONS` dans `applyTraceaV3.ts` : remplace la validation après génération

Le post-traitement écrase toujours la validation produite par l'IA, mais les deux tables peuvent diverger silencieusement. Si `getToneDirective` guide l'IA vers une formulation que `applyTraceaV3` ne produira jamais, la directive devient trompeuse et peut perturber le ton global de la réponse.

**Correction partielle :** La désynchronisation tristesse (`"Tu peux rester avec ça."`) et le défaut ont été corrigés le 25/04/2026. Le risque de re-divergence future reste ouvert.

**Fichiers :**
- `src/app/api/tracea/route.ts` — fonction `getToneDirective()`
- `src/lib/ai/applyTraceaV3.ts` — constante `VALIDATIONS`

**Solution envisagée :** Faire de `applyTraceaV3.ts` la source de vérité unique. Supprimer la section "Validation finale" de `getToneDirective` et laisser uniquement ton + rythme + micro-phrase. Le post-traitement gère toujours la validation finale.

---

### R2 — Code mort : STEP_ORDER et STEP_LABELS

**Priorité :** P3

**Description :**
Deux constantes définies dans `route.ts` ne sont appelées nulle part dans `handleFinalAnalysis` ni dans aucune autre fonction du fichier :

```typescript
const STEP_ORDER = ["traverser", "reconnaitre", "ancrer", "conscientiser", "emerger", "aligner"];
const STEP_LABELS: Record<string, string> = { traverser: "Traverser", ... };
```

Ces constantes semblent être un vestige d'une version antérieure qui les utilisait pour construire le contexte de session.

**Fichier :** `src/app/api/tracea/route.ts` — lignes ~113–129

**Solution envisagée :** Supprimer les deux constantes. Vérifier d'abord qu'elles ne sont pas importées depuis un autre module (elles ne sont pas exportées, donc le risque est faible).

---

### R3 — Besoin (conscientiser) non injecté dans le prompt

**Priorité :** P2

**Description :**
Résolu partiellement le 25/04/2026 : `steps.conscientiser` est maintenant injecté dans `userMessage` de façon conditionnelle. Le modèle reçoit le besoin uniquement s'il est non vide, et peut l'intégrer dans la phrase d'émotion.

**Risque résiduel :** L'instruction "tu peux intégrer le besoin dans cette phrase si c'est naturel" est permissive — le modèle peut l'ignorer ou l'intégrer maladroitement. Aucun garde-fou de post-traitement ne vérifie la présence du besoin dans la réponse finale.

**Fichiers :**
- `src/app/api/tracea/route.ts` — `handleFinalAnalysis()`
- `src/app/app/session/page.tsx` — `steps.conscientiser` transmis avec valeur réelle

**Solution envisagée :** Évaluer si le besoin doit avoir sa propre phrase dédiée, ou si l'intégration dans la phrase d'émotion est suffisante. Décision produit requise avant correction technique.

---

### R4 — Duplication de checkAiLimit

**Priorité :** P3

**Description :**
La fonction `checkAiLimit(userId)` est définie en double, avec un code identique dans deux fichiers distincts :
- `src/app/api/tracea/route.ts`
- `src/app/api/tracea/summarize/route.ts`

Toute modification du seuil (actuellement : 1 session gratuite) ou de la logique (ex. ajout de Stripe) doit être appliquée dans les deux fichiers manuellement.

**Fichiers :**
- `src/app/api/tracea/route.ts`
- `src/app/api/tracea/summarize/route.ts`

**Solution envisagée :** Extraire `checkAiLimit` dans un module partagé, par exemple `src/lib/ai/aiLimit.ts`, et l'importer dans les deux routes.

---

### R5 — Prompt de résumé non centralisé

**Priorité :** P2

**Description :**
Le system prompt de `summarize/route.ts` (`SUMMARY_SYSTEM_PROMPT`) est défini inline dans le fichier de route, contrairement à `MIRROR_SYSTEM_PROMPT` qui est centralisé dans `src/lib/ai/traceaMirrorPrompt.ts`. L'architecture est incohérente entre les deux routes IA.

Conséquence : le prompt de résumé est difficile à versionner, à comparer, et à modifier indépendamment du code de routage.

**Fichier :** `src/app/api/tracea/summarize/route.ts`

**Solution envisagée :** Extraire `SUMMARY_SYSTEM_PROMPT` vers `src/lib/ai/traceaSummarizePrompt.ts`, suivre le même pattern que `traceaMirrorPrompt.ts`.

---

### R6 — Parsing fragile sur \n\n dans applyTraceaV3

**Priorité :** P1

**Description :**
`parseIaOutput()` découpe le texte IA exclusivement sur les doubles sauts de ligne (`\n\n`) pour identifier les blocs sémantiques (situation, émotion, direction, validation). Si Claude retourne le texte avec des phrases sur une seule ligne sans `\n\n`, le parser ne détecte aucun bloc distinct.

Conséquence directe : `parts.direction` est `null` → `applyTraceaV3` retourne le texte brut sans aucun post-traitement. La validation émotionnelle et la variation structurelle ne sont pas appliquées. Aucune erreur n'est levée — le comportement est silencieux.

Le prompt demande "Texte brut uniquement" sans imposer le format de séparation, ce qui rend ce cas probable.

**Fichier :** `src/lib/ai/applyTraceaV3.ts` — fonction `parseIaOutput()`

**Solution envisagée :** Ajouter un second mode de parsing sur les phrases terminées par un point (`.`) comme fallback si `\n\n` ne produit qu'un seul bloc. Ou injecter une instruction explicite dans le prompt pour forcer les sauts de ligne doubles entre chaque phrase.

---

### R7 — Incohérence sur le nombre de phrases maximum

**Priorité :** P2

**Description :**
Trois sources donnaient des maxima différents pour le nombre de phrases en sortie :

| Source | Valeur |
|--------|--------|
| `MIRROR_SYSTEM_PROMPT` | "2 à 4 phrases maximum" |
| `userMessage` (avant 25/04) | "exactement 4 phrases" |
| `applyTraceaV3` variant D (avant 25/04) | 5 blocs possibles |

**Correction appliquée le 25/04/2026 :**
- `userMessage` : "exactement 4" → "2 à 4 maximum"
- Variante D : cap à 4 blocs (micro remplace emo)

**Risque résiduel :** Le `MIRROR_SYSTEM_PROMPT` liste dans sa section "Structure de la réponse" les 5 variantes A–E sans mentionner explicitement le plafond de 4. Si le system prompt est mis à jour, vérifier la cohérence avec `applyTraceaV3`.

**Fichiers :**
- `src/lib/ai/traceaMirrorPrompt.ts`
- `src/app/api/tracea/route.ts`
- `src/lib/ai/applyTraceaV3.ts`

---

### R8 — logAiUsage sans monitoring ni alerte

**Priorité :** P2

**Description :**
`logAiUsage()` est appelée en fire-and-forget avec `.catch(() => {})`. Les erreurs d'insertion Supabase sont loggées en console mais ne déclenchent aucune alerte. Des pertes silencieuses de données de coût sont possibles sans qu'aucun signal ne remonte.

Dans l'état actuel, il est impossible de détecter une panne prolongée du logging de coûts sans consulter manuellement les logs Vercel.

**Fichier :** `src/app/api/tracea/route.ts` — fonction `logAiUsage()`

**Solution envisagée :** Ajouter une métrique ou un compteur d'erreurs (ex. Sentry, ou simplement un champ `log_error` dans une table dédiée). En attendant, le `.catch` devrait au minimum incrémenter un compteur observable.

---

### R9 — Tokens de cache non persistés dans Supabase

**Priorité :** P3

**Description :**
`logAiUsage()` reçoit `cacheCreationTokens` et `cacheReadTokens` et les utilise correctement pour le calcul du coût estimé en mémoire. Cependant, le schéma d'insert dans `ai_usage_logs` ne les inclut pas — ces valeurs ne sont pas stockées en base.

Conséquence : le coût total affiché en console est correct, mais la table Supabase ne permet pas de reconstituer l'historique de cache hit/miss ni d'analyser l'efficacité du prompt caching.

**Fichier :** `src/app/api/tracea/route.ts` — fonction `logAiUsage()`

**Solution envisagée :** Ajouter les colonnes `cache_creation_tokens` et `cache_read_tokens` à la table `ai_usage_logs` dans Supabase, puis les inclure dans l'insert. Migration SQL requise.

---

### R10 — Fusion variante C fragile sur structures complexes

**Priorité :** P2

**Description :**
La variante C fusionne la dernière phrase de situation avec la phrase d'émotion :

```typescript
const fused = `${lastSit}, et ${emoLower}`;
```

Deux cas de fragilité :
1. Si `emo` contient une virgule ou une structure subordonnée, la fusion produit une phrase syntaxiquement malformée.
2. Si `situation.length > 1`, les phrases de contexte précédentes (`prefix`) sont ajoutées comme blocs séparés, ce qui peut dépasser 4 blocs au total si `prefix.length >= 2`.

**Fichier :** `src/lib/ai/applyTraceaV3.ts` — `buildBlocks()`, cas `"C"`

**Solution envisagée :**
1. Ajouter un garde : si `emo` contient une virgule, repli sur variante A.
2. Limiter `prefix` à 1 élément maximum, ou fusionner tout `situation` en un seul bloc avant la fusion avec `emo`.

---

## À traiter avant mise en production

Les points suivants doivent être résolus avant un lancement public large :

| Ref | Description | Priorité |
|-----|-------------|----------|
| R1 | Désynchronisation validations — risque de directive trompeuse pour l'IA | P1 |
| R6 | Parsing fragile `\n\n` — post-traitement silencieusement inactif si Claude répond sur une ligne | P1 |
| R8 | logAiUsage sans monitoring — perte de données coût sans alerte | P2 |
| R10 | Fusion variante C — phrase malformée sur structures d'émotion complexes | P2 |

Les points R2, R3, R4, R5, R7, R9 peuvent être traités après lancement sans impact critique sur le comportement produit.

---

*Dernière mise à jour : 25 avril 2026*
*Source : Audit architecture IA TRACÉA — session du 25/04/2026*
