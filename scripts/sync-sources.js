#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CACHE_PATH = resolve(ROOT, 'config', 'source.json');

const HARDCODED_SOURCES = {
  fuente_oficial: [
    { name: 'OpenAI Blog', url: 'https://openai.com/blog', cadencia: 'diaria' },
    { name: 'Anthropic News', url: 'https://www.anthropic.com/news', cadencia: 'diaria' },
    { name: 'Google DeepMind Blog', url: 'https://deepmind.google/discover/blog/', cadencia: 'diaria' },
    { name: 'Google AI Blog', url: 'https://blog.google/technology/ai/', cadencia: 'diaria' }
  ],
  repo_tecnico: [
    { name: 'GitHub Trending ML', url: 'https://api.github.com/search/repositories?q=topic:machine-learning&sort=stars&order=desc', cadencia: 'diaria' },
    { name: 'Hugging Face Papers', url: 'https://huggingface.co/papers', cadencia: 'diaria' },
    { name: 'ArXiv AI Papers', url: 'https://arxiv.org/list/cs.AI/recent', cadencia: 'diaria' }
  ],
  comunidad: [
    { name: 'Reddit r/MachineLearning', url: 'https://reddit.com/r/MachineLearning/.json', cadencia: 'diaria' },
    { name: 'Hacker News', url: 'https://news.ycombinator.com', cadencia: 'diaria' }
  ],
  medio_secundario: [
    { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/', cadencia: 'diaria' },
    { name: 'The Decoder', url: 'https://the-decoder.com', cadencia: 'diaria' }
  ]
};

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'check';
  const forceFlag = args.includes('--force') || args.includes('-f');

  console.log(`[sources-sync] Modo: ${mode}`);

  switch (mode) {
    case 'check':
      await checkCache();
      break;
    case 'update':
      await updateFromFallback(forceFlag);
      break;
    case 'reset':
      await resetToHardcoded();
      break;
    default:
      console.log(`Uso: node scripts/sync-sources.js [check|update|reset] [--force]`);
      process.exit(1);
  }
}

async function checkCache() {
  try {
    const raw = await readFile(CACHE_PATH, 'utf-8');
    const cache = JSON.parse(raw);
    const age = Date.now() - new Date(cache.lastUpdated).getTime();
    const ageHours = Math.round(age / (1000 * 60 * 60));
    const sourceCount = Object.values(cache.sources || {}).reduce((sum, group) => sum + group.length, 0);
    console.log(`  Cache: ${CACHE_PATH}`);
    console.log(`  Ultima actualizacion: ${cache.lastUpdated} (hace ${ageHours}h)`);
    console.log(`  Fuentes: ${sourceCount}`);
    if (ageHours > 24) {
      console.log(`  ⚠️  Cache desactualizada (>24h). Ejecuta 'update' para refrescar.`);
    } else {
      console.log(`  ✅ Cache vigente (<24h)`);
    }
    for (const [group, sources] of Object.entries(cache.sources)) {
      console.log(`  - ${group}: ${sources.length} fuentes`);
      for (const s of sources) {
        console.log(`    • ${s.name}`);
      }
    }
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log(`  ❌ Cache no encontrada. Ejecuta 'update' para generarla.`);
    } else {
      console.error(`  ❌ Error: ${e.message}`);
    }
  }
}

async function updateFromFallback(force) {
  try {
    const raw = await readFile(CACHE_PATH, 'utf-8');
    const cache = JSON.parse(raw);
    const age = Date.now() - new Date(cache.lastUpdated).getTime();
    const ageHours = Math.round(age / (1000 * 60 * 60));
    if (!force && ageHours <= 24) {
      console.log(`  Cache vigente (hace ${ageHours}h). Usa --force para forzar.`);
      return;
    }
  } catch (e) {
    if (e.code !== 'ENOENT') console.error(`  Error: ${e.message}`);
  }
  await writeHardcoded('update');
}

async function resetToHardcoded() {
  await writeHardcoded('reset');
}

async function writeHardcoded(reason) {
  const cache = {
    lastUpdated: new Date().toISOString(),
    _source: `hardcoded-fallback (${reason})`,
    _note: 'Esta cache usa fuentes locales. La sincronizacion con Notion no esta disponible en este momento.',
    sources: HARDCODED_SOURCES
  };
  await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
  const totalSources = Object.values(HARDCODED_SOURCES).reduce((sum, g) => sum + g.length, 0);
  console.log(`  ✅ Cache actualizada (${reason}): ${CACHE_PATH}`);
  console.log(`  Fuentes: ${totalSources} (desde hardcoded fallback)`);
}

main().catch(err => { console.error(`Fatal: ${err.message}`); process.exit(1); });
