// ============================================
// GOOGLE SHEETS API UTILITIES
// ============================================
// Uses direct fetch() with Bearer token instead of gapi.client

import { CONFIG } from '../config.js';
import { getCurrentTimestamp } from './dateUtils.js';

const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
const SHEET_ID = CONFIG.GOOGLE_SHEET_ID;

// Column order matching the Data sheet headers exactly:
// Timestamp, Sales Rep, Location Name, Business Address, DirectLink,
// Business Phone, Business Email, Business Website, Contact Person,
// Contact Title, Direct Phone, Direct Email, Business Types,
// Interest Level, Visit Notes, Follow-up Date, Sample Given, "",
// pipelineStage, followUpCount, lastFollowUpDate, nextActionDate,
// nextActionType, automationStatus, materialsSent, notesInternal

const authHeaders = () => {
  const token = window.googleAccessToken;
  if (!token) throw new Error('Not signed in. Please sign out and sign back in.');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const apiFetch = async (url, options = {}) => {
  const headers = authHeaders();
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.error?.message || `HTTP ${res.status}`;
    console.error('Sheets API error:', res.status, msg);
    const err = new Error(msg);
    err.status = res.status;
    err.result = body;
    throw err;
  }
  return res.json();
};

const getValues = async (range) => {
  const url = `${BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}`;
  const data = await apiFetch(url);
  return data.values || [];
};

const updateValues = async (range, values, inputOption = 'USER_ENTERED') => {
  const url = `${BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=${inputOption}`;
  return apiFetch(url, {
    method: 'PUT',
    body: JSON.stringify({ values })
  });
};

const appendValues = async (range, values, inputOption = 'USER_ENTERED') => {
  const url = `${BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=${inputOption}`;
  return apiFetch(url, {
    method: 'POST',
    body: JSON.stringify({ values })
  });
};

const clearValues = async (range) => {
  const url = `${BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}:clear`;
  return apiFetch(url, { method: 'POST', body: '{}' });
};

const getSpreadsheet = async (fields = '') => {
  let url = `${BASE}/${SHEET_ID}`;
  if (fields) url += `?fields=${encodeURIComponent(fields)}`;
  return apiFetch(url);
};

const batchUpdate = async (requests) => {
  const url = `${BASE}/${SHEET_ID}:batchUpdate`;
  return apiFetch(url, {
    method: 'POST',
    body: JSON.stringify({ requests })
  });
};

const getSheetId = async (sheetTitle) => {
  const data = await getSpreadsheet('sheets.properties');
  const sheet = data.sheets?.find(s => s.properties.title === sheetTitle);
  return sheet ? sheet.properties.sheetId : null;
};

// ============================================
// Initialize
// ============================================

export const initSheetsAPI = () => {
  return new Promise((resolve) => {
    if (window.googleAccessToken) {
      console.log('Sheets API ready (using direct fetch with Bearer token)');
    } else {
      console.log('Sheets API ready (no token yet)');
    }
    resolve();
  });
};

// ============================================
// AUTHORIZED USERS
// ============================================

export const getAuthorizedUsers = async () => {
  try {
    const rows = await getValues(`${CONFIG.SHEETS.AUTHORIZED_USERS}!B2:B`);
    const emails = rows.map(row => row[0]).filter(Boolean);
    console.log('📋 Authorized users from sheet:', emails);
    return emails;
  } catch (error) {
    console.error('Error fetching authorized users:', error);
    return [];
  }
};

export const addAuthorizedUser = async (email) => {
  try {
    await appendValues(`${CONFIG.SHEETS.AUTHORIZED_USERS}!B:B`, [[email]]);
    return true;
  } catch (error) {
    console.error('Error adding authorized user:', error);
    return false;
  }
};

export const removeAuthorizedUser = async (email) => {
  try {
    const rows = await getValues(`${CONFIG.SHEETS.AUTHORIZED_USERS}!B2:B`);
    const rowIndex = rows.findIndex(row => row[0] === email);

    if (rowIndex === -1) return false;

    const sheetId = await getSheetId(CONFIG.SHEETS.AUTHORIZED_USERS);
    if (sheetId === null) throw new Error('Authorized Users sheet not found');

    await batchUpdate([{
      deleteDimension: {
        range: {
          sheetId,
          dimension: 'ROWS',
          startIndex: rowIndex + 1,
          endIndex: rowIndex + 2
        }
      }
    }]);

    return true;
  } catch (error) {
    console.error('Error removing authorized user:', error);
    return false;
  }
};

