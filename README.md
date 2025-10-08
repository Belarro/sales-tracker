# Sales Tracker - Food Business CRM

A web-based sales tracking application for food industry sales representatives. Track visits to restaurants, cafes, and other food establishments with Google Maps integration and Google Sheets as a database.

## Features

✅ **Google Authentication** - Secure sign-in with Google accounts
✅ **Interactive Map** - View all food-related businesses near your location
✅ **GPS Integration** - Automatic location detection
✅ **Visit Tracking** - Record detailed notes for each business visit
✅ **Contact Management** - Store contact person details, phone, email
✅ **Interest Levels** - Track business interest (Interested, Not Interested, Follow Up, etc.)
✅ **Automatic Follow-ups** - Calculate follow-up dates (4 business days ahead, skips weekends)
✅ **Visit History** - Full history of all visits to each location
✅ **Color-Coded Markers** - Red (unvisited), Green (visited)
✅ **Admin Panel** - Manage authorized users
✅ **Google Sheets Database** - All data stored in Google Sheets
✅ **Mobile-Friendly** - Responsive design for phone and desktop

## Tech Stack

- **Frontend**: React 18 + Vite
- **Maps**: Google Maps JavaScript API + Places API
- **Authentication**: Google Identity Services (OAuth 2.0)
- **Database**: Google Sheets API v4
- **Styling**: Pure CSS (no frameworks)

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Google account
- Google Cloud project with APIs enabled

### 2. Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### 3. Configuration

Before running the app, you need to:

1. Set up Google Cloud APIs (Maps, Sheets, OAuth)
2. Create a Google Sheet with required structure
3. Add API keys to `src/config.js`

**📖 See [SETUP-GUIDE.md](SETUP-GUIDE.md) for complete step-by-step instructions**

## File Structure

```
saletracker/
├── src/
│   ├── components/
│   │   ├── Login.jsx              # Google sign-in component
│   │   ├── AdminSetup.jsx         # User management interface
│   │   ├── MapView.jsx            # Google Maps with food places
│   │   └── LocationPanel.jsx      # Visit notes form and history
│   ├── utils/
│   │   ├── googleAuth.js          # Authentication utilities
│   │   ├── googleSheets.js        # Sheets API integration
│   │   └── dateUtils.js           # Follow-up date calculations
│   ├── styles/
│   │   └── App.css                # All application styles
│   ├── config.js                  # Configuration (API keys, settings)
│   ├── App.jsx                    # Main app component
│   └── main.jsx                   # React entry point
├── SETUP-GUIDE.md                 # Detailed setup instructions
├── package.json                   # Dependencies
├── vite.config.js                 # Vite configuration
└── index.html                     # HTML entry point
```

## Configuration Options

Edit `src/config.js` to customize:

- Admin email address
- Business type options
- Interest level options
- Follow-up days (default: 4)
- Google Sheet tab names

## Google Sheets Structure

The app requires a Google Sheet with 4 tabs:

### 1. Data Tab
Main sales data with columns:
- Timestamp, Sales Rep, Location Name, Business Address
- Business Phone, Business Email, Business Website
- Contact Person, Contact Title, Direct Phone, Direct Email
- Business Types, Interest Level, Visit Notes, Follow-up Date

### 2. Visit History Tab
Same structure as Data tab - stores all historical visits

### 3. Config Tab
Reserved for future configuration options

### 4. Authorized Users Tab
List of email addresses allowed to use the app

## How It Works

### For Admin

1. Sign in with admin email (configured in `config.js`)
2. Access Admin Setup to add/remove authorized users
3. Can switch between Admin Setup and main map view
4. Can use the app like a regular salesperson

### For Salespeople

1. Sign in with Google account (must be authorized by admin)
2. View map centered on current GPS location
3. See food businesses with color-coded markers:
   - **Red**: Not yet visited
   - **Green**: Already visited
4. Click marker to see business details
5. Add visit notes with contact info and follow-up date
6. View complete visit history for each location

### Visit Tracking

When a salesperson visits a location:
- Form captures: Contact person, title, phone, email, business type, interest level, notes
- Follow-up date automatically calculated (4 business days, skips Sat/Sun)
- Visit saved to both **Data** tab (latest visit) and **Visit History** tab (all visits)
- Marker color changes from red to green

## Development

```bash
# Install dependencies
npm install

# Run dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Netlify (Recommended)

1. Build the app: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Update OAuth authorized origins in Google Cloud Console

### GitHub Pages

1. Update `vite.config.js` with base path
2. Build: `npm run build`
3. Deploy `dist` folder to `gh-pages` branch

### Other Platforms

Works on any static hosting: Vercel, Cloudflare Pages, Firebase Hosting, etc.

**Important**: After deploying, add your production URL to:
- Google Cloud Console → OAuth Client → Authorized JavaScript origins

## Security Notes

- **API Keys**: Maps and Sheets API keys are exposed in frontend (this is normal for these APIs)
- **API Restrictions**: Restrict keys to specific APIs in Google Cloud Console
- **OAuth**: Only authorized users can access the app
- **Sheet Permissions**: Set to "Anyone with link can edit" (required for API access)
- **Admin Access**: Only configured admin email can manage users

## Troubleshooting

### Common Issues

**"Failed to initialize"**
- Check API keys in `config.js`
- Verify APIs are enabled in Google Cloud

**"You are not authorized"**
- User email must be added by admin first

**Map not loading**
- Enable Maps JavaScript API and Places API
- Check Maps API key is correct

**Can't save visits**
- Verify Sheet is shared with "Anyone with link - Editor"
- Check Sheets API is enabled
- Verify Sheet ID is correct

**Sign-in not working**
- Check OAuth Client ID is correct
- Verify authorized JavaScript origins include your URL

See [SETUP-GUIDE.md](SETUP-GUIDE.md) for detailed troubleshooting.

## Browser Support

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

Requires modern browser with:
- Geolocation API support
- ES6+ JavaScript support

## License

MIT License - Free to use and modify

## Support

For issues or questions:
1. Check [SETUP-GUIDE.md](SETUP-GUIDE.md)
2. Check browser console for errors
3. Verify Google Cloud setup

## Credits

Built with:
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Google Identity Services](https://developers.google.com/identity)

---

**Made for food industry sales teams** 🍕🥗☕