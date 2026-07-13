---
name: consult-ai-radar-signals
description: >
  Consult or fetch AI Radar daily signals. Use when the user asks for
  "latest AI news", "recent AI news", "noticias recientes de IA",
  "AI Radar signals", "señales de AI Radar", "consultar señales",
  "ver señales", or wants to "save search as daily JSON",
  "guardar búsqueda como JSON diario". Covers two modes: querying
  existing local fixtures and fetching fresh news from the internet.
---

# AI Radar Signals

Two modes: **consult** existing local fixtures, or **fetch** fresh news from the internet. The user's wording determines which mode runs.

## Source Management

There are three strategies for loading sources, in order of preference:

### Strategy A: Notion search + per-page fetch (preferred, works on all plans)

Since `query_data_sources` requires Business/Enterprise plan with Notion AI, use this fallback:

1. Use `notion_notion-search` with `data_source_url` pointing to `collection://70d96436-72b6-47ce-98ad-640883a7ebf1` and query each source type name.
2. For each result, use `notion_notion-fetch` to get the page properties.
3. Filter for Status = "Activa" (or "activa").
4. Warn: newly created sources may not appear immediately in search results due to indexing delay. Use the page ID returned by `create_pages` as verification.
5. Group sources by Type

### Strategy B: Source cache file

If `config/source.json` exists and `lastUpdated` is less than 24 hours old, use it directly.
If the cache is stale, try Strategy A to refresh it, then fall back to Strategy C.

### Strategy C: Hardcoded fallback + sync script

If Notion is unavailable, use sources from `config/source.json` cache. If cache is also missing, run:

```bash
node scripts/sync-sources.js reset
```

This writes hardcoded sources to cache. Report clearly:

```
⚠️ Notion no disponible, usando cache local (generada: <timestamp>).
Fuentes hardcoded: OpenAI Blog, Anthropic News, Google DeepMind Blog, Google AI Blog, GitHub Trending ML, Hugging Face Papers, ArXiv, Reddit r/ML, Hacker News, TechCrunch AI, The Decoder.
```

**Hardcoded fallback sources (full list):**
- **fuente_oficial**: OpenAI Blog, Anthropic News, Google DeepMind Blog, Google AI Blog
- **repo_tecnico**: GitHub Trending ML, Hugging Face Papers, ArXiv AI Papers
- **comunidad**: Reddit r/MachineLearning, Hacker News
- **medio_secundario**: TechCrunch AI, The Decoder

### Cache format

Generate `config/source.json` as cache:

```json
{
  "lastUpdated": "ISO-8601-datetime",
  "_source": "notion | hardcoded-fallback",
  "_note": "Explicacion del origen de la cache",
  "sources": {
    "fuente_oficial": [
      { "name": "OpenAI Blog", "url": "https://openai.com/blog", "cadencia": "diaria" }
    ],
    "repo_tecnico": [
      { "name": "GitHub Trending ML", "url": "https://api.github.com/search/repositories?q=topic:machine-learning&sort=stars&order=desc", "cadencia": "diaria" }
    ],
    "comunidad": [
      { "name": "Reddit r/MachineLearning", "url": "https://reddit.com/r/MachineLearning/.json", "cadencia": "diaria" }
    ],
    "medio_secundario": [
      { "name": "TechCrunch AI", "url": "https://techcrunch.com/category/artificial-intelligence/", "cadencia": "diaria" }
    ]
  }
}
```

---

## Trigger Mapping

| User says | Mode | Action |
|-----------|------|--------|
| ver señales, listar señales, consultar señales del día X | Consult | Run `query-daily-signals.py` (fixtures) or GET /signals (supabase) |
| latest AI news, recent AI news, noticias recientes de IA | Fetch | Load sources from Notion cache, webfetch from sources, process, structure |
| guardar como JSON, save as daily JSON, guardar búsqueda | Save | Generate JSON, confirm, write to fixtures (deprecated) |
| guardar señales, save signals, guardar en base de datos | Save to Supabase | Use `guardar-señales-a-radar` skill |

