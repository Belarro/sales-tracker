// ============================================
// GOOGLE AUTHENTICATION UTILITIES
// ============================================
// Handles Google OAuth login and user management

import { CONFIG } from '../config.js';

/**
 * Initialize Google Authentication
 * @returns {Promise} Resolves when Google Auth is ready
 */
export const initGoogleAuth = () => {
  return new Promise((resolve, reject) => {
    window.google.accounts.id.initialize({
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      callback: resolve,
      auto_select: false
    });
  });
};

/**
 * Decode JWT token to get user info
 * @param {string} token - JWT token from Google
 * @returns {Object} User information
 */
export const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Check if user is admin (from .env only - for immediate checks)
 * @param {string} email - User email
 * @returns {boolean} True if user is admin in .env
 */
export const isAdmin = (email) => {
  return CONFIG.ADMIN_EMAILS.includes(email);
};

/**
 * Check if user is admin (including Google Sheets admins)
 * @param {string} email - User email
 * @param {Array} sheetAdmins - List of admin emails from Google Sheets
 * @returns {boolean} True if user is admin
 */
export const isAdminWithSheet = (email, sheetAdmins = []) => {
  return CONFIG.ADMIN_EMAILS.includes(email) || sheetAdmins.includes(email);
};

/**
 * Check if user is authorized
 * @param {string} email - User email
 * @param {Array} authorizedUsers - List of authorized emails
 * @returns {boolean} True if user is authorized
 */
export const isAuthorized = (email, authorizedUsers) => {
  return isAdmin(email) || authorizedUsers.includes(email);
};

/**
 * Sign out user
 */
export const signOut = () => {
  if (window.google && window.google.accounts && window.google.accounts.id) {
    window.google.accounts.id.disableAutoSelect();
  }
  // Clear any stored user data
  sessionStorage.clear();
};