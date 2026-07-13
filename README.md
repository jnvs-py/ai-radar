# AI Radar

AI Radar es el proyecto del curso avanzado de Codex. Organiza noticias, herramientas, papers, repos y lanzamientos de IA en señales accionables para builders: que paso, por que importa, que tan confiable es y que vale la pena probar.

## Estado Actual

El frontend es un dashboard funcional con 5 vistas que consume datos reales desde Supabase:

- **Dashboard** — KPIs agregados y actividad reciente
- **Ranking** — Tabla filtrable de señales con confianza, tendencia y estado
- **Evidencia** — Timeline de fuentes y consenso por senal
- **Lector** — Vista de lectura con callout de impacto y accion recomendada
- **Operador** — Centro de monitoreo con feed en vivo, tabla raw y metricas

Los datos se obtienen de la Edge Function `GET /signals` en Supabase, con fallback automatico a `fixtures/signals.json` si la API no responde.

## Arquitectura

```
js/app.js (router SPA)
├── js/api.js (fetch desde Supabase Edge Function + fallback a fixtures)
├── js/state.js (loading/empty/error/success)
├── js/views/dashboard.js
├── js/views/signals.js
├── js/views/evidence.js
├── js/views/reader.js
└── js/views/operator.js

packages/api/
├── functions/signals/index.ts (Edge Function: GET + POST /signals)
├── scripts/seed-fixtures.ts
└── supabase/migrations/20260713_create_signals.sql
```

## Stack

- **Frontend**: HTML + CSS + JavaScript vanilla (sin framework)
- **API**: Supabase Edge Functions (Deno)
- **Base de datos**: Supabase Postgres
- **Skills de Codex**: `.codex/skills/` para consulta, guardado, descubrimiento de fuentes y frontend-dev
- **Fuentes**: Notion (base `AI Radar Sources`) con cache local en `config/source.json`

## Configuracion del Entorno

Variables requeridas para desarrollo local:

```bash
# Frontend (usa SUPABASE_ANON_KEY - segura para navegador)
SUPABASE_URL=https://luymyxnbfieuelbsaqzv.supabase.co
SUPABASE_ANON_KEY=...

# API / scripts server-side (NO exponer en frontend)
SUPABASE_SERVICE_ROLE_KEY=...
AI_RADAR_SAVE_TOKEN=...
```

Para usar la API de guardado, copia `packages/api/.env.example` a `packages/api/.env.local` y completa las variables.

## Comandos

```bash
# Seedear fixtures a Supabase
cd packages/api && npm run seed

# Desplegar Edge Function
cd packages/api && npm run deploy

# Servir frontend local
python3 -m http.server 4174

# Sincronizar cache de fuentes
node scripts/sync-sources.js check
node scripts/sync-sources.js update --force

# Guardar snapshot en Supabase
node scripts/e2e-save.js fixtures/signals.json --date 2026-07-13
```

## Skills de Codex

| Skill | Descripcion |
|-------|-------------|
| `consult-ai-radar-signals` | Consultar senales locales o Supabase, o hacer fetch desde internet |
| `guardar-senales-a-radar` | Persistir senales en Supabase via POST /signals |
| `discover-new-sources` | Descubrir nuevas fuentes de noticias IA en paralelo |
| `frontend-dev` | Gobernanza de desarrollo frontend (estados, responsive, a11y) |
