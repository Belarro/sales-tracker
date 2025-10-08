// ============================================
// DATE UTILITIES
// ============================================
// Handles follow-up date calculations

/**
 * Calculate follow-up date (4 days ahead, skipping weekends)
 * @returns {string} Follow-up date in YYYY-MM-DD format
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

  return followUpDate.toISOString().split('T')[0];
};

/**
 * Format date for display
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Get current timestamp
 * @returns {string} Current timestamp in ISO format
 */
export const getCurrentTimestamp = () => {
  return new Date().toISOString();
};