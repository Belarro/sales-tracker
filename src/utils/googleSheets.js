// ============================================
// GOOGLE SHEETS API UTILITIES
// ============================================
// Handles all interactions with Google Sheets

import { CONFIG } from '../config.js';
import { getCurrentTimestamp } from './dateUtils.js';

/**
 * Initialize Google Sheets API client with access token from Google Identity Services
 */
export const initSheetsAPI = () => {
  return new Promise((resolve, reject) => {
    const initClient = () => {
      if (window.gapi) {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: CONFIG.GOOGLE_SHEETS_API_KEY,
              discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
            });

            // Set the access token from Google Identity Services
            if (window.googleAccessToken) {
              window.gapi.client.setToken({
                access_token: window.googleAccessToken
              });
              console.log('Sheets API client initialized with access token');
            } else {
              console.log('Sheets API client initialized (no token yet)');
            }

            resolve();
          } catch (error) {
            console.error('Failed to initialize Sheets API client:', error);
            reject(error);
          }
        });
      } else {
        // Retry if gapi not loaded yet
        setTimeout(initClient, 100);
      }
    };

    initClient();
  });
};

/**
 * Get all authorized users from sheet
 * @returns {Promise<Array>} List of authorized email addresses
 */
export const getAuthorizedUsers = async () => {
  try {
    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      range: `${CONFIG.SHEETS.AUTHORIZED_USERS}!B2:B`
    });

    const rows = response.result.values || [];
    const emails = rows.map(row => row[0]).filter(email => email);
    console.log('📋 Authorized users from sheet:', emails);
    return emails;
  } catch (error) {
    console.error('Error fetching authorized users:', error);
    return [];
  }
};

/**
 * Add a new authorized user
 * @param {string} email - User email to authorize
 */
export const addAuthorizedUser = async (email) => {
  try {
    await window.gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      range: `${CONFIG.SHEETS.AUTHORIZED_USERS}!B:B`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[email]]
      }
    });
    return true;
  } catch (error) {
    console.error('Error adding authorized user:', error);
    return false;
  }
};

/**
 * Remove an authorized user
 * @param {string} email - User email to remove
 */
export const removeAuthorizedUser = async (email) => {
  try {
    // Get all users
    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      range: `${CONFIG.SHEETS.AUTHORIZED_USERS}!B2:B`
    });

    const rows = response.result.values || [];
    const emails = rows.map(row => row[0]).filter(e => e);

    console.log('📋 Current users:', emails);
    console.log('🗑️ Removing:', email);

    // Filter out the user to remove
    const updatedEmails = emails.filter(e => e !== email);

    if (emails.length === updatedEmails.length) {
      console.log('❌ User not found in sheet:', email);
      return false;
    }

    // Clear all current data
    await window.gapi.client.sheets.spreadsheets.values.clear({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      range: `${CONFIG.SHEETS.AUTHORIZED_USERS}!B2:B`
    });

    // Write back the updated list (without gaps)
    if (updatedEmails.length > 0) {
      const values = updatedEmails.map(e => [e]);
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
        range: `${CONFIG.SHEETS.AUTHORIZED_USERS}!B2`,
        valueInputOption: 'RAW',
        resource: { values }
      });
    }

    console.log('✅ User removed successfully. Remaining users:', updatedEmails);
    return true;
  } catch (error) {
    console.error('Error removing authorized user:', error);
    return false;
  }
};

/**
 * Get all location data from sheet
 * @returns {Promise<Array>} List of all location records
 */
export const getAllLocations = async () => {
  try {
    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      range: `${CONFIG.SHEETS.DATA}!A2:R`
    });

    const rows = response.result.values || [];
    return rows.map(row => ({
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
      archived: row[17] || ''
    }));
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
};

/**
 * Check if location exists in sheet
 * @param {string} locationName - Name of the location
 * @param {string} businessAddress - Address of the location
 * @returns {Promise<Object|null>} Location data if exists, null otherwise
 */
export const checkLocationExists = async (locationName, businessAddress) => {
  const locations = await getAllLocations();
  return locations.find(
    loc => loc.locationName === locationName && loc.businessAddress === businessAddress
  ) || null;
};

/**
 * Add visit to history tab
 * @param {Object} visitData - Visit information
 */
