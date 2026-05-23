/**
 * ============================================================================
 * SALES TRACKER → BELARRO SUPABASE SYNC
 * ============================================================================
 *
 * This Google Apps Script syncs prospects from your Sales Tracker Google Sheet
 * directly to Belarro's Supabase database.
 *
 * When you mark a prospect as "Closed Deal" in the Interest Level column:
 * 1. Script detects the edit
 * 2. Extracts prospect data from the row
 * 3. Calls Belarro API to create/update restaurant
 * 4. Restaurant appears in Belarro orders page immediately
 *
 * DEPLOYMENT:
 * 1. Open your Sales Tracker Google Sheet
 * 2. Extensions > Apps Script
 * 3. Delete any existing code, paste this entire script
 * 4. Click Save
 * 5. Authorize when prompted
 * 6. Close Apps Script editor
 * 7. Test: Edit any row and change Interest Level to "Closed Deal"
 * ============================================================================
 */

// Configuration
const SYNC_ENDPOINT = 'https://belarro-v2.vercel.app/api/sync-sales-tracker';
const DATA_SHEET_NAME = 'Data';

/**
 * Trigger function that runs when the sheet is edited.
 * Detects when a prospect status changes to "Closed Deal" and syncs to Belarro.
 */
function onEdit(e) {
  const sheet = e.source.getActiveSheet();

  // Only process edits on the Data sheet
  if (sheet.getName() !== DATA_SHEET_NAME) {
    return;
  }

  const editedRange = e.range;
  const row = editedRange.getRow();
  const col = editedRange.getColumn();

  // Get all headers to find the Interest Level column
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const interestLevelCol = headers.indexOf('Interest Level') + 1;

  // Only process if Interest Level column was edited
  if (col !== interestLevelCol) {
    return;
  }

  // Get the edited value
  const newValue = editedRange.getValue();

  // Check if it's being marked as a Client (closed deal or similar)
  const isClient = String(newValue).toLowerCase() === 'closed deal' ||
                   String(newValue).toLowerCase() === 'closeddeal' ||
                   String(newValue).toLowerCase() === 'customer';

  if (!isClient) {
    return;
  }

  // Get all column indices from headers
  const locationCol = headers.indexOf('Location Name') + 1;
  const contactCol = headers.indexOf('Contact Person') + 1;
  const phoneCol = headers.indexOf('Direct Phone') + 1;
  const emailCol = headers.indexOf('Direct Email') + 1;
  const addressCol = headers.indexOf('Business Address') + 1;
  const cityCol = headers.indexOf('City') !== -1 ? headers.indexOf('City') + 1 : 0;

  // Get the prospect data from this row
  const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

  const prospect = {
    restaurant_name: String(rowData[locationCol - 1] || '').trim(),
    chef_name: String(rowData[contactCol - 1] || '').trim(),
    chef_phone: String(rowData[phoneCol - 1] || '').trim(),
    chef_email: String(rowData[emailCol - 1] || '').trim(),
    address: String(rowData[addressCol - 1] || '').trim(),
    city: cityCol > 0 ? String(rowData[cityCol - 1] || '').trim() : 'Berlin',
  };

  // Validate required fields
  if (!prospect.restaurant_name || !prospect.chef_name || !prospect.chef_phone) {
    console.log('Sync skipped: Missing required fields');
    return;
  }

  // Sync to Belarro
  syncProspectToSupabase(prospect);
}

/**
 * Syncs a prospect to Belarro's Supabase database via the API endpoint.
 */
function syncProspectToSupabase(prospect) {
  try {
    const response = UrlFetchApp.fetch(SYNC_ENDPOINT, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        locationName: prospect.restaurant_name,
        contactPerson: prospect.chef_name,
        directPhone: prospect.chef_phone,
        directEmail: prospect.chef_email || null,
        language: 'DE',
        visitNotes: 'Synced from Sales Tracker',
        sampleGiven: false,
        visitDate: new Date().toISOString()
      }),
      muteHttpExceptions: true
    });

    const result = JSON.parse(response.getContentText());

    if (response.getResponseCode() !== 200) {
      throw new Error(result.error || `HTTP ${response.getResponseCode()}`);
    }

    console.log(`Synced: ${prospect.restaurant_name} (ID: ${result.id})`);
    SpreadsheetApp.getActiveSpreadsheet().toast(
      `✓ ${prospect.restaurant_name} synced to Belarro!`,
      'Sync Successful',
      5
    );

  } catch (err) {
    console.error('Sync error:', err.message);
    SpreadsheetApp.getActiveSpreadsheet().toast(
      `✗ Sync failed: ${err.message}`,
      'Sync Error',
      5
    );
  }
}
