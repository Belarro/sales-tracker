// ============================================
// GOOGLE SHEETS MIRROR (background, best-effort)
// ============================================
// Supabase is primary. This runs after every successful Supabase write.
// If it fails, data is already safe — user is never affected.

const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const SHEET_TAB = 'Data';

const DATA_HEADERS = [
  'Location Name','Business Address','Contact Person','Contact Title',
  'Direct Phone','Direct Email','Business Types','Interest Level',
  'Visit Notes','Timestamp','Follow-up Date','Sample Given',
  'Sales Rep','Direct Link','Business Phone','Business Email',
  'Business Website','Archived','Pipeline Stage','Follow-up Count',
  'Last Follow-up Date','Next Action Date','Next Action Type',
  'Automation Status','Materials Sent','Notes Internal',
  'Language','Uses Microgreens'
];

const authHeaders = () => {
  const token = window.googleAccessToken;
  if (!token) return null;
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const apiFetch = async (url, options = {}) => {
  const headers = authHeaders();
  if (!headers) throw new Error('No token');
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `HTTP ${res.status}`);
  }
  return res.json();
};

const getValues = (range) =>
  apiFetch(`${BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}`).then(d => d.values || []);

const updateValues = (range, values) =>
  apiFetch(`${BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    body: JSON.stringify({ values })
  });

const appendValues = (range, values) =>
  apiFetch(`${BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    body: JSON.stringify({ values })
  });

// Convert app data object → flat array matching DATA_HEADERS column order
const toSheetRow = (d) => [
  d.locationName    || '',
  d.businessAddress || '',
  d.contactPerson   || '',
  d.contactTitle    || '',
  d.directPhone     || '',
  d.directEmail     || '',
  d.businessTypes   || '',
  d.interestLevel   || '',
  d.visitNotes      || '',
  d.timestamp       || '',
  d.followUpDate    || '',
  d.sampleGiven     || '',
  d.salesRep        || '',
  d.directLink      || '',
  d.businessPhone   || '',
  d.businessEmail   || '',
  d.businessWebsite || '',
  d.archived        || '',
  d.pipelineStage   || '',
  String(d.followUpCount || '0'),
  d.lastFollowUpDate  || '',
  d.nextActionDate    || '',
  d.nextActionType    || '',
  d.automationStatus  || '',
  d.materialsSent     || '',
  d.notesInternal     || '',
  d.language          || '',
  d.usesMicrogreens ? 'YES' : 'NO'
];

// Ensure header row exists
const ensureHeaders = async () => {
  try {
    const rows = await getValues(`${SHEET_TAB}!A1:AB1`);
    if (!rows?.[0]?.[0] || rows[0][0] !== 'Location Name') {
      await updateValues(`${SHEET_TAB}!A1:AB1`, [DATA_HEADERS]);
    }
  } catch {
    // Non-fatal — sheet may not exist yet
  }
};

/**
 * Mirror a location save to Google Sheets (background, non-blocking).
 * Called after successful Supabase write. Never throws — all errors are swallowed.
 */
export const mirrorToSheets = (locationData) => {
  if (!SHEET_ID || !window.googleAccessToken) return;

  // Fire and forget — don't await this
  (async () => {
    try {
      await ensureHeaders();

      const row = toSheetRow(locationData);

      // Find existing row by location name + address (col A + B)
      const existing = await getValues(`${SHEET_TAB}!A2:B`);
      const rowIndex = existing.findIndex(
        r => r[0] === locationData.locationName && r[1] === locationData.businessAddress
      );

      if (rowIndex !== -1) {
        // Update existing row
        await updateValues(`${SHEET_TAB}!A${rowIndex + 2}:AB${rowIndex + 2}`, [row]);
      } else {
        // Append new row
        await appendValues(`${SHEET_TAB}!A:AB`, [row]);
      }

      console.log(`📊 Sheet mirror: ${locationData.locationName}`);
    } catch (err) {
      // Silent — Supabase already has the data, sheet mirror is best-effort
      console.warn('Sheet mirror failed (non-fatal):', err.message);
    }
  })();
};