export const addVisitToHistory = async (visitData) => {
  try {
    const values = [[
      visitData.timestamp,
      visitData.salesRep,
      visitData.locationName,
      visitData.businessAddress,
      visitData.directLink || '',
      visitData.businessPhone || '',
      visitData.businessEmail || '',
      visitData.businessWebsite || '',
      visitData.contactPerson || '',
      visitData.contactTitle || '',
      visitData.directPhone || '',
      visitData.directEmail || '',
      visitData.businessTypes || '',
      visitData.interestLevel || '',
      visitData.visitNotes || '',
      visitData.followUpDate || '',
      visitData.sampleGiven || ''
    ]];

    const appendResponse = await window.gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      range: `${CONFIG.SHEETS.VISIT_HISTORY}!A:Q`,
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    });

    // Get the row number that was just added
    const updatedRange = appendResponse.result.updates.updatedRange;
    const rowNum = parseInt(updatedRange.match(/\d+$/)[0]);

    // Set font size to 13 for the new row in Visit History
    await setRowFontSizeVisitHistory(rowNum);

    return true;
  } catch (error) {
    console.error('Error adding visit to history:', error);
    return false;
  }
};

/**
 * Save or update location data
 * @param {Object} locationData - Complete location information
 * @param {string} userName - Name of the user saving the data
 * @param {string} userEmail - Email of the user (for reference)
 * @returns {Promise<boolean>} Success status
 */
export const saveLocationData = async (locationData, userName, userEmail) => {
  try {
    // Check if gapi client is initialized
    if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
      console.error('Google Sheets API not initialized. Please wait and try again.');
      throw new Error('Google Sheets API not ready. Please refresh the page and try again.');
    }

    const timestamp = getCurrentTimestamp();
    const visitData = {
      timestamp,
      salesRep: userName,
      ...locationData
    };

    // Always add to visit history
    await addVisitToHistory(visitData);

    // Check if location exists in main Data tab
    const existingLocation = await checkLocationExists(
      locationData.locationName,
      locationData.businessAddress
    );

    console.log('🔍 Checking location:', {
      name: locationData.locationName,
      address: locationData.businessAddress,
      existingLocation: existingLocation
    });

    const values = [[
      timestamp,
      userName,
      locationData.locationName,
      locationData.businessAddress,
      locationData.directLink || '',
      locationData.businessPhone || '',
      locationData.businessEmail || '',
      locationData.businessWebsite || '',
      locationData.contactPerson || '',
      locationData.contactTitle || '',
      locationData.directPhone || '',
      locationData.directEmail || '',
      locationData.businessTypes || '',
      locationData.interestLevel || '',
      locationData.visitNotes || '',
      locationData.followUpDate || '',
      locationData.sampleGiven || '',
      locationData.archived || ''
    ]];

    if (existingLocation) {
      // Update existing row
      console.log('📝 Updating existing location in Data sheet');
      const locations = await getAllLocations();
      const rowIndex = locations.findIndex(
        loc => loc.locationName === locationData.locationName &&
               loc.businessAddress === locationData.businessAddress
      );

      if (rowIndex !== -1) {
        console.log(`✅ Updating row ${rowIndex + 2} in Data sheet`);
        await window.gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
          range: `${CONFIG.SHEETS.DATA}!A${rowIndex + 2}:R${rowIndex + 2}`,
          valueInputOption: 'USER_ENTERED',
          resource: { values }
        });

        // Set font size to 13 for the updated row
        await setRowFontSize(rowIndex + 2);
      }
    } else {
      // Add new row
      console.log('➕ Adding new location to Data sheet');
      const appendResponse = await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
        range: `${CONFIG.SHEETS.DATA}!A:R`,
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });

      // Get the row number that was just added
      const updatedRange = appendResponse.result.updates.updatedRange;
      const rowNum = parseInt(updatedRange.match(/\d+$/)[0]);

      // Set font size to 13 for the new row
      await setRowFontSize(rowNum);
    }

    return true;
  } catch (error) {
    console.error('Error saving location data:', error);
    return false;
  }
};

/**
 * Get visit history for a specific location
 * @param {string} locationName - Name of the location
 * @param {string} businessAddress - Address of the location
 * @returns {Promise<Array>} List of all visits for this location
 */
export const getLocationHistory = async (locationName, businessAddress) => {
  try {
    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      range: `${CONFIG.SHEETS.VISIT_HISTORY}!A2:Q`
    });

    const rows = response.result.values || [];
    return rows
      .filter(row => row[2] === locationName && row[3] === businessAddress)
      .map(row => ({
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
        sampleGiven: row[16] || ''
      }));
  } catch (error) {
    console.error('Error fetching location history:', error);
    return [];
  }
};

/**
 * Archive a location by setting archived flag to 'YES'
 * @param {string} locationName - Name of the location
 * @param {string} businessAddress - Address of the location
 * @returns {Promise<boolean>} Success status
 */
