/**
 * GOOGLE APPS SCRIPT FOR SALES TRACKER - PIPELINE & FOLLOW-UP COLOR CODING
 *
 * This script automatically colors cells in the Data sheet based on:
 * - Follow-up date status (column P - legacy, column V - pipeline)
 * - Pipeline stage (row background tint)
 * - Automation status (column X)
 *
 * COLUMN LAYOUT (A-AB, 28 columns):
 * A: timestamp, B: salesRep, C: locationName, D: businessAddress,
 * E: directLink, F: businessPhone, G: businessEmail, H: businessWebsite,
 * I: contactPerson, J: contactTitle, K: directPhone, L: directEmail,
 * M: businessTypes, N: interestLevel, O: visitNotes, P: followUpDate,
 * Q: sampleGiven, R: archived,
 * S: pipelineStage, T: followUpCount, U: lastFollowUpDate,
 * V: nextActionDate, W: nextActionType, X: automationStatus,
 * Y: materialsSent, Z: notesInternal,
 * AA: whatsAppLink (auto-generated), AB: sentCheckbox (tick when sent)
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

// ============================================================
// FOLLOW-UP DIGEST — sends you a daily email with WhatsApp links
// ============================================================

/**
 * YOUR EMAIL — change this to the email you want to receive the digest at.
 */
var DIGEST_EMAIL = 'hello@belarro.com';

/**
 * Price list links
 */
// Links sent to chefs — for-chefs page with ordering system
var CHEF_LINK_EN = 'https://belarro.com/for-chefs';
var CHEF_LINK_DE = 'https://belarro.com/de/for-chefs';

/**
 * Build personalized for-chefs link with pre-filled restaurant/contact
 */
function chefLink(base, contactName, locationName) {
  var parts = [];
  if (locationName) parts.push('c=' + encodeURIComponent(locationName));
  if (contactName) parts.push('n=' + encodeURIComponent(contactName));
  return parts.length > 0 ? base + '?' + parts.join('&') : base;
}

/**
 * Your name for messages
 */
var SENDER_NAME = 'Ron';

/**
 * Follow-up message templates by pipeline stage.
 * Each returns the message text for WhatsApp.
 */
