import { supabase } from './supabaseClient.js';

const NEW_LEAD_GAPS = { 1: 0, 2: 2, 3: 5, 4: 14, 5: 30 };
const REENGAGE_GAPS = { 1: 0, 2: 5, 3: 14, 4: 30 };

function isOldLead(visitDateISO) {
  if (!visitDateISO) return false;
  const ms = Date.now() - new Date(visitDateISO).getTime();
  return ms / (1000 * 60 * 60 * 24) > 30;
}

function addBusinessDays(from, days) {
  if (days === 0) return from;
  const result = new Date(from);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

async function seedFollowUps(locationId, visitDate) {
  // Don't seed if rows already exist for this location
  const { data: existing } = await supabase
    .from('belarro_v4_follow_up')
    .select('id')
    .eq('location_id', locationId)
    .limit(1);

  if (existing && existing.length > 0) return;

  const old = isOldLead(visitDate);
  const gaps = old ? REENGAGE_GAPS : NEW_LEAD_GAPS;
  const now = new Date();
  // Anchor to start-of-today in local timezone so stage 1 always lands on today
  // regardless of what time the lead is created (even after midnight)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const rows = [];

  for (const [stageStr, days] of Object.entries(gaps)) {
    const stage = Number(stageStr);
    const dueDate = stage === 1 ? todayStart : addBusinessDays(todayStart, days);

    rows.push({
      location_id: locationId,
      follow_up_number: stage,
      follow_up_days: days,
      stage,
      due_date: dueDate.toISOString(),
      status: 'pending',
      sent_via: null,
      sent_date: null,
    });
  }

  await supabase.from('belarro_v4_follow_up').insert(rows);
}

export async function syncProspectToSupabase(prospectData) {
  const {
    locationName,
    contactPerson,
    directPhone,
    directEmail = null,
    language = 'DE',
    visitNotes = '',
    sampleGiven = false,
    visitDate = new Date().toISOString(),
    salesRep = ''
  } = prospectData;

  try {
    if (!locationName || !contactPerson || !directPhone) {
      return { success: false, error: 'Missing required fields: locationName, contactPerson, directPhone' };
    }

    const response = await fetch(
      'https://wbqzlxdyjdmbzifhsyil.supabase.co/functions/v1/sync-prospect-to-restaurant',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName,
          contactPerson,
          directPhone,
          directEmail,
          language: (language || 'DE').toUpperCase(),
          visitNotes,
          sampleGiven,
          visitDate,
          salesRep
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.id) {
      // Seed follow-up rows immediately after location is created
      await seedFollowUps(data.id, visitDate).catch(err => {
        console.warn('Follow-up seed failed (non-fatal):', err.message);
      });

      return { success: true, id: data.id, locationName, contactPerson };
    } else {
      return { success: false, error: data.error || 'Unknown sync error' };
    }
  } catch (err) {
    console.error('Sync error:', err.message);
    return { success: false, error: err.message };
  }
}

export default { syncProspectToSupabase };