export const archiveLocation = async (locationName, businessAddress) => {
  try {
    const locations = await getAllLocations();
    const rowIndex = locations.findIndex(
      loc => loc.locationName === locationName && loc.businessAddress === businessAddress
    );

    if (rowIndex === -1) {
      console.error('Location not found');
      return false;
    }

    // Update only the archived column (column R)
    await window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      range: `${CONFIG.SHEETS.DATA}!R${rowIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [['YES']]
      }
    });

    return true;
  } catch (error) {
    console.error('Error archiving location:', error);
    return false;
  }
};

/**
 * Unarchive a location by clearing archived flag
 * @param {string} locationName - Name of the location
 * @param {string} businessAddress - Address of the location
 * @returns {Promise<boolean>} Success status
 */
export const unarchiveLocation = async (locationName, businessAddress) => {
  try {
    const locations = await getAllLocations();
    const rowIndex = locations.findIndex(
      loc => loc.locationName === locationName && loc.businessAddress === businessAddress
    );

    if (rowIndex === -1) {
      console.error('Location not found');
      return false;
    }

    // Clear the archived column
    await window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      range: `${CONFIG.SHEETS.DATA}!R${rowIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [['']]
      }
    });

    return true;
  } catch (error) {
    console.error('Error unarchiving location:', error);
    return false;
  }
};

/**
 * Delete a location from the Data sheet
 * @param {string} locationName - Name of the location
 * @param {string} businessAddress - Address of the location
 * @returns {Promise<boolean>} Success status
 */
export const deleteLocation = async (locationName, businessAddress) => {
  try {
    const locations = await getAllLocations();
    const rowIndex = locations.findIndex(
      loc => loc.locationName === locationName && loc.businessAddress === businessAddress
    );

    if (rowIndex === -1) {
      console.error('Location not found');
      return false;
    }

    // Delete the row (rowIndex + 2 because: +1 for 0-index, +1 for header row)
    await window.gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, // Assumes Data sheet is the first sheet (ID 0)
              dimension: 'ROWS',
              startIndex: rowIndex + 1, // +1 for header
              endIndex: rowIndex + 2
            }
          }
        }]
      }
    });

    return true;
  } catch (error) {
    console.error('Error deleting location:', error);
    return false;
  }
};

/**
 * Get all note templates from sheet
 * @returns {Promise<Array>} List of note templates
 */
export const getNoteTemplates = async () => {
  try {
    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      range: `${CONFIG.SHEETS.NOTE_TEMPLATES}!A2:A`
    });

    const rows = response.result.values || [];
    const templates = rows.map(row => row[0]).filter(template => template);

    // If no templates found, return defaults
    if (templates.length === 0) {
      return CONFIG.DEFAULT_NOTE_TEMPLATES;
    }

    return templates;
  } catch (error) {
    console.error('Error fetching note templates:', error);
    // Return defaults if sheet doesn't exist yet
    return CONFIG.DEFAULT_NOTE_TEMPLATES;
  }
};

/**
 * Add a new note template
 * @param {string} template - Template text
 * @returns {Promise<boolean>} Success status
 */
export const addNoteTemplate = async (template) => {
  try {
    await window.gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      range: `${CONFIG.SHEETS.NOTE_TEMPLATES}!A:A`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[template]]
      }
    });
    return true;
  } catch (error) {
    console.error('Error adding note template:', error);
    return false;
  }
};

/**
 * Remove a note template
 * @param {string} template - Template text to remove
 * @returns {Promise<boolean>} Success status
 */
export const removeNoteTemplate = async (template) => {
  try {
    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      range: `${CONFIG.SHEETS.NOTE_TEMPLATES}!A2:A`
    });

    const rows = response.result.values || [];
    const templates = rows.map(row => row[0]).filter(t => t);

    // Filter out the template to remove
    const updatedTemplates = templates.filter(t => t !== template);

    if (templates.length === updatedTemplates.length) {
      console.log('Template not found:', template);
      return false;
    }

    // Clear all current data
    await window.gapi.client.sheets.spreadsheets.values.clear({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      range: `${CONFIG.SHEETS.NOTE_TEMPLATES}!A2:A`
    });

    // Write back the updated list
    if (updatedTemplates.length > 0) {
      const values = updatedTemplates.map(t => [t]);
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
        range: `${CONFIG.SHEETS.NOTE_TEMPLATES}!A2`,
        valueInputOption: 'RAW',
        resource: { values }
      });
    }

    return true;
  } catch (error) {
    console.error('Error removing note template:', error);
    return false;
  }
};

/**
 * Get all admin emails from sheet
 * @returns {Promise<Array>} List of admin email addresses
 */
export const getAdminEmails = async () => {
  try {
    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      range: `${CONFIG.SHEETS.ADMIN_EMAILS}!A2:A`
    });

    const rows = response.result.values || [];
    const emails = rows.map(row => row[0]).filter(email => email);
    console.log('🔐 Admin emails from sheet:', emails);

    // Merge with .env admin emails (removing duplicates)
    const envAdmins = CONFIG.ADMIN_EMAILS || [];
    const allAdmins = [...new Set([...envAdmins, ...emails])];

    return allAdmins;
  } catch (error) {
    console.error('Error fetching admin emails:', error);
    // Return .env admins as fallback
    return CONFIG.ADMIN_EMAILS || [];
  }
};

