# Sales Tracker - Development Roadmap

## Current Status

**Authentication:** ⚠️ **TEMPORARILY DISABLED**

To get the app running quickly, authentication has been bypassed. The app currently runs with a mock user (`dev@example.com`). This allows you to test core functionality without dealing with Google OAuth configuration issues.

**What Works:**
- ✅ App loads successfully
- ✅ Google Sheets API initialized
- ✅ Map view and location tracking ready to test
- ✅ Visit notes and data entry forms functional

**What's Disabled:**
- ❌ Google Sign-In
- ❌ User authorization checks
- ❌ Admin user management
- ❌ Multi-user access control

---

## Phase 1: Re-Enable Authentication (CRITICAL)

### 🔴 Priority 1: Fix OAuth Configuration

**Issue:** OAuth Client ID doesn't recognize `http://localhost:3000` as authorized origin.

**Error Message:**
```
[GSI_LOGGER]: The given origin is not allowed for the given client ID
```

**Fix Required (Google Cloud Console):**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find OAuth 2.0 Client ID: `794302779341-uis3hrehssvi3iiaoev113t5k67h6cb7.apps.googleusercontent.com`
3. Click **Edit** (pencil icon)
4. Under **"Authorized JavaScript origins"**, add:
   ```
   http://localhost:3000
   http://localhost:5173
   ```
5. Under **"Authorized redirect URIs"** (if not already present), add:
   ```
   http://localhost:3000
   http://localhost:5173
   ```
6. Click **SAVE**
7. Wait 2-3 minutes for changes to propagate

**For Production Deployment**, also add:
```
https://yourdomain.com
https://www.yourdomain.com
```

---

### 🔴 Priority 2: Verify OAuth Consent Screen Scopes

**Issue:** OAuth might not have permission to access Google Sheets API.

**Fix Required:**

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Click **"Edit App"**
3. Navigate to **"Scopes"** section
4. Click **"Add or Remove Scopes"**
5. Ensure these scopes are selected:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
   - ✅ `.../auth/spreadsheets` (Google Sheets API)
6. Click **"Update"** and **"Save"**

---

### 🔴 Priority 3: Re-Enable Authentication Code

**After fixing OAuth configuration**, uncomment the authentication code:

**File: `src/App.jsx`**

**Change Line 16-18:**
```javascript
// REMOVE THIS:
const [user, setUser] = useState({ email: 'dev@example.com', name: 'Developer' });
const [authorized, setAuthorized] = useState(true);

// RESTORE THIS:
const [user, setUser] = useState(null);
const [authorized, setAuthorized] = useState(false);
```

**Change Lines 136-153:**
```javascript
// UNCOMMENT THESE LINES:
if (!user) {
  return <Login onLogin={handleLogin} />;
}

if (!authorized) {
  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Access Denied</h1>
        <p style={{ color: '#ea4335', marginBottom: '20px' }}>{error}</p>
        <button onClick={handleSignOut} className="btn btn-secondary">
          Sign Out
        </button>
      </div>
    </div>
  );
}
```

---

### 🔴 Priority 4: Verify APIs are Enabled

**Confirm these APIs are enabled in Google Cloud Console:**

Go to: https://console.cloud.google.com/apis/dashboard

Required APIs:
- ✅ **Google Sheets API**
- ✅ **Maps JavaScript API**
- ✅ **Places API** (or "Places API (New)")

If any are missing:
1. Go to: https://console.cloud.google.com/apis/library
2. Search for the API name
3. Click **"Enable"**
4. Wait 30 seconds for activation

---

## Phase 2: Security & Configuration

### 🟡 Google Sheet Setup

**Current Sheet ID:** `1TCRdV8PMdElo2J6ZcM2rUQwRWV0RNDFcq0EXdl9lGaQ`

**Required Tabs (exact names, case-sensitive):**
1. `Data` - Latest visit for each location
2. `Visit History` - Complete visit history
3. `Config` - Reserved for future use
4. `Authorized Users` - Email addresses allowed to access app

**Sharing Permissions (CRITICAL):**
- Share setting: **"Anyone with the link"**
- Permission level: **"Editor"**
- This is required for the API to read/write data

