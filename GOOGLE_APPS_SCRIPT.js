/**
 * GOOGLE APPS SCRIPT FOR SALES TRACKER - PIPELINE & FOLLOW-UP SYSTEM
 *
 * Features:
 * - Color-codes rows by pipeline stage and urgency
 * - Sends daily follow-up digest email at 8am (Mon + Thu only)
 * - In-sheet WhatsApp links with pre-filled messages
 * - Checkbox to mark as sent and auto-advance pipeline
 * - All dates in European format (DD.MM.YYYY) for display
 * - Follow-ups snap to Monday or Thursday (follow-up days)
 *
 * COLUMN LAYOUT (A-AB, 28 columns):
 * A: locationName, B: businessAddress, C: contactPerson, D: contactTitle,
 * E: directPhone, F: directEmail, G: businessTypes, H: interestLevel,
 * I: visitNotes, J: timestamp, K: followUpDate, L: sampleGiven,
 * M: salesRep, N: directLink, O: businessPhone, P: businessEmail,
 * Q: businessWebsite, R: archived,
 * S: pipelineStage, T: followUpCount, U: lastFollowUpDate,
 * V: nextActionDate, W: nextActionType, X: automationStatus,
 * Y: materialsSent, Z: notesInternal,
 * AA: whatsAppLink (auto-generated), AB: sentCheckbox (tick when sent)
 *
 * INSTALLATION:
 * 1. Open your Google Sheet → Extensions → Apps Script
 * 2. Delete any existing code, paste this entire script
 * 3. Click Save, then Run → setupAllTriggers (authorize when prompted)
 */

// ============================================================
// CONFIGURATION
// ============================================================

var DIGEST_EMAIL = 'hello@belarro.com';
var SENDER_NAME = 'Ron';
var CHEF_LINK_EN = 'https://belarro.com/for-chefs';
var CHEF_LINK_DE = 'https://belarro.com/de/for-chefs';

// Follow-up days: Monday (1) and Thursday (4)
var FOLLOW_UP_DAYS = [1, 4];

// ============================================================
// DATE UTILITIES
// ============================================================

/**
 * Parse a date string in YYYY-MM-DD or DD.MM.YYYY or DD-MM-YYYY format.
 * Also handles native Date objects from Sheets.
 */
