# Technique

_Date : 2026-04-11_

## Stack
- Next.js
- Supabase
- Vercel
- Claude Code

## API
- /api/tracea
- /api/tracea/summarize

## Tables actives
- profiles
- sessions
- consent_logs
- session_summaries
- user_memory_profile
- ai_usage_logs
- rate_limit_logs
- tracea_events

## Sécurité
- HTTPS
- rate limiting
- auth

## Tracking produit minimal actif
Table : `tracea_events`

Events actuellement trackés :
- session_start
- step_complete
- session_end

## Objectif du tracking
- mesurer la complétion
- repérer les points de chute réels
- comparer flow court et flow long
- sortir d’un pilotage purement intuitif

## Point de vigilance
- user_id doit être vérifié en usage authentifié
- lecture produit des events à structurer
- ne pas complexifier le tracking avant exploitation réelle de cette première couche