/**
 * Add a new admin email
 * @param {string} email - Admin email to add
 * @returns {Promise<boolean>} Success status
 */
export const addAdminEmail = async (email) => {
  try {
    await window.gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      range: `${CONFIG.SHEETS.ADMIN_EMAILS}!A:A`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[email]]
      }
    });
    console.log('✅ Admin email added to sheet:', email);
    return true;
  } catch (error) {
    console.error('Error adding admin email:', error);
    return false;
  }
};

/**
 * Remove an admin email
 * @param {string} email - Admin email to remove
 * @returns {Promise<boolean>} Success status
 */
export const removeAdminEmail = async (email) => {
  try {
    // Get all admin emails from sheet
    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      range: `${CONFIG.SHEETS.ADMIN_EMAILS}!A2:A`
    });

    const rows = response.result.values || [];
    const emails = rows.map(row => row[0]).filter(e => e);

    console.log('🔐 Current admin emails in sheet:', emails);
    console.log('🗑️ Removing admin:', email);

    // Filter out the email to remove
    const updatedEmails = emails.filter(e => e !== email);

    if (emails.length === updatedEmails.length) {
      console.log('❌ Admin email not found in sheet:', email);
      return false;
    }

    // Clear all current data
    await window.gapi.client.sheets.spreadsheets.values.clear({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      range: `${CONFIG.SHEETS.ADMIN_EMAILS}!A2:A`
    });

    // Write back the updated list
    if (updatedEmails.length > 0) {
      const values = updatedEmails.map(e => [e]);
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
        range: `${CONFIG.SHEETS.ADMIN_EMAILS}!A2`,
        valueInputOption: 'RAW',
        resource: { values }
      });
    }

    console.log('✅ Admin email removed successfully. Remaining admins:', updatedEmails);
    return true;
  } catch (error) {
    console.error('Error removing admin email:', error);
    return false;
  }
};

/**
 * Set font size to 13 for a specific row in the Data sheet
 * @param {number} rowNumber - Row number (1-based)
 * @returns {Promise<boolean>} Success status
 */
const setRowFontSize = async (rowNumber) => {
  try {
    // Get sheet ID for Data sheet (usually 0, but we'll be safe)
    const spreadsheet = await window.gapi.client.sheets.spreadsheets.get({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID
    });

    const dataSheet = spreadsheet.result.sheets.find(
      sheet => sheet.properties.title === CONFIG.SHEETS.DATA
    );

    if (!dataSheet) {
      console.error('Data sheet not found');
      return false;
    }

    const sheetId = dataSheet.properties.sheetId;

    // Format the row with font size 13
    await window.gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      resource: {
        requests: [{
          repeatCell: {
            range: {
              sheetId: sheetId,
              startRowIndex: rowNumber - 1, // 0-based
              endRowIndex: rowNumber,
              startColumnIndex: 0, // Column A
              endColumnIndex: 18 // Column R (0-based, so 18 means up to column R)
            },
            cell: {
              userEnteredFormat: {
                textFormat: {
                  fontSize: 13
                }
              }
            },
            fields: 'userEnteredFormat.textFormat.fontSize'
          }
        }]
      }
    });

    return true;
  } catch (error) {
    console.error('Error setting font size:', error);
    return false;
  }
};

/**
 * Set font size to 13 for a specific row in the Visit History sheet
 * @param {number} rowNumber - Row number (1-based)
 * @returns {Promise<boolean>} Success status
 */
const setRowFontSizeVisitHistory = async (rowNumber) => {
  try {
    const spreadsheet = await window.gapi.client.sheets.spreadsheets.get({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID
    });

    const visitHistorySheet = spreadsheet.result.sheets.find(
      sheet => sheet.properties.title === CONFIG.SHEETS.VISIT_HISTORY
    );

    if (!visitHistorySheet) {
      console.error('Visit History sheet not found');
      return false;
    }

    const sheetId = visitHistorySheet.properties.sheetId;

    await window.gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      resource: {
        requests: [{
          repeatCell: {
            range: {
              sheetId: sheetId,
              startRowIndex: rowNumber - 1,
              endRowIndex: rowNumber,
              startColumnIndex: 0,
              endColumnIndex: 17 // Column Q (0-based)
            },
            cell: {
              userEnteredFormat: {
                textFormat: {
                  fontSize: 13
                }
              }
            },
            fields: 'userEnteredFormat.textFormat.fontSize'
          }
        }]
      }
    });

    return true;
  } catch (error) {
    console.error('Error setting font size for Visit History:', error);
    return false;
  }
};