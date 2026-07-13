---
name: discover-new-sources
description: >
  Discover new AI news sources for AI Radar. Use when the user asks to
  "find new sources", "discover sources", "buscar nuevas fuentes",
  "encontrar fuentes", or wants to "expand source list",
  "agregar fuentes". Searches the internet for potential AI news sources,
  evaluates them, and adds selected ones to Notion.
---

# Discover New AI Sources

Find potential AI news sources on the internet, evaluate them, and add selected ones to the Notion database.

## Trigger Mapping

| User says | Action |
|-----------|--------|
| find new sources, discover sources | Search internet for candidate sources |
| buscar nuevas fuentes, encontrar fuentes | Search internet for candidate sources |
| expand source list, agregar fuentes | Search and add to Notion |

---

## Process Overview

```
1. Load current sources from Notion (avoid duplicates)
2. Search internet for candidate sources
3. Evaluate candidates (relevance, frequency, quality)
4. Present candidates to user
5. User selects sources to add
6. Add selected sources to Notion
7. Update cache (config/source.json)
```

---

## Step 1: Load Current Sources

Before searching, load existing sources to avoid duplicates. Use the Source Management strategies from `consult-ai-radar-signals`:

1. Try `notion_notion-search` with `data_source_url` pointing to `collection://70d96436-72b6-47ce-98ad-640883a7ebf1` (Strategy A)
2. If that fails, try `config/source.json` cache (Strategy B)
3. If cache is also missing/stale, run `node scripts/sync-sources.js reset` (Strategy C)

> Note: `notion_query_data_sources` requires Business/Enterprise plan with Notion AI and will return a 400 error on most plans. Use `notion_search` + `notion_fetch` instead.

Extract all source URLs and names for duplicate checking.

---

## Step 2-6: Search, Extract, Deduplicate, Score, Present

Search 5 source types in parallel: Hacker News, Reddit, GitHub Topics, AI Newsletters, Tech News AI sections. Extract candidates, deduplicate by URL, score by relevance (1-5) + frequency (1-5) + quality (1-5). Present candidates to user for selection.

---

## Step 7: Add to Notion

For each selected source:

1. Create page in Notion database `b8bc6a22-9429-40f3-a06b-daf69a58d405`
2. Fill all properties: Name, URL, Type, Status=activa, Description, Cadencia
3. Save the page ID returned by `create_pages` for immediate verification
4. Note: new pages may not appear in `notion_search` immediately due to indexing delay

---

## Step 8: Update Cache

After adding sources, update `config/source.json`:

1. If Notion is available, use `notion_search` + `notion_fetch` to enumerate active sources
2. If Notion is unavailable, include new sources alongside existing cache entries
3. Set `_source: "notion"` or `_source: "partial-sync"` as appropriate
4. Update `lastUpdated` timestamp

---

## Error Handling

- Source unavailable: log warning, continue with others
- No new sources: report, suggest different filters
- Notion unavailable: save candidates to `config/pending-sources.json`
