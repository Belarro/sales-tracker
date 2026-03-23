// ============================================
// GOOGLE CALENDAR API UTILITIES
// ============================================
// Creates calendar events silently via the Google Calendar API.
// Uses the same OAuth token as Google Sheets (window.googleAccessToken).

const CAL_BASE = 'https://www.googleapis.com/calendar/v3';

/**
 * Make an authenticated request to the Google Calendar API.
 */
const calFetch = async (url, options = {}) => {
  const token = window.googleAccessToken;
  if (!token) throw new Error('Not signed in');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.error?.message || `Calendar API HTTP ${res.status}`;
    console.error('Calendar API error:', res.status, msg);
    throw new Error(msg);
  }
  return res.json();
};

/**
 * Create a single calendar event.
 * @param {Object} opts
 * @param {string} opts.title - Event title
 * @param {string} opts.description - Event description (supports newlines)
 * @param {string} opts.date - YYYY-MM-DD for the event
 * @param {string} [opts.time='08:00'] - HH:MM start time
 * @param {number} [opts.durationMinutes=30] - Duration
 * @param {string} [opts.location] - Address
 * @param {string} [opts.appLink] - Link back to Sales Tracker (added to description)
 * @returns {Promise<Object>} Created event object (has htmlLink for opening in Calendar)
 */
export async function createCalendarEvent({
  title,
  description = '',
  date,
  time = '08:00',
  durationMinutes = 30,
  location = '',
  appLink = '',
}) {
  const startDT = new Date(`${date}T${time}:00`);
  const endDT = new Date(startDT);
  endDT.setMinutes(endDT.getMinutes() + durationMinutes);

  // Append app link to description
  const fullDesc = appLink
    ? `${description}\n\nOpen Sales Tracker: ${appLink}`
    : description;

  const event = {
    summary: title,
    description: fullDesc,
    location,
    start: {
      dateTime: startDT.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDT.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 0 },   // At event time
        { method: 'popup', minutes: 30 },   // 30 min before
      ],
    },
  };

  return calFetch(`${CAL_BASE}/calendars/primary/events`, {
    method: 'POST',
    body: JSON.stringify(event),
  });
}

/**
 * Create a follow-up calendar event for a location.
 * @param {Object} location - Location data from Google Sheet
 * @param {string} nextDate - YYYY-MM-DD for the follow-up
 * @param {string} nextStage - Pipeline stage label
 * @param {string} [messageBody] - Follow-up message text
 * @returns {Promise<Object>} Created event
 */
export async function createFollowUpEvent(location, nextDate, nextStage, messageBody) {
  const stageLabel = (nextStage || '').replace(/_/g, ' ');
  const title = `Follow-up: ${location.contactPerson || 'Contact'} — ${location.locationName}`;
  const description = [
    stageLabel ? `Stage: ${stageLabel}` : '',
    '',
    messageBody || '',
  ].filter(Boolean).join('\n');

  return createCalendarEvent({
    title,
    description,
    date: nextDate,
    time: '08:00',
    location: location.businessAddress || '',
    appLink: `${window.location.origin}/?view=tasks`,
  });
}

/**
 * Create a recurring weekly event (for Monday/Thursday follow-up sessions).
 * @param {string} dayName - 'MO' or 'TH'
 * @param {string} startDate - YYYY-MM-DD of the first occurrence
 * @returns {Promise<Object>} Created recurring event
 */
export async function createRecurringReminder(dayName, startDate) {
  const dayLabel = dayName === 'MO' ? 'Monday' : 'Thursday';
  const startDT = new Date(`${startDate}T08:00:00`);
  const endDT = new Date(startDT);
  endDT.setMinutes(endDT.getMinutes() + 30);

  const event = {
    summary: `Follow-up session — Open Sales Tracker`,
    description: `${dayLabel} follow-up session.\n\nOpen Sales Tracker and complete all due tasks.\n\n${window.location.origin}/?view=tasks`,
    start: {
      dateTime: startDT.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDT.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    recurrence: [`RRULE:FREQ=WEEKLY;BYDAY=${dayName}`],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 0 },
        { method: 'popup', minutes: 15 },
      ],
    },
  };

  return calFetch(`${CAL_BASE}/calendars/primary/events`, {
    method: 'POST',
    body: JSON.stringify(event),
  });
}