function getMessageForStage(stage, contactName, locationName, lang) {
  var isDE = (lang || 'DE').toUpperCase() === 'DE';

  var templates = {
    'new_visit': isDE
      ? 'Hi ' + contactName + ', hier ist Ron von Belarro.\n\n'
        + 'Hat mich gefreut dich heute bei ' + locationName + ' kennenzulernen. Danke dass du dir die Zeit genommen hast.\n\n'
        + 'Hier ist alles was wir anbauen mit Preisen — du kannst auch direkt bestellen:\n' + chefLink(CHEF_LINK_DE, contactName, locationName) + '\n\n'
        + 'Wir liefern jeden Dienstag. Keine Mindestbestellung, keine Lieferkosten. Sag Bescheid wenn du uns testen moechtest.\n\n'
        + 'Ron Ben\nGruender von Belarro'
      : 'Hi ' + contactName + ', this is Ron from Belarro.\n\n'
        + 'It was really nice meeting you today at ' + locationName + '. Thank you for taking the time.\n\n'
        + 'Here is everything we grow with prices — you can also order directly:\n' + chefLink(CHEF_LINK_EN, contactName, locationName) + '\n\n'
        + 'We deliver every Tuesday. No minimum order, no delivery cost. Let me know if you\'d like to test us.\n\n'
        + 'Ron Ben\nFounder of Belarro',

    'follow_up_1': isDE
      ? 'Hi ' + contactName + ', hast du die Proben schon probiert? Wuerde mich freuen zu hoeren wie sie dir geschmeckt haben und ob du irgendwelche Anmerkungen hast.\n\n'
        + 'Ron'
      : 'Hi ' + contactName + ', did you get a chance to try the samples? Would love to hear how you liked them and if you have any thoughts.\n\n'
        + 'Ron',

    'follow_up_2': isDE
      ? 'Hi ' + contactName + ', wollte nur nochmal erinnern: keine Mindestbestellung, keine Lieferkosten. Du kannst auch einfach die kleinste Box bestellen um uns einmal zu testen. Und du kannst jederzeit aendern oder pausieren.\n\n'
        + 'Schreib mir einfach wenn du soweit bist.\n\n'
        + 'Ron'
      : 'Hi ' + contactName + ', just a quick reminder: no minimum order, no delivery fee. You can order even the smallest box just to give us a try. And you can always change or cancel anytime.\n\n'
        + 'Just write me whenever you are ready.\n\n'
        + 'Ron',

    'follow_up_3': isDE
      ? 'Hi ' + contactName + ', wir haben ein paar neue Sorten im Angebot. Schau mal rein: ' + chefLink(CHEF_LINK_DE, contactName, locationName) + '\n\n'
        + 'Soll ich Dienstag was vorbeibringen?\n\n'
        + 'Ron'
      : 'Hi ' + contactName + ', we just started growing some new varieties. Worth a look: ' + chefLink(CHEF_LINK_EN, contactName, locationName) + '\n\n'
        + 'Want me to bring some by this Tuesday?\n\n'
        + 'Ron',

    'order_confirmed': isDE
      ? 'Hi ' + contactName + ', du bist im Plan.\n\nErste Lieferung: Dienstag.\n\nRechnung kommt per Email nach Lieferung. Falls du mal Mengen oder Sorten aendern willst, schreib mir einfach.\n\n'
        + 'Ron'
      : 'Hi ' + contactName + ', you\'re on the schedule.\n\nFirst delivery: Tuesday.\n\nInvoice comes by email after delivery. If you ever want to change quantities or varieties, just message me.\n\n'
        + 'Ron',

    'recurring': isDE
      ? 'Hi ' + contactName + ', Bestellung fuer Dienstag? Gleich wie letzte Woche oder Aenderungen?\n\n'
        + 'Ron'
      : 'Hi ' + contactName + ', order for Tuesday? Same as last week or any changes?\n\n'
        + 'Ron',

    'inactive_2wk': isDE
      ? 'Hi ' + contactName + ', alles gut bei euch? Soll ich Dienstag wieder was mitbringen?\n\n'
        + 'Ron'
      : 'Hi ' + contactName + ', everything good with you? Want me to bring something this Tuesday?\n\n'
        + 'Ron',

    'inactive_1mo': isDE
      ? 'Hi ' + contactName + ', falls sich euer Menue geaendert hat und du andere Sorten brauchst, passen wir gerne an. Wir sind da wenn du uns brauchst.\n\n'
        + 'Ron'
      : 'Hi ' + contactName + ', if your menu changed and you need different varieties, happy to adjust. I am here when you need us.\n\n'
        + 'Ron',

    'post_delivery': isDE
      ? 'Hi ' + contactName + ', wie war alles? Irgendwas das du fuer naechste Woche aendern wuerdest?\n\n'
        + 'Ron'
      : 'Hi ' + contactName + ', how did everything look? Anything you would change for next week?\n\n'
        + 'Ron',

    'delivery_reminder': isDE
      ? 'Hi ' + contactName + ', kurze Bestaetigung fuer morgen: deine Bestellung kommt gegen Mittag. Bis dann!\n\n'
        + 'Ron'
      : 'Hi ' + contactName + ', just confirming for tomorrow: your order will arrive around noon. See you then!\n\n'
        + 'Ron'
  };

  return templates[stage] || null;
}

/**
 * Next stage mapping — after sending, what stage comes next
 */
function getNextStage(stage) {
  var map = {
    'new_visit':         'follow_up_1',
    'follow_up_1':       'follow_up_2',
    'follow_up_2':       'follow_up_3',
    'follow_up_3':       'closed_lost',
    'order_confirmed':   'delivery_reminder',
    'recurring':         'recurring',
    'inactive_2wk':      'inactive_1mo',
    'inactive_1mo':      'closed_lost',
    'post_delivery':     'recurring',
    'delivery_reminder': 'post_delivery'
  };
  return map[stage] || null;
}

/**
 * Days until next follow-up after this stage
 */
