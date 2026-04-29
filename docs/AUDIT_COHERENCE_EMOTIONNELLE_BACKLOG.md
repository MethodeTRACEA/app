# TRACÉA — Backlog audit cohérence émotionnelle landing → app

## État général

Audit réalisé en lecture seule sur la cohérence émotionnelle entre :
- landing
- /start
- connexion
- bienvenue
- accueil app
- ressources
- flows court / long
- post-session / paywall

Conclusion :
Le cœur landing → start → traversée courte → sortie est cohérent.
Les ruptures principales concernent les périphéries : bienvenue, paywalls, footer, connexion, distinction court/long.

---

## 1. Page bienvenue

Statut : corrigé.

Corrections effectuées :
- suppression surcharge pédagogique
- suppression bloc 6 étapes
- suppression textarea "Comment arrives-tu là"
- passage en palette sombre
- CTA unique
- prénom facultatif
- carte enveloppe premium
- logo renforcé
- footer masqué sur cette page

Statut actuel :
OK visuellement après captures.

---

## 2. Paywalls de clôture

Statut : à traiter.

Problèmes identifiés :
- formulation "Sinon, tu repartiras de zéro"
- soft-limit après un moment de régulation
- risque de casser la confiance après une sortie contenante
- ton trop menaçant / commercial à un moment sensible

Priorité :
Haute.

Règle :
Ne pas traiter comme un patch marketing.
Traiter comme un sujet UX émotionnel + produit.

---

## 3. Footer app layout

Statut : à vérifier.

Problème identifié :
- footer global peut créer une rupture SaaS / marketing sous des pages émotionnelles sensibles
- déjà masqué sur bienvenue
- vérifier s'il apparaît encore sous post-session, flows, urgence ou pages de clôture

Priorité :
Moyenne.

Règle :
Ne pas supprimer globalement sans audit.
Masquer seulement sur pages sensibles si nécessaire.

---

## 4. Page connexion

Statut : à traiter plus tard.

Problème identifié :
- fond légèrement décalé par rapport à la palette standard
- différence subtile mais cumulative

Priorité :
Basse à moyenne.

Règle :
Patch visuel minimal uniquement après audit ciblé.

---

## 5. Distinction court / long / compte requis

Statut : à clarifier.

Problèmes identifiés :
- "Compte requis" sur certains choix peut créer un mini-frein
- l'utilisateur peut découvrir trop tard le besoin de compte / abonnement
- confusion possible entre urgence, traversée courte et approfondissement

Priorité :
Haute, mais après paywall.

Règle :
Ne pas modifier /start car page frozen.
Auditer les points de bascule hors /start.

---

## 6. Ressources

Statut : verrouillé par décision produit.

Décision :
Ne pas modifier les textes de la page ressources.

Note :
Même si l'audit a signalé un risque de sur-intellectualisation, les textes ressources sont hors périmètre de correction.

Règle :
Ne pas toucher à la page ressources sans décision explicite.

---

## 7. /start

Statut : frozen.

Décision :
Ne pas toucher à /start.

Même si l'audit mentionne un logo petit ou des éléments à améliorer, aucun patch sur /start n'est autorisé actuellement.

---

## Ordre recommandé des prochaines actions

1. Audit ciblé lecture seule des paywalls de clôture.
2. Correction wording / placement paywall si nécessaire.
3. Audit ciblé footer sur pages sensibles.
4. Audit ciblé distinction court / long hors /start.
5. Correction connexion si encore utile.

---

## Règle de travail

Pour chaque sujet :
1. audit lecture seule
2. diagnostic
3. un seul prompt
4. un seul fichier ou périmètre clair
5. capture ou vérification
6. validation avant sujet suivant
