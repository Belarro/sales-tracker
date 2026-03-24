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

  // Contact role options for the dropdown
  CONTACT_ROLES: [
    'Owner',
    'Owner/Chef',
    'Head Chef',
    'Sous Chef',
    'Manager',
    'Buyer',
    'Staff'
  ],

  // Business type options for the dropdown
  BUSINESS_TYPES: [
    'German',
    'Italian',
    'French',
    'Greek',
    'Spanish',
    'Turkish',
    'Lebanese/Middle Eastern',
    'Indian',
    'Thai',
    'Japanese',
    'Chinese',
    'Korean',
    'Vietnamese',
    'Mexican',
    'American',
    'Russian/Eastern European',
    'African',
    'Asian Fusion',
    'Mediterranean',
    'Seafood',
    'Steakhouse',
    'Salad',
    'Sandwiches',
    'Bowl/Poke',
    'Coffee',
    'Breakfast/Brunch',
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
    'Catering',
    'Hotel Restaurant',
    'Canteen/Kantine',
    'Other'
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
  ],

  // Pipeline stage values (stored in column S = index 18)
  // These are the strings n8n will filter on
  PIPELINE_STAGES: {
    NEW_VISIT:        'new_visit',
    FOLLOW_UP_1:      'follow_up_1',
    FOLLOW_UP_2:      'follow_up_2',
    FOLLOW_UP_3:      'follow_up_3',
    FOLLOW_UP_4:      'follow_up_4',
    ORDER_CONFIRMED:    'order_confirmed',
    DELIVERY_REMINDER:  'delivery_reminder',
    POST_DELIVERY:      'post_delivery',
    ACTIVE_CUSTOMER:  'active_customer',
    INACTIVE:         'inactive',
    CLOSED_WON:       'closed_won',
    CLOSED_LOST:      'closed_lost'
  },

  // Action type values (stored in column W = index 22)
  ACTION_TYPES: [
    'physical_visit',
    'call',
    'email',
    'sms',
    'whatsapp',
    'send_materials'
  ],

  // Automation status values (stored in column X = index 23)
  // App writes 'pending'; n8n reads 'pending', then writes 'sent'/'failed'
  AUTOMATION_STATUS: {
    PENDING:   'pending',
    SENT:      'sent',
    DELIVERED: 'delivered',
    FAILED:    'failed',
    SKIPPED:   'skipped'
  },

  // Materials that can be sent (stored comma-separated in column Y = index 24)
  MATERIALS_LIST: [
    'samples',
    'catalog',
    'price_list',
    'menu_proposal'
  ],

  // Smart follow-up preset offsets in days
  FOLLOW_UP_PRESETS: [
    { label: '3 Days',  days: 3  },
    { label: '1 Week',  days: 7  },
    { label: '2 Weeks', days: 14 }
  ],

  // How many days ahead qualifies as "upcoming" on Today's Tasks
  UPCOMING_DAYS_WINDOW: 3
};