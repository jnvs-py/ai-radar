---
name: guardar-señales-a-radar
description: >
  Persist AI Radar signals to Supabase via Edge Function. Use when the user
  asks to "guardar señales", "save signals", "persistir señales",
  "guardar en base de datos", "save to database", or wants to store
  signals from a fetch operation.
---

# Guardar Señales a Radar

Persist daily signals to Supabase via the Edge Function `POST /signals`.

## Trigger Mapping

| User says | Action |
|-----------|--------|
| guardar señales, save signals | Persist provided signals to Supabase |
| persistir señales, store signals | Persist provided signals to Supabase |
| guardar en base de datos, save to database | Persist provided signals to Supabase |

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `signals` | `Signal[]` | Yes | Array of signal objects from fetch or user |
| `date` | `string` (YYYY-MM-DD) | Yes | Date of the signals |

Each signal must have:
- `id`: `signal-YYYY-MM-DD-NN`
- `title`: string
- `source`: `{ name: string, url: string }`
- `evidence`: string
- `impact`: string
- `action`: string
- `confidence`: number (optional)
- `trend`: string (optional)
- `categories`: string[] (optional)
- `status`: one of valid statuses

---

## Process

### Step 1: Validate inputs

Check that `signals` is a non-empty array and `date` is provided.

### Step 2: Call Edge Function

```
POST https://luymyxnbfieuelbsaqzv.supabase.co/functions/v1/signals
Authorization: Bearer <SUPABASE_ANON_KEY>
Content-Type: application/json

{
  "date": "2026-07-13",
  "capturedAt": "2026-07-13T15:30:00Z",
  "signals": [ ... ]
}
```

Use `webfetch` or `curl` via bash to call the endpoint.

### Step 3: Handle response

**Success (201):** `✅ {inserted} señales guardadas para {date}.`
**Validation error (400):** `❌ Error de validación: {error}`
**Server error (500):** `❌ Error del servidor.`

---

## CLI / Script Flow

```bash
node scripts/e2e-save.js snapshots/daily/2026-07-13-ai-radar-search.json
node scripts/e2e-save.js fixtures/signals.json --date 2026-07-13
```

Requires `SUPABASE_ANON_KEY` in `.env.local`.