function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    value.setHours(0, 0, 0, 0);
    return value;
  }
  var str = value.toString().trim();
  var d;
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    var parts = str.split('-');
    d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }
  // DD.MM.YYYY
  else if (/^\d{2}\.\d{2}\.\d{4}$/.test(str)) {
    var parts = str.split('.');
    d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  // DD-MM-YYYY
  else if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    var parts = str.split('-');
    d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  else {
    d = new Date(str);
  }
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Format a Date to DD.MM.YYYY (European format)
 */
function formatEU(date) {
  if (!date) return '';
  var dd = String(date.getDate()).padStart(2, '0');
  var mm = String(date.getMonth() + 1).padStart(2, '0');
  var yyyy = date.getFullYear();
  return dd + '.' + mm + '.' + yyyy;
}

/**
 * Format a Date to YYYY-MM-DD (ISO, for storage in sheet)
 */
function formatISO(date) {
  if (!date) return '';
  var dd = String(date.getDate()).padStart(2, '0');
  var mm = String(date.getMonth() + 1).padStart(2, '0');
  var yyyy = date.getFullYear();
  return yyyy + '-' + mm + '-' + dd;
}

/**
 * Snap a date to the next Monday or Thursday (on or after).
 * If the date is already Mon or Thu, returns that date.
 */
function snapToFollowUpDay(date) {
  var d = new Date(date);
  d.setHours(0, 0, 0, 0);
  var dow = d.getDay();

  if (FOLLOW_UP_DAYS.indexOf(dow) !== -1) return d;

  var bestDiff = 999;
  for (var i = 0; i < FOLLOW_UP_DAYS.length; i++) {
    var diff = (FOLLOW_UP_DAYS[i] - dow + 7) % 7;
    if (diff > 0 && diff < bestDiff) bestDiff = diff;
  }
  d.setDate(d.getDate() + bestDiff);
  return d;
}

/**
 * Calculate next follow-up date: add daysAhead calendar days, then snap to Mon/Thu.
 * Returns YYYY-MM-DD string.
 */
function calculateNextFollowUpDate(daysAhead) {
  var d = new Date();
  d.setDate(d.getDate() + daysAhead);
  var snapped = snapToFollowUpDay(d);
  return formatISO(snapped);
}

// ============================================================
// PIPELINE STAGE CONFIGURATION (synced with app)
// ============================================================

/**
 * Next stage mapping
 */
function getNextStage(stage) {
  var map = {
    'new_visit':         'follow_up_1',
    'follow_up_1':       'follow_up_2',
    'follow_up_2':       'follow_up_3',
    'follow_up_3':       'closed_lost',
    'order_confirmed':   'delivery_reminder',
    'delivery_reminder': 'post_delivery',
    'post_delivery':     'active_customer',
    'active_customer':   'active_customer',
    'inactive':          'closed_lost'
  };
  return map[stage] || null;
}

/**
 * Days until next follow-up (before snapping to Mon/Thu)
 * Synced with followUpTemplates.js in the app
 */
function getNextActionDays(stage) {
  var map = {
    'new_visit':         2,
    'follow_up_1':       5,
    'follow_up_2':       7,
    'follow_up_3':       null,
    'order_confirmed':   null,
    'delivery_reminder': 2,
    'post_delivery':     30,
    'active_customer':   42,
    'inactive':          null
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
    'follow_up_2':       'Low barrier — just try us',
    'follow_up_3':       'Re-engage with new varieties',
    'order_confirmed':   'Confirm order details',
    'delivery_reminder': 'Delivery reminder',
    'post_delivery':     'Post-delivery check-in',
    'active_customer':   'Monthly check-in',
    'inactive':          'Inactive — last attempt',
    'closed_won':        'Active customer',
    'closed_lost':       'Closed — no follow-up'
  };
  return labels[stage] || stage;
}

// ============================================================
// COLOR CODING
// ============================================================

function colorFollowUpDates() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName('Data');
  if (!dataSheet) return;

  var lastRow = dataSheet.getLastRow();
  if (lastRow < 2) return;

  var dataRange = dataSheet.getRange(2, 1, lastRow - 1, 26);
  var values = dataRange.getValues();

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var colors = {
    white:      '#ffffff',
    yellow:     '#fff3cd',
    red:        '#f8d7da',
    green:      '#d4edda',
    newVisit:   '#ffffff',
    followUp1:  '#fffde7',
    followUp2:  '#fff8e1',
    followUp3:  '#fff3e0',
    orderConf:  '#e3f2fd',
    delivery:   '#e8eaf6',
    postDel:    '#f3e5f5',
    active:     '#e8f5e9',
    closedWon:  '#a5d6a7',  // strong green — client!
    closedLost: '#ef9a9a',  // strong red — not interested
    inactive:   '#f5f5f5'
  };

  var pipelineRowColors = {
    'new_visit':         colors.newVisit,
    'follow_up_1':       colors.followUp1,
    'follow_up_2':       colors.followUp2,
    'follow_up_3':       colors.followUp3,
    'order_confirmed':   colors.orderConf,
    'delivery_reminder': colors.delivery,
    'post_delivery':     colors.postDel,
    'active_customer':   colors.active,
    'inactive':          colors.inactive,
    'closed_won':        colors.closedWon,
    'closed_lost':       colors.closedLost
  };

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var rowNum = i + 2;

    var archived         = row[17]; // R
    var pipelineStage    = row[18]; // S
    var nextActionDate   = row[21]; // V
    var automationStatus = row[23]; // X

    // 1. Pipeline stage row background
    var rowBg = pipelineRowColors[pipelineStage] || colors.white;
    if (archived === 'YES') rowBg = colors.white;
    dataSheet.getRange(rowNum, 1, 1, 26).setBackground(rowBg);

    // 2. Color nextActionDate cell (V = 22) by urgency
    if (!archived && nextActionDate && automationStatus !== 'sent' && automationStatus !== 'delivered') {
      var actionDate = parseDate(nextActionDate);
      if (actionDate) {
        var diffDays = Math.floor((today - actionDate) / 86400000);
        var cellColor = rowBg;
        if (diffDays >= 8) cellColor = colors.red;
        else if (diffDays >= 1) cellColor = colors.yellow;
        else if (diffDays === 0) cellColor = colors.green;
        dataSheet.getRange(rowNum, 22, 1, 1).setBackground(cellColor);
      }
    }

    // 3. Color legacy followUpDate (K = 11, index 10)
    var legacyFollowUp = row[10];
    if (legacyFollowUp && !archived) {
      var legacyDate = parseDate(legacyFollowUp);
      if (legacyDate) {
        var legacyDiff = Math.floor((today - legacyDate) / 86400000);
        var legacyColor = rowBg;
        if (legacyDiff >= 8) legacyColor = colors.red;
        else if (legacyDiff >= 1) legacyColor = colors.yellow;
        dataSheet.getRange(rowNum, 11, 1, 1).setBackground(legacyColor);
      }
    }
  }

  Logger.log('Color coding complete. Rows: ' + values.length);
}