function getNextActionDays(stage) {
  var map = {
    'new_visit':         2,
    'follow_up_1':       3,
    'follow_up_2':       14,
    'follow_up_3':       null,
    'order_confirmed':   null,
    'recurring':         7,
    'inactive_2wk':      14,
    'inactive_1mo':      null,
    'post_delivery':     4,
    'delivery_reminder': 2
  };
  return map[stage] !== undefined ? map[stage] : null;
}

/**
 * Human-readable stage labels
 */
function getStageLabel(stage) {
  var labels = {
    'new_visit':         'Send prices & intro',
    'follow_up_1':       'How were the samples?',
    'follow_up_2':       'Reminder, just try us',
    'follow_up_3':       'New varieties',
    'final_touch':       'Final soft touch',
    'recurring':         'Weekly order',
    'inactive_2wk':      'Inactive 2wk',
    'inactive_1mo':      'Inactive 1mo',
    'post_delivery':     'Post-delivery',
    'delivery_reminder': 'Delivery reminder',
    'order_confirmed':   'Order confirmed'
  };
  return labels[stage] || stage;
}

/**
 * MAIN FUNCTION: Send Follow-Up Digest Email
 *
 * Scans the sheet for contacts due today or overdue,
 * builds an email with WhatsApp click-to-send links,
 * and optionally marks rows as "digest_sent" to avoid duplicates.
 */
