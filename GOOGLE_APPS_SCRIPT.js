/**
 * GOOGLE APPS SCRIPT FOR FOLLOW-UP DATE COLOR CODING
 *
 * This script automatically colors cells in the Data sheet based on follow-up date status:
 * - Yellow: Follow-up date is 1-7 days overdue
 * - Red: Follow-up date is 8+ days overdue
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

  // Get all data (starting from row 2 to skip header)
  var lastRow = dataSheet.getLastRow();
  if (lastRow < 2) {
    Logger.log('No data rows found');
    return;
  }

  var dataRange = dataSheet.getRange(2, 1, lastRow - 1, 18); // A2:R (18 columns)
  var values = dataRange.getValues();

  var today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate comparison

  var yellowColor = '#fff3cd'; // Yellow background
  var redColor = '#f8d7da';    // Red background
  var whiteColor = '#ffffff';  // White background (clear formatting)

  // Track which rows to color
  var rowsToColor = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];

    // Column indices (0-based):
    // 13 = Interest Level (N)
    // 15 = Follow-up Date (P)
    // 16 = Sample Given (Q)
    // 17 = Archived (R)

    var interestLevel = row[13]; // Column N
    var followUpDateStr = row[15]; // Column P
    var archived = row[17]; // Column R

    // Skip if archived
    if (archived === 'YES') {
      rowsToColor.push({ row: i + 2, color: whiteColor }); // Clear any existing color
      continue;
    }

    // Skip if no follow-up needed (Not Interested or Closed Deal)
    if (interestLevel === 'Not Interested' || interestLevel === 'Closed Deal') {
      rowsToColor.push({ row: i + 2, color: whiteColor }); // Clear any existing color
      continue;
    }

    // Skip if no follow-up date
    if (!followUpDateStr || followUpDateStr === '') {
      rowsToColor.push({ row: i + 2, color: whiteColor }); // Clear any existing color
      continue;
    }

    // Parse follow-up date (expecting format: DD/MM/YYYY or MM/DD/YYYY)
    var followUpDate = new Date(followUpDateStr);

    // Check if date is valid
    if (isNaN(followUpDate.getTime())) {
      Logger.log('Invalid date format in row ' + (i + 2) + ': ' + followUpDateStr);
      rowsToColor.push({ row: i + 2, color: whiteColor });
      continue;
    }

    followUpDate.setHours(0, 0, 0, 0); // Reset time to midnight

    // Calculate days overdue
    var diffTime = today - followUpDate;
    var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Determine color based on days overdue
    var color = whiteColor; // Default: no color

    if (diffDays >= 8) {
      // 8+ days overdue = RED
      color = redColor;
      Logger.log('Row ' + (i + 2) + ': ' + diffDays + ' days overdue - RED');
    } else if (diffDays >= 1 && diffDays <= 7) {
      // 1-7 days overdue = YELLOW
      color = yellowColor;
      Logger.log('Row ' + (i + 2) + ': ' + diffDays + ' days overdue - YELLOW');
    }

    rowsToColor.push({ row: i + 2, color: color });
  }

  // Apply colors to column Q (Sample Given column - column 17)
  for (var j = 0; j < rowsToColor.length; j++) {
    var rowNum = rowsToColor[j].row;
    var color = rowsToColor[j].color;

    // Color only column Q (column 17)
    var cell = dataSheet.getRange(rowNum, 17, 1, 1);
    cell.setBackground(color);
  }

  Logger.log('Follow-up date coloring completed. Processed ' + rowsToColor.length + ' rows.');
}

/**
 * Set up a daily trigger to run the coloring function automatically
 * Run this function ONCE to set up the automatic daily trigger
 */
function setupDailyTrigger() {
  // Delete any existing triggers for this function to avoid duplicates
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'colorFollowUpDates') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Create new daily trigger (runs every day at midnight)
  ScriptApp.newTrigger('colorFollowUpDates')
    .timeBased()
    .everyDays(1)
    .atHour(0) // Midnight
    .create();

  Logger.log('Daily trigger set up successfully. The script will run automatically every day at midnight.');

  // Run once immediately to test
  colorFollowUpDates();
}

/**
 * Remove the daily trigger (if needed)
 */
function removeDailyTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'colorFollowUpDates') {
      ScriptApp.deleteTrigger(triggers[i]);
      Logger.log('Trigger removed');
    }
  }
}

/**
 * Manual run function - use this to test the script manually
 */
function manualRun() {
  colorFollowUpDates();
}