**Verify Headers:**

**Tab: "Authorized Users"**
- Cell A1: `Email`
- Cell A2+: List of authorized user emails (one per row)

**Tab: "Data" & "Visit History"**
```
A1: Timestamp
B1: Sales Rep
C1: Location Name
D1: Business Address
E1: Business Phone
F1: Business Email
G1: Business Website
H1: Contact Person
I1: Contact Title
J1: Direct Phone
K1: Direct Email
L1: Business Types
M1: Interest Level
N1: Visit Notes
O1: Follow-up Date
```

**Template:** See `GOOGLE-SHEET-TEMPLATE.txt` for copy/paste headers

---

### 🟡 Admin Configuration

**Current Admins (src/config.js line 9):**
```javascript
ADMIN_EMAILS: ['ronbenyohanan@gmail.com', 'mintzer.elad@gmail.com']
```

**To add more admins:**
1. Edit `src/config.js`
2. Add email to `ADMIN_EMAILS` array
3. Save and refresh browser

**Admin Privileges:**
- Can access Admin Setup panel
- Can add/remove authorized users
- Can use app as regular salesperson
- Bypass authorization check (always authorized)

---

### 🟡 Environment Variables (RECOMMENDED)

**Current Setup:** API keys hardcoded in `src/config.js` (⚠️ not secure for production)

**Better Approach:** Use environment variables

**Create `.env.local` file:**
```bash
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDGE5vzppjbcnF7vbhlUvs-uTSQPeJcScI
VITE_GOOGLE_CLIENT_ID=794302779341-uis3hrehssvi3iiaoev113t5k67h6cb7.apps.googleusercontent.com
VITE_GOOGLE_SHEETS_API_KEY=AIzaSyCOMwWjwW4dwQ7JhBAVCHg75XS46ot1bWg
VITE_GOOGLE_SHEET_ID=1TCRdV8PMdElo2J6ZcM2rUQwRWV0RNDFcq0EXdl9lGaQ
VITE_ADMIN_EMAILS=ronbenyohanan@gmail.com,mintzer.elad@gmail.com
```

**Update `src/config.js`:**
```javascript
export const CONFIG = {
  ADMIN_EMAILS: import.meta.env.VITE_ADMIN_EMAILS?.split(',') || ['ronbenyohanan@gmail.com', 'mintzer.elad@gmail.com'],
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  GOOGLE_SHEETS_API_KEY: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY,
  GOOGLE_SHEET_ID: import.meta.env.VITE_GOOGLE_SHEET_ID,
  // ... rest of config
};
```

**Update `.gitignore`:**
```
.env.local
.env
```

**Why?**
- Keeps secrets out of Git history
- Different keys for dev/production
- Better security practices

---

## Phase 3: Testing & Validation

### 🟢 Manual Testing Checklist

**After re-enabling authentication:**

#### Admin Flow
- [ ] Admin can sign in with configured email
- [ ] Admin sees "Admin Setup" panel on login
- [ ] Admin can switch between Admin Setup and Map view
- [ ] Admin can add authorized users (test with a real email)
- [ ] Admin can remove authorized users
- [ ] Changes persist in Google Sheet "Authorized Users" tab
- [ ] Admin can sign out successfully

#### Regular User Flow
- [ ] Unauthorized user gets "Access Denied" message
- [ ] Authorized user (added by admin) can sign in
- [ ] User sees map centered on GPS location
- [ ] Red markers appear for unvisited food businesses
- [ ] Clicking marker opens location panel
- [ ] Form validation works (required fields)
- [ ] Visit saves to Google Sheet "Data" tab
- [ ] Visit saves to Google Sheet "Visit History" tab
- [ ] Marker turns green after visit
- [ ] Visit history displays correctly for revisited locations
- [ ] Follow-up date calculated correctly (4 business days, skips weekends)

#### Edge Cases
- [ ] User denies GPS permission (should fallback or show error)
- [ ] Network failure handling (graceful error messages)
- [ ] Google Sheets quota exceeded (error handling)
- [ ] Multiple browser tabs open (data sync)
- [ ] Refresh during form entry (data preservation)