function colorAutomationStatus() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName('Data');
  if (!dataSheet) return;

  var lastRow = dataSheet.getLastRow();
  if (lastRow < 2) return;

  var statusRange = dataSheet.getRange(2, 24, lastRow - 1, 1);
  var statuses = statusRange.getValues();

  for (var i = 0; i < statuses.length; i++) {
    var status = statuses[i][0];
    var cell = dataSheet.getRange(i + 2, 24, 1, 1);
    if (status === 'pending')                             cell.setBackground('#fff3cd');
    else if (status === 'sent' || status === 'delivered') cell.setBackground('#d4edda');
    else if (status === 'failed')                         cell.setBackground('#f8d7da');
    else                                                  cell.setBackground('#ffffff');
  }
  Logger.log('Automation status coloring complete.');
}

// ============================================================
// MESSAGE TEMPLATES (synced with followUpTemplates.js)
// ============================================================

function chefLink(base, contactName, locationName) {
  var parts = [];
  if (locationName) parts.push('c=' + encodeURIComponent(locationName));
  if (contactName) parts.push('n=' + encodeURIComponent(contactName));
  return parts.length > 0 ? base + '?' + parts.join('&') : base;
}

function getMessageForStage(stage, contactName, locationName, lang) {
  var isDE = (lang || 'DE').toUpperCase() === 'DE';

  var templates = {
    'new_visit': isDE
      ? 'Hi ' + contactName + ', hier ist ' + SENDER_NAME + ' von Belarro.\n\n'
        + 'Hat mich gefreut dich bei ' + locationName + ' kennenzulernen. Danke fuer deine Zeit.\n\n'
        + 'Hier ist unsere komplette Liste mit Preisen — du kannst auch direkt bestellen:\n' + chefLink(CHEF_LINK_DE, contactName, locationName) + '\n\n'
        + 'Wir liefern jeden Dienstag. Keine Mindestbestellung, keine Lieferkosten. Sag Bescheid wenn du uns testen moechtest.'
      : 'Hi ' + contactName + ', this is ' + SENDER_NAME + ' from Belarro.\n\n'
        + 'Great meeting you at ' + locationName + ' today. Thanks for your time.\n\n'
        + 'Here\'s everything we grow with prices — you can also order directly:\n' + chefLink(CHEF_LINK_EN, contactName, locationName) + '\n\n'
        + 'We deliver every Tuesday. No minimum order, no delivery cost. Let me know if you\'d like to test us.',

    'follow_up_1': isDE
      ? 'Hi ' + contactName + ', haben es die Proben auf einen Teller geschafft? Wuerde mich interessieren wie sie dir gefallen haben.'
      : 'Hi ' + contactName + ', did the samples make it onto a plate? Curious what you thought.',

    'follow_up_2': isDE
      ? 'Hi ' + contactName + ', keine Mindestbestellung, keine Lieferkosten. Auch eine einzelne 12 EUR Packung geht.\n\n'
        + 'Probier uns einfach einmal aus — und schau wie der Ablauf und die Qualitaet fuer deine Kueche passt. Meld dich einfach wenn du soweit bist.'
      : 'Hi ' + contactName + ', no minimum order, no delivery cost. Even a single 12 EUR pack works.\n\n'
        + 'Just want you to test us once — see how the process and quality works for your kitchen. Whenever you\'re ready, just message me.',

    'follow_up_3': isDE
      ? 'Hi ' + contactName + ', wir haben ein paar neue Sorten im Angebot. Schau mal rein: ' + chefLink(CHEF_LINK_DE, contactName, locationName) + '\n\nSoll ich Dienstag was vorbeibringen?'
      : 'Hi ' + contactName + ', we just started growing some new varieties. Worth a look: ' + chefLink(CHEF_LINK_EN, contactName, locationName) + '\n\nWant me to bring some by this Tuesday?',

    'order_confirmed': isDE
      ? 'Hi ' + contactName + ', du bist im Plan.\n\nErste Lieferung: Dienstag.\n\nRechnung kommt per Email nach Lieferung. Falls du mal Mengen oder Sorten aendern willst, schreib mir einfach.'
      : 'Hi ' + contactName + ', you\'re on the schedule.\n\nFirst delivery: Tuesday.\n\nInvoice comes by email after delivery. If you ever want to change quantities or varieties, just message me.',

    'delivery_reminder': isDE
      ? 'Hi ' + contactName + ', kurze Bestaetigung — deine erste Lieferung kommt morgen (Dienstag). Bis dann.'
      : 'Hi ' + contactName + ', just confirming — your first delivery is arriving tomorrow (Tuesday). See you then.',

    'post_delivery': isDE
      ? 'Hi ' + contactName + ', wie war alles? Irgendwas das du beim naechsten Mal aendern wuerdest?'
      : 'Hi ' + contactName + ', how did everything look? Anything you\'d change for next time?',

    'active_customer': isDE
      ? 'Hi ' + contactName + ', kurzes Check-in. Laeuft alles gut mit den Lieferungen? Willst du was tauschen oder dazunehmen?'
      : 'Hi ' + contactName + ', just checking in. Everything working well with the deliveries? Need to swap or add anything?',

    'inactive': isDE
      ? 'Hi ' + contactName + ', falls sich euer Menue geaendert hat und du andere Sorten brauchst, passen wir gerne an. Wir sind da wenn du uns brauchst.'
      : 'Hi ' + contactName + ', if your menu has changed and you need different varieties, happy to adjust. We\'re here when you need us.'
  };

  return templates[stage] || null;
}

