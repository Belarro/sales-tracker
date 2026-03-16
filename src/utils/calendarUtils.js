// ============================================
// CALENDAR UTILITIES
// ============================================
// Generates Google Calendar URLs and .ics files for follow-up reminders.

/**
 * Format a Date to Google Calendar's required format: YYYYMMDDTHHMMSS
 */
function toGCalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}${m}${d}T${h}${min}00`;
}

/**
 * Parse a YYYY-MM-DD or DD-MM-YYYY date string into a Date object at 09:00
 */
function parseToMorning(dateStr) {
  if (!dateStr) return new Date();
  let date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    date = new Date(dateStr + 'T09:00:00');
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [dd, mm, yyyy] = dateStr.split('-');
    date = new Date(`${yyyy}-${mm}-${dd}T09:00:00`);
  } else {
    date = new Date();
    date.setHours(9, 0, 0, 0);
  }
  return date;
}

/**
 * Generate a Google Calendar URL for a follow-up task.
 * @param {Object} location - Location data
 * @param {string} messageBody - The follow-up message text
 * @param {string} appUrl - URL to link back to the app
 * @returns {string} Google Calendar URL
 */
export function generateGoogleCalendarUrl(location, messageBody, appUrl) {
  const start = parseToMorning(location.nextActionDate);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);

  const title = `Follow-up: ${location.contactPerson || 'Contact'} — ${location.locationName}`;

  const stage = location.pipelineStage ? location.pipelineStage.replace(/_/g, ' ') : '';
  const description = [
    stage ? `Stage: ${stage}` : '',
    '',
    messageBody || '',
    '',
    appUrl ? `Open Sales Tracker: ${appUrl}` : ''
  ].filter(Boolean).join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: description,
    dates: `${toGCalDate(start)}/${toGCalDate(end)}`,
    location: location.businessAddress || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate and download an .ics file for a follow-up task.
 * @param {Object} location - Location data
 * @param {string} messageBody - The follow-up message text
 */
export function downloadICSFile(location, messageBody) {
  const start = parseToMorning(location.nextActionDate);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);

  const formatICS = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}${m}${day}T${h}${min}00`;
  };

  const escapeICS = (str) => (str || '').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

  const title = `Follow-up: ${location.contactPerson || 'Contact'} — ${location.locationName}`;
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@saletracker`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SalesTracker//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatICS(start)}`,
    `DTEND:${formatICS(end)}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${escapeICS(messageBody || '')}`,
    `LOCATION:${escapeICS(location.businessAddress || '')}`,
    `UID:${uid}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `followup-${(location.locationName || 'task').replace(/\s+/g, '-')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
