---
name: tracea-patch-minimal
description: Convert one validated UX or product issue into a minimal Claude Code patch with strict scope control.
---

# Purpose
Use this skill only after a problem has already been identified and prioritized.
This skill exists to stop scope drift.

## Input expected
- one problem only
- target screen or component
- desired behavior
- constraints

## Required patch structure
Return exactly:

### Scope
1-2 lines.

### Files touched
Short list.

### Will not touch
Short list.

### Implementation
Minimal code change only.
No refactor.
No adjacent cleanup unless required.

### Verification
A short checklist with 3-6 manual checks.

## Rules
- 1 problem = 1 patch.
- Keep names, architecture, and styling patterns unless change is required.
- Do not optimize unrelated code.
- Do not rewrite copy outside the target issue.
- If the request is actually multiple patches, split it and say so.