function sendFollowUpDigest() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName('Data');

  if (!dataSheet) {
    Logger.log('Data sheet not found');
    return;
  }

  var lastRow = dataSheet.getLastRow();
  if (lastRow < 2) {
    Logger.log('No data rows');
    return;
  }

  var dataRange = dataSheet.getRange(2, 1, lastRow - 1, 26);
  var values = dataRange.getValues();

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var overdue = [];
  var dueToday = [];
  var upcoming = []; // next 3 days

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var rowNum = i + 2;

    var locationName    = row[2];  // C
    var businessAddress = row[3];  // D
    var businessPhone   = row[5];  // F
    var contactPerson   = row[8];  // I
    var contactTitle    = row[9];  // J
    var directPhone     = row[10]; // K
    var directEmail     = row[11]; // L
    var interestLevel   = row[13]; // N
    var visitNotes      = row[14]; // O
    var sampleGiven     = row[16]; // Q
    var archived        = row[17]; // R
    var pipelineStage   = row[18]; // S
    var nextActionDate  = row[21]; // V
    var nextActionType  = row[22]; // W
    var automationStatus = row[23]; // X

    // Skip archived, closed, already sent, or no action date
    if (archived === 'YES') continue;
    if (pipelineStage === 'closed_won' || pipelineStage === 'closed_lost') continue;
    if (automationStatus === 'sent' || automationStatus === 'delivered') continue;
    if (!nextActionDate) continue;

    var actionDate = new Date(nextActionDate);
    if (isNaN(actionDate.getTime())) continue;
    actionDate.setHours(0, 0, 0, 0);

    var diffDays = Math.floor((today - actionDate) / 86400000);

    // Only include overdue (diffDays > 0), today (diffDays === 0), and upcoming (diffDays -1 to -3)
    if (diffDays < -3) continue;

    // Pick the phone number (prefer direct, fallback to business)
    var phone = (directPhone || businessPhone || '').toString().replace(/[^0-9+]/g, '');

    // Detect language from notes or default to DE
    var lang = 'DE';
    if (visitNotes && visitNotes.toString().toLowerCase().indexOf('[en]') !== -1) lang = 'EN';

    // Get the message template
    var message = getMessageForStage(pipelineStage, contactPerson || 'there', locationName, lang);

    // Build WhatsApp link
    var waLink = '';
    if (phone && message) {
      var cleanPhone = phone.replace(/^\+/, '');
      waLink = 'https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(message);
    }

    var entry = {
      rowNum: rowNum,
      locationName: locationName,
      businessAddress: businessAddress,
      contactPerson: contactPerson || '(no name)',
      contactTitle: contactTitle,
      phone: phone,
      email: directEmail,
      stage: pipelineStage,
      stageLabel: getStageLabel(pipelineStage),
      interestLevel: interestLevel,
      sampleGiven: sampleGiven,
      visitNotes: visitNotes ? visitNotes.toString().substring(0, 100) : '',
      nextActionDate: Utilities.formatDate(actionDate, Session.getScriptTimeZone(), 'dd.MM.yyyy'),
      diffDays: diffDays,
      waLink: waLink,
      message: message
    };

    if (diffDays > 0) {
      overdue.push(entry);
    } else if (diffDays === 0) {
      dueToday.push(entry);
    } else {
      upcoming.push(entry);
    }
  }

  var totalDue = overdue.length + dueToday.length;

  if (totalDue === 0 && upcoming.length === 0) {
    Logger.log('No follow-ups due. No email sent.');
    return;
  }

  // Build the HTML email
  var html = '';
  html += '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">';
  html += '<h2 style="color:#2d5016;">Belarro Follow-Up Digest</h2>';
  html += '<p style="color:#666;">' + Utilities.formatDate(today, Session.getScriptTimeZone(), 'EEEE, dd MMMM yyyy') + '</p>';

  if (totalDue > 0) {
    html += '<p style="font-size:18px;font-weight:bold;">' + totalDue + ' contact' + (totalDue > 1 ? 's' : '') + ' to follow up with today</p>';
  } else {
    html += '<p style="color:#666;">No follow-ups due today. Here\'s what\'s coming up:</p>';
  }

  // Render a section
  function renderSection(title, color, entries) {
    if (entries.length === 0) return '';
    var s = '<h3 style="color:' + color + ';border-bottom:2px solid ' + color + ';padding-bottom:5px;">' + title + ' (' + entries.length + ')</h3>';

    for (var j = 0; j < entries.length; j++) {
      var e = entries[j];
      s += '<div style="background:#f9f9f9;border-left:4px solid ' + color + ';padding:12px;margin:10px 0;border-radius:4px;">';

      // Header: restaurant name + contact
      s += '<div style="font-size:16px;font-weight:bold;">' + e.locationName + '</div>';
      s += '<div style="color:#555;">' + e.contactPerson;
      if (e.contactTitle) s += ' (' + e.contactTitle + ')';
      s += '</div>';

      // Stage + due date
      s += '<div style="margin:6px 0;">';
      s += '<span style="background:#e8f5e9;padding:2px 8px;border-radius:3px;font-size:12px;">' + e.stageLabel + '</span>';
      if (e.diffDays > 0) {
        s += ' <span style="color:#d32f2f;font-weight:bold;">' + e.diffDays + ' day' + (e.diffDays > 1 ? 's' : '') + ' overdue</span>';
      } else if (e.diffDays === 0) {
        s += ' <span style="color:#f57c00;font-weight:bold;">Due today</span>';
      } else {
        s += ' <span style="color:#666;">Due ' + e.nextActionDate + '</span>';
      }
      s += '</div>';

      // Notes snippet
      if (e.visitNotes) {
        s += '<div style="color:#777;font-size:12px;font-style:italic;margin:4px 0;">"' + e.visitNotes + '"</div>';
      }

      // Sample given
      if (e.sampleGiven === 'YES') {
        s += '<div style="color:#2d5016;font-size:12px;">Sample was given</div>';
      }

      // ACTION BUTTONS
      s += '<div style="margin-top:10px;">';

      // WhatsApp button (the main one)
      if (e.waLink) {
        s += '<a href="' + e.waLink + '" style="display:inline-block;background:#25D366;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;margin-right:8px;">Send WhatsApp</a>';
      }

      // If they have email, add email link
      if (e.email) {
        var emailSubject = encodeURIComponent('Belarro - ' + e.stageLabel);
        var emailBody = e.message ? encodeURIComponent(e.message) : '';
        s += '<a href="mailto:' + e.email + '?subject=' + emailSubject + '&body=' + emailBody + '" style="display:inline-block;background:#1976D2;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;margin-right:8px;">Send Email</a>';
      }

      // Phone call link
      if (e.phone) {
        s += '<a href="tel:' + e.phone + '" style="display:inline-block;background:#666;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;">Call</a>';
      }

      s += '</div>'; // buttons
      s += '</div>'; // card
    }
    return s;
  }

  html += renderSection('OVERDUE', '#d32f2f', overdue);
  html += renderSection('DUE TODAY', '#f57c00', dueToday);
  html += renderSection('COMING UP (next 3 days)', '#666666', upcoming);

  // Footer
  html += '<hr style="margin:20px 0;border:none;border-top:1px solid #ddd;">';
  html += '<p style="color:#999;font-size:12px;">After sending each message, open the sheet and update column X (automationStatus) to "sent".</p>';
  html += '<p style="color:#999;font-size:12px;">Or just reply "done" to this email and I\'ll mark them.</p>';
  html += '</div>';

  // Send the email
  var subject = totalDue > 0
    ? 'Belarro: ' + totalDue + ' follow-up' + (totalDue > 1 ? 's' : '') + ' due today'
    : 'Belarro: ' + upcoming.length + ' follow-up' + (upcoming.length > 1 ? 's' : '') + ' coming up';

  MailApp.sendEmail({
    to: DIGEST_EMAIL,
    subject: subject,
    htmlBody: html
  });

  Logger.log('Digest sent to ' + DIGEST_EMAIL + '. Overdue: ' + overdue.length + ', Today: ' + dueToday.length + ', Upcoming: ' + upcoming.length);
}