// ============================================================
// FOLLOW-UP DIGEST EMAIL
// ============================================================

function sendFollowUpDigest() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName('Data');
  if (!dataSheet) return;

  // Only send on Monday and Thursday
  var dayOfWeek = new Date().getDay();
  if (FOLLOW_UP_DAYS.indexOf(dayOfWeek) === -1) {
    Logger.log('Not a follow-up day (Mon/Thu). Skipping digest.');
    return;
  }

  var lastRow = dataSheet.getLastRow();
  if (lastRow < 2) return;

  var values = dataSheet.getRange(2, 1, lastRow - 1, 26).getValues();

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var overdue = [];
  var dueToday = [];
  var upcoming = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var rowNum = i + 2;

    var locationName     = row[0];  // A
    var contactPerson    = row[2];  // C
    var contactTitle     = row[3];  // D
    var directPhone      = row[4];  // E
    var directEmail      = row[5];  // F
    var visitNotes       = row[8];  // I
    var sampleGiven      = row[11]; // L
    var archived         = row[17]; // R
    var pipelineStage    = row[18]; // S
    var nextActionDate   = row[21]; // V
    var businessPhone    = row[14]; // O
    var automationStatus = row[23]; // X

    if (archived === 'YES') continue;
    if (pipelineStage === 'closed_won' || pipelineStage === 'closed_lost') continue;
    if (automationStatus === 'sent' || automationStatus === 'delivered') continue;
    if (!nextActionDate) continue;

    var actionDate = parseDate(nextActionDate);
    if (!actionDate) continue;

    var diffDays = Math.floor((today - actionDate) / 86400000);
    if (diffDays < -3) continue;

    var phone = (directPhone || businessPhone || '').toString().replace(/[^0-9+]/g, '');
    var lang = 'DE';
    if (visitNotes && visitNotes.toString().toLowerCase().indexOf('[en]') !== -1) lang = 'EN';

    var message = getMessageForStage(pipelineStage, contactPerson || 'there', locationName, lang);

    var waLink = '';
    if (phone && message) {
      var cleanPhone = phone.replace(/^\+/, '');
      waLink = 'https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(message);
    }

    var entry = {
      rowNum: rowNum,
      locationName: locationName,
      contactPerson: contactPerson || '(no name)',
      contactTitle: contactTitle,
      phone: phone,
      email: directEmail,
      stage: pipelineStage,
      stageLabel: getStageLabel(pipelineStage),
      sampleGiven: sampleGiven,
      visitNotes: visitNotes ? visitNotes.toString().substring(0, 100) : '',
      nextActionDate: formatEU(actionDate),
      diffDays: diffDays,
      waLink: waLink,
      message: message
    };

    if (diffDays > 0) overdue.push(entry);
    else if (diffDays === 0) dueToday.push(entry);
    else upcoming.push(entry);
  }

  var totalDue = overdue.length + dueToday.length;
  if (totalDue === 0 && upcoming.length === 0) {
    Logger.log('No follow-ups due. No email sent.');
    return;
  }

  // Build HTML email
  var html = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">';
  html += '<h2 style="color:#2d5016;">Belarro Follow-Up Digest</h2>';
  html += '<p style="color:#666;">' + formatEU(today) + ' (' + ['So','Mo','Di','Mi','Do','Fr','Sa'][today.getDay()] + ')</p>';

  if (totalDue > 0) {
    html += '<p style="font-size:18px;font-weight:bold;">' + totalDue + ' contact' + (totalDue > 1 ? 's' : '') + ' to follow up with today</p>';
  } else {
    html += '<p style="color:#666;">No follow-ups due today. Here\'s what\'s coming up:</p>';
  }

  function renderSection(title, color, entries) {
    if (entries.length === 0) return '';
    var s = '<h3 style="color:' + color + ';border-bottom:2px solid ' + color + ';padding-bottom:5px;">' + title + ' (' + entries.length + ')</h3>';

    for (var j = 0; j < entries.length; j++) {
      var e = entries[j];
      s += '<div style="background:#f9f9f9;border-left:4px solid ' + color + ';padding:12px;margin:10px 0;border-radius:4px;">';
      s += '<div style="font-size:16px;font-weight:bold;">' + e.locationName + '</div>';
      s += '<div style="color:#555;">' + e.contactPerson;
      if (e.contactTitle) s += ' (' + e.contactTitle + ')';
      s += '</div>';

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

      if (e.visitNotes) s += '<div style="color:#777;font-size:12px;font-style:italic;margin:4px 0;">"' + e.visitNotes + '"</div>';
      if (e.sampleGiven === 'YES') s += '<div style="color:#2d5016;font-size:12px;">Sample was given</div>';

      s += '<div style="margin-top:10px;">';
      if (e.waLink) s += '<a href="' + e.waLink + '" style="display:inline-block;background:#25D366;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;margin-right:8px;">Send WhatsApp</a>';
      if (e.email) {
        var emailSubject = encodeURIComponent('Belarro - ' + e.stageLabel);
        var emailBody = e.message ? encodeURIComponent(e.message) : '';
        s += '<a href="mailto:' + e.email + '?subject=' + emailSubject + '&body=' + emailBody + '" style="display:inline-block;background:#1976D2;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;margin-right:8px;">Send Email</a>';
      }
      if (e.phone) s += '<a href="tel:' + e.phone + '" style="display:inline-block;background:#666;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;">Call</a>';
      s += '</div></div>';
    }
    return s;
  }

  html += renderSection('OVERDUE', '#d32f2f', overdue);
  html += renderSection('DUE TODAY', '#f57c00', dueToday);
  html += renderSection('COMING UP (next 3 days)', '#666666', upcoming);

  html += '<hr style="margin:20px 0;border:none;border-top:1px solid #ddd;">';
  html += '<p style="color:#999;font-size:12px;">After sending each message, tick the checkbox in column AB to auto-advance the pipeline.</p>';
  html += '</div>';

  var subject = totalDue > 0
    ? 'Belarro: ' + totalDue + ' follow-up' + (totalDue > 1 ? 's' : '') + ' due today'
    : 'Belarro: ' + upcoming.length + ' follow-up' + (upcoming.length > 1 ? 's' : '') + ' coming up';

  MailApp.sendEmail({ to: DIGEST_EMAIL, subject: subject, htmlBody: html });
  Logger.log('Digest sent. Overdue: ' + overdue.length + ', Today: ' + dueToday.length + ', Upcoming: ' + upcoming.length);
}

