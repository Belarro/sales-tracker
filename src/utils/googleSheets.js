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
      range: `${CONFIG.SHEETS.AUTHORIZED_USERS}!A2:A`
    });

    const rows = response.result.values || [];
    return rows.map(row => row[0]).filter(email => email);
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
      range: `${CONFIG.SHEETS.AUTHORIZED_USERS}!A:A`,
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
      range: `${CONFIG.SHEETS.AUTHORIZED_USERS}!A2:A`
    });

    const rows = response.result.values || [];
    const rowIndex = rows.findIndex(row => row[0] === email);

    if (rowIndex === -1) return false;

    // Delete the row (rowIndex + 2 because of header and 0-based index)
    await window.gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, // Adjust if needed
              dimension: 'ROWS',
              startIndex: rowIndex + 1,
              endIndex: rowIndex + 2
            }
          }
        }]
      }
    });

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
      range: `${CONFIG.SHEETS.DATA}!A2:O`
    });

    const rows = response.result.values || [];
    return rows.map(row => ({
      timestamp: row[0] || '',
      salesRep: row[1] || '',
      locationName: row[2] || '',
      businessAddress: row[3] || '',
      businessPhone: row[4] || '',
      businessEmail: row[5] || '',
      businessWebsite: row[6] || '',
      contactPerson: row[7] || '',
      contactTitle: row[8] || '',
      directPhone: row[9] || '',
      directEmail: row[10] || '',
      businessTypes: row[11] || '',
      interestLevel: row[12] || '',
      visitNotes: row[13] || '',
      followUpDate: row[14] || ''
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
      visitData.followUpDate || ''
    ]];

    await window.gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
      range: `${CONFIG.SHEETS.VISIT_HISTORY}!A:O`,
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    });

    return true;
  } catch (error) {
    console.error('Error adding visit to history:', error);
    return false;
  }
};

/**
 * Save or update location data
 * @param {Object} locationData - Complete location information
 * @param {string} userEmail - Email of the user saving the data
 * @returns {Promise<boolean>} Success status
 */
export const saveLocationData = async (locationData, userEmail) => {
  try {
    // Check if gapi client is initialized
    if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
      console.error('Google Sheets API not initialized. Please wait and try again.');
      throw new Error('Google Sheets API not ready. Please refresh the page and try again.');
    }

    const timestamp = getCurrentTimestamp();
    const visitData = {
      timestamp,
      salesRep: userEmail,
      ...locationData
    };

    // Always add to visit history
    await addVisitToHistory(visitData);

    // Check if location exists in main Data tab
    const existingLocation = await checkLocationExists(
      locationData.locationName,
      locationData.businessAddress
    );

    const values = [[
      timestamp,
      userEmail,
      locationData.locationName,
      locationData.businessAddress,
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
      locationData.followUpDate || ''
    ]];

    if (existingLocation) {
      // Update existing row
      const locations = await getAllLocations();
      const rowIndex = locations.findIndex(
        loc => loc.locationName === locationData.locationName &&
               loc.businessAddress === locationData.businessAddress
      );

      if (rowIndex !== -1) {
        await window.gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
          range: `${CONFIG.SHEETS.DATA}!A${rowIndex + 2}:O${rowIndex + 2}`,
          valueInputOption: 'USER_ENTERED',
          resource: { values }
        });
      }
    } else {
      // Add new row
      await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
        range: `${CONFIG.SHEETS.DATA}!A:O`,
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });
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
      range: `${CONFIG.SHEETS.VISIT_HISTORY}!A2:O`
    });

    const rows = response.result.values || [];
    return rows
      .filter(row => row[2] === locationName && row[3] === businessAddress)
      .map(row => ({
        timestamp: row[0] || '',
        salesRep: row[1] || '',
        locationName: row[2] || '',
        businessAddress: row[3] || '',
        businessPhone: row[4] || '',
        businessEmail: row[5] || '',
        businessWebsite: row[6] || '',
        contactPerson: row[7] || '',
        contactTitle: row[8] || '',
        directPhone: row[9] || '',
        directEmail: row[10] || '',
        businessTypes: row[11] || '',
        interestLevel: row[12] || '',
        visitNotes: row[13] || '',
        followUpDate: row[14] || ''
      }));
  } catch (error) {
    console.error('Error fetching location history:', error);
    return [];
  }
};