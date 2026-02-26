// ============================================
// DATE UTILITIES
// ============================================
// Handles follow-up date calculations

/**
 * Calculate follow-up date (4 days ahead, skipping weekends)
 * @returns {string} Follow-up date in DD-MM-YYYY format
 */
export const calculateFollowUpDate = (daysAhead = 4) => {
  const today = new Date();
  let followUpDate = new Date(today);
  followUpDate.setDate(followUpDate.getDate() + daysAhead);

  // Check if follow-up falls on weekend
  const dayOfWeek = followUpDate.getDay();

  // If Saturday (6), push to Monday
  if (dayOfWeek === 6) {
    followUpDate.setDate(followUpDate.getDate() + 2);
  }
  // If Sunday (0), push to Monday
  else if (dayOfWeek === 0) {
    followUpDate.setDate(followUpDate.getDate() + 1);
  }

  return formatDateDDMMYYYY(followUpDate);
};

/**
 * Format date to DD-MM-YYYY
 * @param {Date|string} date - Date object or date string
 * @returns {string} Date in DD-MM-YYYY format
 */
export const formatDateDDMMYYYY = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Format date for display
 * @param {string} dateString - Date in any format
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  // If already in DD-MM-YYYY format, return as is
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    return dateString;
  }
  const date = new Date(dateString);
  return formatDateDDMMYYYY(date);
};

/**
 * Get current timestamp in DD-MM-YYYY HH:MM format
 * @returns {string} Current timestamp
 */
export const getCurrentTimestamp = () => {
  const now = new Date();
  const date = formatDateDDMMYYYY(now);
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${date} ${hours}:${minutes}`;
};

// ============================================
// PIPELINE DATE UTILITIES
// ============================================

/**
 * Convert a Date object to YYYY-MM-DD string (ISO format for n8n compatibility)
 */
export const toISODateString = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculate a next-action date N business days from today, skipping weekends.
 * Returns YYYY-MM-DD format for automation compatibility.
 */
export const calculateNextActionDate = (daysAhead) => {
  const date = new Date();
  let added = 0;
  while (added < daysAhead) {
    date.setDate(date.getDate() + 1);
    const dow = date.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return toISODateString(date);
};

/**
 * Parse either DD-MM-YYYY (existing app format) or YYYY-MM-DD (pipeline format)
 * into a JS Date object. Returns null on failure.
 */
export const parseAppDate = (dateStr) => {
  if (!dateStr) return null;
  // ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + 'T00:00:00');
  }
  // Existing DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [dd, mm, yyyy] = dateStr.split('-');
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  }
  return null;
};

/**
 * Return the number of calendar days between today (midnight) and a given date string.
 * Negative = in the past (overdue). Positive = in the future.
 */
export const daysFromToday = (dateStr) => {
  const target = parseAppDate(dateStr);
  if (!target) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
};