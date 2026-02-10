// ============================================
// CONFIGURATION FILE
// ============================================
// Configuration now uses environment variables from .env file
// Copy .env.example to .env and fill in your values

export const CONFIG = {
  // Admin emails - loaded from environment variables
  ADMIN_EMAILS: (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').filter(Boolean),

  // Google Maps API Key
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',

  // Google OAuth Client ID
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',

  // Google Sheets API Key
  GOOGLE_SHEETS_API_KEY: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '',

  // Your Google Sheet ID
  GOOGLE_SHEET_ID: import.meta.env.VITE_GOOGLE_SHEET_ID || '',

  // Business type options for the dropdown
  BUSINESS_TYPES: [
    'German',
    'Italian',
    'Asian',
    'Salad',
    'Sandwiches',
    'Coffee',
    'Breakfast',
    'Fine Dining',
    'Healthy Food',
    'Vegan',
    'Vegetarian',
    'Bakery',
    'Desserts',
    'Fast Food',
    'Bar/Pub',
    'Food Truck',
    'Grocery/Market',
    'Catering'
  ],

  // Interest level options
  INTEREST_LEVELS: [
    'Interested',
    'Not Interested',
    'Follow Up',
    'Pending',
    'Closed Deal'
  ],

  // Follow-up settings
  FOLLOW_UP_DAYS: 4, // Days until follow-up

  // Google Sheets tab names
  SHEETS: {
    DATA: 'Data',
    VISIT_HISTORY: 'Visit History',
    CONFIG: 'Config',
    AUTHORIZED_USERS: 'Authorized Users',
    NOTE_TEMPLATES: 'Note Templates',
    ADMIN_EMAILS: 'Admin Emails'
  },

  // Default note templates (used if sheet doesn't exist yet)
  DEFAULT_NOTE_TEMPLATES: [
    'Owner was not at the place, spoke with worker, got the owners email',
    'Not interested at all'
  ]
};