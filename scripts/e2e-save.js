#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const API_URL = 'https://luymyxnbfieuelbsaqzv.supabase.co/functions/v1/signals';

function loadEnv() {
  try {
    const fs = require('node:fs');
    const lines = fs.readFileSync(resolve(ROOT, '.env.local'), 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex > 0) {
          const key = trimmed.slice(0, eqIndex).trim();
          const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
          process.env[key] = value;
        }
      }
    }
  } catch {}
}

async function main() {
  loadEnv();
  const args = process.argv.slice(2);
  const fixturePath = args.find(a => !a.startsWith('--'));
  if (!fixturePath) {
    console.log('Uso: node scripts/e2e-save.js <path/to/fixture.json> [--date YYYY-MM-DD]');
    process.exit(1);
  }
  const dateIdx = args.indexOf('--date');
  const dateArg = dateIdx >= 0 ? args[dateIdx + 1] : null;
  let fixtureData;
  try {
    fixtureData = JSON.parse(await readFile(resolve(ROOT, fixturePath), 'utf-8'));
  } catch (e) {
    console.error(`Error al leer fixture: ${e.message}`);
    process.exit(1);
  }
  const signals = fixtureData.signals || [];
  const date = dateArg || fixtureData.date || new Date().toISOString().split('T')[0];
  const capturedAt = fixtureData.capturedAt || new Date().toISOString();
  if (signals.length === 0) { console.error('El fixture no contiene señales.'); process.exit(1); }
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!anonKey) { console.error('SUPABASE_ANON_KEY no configurada.'); process.exit(1); }
  console.log(`[e2e-save] Enviando ${signals.length} señales para ${date}...`);
  try {
    const res = await fetch(API_URL, { method: 'POST', headers: { 'Authorization': `Bearer ${anonKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ date, capturedAt, signals }) });
    const body = await res.json();
    if (res.status === 201) {
      console.log(`✅ ${body.inserted} señales guardadas para ${date}`);
      if (body.ids?.length) console.log(`   IDs: ${body.ids.slice(0, 5).join(', ')}...`);
    } else {
      console.error(`❌ Error (${res.status}): ${body.error || 'desconocido'}`);
      process.exit(1);
    }
  } catch (e) { console.error(`❌ Error de conexion: ${e.message}`); process.exit(1); }
}
main();
