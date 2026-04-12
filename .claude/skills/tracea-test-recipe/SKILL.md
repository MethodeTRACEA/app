---
name: tracea-test-recipe
description: Run a disciplined TRACÉA test recipe for one profile and one flow, then summarize findings into a closed-cycle test sheet.
---

# Purpose
Use this skill to structure product testing without patching mid-test.

## Allowed test profiles
### Short flow priority
- very activated
- activated confused
- activated blocked
- activated skeptical

### Long flow
- moderate available
- moderate introspective

## Test rules
- one profile at a time
- one flow at a time
- no code edits during the test
- record friction, bugs, and useful moments
- choose max 5 corrections afterwards

## Output format
Return exactly:

### Context
- profile
- flow
- objective

### Score
- clarity /5
- simplicity /5
- utility /5
- real-world feasibility /5

### Findings
For each finding use:
`type — screen — issue — impact`
Where type is one of: bug / friction / incomprehension / useful

### Top 5 problems
Ordered by severity.

### Decision
Choose one:
- no correction now
- patch top 1-3 only
- patch top 4-5 only
- stop and redesign this segment

## Rules
- Do not correct during the recipe.
- Do not exceed 5 problems.
- Prefer closed cycles over exhaustive lists.