// ============================================================
// MARK AS SENT + ADVANCE PIPELINE
// ============================================================

function markRowAsSent(rowNum) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName('Data');
  var today = formatISO(new Date());

  // Update automationStatus (X = 24)
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

  // Set next action date snapped to Mon/Thu (V = 22)
  var nextDays = getNextActionDays(currentStage);
  if (nextDays) {
    var nextDateStr = calculateNextFollowUpDate(nextDays);
    dataSheet.getRange(rowNum, 22).setValue(nextDateStr);
    dataSheet.getRange(rowNum, 24).setValue('pending');
  } else {
    dataSheet.getRange(rowNum, 22).setValue('');
    dataSheet.getRange(rowNum, 24).setValue('');
  }

  // Log to notesInternal (Z = 26)
  var existingNotes = dataSheet.getRange(rowNum, 26).getValue() || '';
  var nextLabel = nextStage ? nextStage.replace(/_/g, ' ') : 'done';
  var nextDate = nextDays ? calculateNextFollowUpDate(nextDays) : 'n/a';
  var logEntry = '[' + today + '] ' + currentStage.replace(/_/g, ' ') + ' sent → next: ' + nextLabel + ' on ' + nextDate;
  var updatedNotes = existingNotes ? existingNotes + '\n' + logEntry : logEntry;
  dataSheet.getRange(rowNum, 26).setValue(updatedNotes);

  Logger.log('Row ' + rowNum + ' marked as sent. Next stage: ' + (nextStage || 'none'));
}

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
    if (row[17] === 'YES') continue;
    var stage = row[18];
    if (stage === 'closed_won' || stage === 'closed_lost') continue;
    var status = row[23];
    if (status === 'sent' || status === 'delivered') continue;
    if (!row[21]) continue;

    var actionDate = parseDate(row[21]);
    if (!actionDate) continue;
    if (actionDate <= today) {
      markRowAsSent(i + 2);
      count++;
    }
  }
  Logger.log('Marked ' + count + ' rows as sent.');
}