---

## Phase 4: Enhancements (Future)

### 🔵 Code Quality

**Add Linting & Formatting:**
```bash
npm install -D eslint prettier eslint-config-prettier
npm install -D @eslint/js eslint-plugin-react
```

**Remove console.log statements:**
- Found in 8 files across the codebase
- Replace with proper error handling
- Use environment-based logging

**Add Error Boundaries:**
```javascript
// components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  // Catch React errors and display fallback UI
}
```

---

### 🔵 Testing Infrastructure

**Unit Tests (Vitest + React Testing Library):**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Priority test files:**
1. `src/utils/dateUtils.test.js` - Business day calculation
2. `src/utils/googleAuth.test.js` - Admin check logic
3. `src/components/LocationPanel.test.jsx` - Form validation

---

### 🔵 Feature Enhancements

**Search & Filter:**
- Search locations by name or address
- Filter by interest level (Interested, Follow Up, etc.)
- Filter by business type (Italian, Asian, etc.)
- Filter by follow-up date (upcoming, overdue)

**Map Improvements:**
- Clustering for dense areas (100+ markers)
- Custom marker icons (different for business types)
- Directions to selected location
- Distance from current location

**Data Export:**
- Export to CSV from UI (don't rely on Google Sheets)
- Date range filtering
- Sales rep filtering
- Email reports (daily digest)

**Notifications:**
- Browser notifications for follow-ups due today
- Email reminders for upcoming visits
- Weekly summary reports

**Offline Support:**
- Service Worker for offline functionality
- Local storage caching
- Sync when back online

---

## Phase 5: Google Maps API Migration (Future - Optional)

### 🟣 Migrate to New Google Maps APIs

**Status:** ⚠️ Using deprecated APIs (still fully functional, not urgent)

**Current Deprecation Warnings:**

1. **`google.maps.Marker` is deprecated** (as of Feb 21, 2024)
   - Should migrate to: `google.maps.marker.AdvancedMarkerElement`
   - Timeline: Not scheduled for discontinuation, at least 12 months notice before removal
   - Current status: Continues to receive bug fixes for major regressions

2. **`google.maps.places.PlacesService` is deprecated** (as of March 1, 2025)
   - Should migrate to: `google.maps.places.Place`
   - Timeline: Not scheduled for discontinuation, at least 12 months notice before removal
   - Current status: Continues to receive bug fixes for major regressions

**Migration Resources:**
- Markers Migration: https://developers.google.com/maps/documentation/javascript/advanced-markers/migration
- Places Migration: https://developers.google.com/maps/documentation/javascript/places-migration-overview
- Deprecation Schedule: https://developers.google.com/maps/deprecations

**Why This Can Wait:**
- ✅ Current implementation works perfectly
- ✅ Google will give 12+ months notice before discontinuing
- ✅ Bug fixes continue for major issues
- ✅ No functional impact on users
- ✅ Migration can be done incrementally

**When to Migrate:**
- [ ] After app is in production and stable
- [ ] Before Google announces discontinuation date
- [ ] When time permits for non-critical improvements
- [ ] Or as part of a larger Maps feature enhancement

**Migration Steps (When Ready):**

1. **Update index.html script tag:**
   ```html
   <!-- Add marker library -->
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&libraries=places,marker" defer></script>
   ```

2. **Replace Marker with AdvancedMarkerElement:**
   ```javascript
   // OLD (current):
   new window.google.maps.Marker({ position, map, icon, title })

   // NEW (future):
   new window.google.maps.marker.AdvancedMarkerElement({
     position,
     map,
     content: buildMarkerContent(iconColor, title)
   })
   ```

3. **Replace PlacesService with Place class:**
   ```javascript
   // OLD (current):
   const service = new window.google.maps.places.PlacesService(map);
   service.nearbySearch(request, callback);

   // NEW (future):
   const { Place } = await window.google.maps.importLibrary("places");
   const request = { fields, includedTypes, locationRestriction };
   const { places } = await Place.searchNearby(request);
   ```

4. **Test thoroughly:**
   - All markers appear correctly
   - Click handlers work
   - Business details fetch properly
   - Performance is acceptable

**Priority:** 🟣 Low (working fine with deprecated APIs, can wait 6-12 months)

---

## Phase 6: Production Deployment

### 🚀 Pre-Deployment Checklist

- [ ] **Re-enable authentication** (Phases 1-3 complete)
- [ ] **Update OAuth authorized origins** with production domain
- [ ] **Configure API key restrictions** in Google Cloud Console:
  - Restrict Maps API to production domain
  - Restrict Sheets API to production domain
  - Add HTTP referrer restrictions
- [ ] **Remove all console.log statements**
- [ ] **Test thoroughly** with real users
- [ ] **Set up error monitoring** (Sentry, LogRocket)
- [ ] **Set up analytics** (Google Analytics, Mixpanel)

### 🚀 Recommended Hosting

**Netlify (Recommended):**
1. Connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Custom domain setup (optional)

**Benefits:**
- Free tier sufficient for this app
- Automatic HTTPS
- Deploy previews for testing
- Easy rollbacks

**After Deployment:**
1. Update OAuth origins in Google Cloud Console with production URL
2. Test sign-in flow on production
3. Verify Google Sheets integration works
4. Test GPS location on mobile devices

---

## Useful Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for updates
npm outdated

# Update dependencies
npm update
```

---

## Important Files Reference

| File | Purpose |
|------|---------|
| `src/config.js` | API keys, admin emails, dropdown options |
| `src/App.jsx` | Main app component, authentication flow |
| `src/utils/googleSheets.js` | Google Sheets API integration |
| `src/utils/googleAuth.js` | Authentication utilities |
| `src/components/Login.jsx` | Google Sign-In UI |
| `src/components/AdminSetup.jsx` | User management panel |
| `src/components/SimpleMap.jsx` | Google Maps integration |
| `src/components/LocationPanel.jsx` | Visit notes form |
| `package.json` | Dependencies and scripts |
| `vite.config.js` | Build configuration |

---

## Known Issues & Limitations

### Current Limitations

**Google Sheets as Database:**
- Quota: 100 requests per 100 seconds per user
- No ACID guarantees (concurrent writes can conflict)
- Limited query capabilities
- Not suitable for >1000 locations or >10 concurrent users

**When to Migrate:**
- More than 10 concurrent users
- More than 1000 business locations
- Need real-time updates
- Frequent quota exceeded errors

**Migration Path:**
1. Add Supabase/Firebase for caching (read from DB, write to both)
2. Dual-write to Sheets + DB for backup
3. Switch reads to database
4. Full migration (export historical data from Sheets)

---

## Support & Resources

**Documentation:**
- `START-HERE.md` - Project overview
- `QUICK-START.md` - Non-technical setup guide
- `SETUP-GUIDE.md` - Detailed setup with screenshots
- `SETUP-CHECKLIST.md` - Progress tracker
- `GOOGLE-SHEET-TEMPLATE.txt` - Sheet structure
- `HOW-IT-WORKS.md` - Visual flow diagrams
- `README.md` - Technical documentation

**Google Cloud Console:**
- APIs Dashboard: https://console.cloud.google.com/apis/dashboard
- Credentials: https://console.cloud.google.com/apis/credentials
- OAuth Consent: https://console.cloud.google.com/apis/credentials/consent
- API Library: https://console.cloud.google.com/apis/library

**External Resources:**
- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

---

## Contact & Collaboration

**Admin Owners:**
- Ron (ronbenyohanan@gmail.com)
- Elad (mintzer.elad@gmail.com)

**Next Steps:**
1. ✅ Test app functionality without authentication
2. ⏳ Fix OAuth configuration in Google Cloud Console
3. ⏳ Re-enable authentication (follow Phase 1)
4. ⏳ Test with real users
5. ⏳ Deploy to production

---

**Last Updated:** 2025-10-08
**Status:** Authentication temporarily disabled for development
**Priority:** Fix OAuth configuration to re-enable authentication