// ============================================
// LOCATIONS — column indices match actual sheet headers
// ============================================
// Col 0  (A):  Location Name
// Col 1  (B):  Business Address
// Col 2  (C):  Contact Person
// Col 3  (D):  Contact Title
// Col 4  (E):  Direct Phone
// Col 5  (F):  Direct Email
// Col 6  (G):  Business Types
// Col 7  (H):  Interest Level
// Col 8  (I):  Visit Notes
// Col 9  (J):  Timestamp (visit date)
// Col 10 (K):  Follow-up Date
// Col 11 (L):  Sample Given
// Col 12 (M):  Sales Rep
// Col 13 (N):  DirectLink
// Col 14 (O):  Business Phone
// Col 15 (P):  Business Email
// Col 16 (Q):  Business Website
// Col 17 (R):  Archived
// Col 18 (S):  pipelineStage
// Col 19 (T):  followUpCount
// Col 20 (U):  lastFollowUpDate
// Col 21 (V):  nextActionDate
// Col 22 (W):  nextActionType
// Col 23 (X):  automationStatus
// Col 24 (Y):  materialsSent
// Col 25 (Z):  notesInternal

function parseRow(row) {
  return {
    locationName: row[0] || '',
    businessAddress: row[1] || '',
    contactPerson: row[2] || '',
    contactTitle: row[3] || '',
    directPhone: row[4] || '',
    directEmail: row[5] || '',
    businessTypes: row[6] || '',
    interestLevel: row[7] || '',
    visitNotes: row[8] || '',
    timestamp: row[9] || '',
    followUpDate: row[10] || '',
    sampleGiven: row[11] || '',
    salesRep: row[12] || '',
    directLink: row[13] || '',
    businessPhone: row[14] || '',
    businessEmail: row[15] || '',
    businessWebsite: row[16] || '',
    archived: row[17] || '',
    pipelineStage: row[18] || '',
    followUpCount: row[19] || '0',
    lastFollowUpDate: row[20] || '',
    nextActionDate: row[21] || '',
    nextActionType: row[22] || '',
    automationStatus: row[23] || '',
    materialsSent: row[24] || '',
    notesInternal: row[25] || ''
  };
}

function buildValues(d) {
  return [
    d.locationName || '',
    d.businessAddress || '',
    d.contactPerson || '',
    d.contactTitle || '',
    d.directPhone || '',
    d.directEmail || '',
    d.businessTypes || '',
    d.interestLevel || '',
    d.visitNotes || '',
    d.timestamp || '',
    d.followUpDate || '',
    d.sampleGiven || '',
    d.salesRep || '',
    d.directLink || '',
    d.businessPhone || '',
    d.businessEmail || '',
    d.businessWebsite || '',
    d.archived || '',
    d.pipelineStage || CONFIG.PIPELINE_STAGES.NEW_VISIT,
    String(d.followUpCount || '0'),
    d.lastFollowUpDate || '',
    d.nextActionDate || '',
    d.nextActionType || '',
    d.automationStatus || '',
    d.materialsSent || '',
    d.notesInternal || ''
  ];
}