// ============================================================
// IN-SHEET WHATSAPP LINKS + SENT CHECKBOX
// ============================================================

function refreshSheetLinks() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName('Data');
  if (!dataSheet) return;

  var lastRow = dataSheet.getLastRow();
  if (lastRow < 2) return;

  // Headers
  if (dataSheet.getRange(1, 27).getValue() !== 'WhatsApp Link') dataSheet.getRange(1, 27).setValue('WhatsApp Link');
  if (dataSheet.getRange(1, 28).getValue() !== 'Sent') dataSheet.getRange(1, 28).setValue('Sent');

  var values = dataSheet.getRange(2, 1, lastRow - 1, 26).getValues();
  var richTexts = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var locationName  = row[0];  // A
    var contactPerson = row[2];  // C
    var directPhone   = row[4];  // E
    var businessPhone = row[14]; // O
    var pipelineStage = row[18]; // S
    var archived      = row[17]; // R
    var visitNotes    = row[8];  // I

    if (archived === 'YES' || pipelineStage === 'closed_won' || pipelineStage === 'closed_lost') {
      richTexts.push([SpreadsheetApp.newRichTextValue().setText('').build()]);
      continue;
    }

    var phone = (directPhone || businessPhone || '').toString().replace(/[^0-9+]/g, '');
    var lang = 'DE';
    if (visitNotes && visitNotes.toString().toLowerCase().indexOf('[en]') !== -1) lang = 'EN';

    var waLink = '';
    if (phone && pipelineStage) {
      var message = getMessageForStage(pipelineStage, contactPerson || 'there', locationName, lang);
      if (message) {
        var cleanPhone = phone.replace(/^\+/, '');
        waLink = 'https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(message);
      }
    }

    if (waLink) {
      richTexts.push([SpreadsheetApp.newRichTextValue().setText('Send WhatsApp').setLinkUrl(waLink).build()]);
    } else {
      richTexts.push([SpreadsheetApp.newRichTextValue().setText('').build()]);
    }
  }

  dataSheet.getRange(2, 27, richTexts.length, 1).setRichTextValues(richTexts);
  var aaRange = dataSheet.getRange(2, 27, richTexts.length, 1);
  aaRange.setFontColor('#25D366');
  aaRange.setFontWeight('bold');

  // Checkboxes in AB
  dataSheet.getRange(2, 28, values.length, 1).insertCheckboxes();

  Logger.log('Sheet links refreshed. Rows: ' + values.length);
}

