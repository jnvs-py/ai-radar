import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const API_URL = 'https://luymyxnbfieuelbsaqzv.supabase.co/functions/v1/signals';
const FIXTURES_DIR = resolve(import.meta.dirname || '.', '..', '..', '..', 'fixtures', 'daily-signals');
const ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

async function main() {
  if (!ANON_KEY) { console.error('SUPABASE_ANON_KEY required'); process.exit(1); }
  let files;
  try { files = await readdir(FIXTURES_DIR); } catch { console.error(`Fixtures dir not found: ${FIXTURES_DIR}`); process.exit(1); }
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  console.log(`Found ${jsonFiles.length} fixture files`);
  let totalInserted = 0;
  for (const file of jsonFiles) {
    const raw = await readFile(resolve(FIXTURES_DIR, file), 'utf-8');
    const data = JSON.parse(raw);
    const { date, capturedAt, signals } = data;
    if (!signals?.length) continue;
    const res = await fetch(API_URL, { method: 'POST', headers: { 'Authorization': `Bearer ${ANON_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ date: date || file.replace('.json',''), capturedAt: capturedAt || new Date().toISOString(), signals }) });
    const body = await res.json();
    console.log(`  ${file}: ${body.inserted} inserted`);
    totalInserted += body.inserted || 0;
  }
  console.log(`Total: ${totalInserted} signals seeded`);
}
main();
