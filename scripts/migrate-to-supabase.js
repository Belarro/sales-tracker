// Migration script: imports CSV data into Supabase
// Run once: node scripts/migrate-to-supabase.js
//
// Requires: npm install @supabase/supabase-js csv-parse dotenv

import { createClient } from '@supabase/supabase-js';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const CSV_FILE = process.argv[2];

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

if (!CSV_FILE) {
  console.error('Usage: node scripts/migrate-to-supabase.js <path-to-csv>');
  console.error('Example: node scripts/migrate-to-supabase.js "Sales Tracker Data - Data (1).csv"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const parseBool = (val) => val === 'YES' || val === 'true' || val === true;

const mapRow = (r) => ({
  location_name:       (r['Location Name']        || '').trim(),
  business_address:    (r['Business Address']      || '').trim(),
  contact_person:      (r['Contact Person']        || '').trim(),
  contact_title:       (r['Contact Title']         || '').trim(),
  direct_phone:        (r['Direct Phone']          || '').trim(),
  direct_email:        (r['Direct Email']          || '').trim(),
  business_types:      (r['Business Types']        || '').trim(),
  interest_level:      (r['Interest Level']        || '').trim(),
  visit_notes:         (r['Visit Notes']           || '').trim(),
  timestamp:           (r['Timestamp']             || '').trim(),
  follow_up_date:      (r['Follow-up Date']        || '').trim(),
  sample_given:        (r['Sample Given']          || '').trim(),
  sales_rep:           (r['Sales Rep']             || '').trim(),
  direct_link:         (r['Direct Link']           || '').trim(),
  business_phone:      (r['Business Phone']        || '').trim(),
  business_email:      (r['Business Email']        || '').trim(),
  business_website:    (r['Business Website']      || '').trim(),
  archived:            (r['Archived']              || '').trim(),
  pipeline_stage:      (r['Pipeline Stage']        || 'new_visit').trim(),
  follow_up_count:     (r['Follow-up Count']       || '0').trim(),
  last_follow_up_date: (r['Last Follow-up Date']   || '').trim(),
  next_action_date:    (r['Next Action Date']      || '').trim(),
  next_action_type:    (r['Next Action Type']      || '').trim(),
  automation_status:   (r['Automation Status']     || '').trim(),
  materials_sent:      (r['Materials Sent']        || '').trim(),
  notes_internal:      (r['Notes Internal']        || '').trim(),
  language:            (r['Language']              || '').trim(),
  uses_microgreens:    parseBool(r['Uses Microgreens'])
});

async function migrate() {
  console.log(`Reading CSV: ${CSV_FILE}`);
  const records = [];

  await new Promise((resolve, reject) => {
    createReadStream(CSV_FILE)
      .pipe(parse({ columns: true, skip_empty_lines: true, bom: true }))
      .on('data', (row) => records.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Parsed ${records.length} rows`);

  const locations = records
    .map(mapRow)
    .filter(r => r.location_name); // skip empty rows

  // Insert locations in batches of 20
  let inserted = 0;
  let failed = 0;
  const BATCH = 20;

  for (let i = 0; i < locations.length; i += BATCH) {
    const batch = locations.slice(i, i + BATCH);
    const { error } = await supabase
      .from('locations')
      .upsert(batch, { onConflict: 'location_name,business_address' });

    if (error) {
      console.error(`Batch ${i}-${i + BATCH} failed:`, error.message);
      failed += batch.length;
    } else {
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${locations.length}...`);
    }
  }

  // Also insert into visit_history (one entry per location as initial visit)
  const history = locations.map(r => ({ ...r })); // same data, no unique constraint
  for (let i = 0; i < history.length; i += BATCH) {
    const batch = history.slice(i, i + BATCH);
    const { error } = await supabase
      .from('visit_history')
      .insert(batch);
    if (error) {
      console.warn(`History batch ${i} failed (non-fatal):`, error.message);
    }
  }

  console.log(`\nDone. Locations: ${inserted} inserted, ${failed} failed.`);
  if (failed > 0) console.log('Check errors above and re-run for failed rows.');
}

migrate().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