function refreshSingleRow(rowNum) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName('Data');
  var row = dataSheet.getRange(rowNum, 1, 1, 26).getValues()[0];

  var locationName  = row[0];  // A
  var contactPerson = row[2];  // C
  var directPhone   = row[4];  // E
  var businessPhone = row[14]; // O
  var pipelineStage = row[18]; // S
  var archived      = row[17]; // R
  var visitNotes    = row[8];  // I

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
      cell.setRichTextValue(SpreadsheetApp.newRichTextValue().setText('Send WhatsApp').setLinkUrl(waLink).build());
      cell.setFontColor('#25D366');
      cell.setFontWeight('bold');
    }
  }
}

// ============================================================
// EDIT TRIGGER — checkbox + interest level changes
// ============================================================

function onSheetEdit(e) {
  var sheet = e.source.getActiveSheet();
  if (sheet.getName() !== 'Data') return;

  var col = e.range.getColumn();
  var row = e.range.getRow();
  if (row < 2) return;

  // AB = 28: Sent checkbox ticked
  if (col === 28 && e.value === 'TRUE') {
    markRowAsSent(row);
    sheet.getRange(row, 28).setValue(false);
    SpreadsheetApp.flush();
    refreshSingleRow(row);
  }

  // H = 8: Interest level changed
  if (col === 8) {
    var val = e.value;
    if (val === 'Closed Deal') {
      sheet.getRange(row, 19).setValue('closed_won');
      sheet.getRange(row, 22).setValue('');
      sheet.getRange(row, 24).setValue('');
      sheet.getRange(row, 27).setValue('');
      sheet.getRange(row, 28).setValue(false);
    } else if (val === 'Not Interested') {
      sheet.getRange(row, 19).setValue('closed_lost');
      sheet.getRange(row, 22).setValue('');
      sheet.getRange(row, 24).setValue('');
      sheet.getRange(row, 27).setValue('');
      sheet.getRange(row, 28).setValue(false);
    }
  }
}

// ============================================================
// SETUP — run ONCE after pasting the script
// ============================================================

function setupAllTriggers() {
  // Remove all existing triggers
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }

  // Color coding at midnight
  ScriptApp.newTrigger('colorFollowUpDates').timeBased().everyDays(1).atHour(0).create();
  ScriptApp.newTrigger('colorAutomationStatus').timeBased().everyDays(1).atHour(0).create();

  // Follow-up digest at 8am (only sends on Mon/Thu)
  ScriptApp.newTrigger('sendFollowUpDigest').timeBased().everyDays(1).atHour(8).create();

  // Edit trigger for checkboxes + interest level
  ScriptApp.newTrigger('onSheetEdit').forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet()).onEdit().create();

  Logger.log('All triggers set up: colors at midnight, digest at 8am, edit trigger.');

  // Run once immediately
  refreshSheetLinks();
  colorFollowUpDates();
  colorAutomationStatus();
}

/**
 * Manual run — test everything
 */
function manualRun() {
  colorFollowUpDates();
  colorAutomationStatus();
  refreshSheetLinks();
}

/**
 * Remove all triggers
 */
function removeAllTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
    Logger.log('Removed: ' + triggers[i].getHandlerFunction());
  }
}

