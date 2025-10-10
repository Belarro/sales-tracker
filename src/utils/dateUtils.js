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