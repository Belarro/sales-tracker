/**
 * GOOGLE APPS SCRIPT FOR SALES TRACKER - PIPELINE & FOLLOW-UP COLOR CODING
 *
 * This script automatically colors cells in the Data sheet based on:
 * - Follow-up date status (column P - legacy, column V - pipeline)
 * - Pipeline stage (row background tint)
 * - Automation status (column X)
 *
 * COLUMN LAYOUT (A-Z, 26 columns):
 * A: timestamp, B: salesRep, C: locationName, D: businessAddress,
 * E: directLink, F: businessPhone, G: businessEmail, H: businessWebsite,
 * I: contactPerson, J: contactTitle, K: directPhone, L: directEmail,
 * M: businessTypes, N: interestLevel, O: visitNotes, P: followUpDate,
 * Q: sampleGiven, R: archived,
 * S: pipelineStage, T: followUpCount, U: lastFollowUpDate,
 * V: nextActionDate, W: nextActionType, X: automationStatus,
 * Y: materialsSent, Z: notesInternal
 *
 * INSTALLATION INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code
 * 4. Copy and paste this entire script
 * 5. Click "Save" (disk icon)
 * 6. Click "Run" > "setupDailyTrigger" (authorize when prompted)
 * 7. The script will now run automatically every day at midnight
 */

function colorFollowUpDates() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName('Data');

  if (!dataSheet) {
    Logger.log('Data sheet not found');
    return;
  }

  var lastRow = dataSheet.getLastRow();
  if (lastRow < 2) {
    Logger.log('No data rows found');
    return;
  }

  // Read all 26 columns (A-Z)
  var dataRange = dataSheet.getRange(2, 1, lastRow - 1, 26);
  var values = dataRange.getValues();

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  // Color palette
  var colors = {
    white:      '#ffffff',
    yellow:     '#fff3cd',
    red:        '#f8d7da',
    // Pipeline stage row tints (very subtle)
    newVisit:   '#ffffff',
    followUp1:  '#fffde7',
    followUp2:  '#fff8e1',
    followUp3:  '#fff3e0',
    closedWon:  '#e8f5e9',
    closedLost: '#fce4ec'
  };

  var pipelineRowColors = {
    'new_visit':    colors.newVisit,
    'follow_up_1':  colors.followUp1,
    'follow_up_2':  colors.followUp2,
    'follow_up_3':  colors.followUp3,
    'closed_won':   colors.closedWon,
    'closed_lost':  colors.closedLost
  };

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var rowNum = i + 2;

    // Column indices (0-based)
    var interestLevel    = row[13]; // N
    var legacyFollowUp   = row[15]; // P
    var archived         = row[17]; // R
    var pipelineStage    = row[18]; // S
    var nextActionDate   = row[21]; // V
    var automationStatus = row[23]; // X

    // 1. Apply pipeline stage row background (entire row A-Z)
    var rowBg = pipelineRowColors[pipelineStage] || colors.white;
    if (archived === 'YES') rowBg = colors.white;
    dataSheet.getRange(rowNum, 1, 1, 26).setBackground(rowBg);

    // 2. Color nextActionDate cell (column V = 22) by urgency
    if (!archived && nextActionDate && automationStatus !== 'sent' && automationStatus !== 'delivered') {
      var actionDate = new Date(nextActionDate);
      if (!isNaN(actionDate.getTime())) {
        actionDate.setHours(0, 0, 0, 0);
        var diffDays = Math.floor((today - actionDate) / 86400000);

        var cellColor = rowBg;
        if (diffDays >= 8) {
          cellColor = colors.red;
        } else if (diffDays >= 1) {
          cellColor = colors.yellow;
        }
        dataSheet.getRange(rowNum, 22, 1, 1).setBackground(cellColor);
      }
    }

    // 3. Color legacy followUpDate (column P = 16) for backward compatibility
    if (legacyFollowUp && !archived) {
      var legacyDate = new Date(legacyFollowUp);
      if (!isNaN(legacyDate.getTime())) {
        legacyDate.setHours(0, 0, 0, 0);
        var legacyDiff = Math.floor((today - legacyDate) / 86400000);
        var legacyColor = rowBg;
        if (legacyDiff >= 8) legacyColor = colors.red;
        else if (legacyDiff >= 1) legacyColor = colors.yellow;
        dataSheet.getRange(rowNum, 16, 1, 1).setBackground(legacyColor);
      }
    }
  }

  Logger.log('Pipeline color coding complete. Rows processed: ' + values.length);
}

/**
 * Color automation status column (X = column 24)
 * Amber for pending, green for sent/delivered, red for failed
 */
function colorAutomationStatus() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName('Data');

  if (!dataSheet) return;

  var lastRow = dataSheet.getLastRow();
  if (lastRow < 2) return;

  var statusRange = dataSheet.getRange(2, 24, lastRow - 1, 1); // Column X
  var statuses = statusRange.getValues();

  var pendingColor  = '#fff3cd';
  var sentColor     = '#d4edda';
  var failedColor   = '#f8d7da';
  var whiteColor    = '#ffffff';

  for (var i = 0; i < statuses.length; i++) {
    var status = statuses[i][0];
    var cell = dataSheet.getRange(i + 2, 24, 1, 1);

    if (status === 'pending')                            cell.setBackground(pendingColor);
    else if (status === 'sent' || status === 'delivered') cell.setBackground(sentColor);
    else if (status === 'failed')                        cell.setBackground(failedColor);
    else                                                 cell.setBackground(whiteColor);
  }

  Logger.log('Automation status coloring complete.');
}

/**
 * Set up daily triggers to run color coding functions
 * Run this function ONCE to set up automatic daily triggers
 */
function setupDailyTrigger() {
  // Delete any existing triggers to avoid duplicates
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    var fn = triggers[i].getHandlerFunction();
    if (fn === 'colorFollowUpDates' || fn === 'colorAutomationStatus') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Create daily triggers (run at midnight)
  ScriptApp.newTrigger('colorFollowUpDates')
    .timeBased()
    .everyDays(1)
    .atHour(0)
    .create();

  ScriptApp.newTrigger('colorAutomationStatus')
    .timeBased()
    .everyDays(1)
    .atHour(0)
    .create();

  Logger.log('Daily triggers set up successfully.');

  // Run once immediately to test
  colorFollowUpDates();
  colorAutomationStatus();
}

/**
 * Remove all daily triggers
 */
function removeDailyTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
    Logger.log('Trigger removed: ' + triggers[i].getHandlerFunction());
  }
}

/**
 * Manual run - test both functions
 */
function manualRun() {
  colorFollowUpDates();
  colorAutomationStatus();
}
