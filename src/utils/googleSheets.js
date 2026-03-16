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
// Col 0:  Timestamp
// Col 1:  Sales Rep
// Col 2:  Location Name
// Col 3:  Business Address
// Col 4:  DirectLink
// Col 5:  Business Phone
// Col 6:  Business Email
// Col 7:  Business Website
// Col 8:  Contact Person
// Col 9:  Contact Title
// Col 10: Direct Phone
// Col 11: Direct Email
// Col 12: Business Types
// Col 13: Interest Level
// Col 14: Visit Notes
// Col 15: Follow-up Date
// Col 16: Sample Given
// Col 17: (empty header — Archived)
// Col 18: pipelineStage
// Col 19: followUpCount
// Col 20: lastFollowUpDate
// Col 21: nextActionDate
// Col 22: nextActionType
// Col 23: automationStatus
// Col 24: materialsSent
// Col 25: notesInternal

function parseRow(row) {
  return {
    timestamp: row[0] || '',
    salesRep: row[1] || '',
    locationName: row[2] || '',
    businessAddress: row[3] || '',
    directLink: row[4] || '',
    businessPhone: row[5] || '',
    businessEmail: row[6] || '',
    businessWebsite: row[7] || '',
    contactPerson: row[8] || '',
    contactTitle: row[9] || '',
    directPhone: row[10] || '',
    directEmail: row[11] || '',
    businessTypes: row[12] || '',
    interestLevel: row[13] || '',
    visitNotes: row[14] || '',
    followUpDate: row[15] || '',
    sampleGiven: row[16] || '',
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
    d.timestamp || '',
    d.salesRep || '',
    d.locationName || '',
    d.businessAddress || '',
    d.directLink || '',
    d.businessPhone || '',
    d.businessEmail || '',
    d.businessWebsite || '',
    d.contactPerson || '',
    d.contactTitle || '',
    d.directPhone || '',
    d.directEmail || '',
    d.businessTypes || '',
    d.interestLevel || '',
    d.visitNotes || '',
    d.followUpDate || '',
    d.sampleGiven || '',
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
