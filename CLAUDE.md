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
```markdown
## Mandatory: TRACEA method visibility

The TRACEA name is an acronym for the 6-step method:
T — Traverser
R — Reconnaître
A — Ancrer
C — Comprendre (id technique : conscientiser, label visible : Comprendre)
E — Émerger
A — Aligner

When patching any user-facing screen related to the TRACEA method:
- The visible counter MUST show X/6 (never X/4 or X/5).
- The 6 letters T·R·A·C·E·A SHOULD be visible (StepIndicator component, immersive mode).
- Step names MUST match the official labels above (case-sensitive for the visible label).
- If a step is "transitional" without user input, FLAG it explicitly in the change report
  and propose either: (a) add real interaction, or (b) explicitly document it as transition.

The component `src/components/StepIndicator.tsx` already exists. Use it.
The data source `src/lib/steps.ts` already defines the 6 steps. Use it.

## Mandatory: SafetyResources visibility

The component `src/components/SafetyResources.tsx` MUST be present on:
- exit screen of `src/app/app/urgence/page.tsx`
- footer of `src/app/app/traversee-courte/page.tsx`
- complete screen of `src/app/app/session/page.tsx`
- accueil page `src/app/app/page.tsx` (discreet)

When patching any of these pages, verify SafetyResources is still rendered.
If a patch removes or hides it, FLAG it as a P0 risk in the change report.

## Mandatory: doctrine wording check before any UI text change

Before introducing or modifying any user-facing string, verify against:
- No effect promises ("calme ton système nerveux", "tu vas te sentir mieux", etc.)
- No imperatives without choice grammar ("respire", "détends-toi" → use "tu peux ralentir")
- No injunctions to feel ("sens ton corps se détendre" → "vois si tu peux sentir, même peu c'est ok")
- No therapeutic / coaching / mystical vocabulary
- No buttons that mislead about what they do

Reference (in user docs): `wordings_interdits.md` of the tracea-doctrine-guardian skill.

## Mandatory: scope discipline

Before any patch, return:
1. Exact scope (1-3 lines)
2. Files that WILL be touched
3. Files that WILL NOT be touched
4. The smallest viable change
5. A short verification checklist
6. ⚠️ If the patch touches the TRACEA method visibility, SafetyResources, or any user-facing
   wording: explicitly state that the doctrine implications have been considered.

## Working with a non-developer founder

The user (Alyson) is not a developer. When reporting back on a patch:
- Use plain French (not technical jargon)
- State what changed in user-visible terms first, then technical details
- If a decision was made implicitly, surface it explicitly
- If something is broken or risky, say so plainly — do not hide it under polite phrasing
```

## Mandatory: Supabase Data API access (May 30 / October 30 2026 change)

Starting May 30 2026, new Supabase projects require explicit GRANTs on every
public schema table to be reachable via supabase-js / PostgREST / GraphQL.
From October 30 2026, this is enforced on the existing TRACEA project as well.

Any new table created in the TRACEA project from now on MUST include, in the
same migration that creates the table:

1. Enable Row Level Security:
   alter table public.<table_name> enable row level security;

2. Explicit GRANTs (adjust per role to what the table actually needs):
   grant select on public.<table_name> to anon;
   grant select, insert, update, delete on public.<table_name> to authenticated;
   grant select, insert, update, delete on public.<table_name> to service_role;

3. At least one RLS policy that scopes access correctly. Default template for
   user-owned data:
   create policy "users can read their own rows"
     on public.<table_name>
     for select to authenticated
     using (auth.uid() = user_id);
   (Add insert/update/delete policies as needed, never leave RLS enabled
   without policies — that locks the table.)

When patching a migration or creating a new table:
- If GRANTs are missing, FLAG it as a P0 blocker in the change report.
- If RLS is enabled but no policy exists, FLAG it as a P0 blocker.
- If a policy uses `to public` or `using (true)` without justification,
  FLAG it as a security risk and ask before applying.

If at runtime the app receives a PostgREST error code "42501", it means a
GRANT is missing on a table. The error message contains the exact GRANT
statement to apply. Report this to Alyson in plain French before applying.

Existing TRACEA tables keep their current grants until October 30 2026.
No retroactive change needed today — but every NEW table from now on must
follow the rules above.