/**
 * Mark a row as "sent" after you've sent the WhatsApp message.
 * Call from sheet: =markAsSent(rowNumber)
 * Or run manually and pass the row number.
 */
function markRowAsSent(rowNum) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName('Data');

  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  // Update automationStatus (X = 24) to "sent"
  dataSheet.getRange(rowNum, 24).setValue('sent');

  // Update lastFollowUpDate (U = 21)
  dataSheet.getRange(rowNum, 21).setValue(today);

  // Increment followUpCount (T = 20)
  var currentCount = dataSheet.getRange(rowNum, 20).getValue() || 0;
  dataSheet.getRange(rowNum, 20).setValue(Number(currentCount) + 1);

  // Advance pipeline stage (S = 19)
  var currentStage = dataSheet.getRange(rowNum, 19).getValue();
  var nextStage = getNextStage(currentStage);
  if (nextStage) {
    dataSheet.getRange(rowNum, 19).setValue(nextStage);
  }

  // Set next action date (V = 22)
  var nextDays = getNextActionDays(currentStage);
  if (nextDays) {
    var nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + nextDays);
    var nextDateStr = Utilities.formatDate(nextDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    dataSheet.getRange(rowNum, 22).setValue(nextDateStr);
    // Reset automationStatus for next round
    dataSheet.getRange(rowNum, 24).setValue('pending');
  } else {
    // No more follow-ups — clear next action date
    dataSheet.getRange(rowNum, 22).setValue('');
    dataSheet.getRange(rowNum, 24).setValue('');
  }

  Logger.log('Row ' + rowNum + ' marked as sent. Next stage: ' + (nextStage || 'none'));
}

/**
 * Bulk mark — after you send all messages, run this to mark all
 * today's due contacts as sent and auto-advance their pipeline.
 */
function markAllDueAsSent() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName('Data');
  var lastRow = dataSheet.getLastRow();
  if (lastRow < 2) return;

  var values = dataSheet.getRange(2, 1, lastRow - 1, 26).getValues();
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var count = 0;

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var archived = row[17];
    var pipelineStage = row[18];
    var nextActionDate = row[21];
    var automationStatus = row[23];

    if (archived === 'YES') continue;
    if (pipelineStage === 'closed_won' || pipelineStage === 'closed_lost') continue;
    if (automationStatus === 'sent' || automationStatus === 'delivered') continue;
    if (!nextActionDate) continue;

    var actionDate = new Date(nextActionDate);
    if (isNaN(actionDate.getTime())) continue;
    actionDate.setHours(0, 0, 0, 0);

    if (actionDate <= today) {
      markRowAsSent(i + 2);
      count++;
    }
  }

  Logger.log('Marked ' + count + ' rows as sent and advanced pipeline stages.');
}

// ============================================================
// SETUP — run this once to add the digest trigger
// ============================================================