// ============================================================
// ONE-TIME: REORDER COLUMNS
// ============================================================
// Run this ONCE to rearrange the Data sheet columns.
// It reads all data, reorders columns in memory, and writes back.
// A backup tab "Data_backup" is created first.
//
// OLD ORDER (A-R):
//   A:Timestamp B:SalesRep C:LocationName D:BusinessAddress
//   E:DirectLink F:BusinessPhone G:BusinessEmail H:BusinessWebsite
//   I:ContactPerson J:ContactTitle K:DirectPhone L:DirectEmail
//   M:BusinessTypes N:InterestLevel O:VisitNotes P:FollowUpDate
//   Q:SampleGiven R:Archived
//
// NEW ORDER (A-R):
//   A:LocationName B:BusinessAddress C:ContactPerson D:ContactTitle
//   E:DirectPhone F:DirectEmail G:BusinessTypes H:InterestLevel
//   I:VisitNotes J:Timestamp K:FollowUpDate L:SampleGiven
//   M:SalesRep N:DirectLink O:BusinessPhone P:BusinessEmail
//   Q:BusinessWebsite R:Archived
//
// Columns S-Z (pipeline) stay exactly where they are.

function reorderColumns() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName('Data');
  if (!dataSheet) {
    Logger.log('Data sheet not found!');
    return;
  }

  var lastRow = dataSheet.getLastRow();
  var lastCol = dataSheet.getLastColumn();
  if (lastRow < 1) {
    Logger.log('Sheet is empty');
    return;
  }

  // 1. Create backup
  var backup = dataSheet.copyTo(ss);
  backup.setName('Data_backup_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmm'));
  Logger.log('Backup created: ' + backup.getName());

  // 2. Read ALL data including headers (A through last column)
  var allData = dataSheet.getRange(1, 1, lastRow, lastCol).getValues();

  // 3. Define the column reorder map for columns A-R (indices 0-17)
  // Maps NEW index → OLD index
  // New A (0) = Old C (2) = LocationName
  // New B (1) = Old D (3) = BusinessAddress
  // New C (2) = Old I (8) = ContactPerson
  // New D (3) = Old J (9) = ContactTitle
  // New E (4) = Old K (10) = DirectPhone
  // New F (5) = Old L (11) = DirectEmail
  // New G (6) = Old M (12) = BusinessTypes
  // New H (7) = Old N (13) = InterestLevel
  // New I (8) = Old O (14) = VisitNotes
  // New J (9) = Old A (0) = Timestamp
  // New K (10) = Old P (15) = FollowUpDate
  // New L (11) = Old Q (16) = SampleGiven
  // New M (12) = Old B (1) = SalesRep
  // New N (13) = Old E (4) = DirectLink
  // New O (14) = Old F (5) = BusinessPhone
  // New P (15) = Old G (6) = BusinessEmail
  // New Q (16) = Old H (7) = BusinessWebsite
  // New R (17) = Old R (17) = Archived
  var reorderMap = [2, 3, 8, 9, 10, 11, 12, 13, 14, 0, 15, 16, 1, 4, 5, 6, 7, 17];

  // 4. Reorder each row
  var newData = [];
  for (var r = 0; r < allData.length; r++) {
    var oldRow = allData[r];
    var newRow = [];

    // Reorder columns 0-17 (A-R)
    for (var c = 0; c < reorderMap.length; c++) {
      newRow.push(oldRow[reorderMap[c]]);
    }

    // Keep columns 18+ (S onward) as-is
    for (var c = 18; c < lastCol; c++) {
      newRow.push(oldRow[c]);
    }

    newData.push(newRow);
  }

  // 5. Update the new headers for row 1
  var newHeaders = [
    'Location Name', 'Business Address', 'Contact Person', 'Contact Title',
    'Direct Phone', 'Direct Email', 'Business Types', 'Interest Level',
    'Visit Notes', 'Timestamp', 'Follow-up Date', 'Sample Given',
    'Sales Rep', 'DirectLink', 'Business Phone', 'Business Email',
    'Business Website', 'Archived'
  ];
  for (var h = 0; h < newHeaders.length; h++) {
    newData[0][h] = newHeaders[h];
  }

  // 6. Write back
  dataSheet.getRange(1, 1, newData.length, newData[0].length).setValues(newData);

  Logger.log('Columns reordered successfully! ' + newData.length + ' rows updated.');
  Logger.log('Backup saved as: Data_backup_*');
  Logger.log('');
  Logger.log('NEXT STEPS:');
  Logger.log('1. Verify the data looks correct');
  Logger.log('2. Run setupAllTriggers() to refresh everything');
  Logger.log('3. Delete the backup tab when satisfied');
}