If the user asks for fresh news AND wants to save, run Fetch first, then Save (or Save to Supabase).

---

## Mode 1: Consult Existing Signals

Two sources: `fixtures` (local JSON) or `supabase` (remote database).

### Source: fixtures (default)

Run the local query tool.

### Source: supabase

Query the Edge Function:

```
GET https://luymyxnbfieuelbsaqzv.supabase.co/functions/v1/signals?date=YYYY-MM-DD&limit=N&name=text
Authorization: Bearer <SUPABASE_ANON_KEY>
```

Map user wording to query params:

- Date, day, dia, fecha: `?date=YYYY-MM-DD`
- Amount, count, cantidad, N, limite: `?limit=N`
- Name, nombre, titulo: `?name=text`
- Status, estado: `?status=en_negociacion`

### Source selection

| User says | Source |
|-----------|--------|
| señales de supabase, signals from database | supabase |
| señales locales, signals from fixtures | fixtures |
| señales (sin especificar) | fixtures (default) |

---

## Mode 2: Fetch Fresh News from Internet

### Step 1: Load sources from cache

First, try to load sources from `config/source.json`. If the file doesn't exist or is older than 1 hour, reload from Notion (see Source Management above).

### Step 2: Fetch from sources by subagent group

Fetch sources in parallel by group. Each group acts as a subagent:

**Group 1: fuente_oficial** — Official AI company blogs
**Group 2: repo_tecnico** — Technical repositories and code sources. For GitHub, use the Search API URL which returns JSON.
**Group 3: comunidad** — Community discussions. For Reddit, use `.json` endpoint to avoid verification walls.
**Group 4: medio_secundario** — Secondary news media

Use `webfetch` to pull content from each source. Fetch in parallel within each group.
If a source fails, skip it and continue with the others. Log which sources failed in the final output.

### Step 3: Extract raw items

From each fetched page, extract:
- `title`: headline or article title
- `url`: full URL to the article
- `source_name`: name of the publication or blog
- `date`: publication date if available

### Step 4: Deduplicate

Remove duplicates using:
1. **URL match**: same URL → keep one
2. **Title similarity**: normalize titles. If >70% word overlap → keep the more recent one

### Step 5: Prioritize

Sort by recency then relevance to AI builders. Select up to **10** signals.

### Step 6: Process with agent

For each item, generate the signal fields:

- **evidence**: What specifically happened?
- **impact**: Why does this matter for AI builders?
- **action**: What should a builder do?
- **confidence**: 0-100. Be realistic — not everything is 95%.
- **trend**: `"up"` if growing, `"down"` if declining, `"neutral"` if stable.
- **categories**: Array of tags like `["LLM", "Infra"]`, `["Robotics", "Agents"]`, etc.
- **status**: One of `en_negociacion`, `resuelto_parcialmente`, `modelo_emergente`, `claim_no_verificado`, `pendiente_de_lanzamiento`, `observacion`

### Step 7: Structure signals

```json
{
  "id": "signal-YYYY-MM-DD-NN",
  "title": "Headline here",
  "source": { "name": "Source Name", "url": "https://..." },
  "evidence": "Concrete facts.",
  "impact": "Why this matters.",
  "action": "What to do.",
  "confidence": 85,
  "trend": "up",
  "categories": ["LLM", "Infra"],
  "status": "modelo_emergente"
}
```

The `id` pattern is `signal-YYYY-MM-DD-NN`. Use today's date.

---

## Mode 3: Save as Daily JSON (Deprecated)

> ⚠️ **Deprecated:** Use `guardar-señales-a-radar` to persist signals to Supabase.

## Conversational Output

Summarize signals as a table:

| # | Título | Fuente | Estado |
|---|--------|--------|--------|
| 1 | ... | ... | ... |

Then a brief summary per signal with evidence, impact, and action.