/**
 * Set up ALL triggers: color coding (midnight) + follow-up digest (8am).
 * Run this ONCE after pasting the script.
 */
function setupAllTriggers() {
  // Remove all existing triggers
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }

  // Color coding at midnight
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

  // Follow-up digest at 8am every day
  ScriptApp.newTrigger('sendFollowUpDigest')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();

  // Edit trigger for sent checkbox + interest level changes
  ScriptApp.newTrigger('onSheetEdit')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();

  Logger.log('All triggers set up: color coding at midnight, digest at 8am, edit trigger for checkboxes.');

  // Refresh sheet links
  refreshSheetLinks();
}

// ============================================================
// IN-SHEET WHATSAPP LINKS + WHAT TO BRING + SENT CHECKBOX
// ============================================================

/**
 * Refresh WhatsApp links (AA), what-to-bring reminders (AB),
 * and ensure sent checkboxes exist (AC) for all rows.
 * Run manually or on a trigger after new data comes in.
 */
function refreshSheetLinks() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName('Data');
  if (!dataSheet) return;

  var lastRow = dataSheet.getLastRow();
  if (lastRow < 2) return;

  // Add headers if missing
  var headers = dataSheet.getRange(1, 27, 1, 2).getValues()[0];
  if (headers[0] !== 'WhatsApp Link') dataSheet.getRange(1, 27).setValue('WhatsApp Link');
  if (headers[1] !== 'Sent') dataSheet.getRange(1, 28).setValue('Sent');
  // Clear old column AC header and AB "What To Bring" if they exist
  var oldHeaders = dataSheet.getRange(1, 29, 1, 1).getValues()[0];
  if (oldHeaders[0] === 'Sent' || oldHeaders[0] === 'What To Bring') dataSheet.getRange(1, 29).setValue('');

  // Read all data (A-Z = 26 columns)
  var values = dataSheet.getRange(2, 1, lastRow - 1, 26).getValues();

  var waLinks = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var locationName  = row[2];  // C
    var contactPerson = row[8];  // I
    var directPhone   = row[10]; // K
    var businessPhone = row[5];  // F
    var interestLevel = row[13]; // N
    var sampleGiven   = row[16]; // Q
    var archived      = row[17]; // R
    var pipelineStage = row[18]; // S
    var nextActionDate = row[21]; // V
    var automationStatus = row[23]; // X
    var visitNotes    = row[14]; // O

    // Skip archived or closed
    if (archived === 'YES' || pipelineStage === 'closed_won' || pipelineStage === 'closed_lost') {
      waLinks.push(['']);
      continue;
    }

    // Phone number
    var phone = (directPhone || businessPhone || '').toString().replace(/[^0-9+]/g, '');

    // Language
    var lang = 'DE';
    if (visitNotes && visitNotes.toString().toLowerCase().indexOf('[en]') !== -1) lang = 'EN';

    // Generate WhatsApp link
    var waLink = '';
    if (phone && pipelineStage) {
      var message = getMessageForStage(pipelineStage, contactPerson || 'there', locationName, lang);
      if (message) {
        var cleanPhone = phone.replace(/^\+/, '');
        waLink = 'https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(message);
      }
    }
    waLinks.push([waLink]);
  }

  // Build rich text values for AA (WhatsApp links) in one batch
  var richTexts = [];
  for (var j = 0; j < waLinks.length; j++) {
    if (waLinks[j][0]) {
      richTexts.push([SpreadsheetApp.newRichTextValue()
        .setText('Send WhatsApp')
        .setLinkUrl(waLinks[j][0])
        .build()]);
    } else {
      richTexts.push([SpreadsheetApp.newRichTextValue().setText('').build()]);
    }
  }
  dataSheet.getRange(2, 27, richTexts.length, 1).setRichTextValues(richTexts);
  // Style the whole AA column at once
  var aaRange = dataSheet.getRange(2, 27, richTexts.length, 1);
  aaRange.setFontColor('#25D366');
  aaRange.setFontWeight('bold');

  // Add checkboxes to AB column (28) in one batch
  var abRange = dataSheet.getRange(2, 28, values.length, 1);
  abRange.insertCheckboxes();
  // Clear old column AC if it had checkboxes
  if (lastRow > 1) {
    dataSheet.getRange(2, 29, lastRow - 1, 1).clearContent();
    dataSheet.getRange(2, 29, lastRow - 1, 1).clearDataValidations();
  }

  Logger.log('Sheet links refreshed. Rows: ' + values.length);
}