export const getAllLocations = async () => {
  try {
    const rows = await getValues(`${CONFIG.SHEETS.DATA}!A2:Z`);
    console.log('Loaded', rows.length, 'location rows from sheet');
    return rows.map(parseRow);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
};

export const checkLocationExists = async (locationName, businessAddress) => {
  const locations = await getAllLocations();
  return locations.find(
    loc => loc.locationName === locationName && loc.businessAddress === businessAddress
  ) || null;
};

// ============================================
// VISIT HISTORY
// ============================================

export const addVisitToHistory = async (visitData) => {
  try {
    const values = [buildValues(visitData)];
    const result = await appendValues(`${CONFIG.SHEETS.VISIT_HISTORY}!A:Z`, values);

    const updatedRange = result.updates?.updatedRange;
    if (updatedRange) {
      const rowNum = parseInt(updatedRange.match(/\d+$/)[0]);
      await setRowFontSizeVisitHistory(rowNum);
    }

    return true;
  } catch (error) {
    console.error('Error adding visit to history:', error);
    throw error;
  }
};

export const getLocationHistory = async (locationName, businessAddress) => {
  try {
    const rows = await getValues(`${CONFIG.SHEETS.VISIT_HISTORY}!A2:Z`);
    return rows
      .filter(row => row[2] === locationName && row[3] === businessAddress)
      .map(parseRow);
  } catch (error) {
    console.error('Error fetching location history:', error);
    return [];
  }
};

// ============================================
// SAVE / UPDATE LOCATION
// ============================================

export const saveLocationData = async (locationData, userName, userEmail) => {
  try {
    if (!window.googleAccessToken) {
      throw new Error('Not signed in. Please sign out and sign back in.');
    }

    const timestamp = getCurrentTimestamp();

    // Sanitize to prevent Formula Injection
    const isPhoneNumber = (val) => typeof val === 'string' && /^\+\d/.test(val);
    const sanitize = (val) => {
      if (typeof val !== 'string') return val;
      if (isPhoneNumber(val)) return val;
      if (val.startsWith('=') || val.startsWith('+') || val.startsWith('-') || val.startsWith('@')) {
        return "'" + val;
      }
      return val;
    };

    const fullData = {
      timestamp: timestamp,
      salesRep: userName,
      locationName: locationData.locationName || '',
      businessAddress: locationData.businessAddress || '',
      directLink: locationData.directLink || '',
      businessPhone: locationData.businessPhone || '',
      businessEmail: locationData.businessEmail || '',
      businessWebsite: locationData.businessWebsite || '',
      contactPerson: locationData.contactPerson || '',
      contactTitle: locationData.contactTitle || '',
      directPhone: locationData.directPhone || '',
      directEmail: locationData.directEmail || '',
      businessTypes: locationData.businessTypes || '',
      interestLevel: locationData.interestLevel || '',
      visitNotes: locationData.visitNotes || '',
      followUpDate: locationData.followUpDate || locationData.nextActionDate || '',
      sampleGiven: locationData.sampleGiven || '',
      archived: locationData.archived || '',
      pipelineStage: locationData.pipelineStage || CONFIG.PIPELINE_STAGES.NEW_VISIT,
      followUpCount: String(locationData.followUpCount || '0'),
      lastFollowUpDate: locationData.lastFollowUpDate || '',
      nextActionDate: locationData.nextActionDate || '',
      nextActionType: locationData.nextActionType || '',
      automationStatus: locationData.automationStatus || '',
      materialsSent: locationData.materialsSent || '',
      notesInternal: locationData.notesInternal || ''
    };

    // Sanitize all string values
    Object.keys(fullData).forEach(key => {
      fullData[key] = sanitize(fullData[key]);
    });

    // Always add to visit history
    await addVisitToHistory(fullData);

    // Single read: check if location exists and find row index
    const locations = await getAllLocations();
    const rowIndex = locations.findIndex(
      loc => loc.locationName === locationData.locationName &&
        loc.businessAddress === locationData.businessAddress
    );

    const values = [buildValues(fullData)];

    if (rowIndex !== -1) {
      // Update existing row
      await updateValues(`${CONFIG.SHEETS.DATA}!A${rowIndex + 2}:Z${rowIndex + 2}`, values);
      await setRowFontSize(rowIndex + 2);
    } else {
      // Append new row
      const result = await appendValues(`${CONFIG.SHEETS.DATA}!A:Z`, values);
      const updatedRange = result.updates?.updatedRange;
      if (updatedRange) {
        const rowNum = parseInt(updatedRange.match(/\d+$/)[0]);
        await setRowFontSize(rowNum);
      }
    }

    return true;
  } catch (error) {
    const apiError = error?.result?.error;
    if (apiError) {
      console.error('Google Sheets API error:', apiError.code, apiError.message);
    } else {
      console.error('Error saving location data:', error?.message || error);
    }
    throw error;
  }
};

// ============================================
// ARCHIVE / UNARCHIVE / DELETE
// ============================================

export const archiveLocation = async (locationName, businessAddress) => {
  try {
    const locations = await getAllLocations();
    const rowIndex = locations.findIndex(
      loc => loc.locationName === locationName && loc.businessAddress === businessAddress
    );
    if (rowIndex === -1) return false;

    await updateValues(`${CONFIG.SHEETS.DATA}!R${rowIndex + 2}`, [['YES']]);
    return true;
  } catch (error) {
    console.error('Error archiving location:', error);
    return false;
  }
};

export const unarchiveLocation = async (locationName, businessAddress) => {
  try {
    const locations = await getAllLocations();
    const rowIndex = locations.findIndex(
      loc => loc.locationName === locationName && loc.businessAddress === businessAddress
    );
    if (rowIndex === -1) return false;

    await updateValues(`${CONFIG.SHEETS.DATA}!R${rowIndex + 2}`, [['']]);
    return true;
  } catch (error) {
    console.error('Error unarchiving location:', error);
    return false;
  }
};

export const deleteLocation = async (locationName, businessAddress) => {
  try {
    const locations = await getAllLocations();
    const rowIndex = locations.findIndex(
      loc => loc.locationName === locationName && loc.businessAddress === businessAddress
    );
    if (rowIndex === -1) return false;

    const sheetId = await getSheetId(CONFIG.SHEETS.DATA);
    if (sheetId === null) return false;

    await batchUpdate([{
      deleteDimension: {
        range: {
          sheetId,
          dimension: 'ROWS',
          startIndex: rowIndex + 1,
          endIndex: rowIndex + 2
        }
      }
    }]);

    return true;
  } catch (error) {
    console.error('Error deleting location:', error);
    return false;
  }
};

// ============================================
// PIPELINE
// ============================================

export const updatePipelineData = async (locationName, businessAddress, pipelineData) => {
  try {
    const locations = await getAllLocations();
    const rowIndex = locations.findIndex(
      loc => loc.locationName === locationName && loc.businessAddress === businessAddress
    );
    if (rowIndex === -1) return false;

    const existing = locations[rowIndex];
    const rowNum = rowIndex + 2;

    const values = [[
      pipelineData.pipelineStage    ?? existing.pipelineStage    ?? '',
      pipelineData.followUpCount    ?? existing.followUpCount     ?? '0',
      pipelineData.lastFollowUpDate ?? existing.lastFollowUpDate  ?? '',
      pipelineData.nextActionDate   ?? existing.nextActionDate    ?? '',
      pipelineData.nextActionType   ?? existing.nextActionType    ?? '',
      pipelineData.automationStatus ?? existing.automationStatus  ?? '',
      pipelineData.materialsSent    ?? existing.materialsSent     ?? '',
      pipelineData.notesInternal    ?? existing.notesInternal     ?? ''
    ]];

    await updateValues(`${CONFIG.SHEETS.DATA}!S${rowNum}:Z${rowNum}`, values);
    console.log(`✅ Pipeline data updated for row ${rowNum}`);
    return true;
  } catch (error) {
    console.error('Error updating pipeline data:', error);
    return false;
  }
};

// ============================================
// NOTE TEMPLATES
// ============================================

export const getNoteTemplates = async () => {
  try {
    const rows = await getValues(`${CONFIG.SHEETS.NOTE_TEMPLATES}!A2:A`);
    const templates = rows.map(row => row[0]).filter(Boolean);
    return templates.length > 0 ? templates : CONFIG.DEFAULT_NOTE_TEMPLATES;
  } catch (error) {
    return CONFIG.DEFAULT_NOTE_TEMPLATES;
  }
};

export const addNoteTemplate = async (template) => {
  try {
    await appendValues(`${CONFIG.SHEETS.NOTE_TEMPLATES}!A:A`, [[template]]);
    return true;
  } catch (error) {
    console.error('Error adding note template:', error);
    return false;
  }
};

export const removeNoteTemplate = async (template) => {
  try {
    const rows = await getValues(`${CONFIG.SHEETS.NOTE_TEMPLATES}!A2:A`);
    const templates = rows.map(row => row[0]).filter(Boolean);
    const updatedTemplates = templates.filter(t => t !== template);

    if (templates.length === updatedTemplates.length) return false;

    await clearValues(`${CONFIG.SHEETS.NOTE_TEMPLATES}!A2:A`);

    if (updatedTemplates.length > 0) {
      const values = updatedTemplates.map(t => [t]);
      await updateValues(`${CONFIG.SHEETS.NOTE_TEMPLATES}!A2`, values, 'RAW');
    }

    return true;
  } catch (error) {
    console.error('Error removing note template:', error);
    return false;
  }
};

// ============================================
// ADMIN EMAILS
// ============================================

export const getAdminEmails = async () => {
  try {
    const rows = await getValues(`${CONFIG.SHEETS.ADMIN_EMAILS}!A2:A`);
    const emails = rows.map(row => row[0]).filter(Boolean);
    const envAdmins = CONFIG.ADMIN_EMAILS || [];
    return [...new Set([...envAdmins, ...emails])];
  } catch (error) {
    if (error.status === 400) {
      console.log(`Sheet '${CONFIG.SHEETS.ADMIN_EMAILS}' missing. Creating it...`);
      await createSheet(CONFIG.SHEETS.ADMIN_EMAILS);
    } else {
      console.warn('Could not fetch admin emails from sheet (using .env fallback):', error.message);
    }
    return CONFIG.ADMIN_EMAILS || [];
  }
};

export const getSheetAdmins = async () => {
  try {
    const rows = await getValues(`${CONFIG.SHEETS.ADMIN_EMAILS}!A2:A`);
    return rows.map(row => row[0]).filter(Boolean);
  } catch (error) {
    return [];
  }
};

export const getEnvAdmins = () => {
  return CONFIG.ADMIN_EMAILS || [];
};

export const createSheet = async (title) => {
  try {
    await batchUpdate([{
      addSheet: { properties: { title } }
    }]);
    return true;
  } catch (error) {
    console.error(`Error creating sheet '${title}':`, error);
    return false;
  }
};

export const addAdminEmail = async (email) => {
  try {
    await appendValues(`${CONFIG.SHEETS.ADMIN_EMAILS}!A:A`, [[email]]);
    console.log('✅ Admin email added to sheet:', email);
    return true;
  } catch (error) {
    console.error('Error adding admin email:', error);
    return false;
  }
};

export const removeAdminEmail = async (email) => {
  try {
    const rows = await getValues(`${CONFIG.SHEETS.ADMIN_EMAILS}!A2:A`);
    const rowIndex = rows.findIndex(row => row[0] === email);
    if (rowIndex === -1) return false;

    const sheetId = await getSheetId(CONFIG.SHEETS.ADMIN_EMAILS);
    if (sheetId === null) throw new Error('Admin Emails sheet not found');

    await batchUpdate([{
      deleteDimension: {
        range: {
          sheetId,
          dimension: 'ROWS',
          startIndex: rowIndex + 1,
          endIndex: rowIndex + 2
        }
      }
    }]);

    return true;
  } catch (error) {
    console.error('Error removing admin email:', error);
    return false;
  }
};

// ============================================
// ROW FORMATTING
// ============================================

const setRowFontSize = async (rowNumber) => {
  try {
    const sheetId = await getSheetId(CONFIG.SHEETS.DATA);
    if (sheetId === null) return false;

    await batchUpdate([{
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: rowNumber - 1,
          endRowIndex: rowNumber,
          startColumnIndex: 0,
          endColumnIndex: 26
        },
        cell: {
          userEnteredFormat: {
            textFormat: { fontSize: 13 }
          }
        },
        fields: 'userEnteredFormat.textFormat.fontSize'
      }
    }]);

    return true;
  } catch (error) {
    console.error('Error setting font size:', error);
    return false;
  }
};

const setRowFontSizeVisitHistory = async (rowNumber) => {
  try {
    const sheetId = await getSheetId(CONFIG.SHEETS.VISIT_HISTORY);
    if (sheetId === null) return false;

    await batchUpdate([{
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: rowNumber - 1,
          endRowIndex: rowNumber,
          startColumnIndex: 0,
          endColumnIndex: 26
        },
        cell: {
          userEnteredFormat: {
            textFormat: { fontSize: 13 }
          }
        },
        fields: 'userEnteredFormat.textFormat.fontSize'
      }
    }]);

    return true;
  } catch (error) {
    console.error('Error setting font size for Visit History:', error);
    return false;
  }
};
