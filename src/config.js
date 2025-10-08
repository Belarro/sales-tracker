// ============================================
// CONFIGURATION FILE
// ============================================
// This is where you'll add your API keys after setting up Google Cloud
// Follow the SETUP-GUIDE.md for detailed instructions

export const CONFIG = {
  // Admin email - this person has full access to setup and manage users
  ADMIN_EMAIL: 'ronbenyohanan@gmail.com',

  // Google Maps API Key - Get this from Google Cloud Console
  // Instructions in SETUP-GUIDE.md Part 1
  GOOGLE_MAPS_API_KEY: 'AIzaSyDGE5vzppjbcnF7vbhlUvs-uTSQPeJcScI',

  // Google OAuth Client ID - Get this from Google Cloud Console
  // Instructions in SETUP-GUIDE.md Part 1
  GOOGLE_CLIENT_ID: '794302779341-uis3hrehssvi3iiaoev113t5k67h6cb7.apps.googleusercontent.com',

  // Google Sheets API Key - Get this from Google Cloud Console
  // Instructions in SETUP-GUIDE.md Part 1
  GOOGLE_SHEETS_API_KEY: 'AIzaSyCOMwWjwW4dwQ7JhBAVCHg75XS46ot1bWg',

  // Your Google Sheet ID - Get this from your sheet URL
  // Instructions in SETUP-GUIDE.md Part 2
  GOOGLE_SHEET_ID: '1TCRdV8PMdElo2J6ZcM2rUQwRWV0RNDFcq0EXdl9lGaQ',

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
    AUTHORIZED_USERS: 'Authorized Users'
  }
};