/**
 * onEdit trigger: when you tick the "Sent" checkbox (AC),
 * auto-advance the pipeline and schedule next follow-up.
 * Also: when interestLevel (N) changes to "Closed Deal",
 * set pipeline to closed_won and clear follow-ups.
 */
function onSheetEdit(e) {
  var sheet = e.source.getActiveSheet();
  if (sheet.getName() !== 'Data') return;

  var col = e.range.getColumn();
  var row = e.range.getRow();
  if (row < 2) return;

  // AB = column 28: Sent checkbox ticked
  if (col === 28 && e.value === 'TRUE') {
    markRowAsSent(row);
    // Uncheck the box after processing
    sheet.getRange(row, 28).setValue(false);
    // Refresh the WhatsApp link for next stage
    SpreadsheetApp.flush();
    refreshSingleRow(row);
  }

  // N = column 14: Interest level changed
  if (col === 14) {
    var newInterest = e.value;
    if (newInterest === 'Closed Deal') {
      // Convert to client
      sheet.getRange(row, 19).setValue('closed_won');   // S: pipelineStage
      sheet.getRange(row, 22).setValue('');              // V: nextActionDate
      sheet.getRange(row, 24).setValue('');              // X: automationStatus
      sheet.getRange(row, 27).setValue('');              // AA: clear WA link
      sheet.getRange(row, 28).setValue(false);           // AB: uncheck
      Logger.log('Row ' + row + ' converted to client (closed_won)');
    } else if (newInterest === 'Not Interested') {
      sheet.getRange(row, 19).setValue('closed_lost');
      sheet.getRange(row, 22).setValue('');
      sheet.getRange(row, 24).setValue('');
      sheet.getRange(row, 27).setValue('');
      sheet.getRange(row, 28).setValue(false);
      Logger.log('Row ' + row + ' marked as closed_lost');
    }
  }
}

/**
 * Refresh WhatsApp link and reminder for a single row
 */
function refreshSingleRow(rowNum) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName('Data');
  var row = dataSheet.getRange(rowNum, 1, 1, 26).getValues()[0];

  var locationName  = row[2];
  var contactPerson = row[8];
  var directPhone   = row[10];
  var businessPhone = row[5];
  var pipelineStage = row[18];
  var archived      = row[17];
  var sampleGiven   = row[16];
  var visitNotes    = row[14];

  if (archived === 'YES' || pipelineStage === 'closed_won' || pipelineStage === 'closed_lost') {
    dataSheet.getRange(rowNum, 27).setValue('');
    return;
  }

  var phone = (directPhone || businessPhone || '').toString().replace(/[^0-9+]/g, '');
  var lang = 'DE';
  if (visitNotes && visitNotes.toString().toLowerCase().indexOf('[en]') !== -1) lang = 'EN';

  if (phone && pipelineStage) {
    var message = getMessageForStage(pipelineStage, contactPerson || 'there', locationName, lang);
    if (message) {
      var cleanPhone = phone.replace(/^\+/, '');
      var waLink = 'https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(message);
      var cell = dataSheet.getRange(rowNum, 27);
      var richText = SpreadsheetApp.newRichTextValue()
        .setText('Send WhatsApp')
        .setLinkUrl(waLink)
        .build();
      cell.setRichTextValue(richText);
      cell.setFontColor('#25D366');
      cell.setFontWeight('bold');
    }
  }
}

/**
 * Set up the onEdit trigger for the sent checkbox and interest level changes.
 * Run this ONCE.
 */
function setupEditTrigger() {
  // Remove existing onSheetEdit triggers
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onSheetEdit') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('onSheetEdit')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();

  Logger.log('Edit trigger set up for sent checkbox and interest level changes.');
}
