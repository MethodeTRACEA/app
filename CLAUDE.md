# TRACÉA — Project Instructions for Claude Code

## Product identity
TRACÉA is a real-time emotional regulation app.
It is not therapy, coaching, diagnosis, or journaling.
The product promise is narrow:
help the user regain a little space and identify one feasible next step.

## Core product doctrine
- Body before mental analysis.
- Simplicity before richness.
- UX leads; AI supports.
- 1 screen = 1 action.
- 1 question = 1 intention.
- Short sentences only.
- No psychological interpretation.
- No refactor wide changes unless explicitly requested.

## Current architecture
TRACÉA has 2 flows:
1. short flow (`/app/traversee-courte`) — high activation / low cognitive bandwidth
   Machine à états avec branching adaptatif. Durée 2-5 min.
2. long flow (`/app/session`) — moderate activation / more available attention
   Protocole 6 étapes (Traverser → Reconnaître → Ancrer → Conscientiser → Émerger → Aligner).

Routing by activation level: `deborde`/`charge` → short ; `encore`/`calme` → long.
Do not flatten both flows into one unless explicitly requested.

## Non-negotiable UX rules
- Reduce cognitive load first.
- Keep visible choices limited.
- Never assume the user must feel better to continue.
- Always allow a simpler version.
- Always keep a soft exit.
- Never add explanatory text "just in case".
- If a screen can be simplified, simplify it.

## AI behavior rules
- AI accompanies, it does not analyze.
- No trauma explanations.
- No diagnostic language.
- No deep introspection prompts in activated states.
- In the short flow, AI must stay minimal and secondary.
- AI must never generate interpretation about user's personality, history, or causes.

## Working method
- 1 problem = 1 patch.
- 1 screen = 1 prompt = 1 modification = 1 verification.
- Freeze scope before coding.
- Do not patch while testing.
- Finish closed cycles: audit -> decide -> patch -> verify.
- If a request is broad, start in plan mode and reduce to minimal patches.

## Required output style for code work
When asked to modify code:
1. Restate the exact scope in 1-3 lines.
2. Say which files will be touched.
3. State what will NOT be touched.
4. Make the smallest viable change.
5. Return a short verification checklist.

## Safety for this codebase
Do not touch unless explicitly requested:
- auth
- database schema
- API routes
- AI routes (`src/app/api/tracea/*`)
- legal pages
- analytics / tracking (`ai_usage_logs`, `rate_limit_logs`)
- design system tokens (`design-tokens.ts`, `tailwind.config.ts`)
- AI prompts (`docs/IA_TRACEA_*.md`, inline prompt in `src/app/api/tracea/route.ts`)
- memory system (`src/lib/memory.ts`, tables `user_memory_profile`, `session_summaries`)

## Critical file warning
`src/app/app/traversee-courte/page.tsx` is a monolithic file (10k+ lines).
Any patch on this file requires verification of every branch path.
Do not refactor its structure unless explicitly requested.

## Decision rule
When torn between "more sophisticated" and "more usable under activation",
choose "more usable under activation".
