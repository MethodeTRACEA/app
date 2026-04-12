---
name: tracea-ux-audit
description: Audit one TRACÉA screen or one short user flow for cognitive load, emotional safety, and UX friction. Use before proposing any UX patch.
---

# Purpose
Use this skill to audit a TRACÉA screen or a very small flow segment before editing code.

## What to inspect
- immediate clarity
- cognitive load
- number of visible choices
- body-first coherence
- emotional safety
- duplication / useless text
- friction for a highly activated user

## Output format
Return exactly these sections:

### 1. What works
3 bullets max.

### 2. Frictions
List only concrete frictions seen on the screen.
Format: `severity — issue — why it matters`
Use severity: critical / major / minor.

### 3. Decision
Choose one:
- keep as is
- simplify
- rewrite
- remove

### 4. Patch direction
Give 3 changes max.
Each change must be screen-level and concrete.

## Rules
- Do not drift into marketing.
- Do not rewrite the whole product.
- Do not propose more than 3 changes at once.
- Prioritize the experience of a highly activated user.
- If the issue is visual clutter, say it plainly.
- If the screen is beyond repair, say "remove".
