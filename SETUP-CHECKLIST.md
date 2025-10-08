# Setup Checklist ✓

Use this checklist to track your setup progress. Check off each item as you complete it.

## Part 1: Google Cloud Setup

### Create Project
- [ ] Went to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Created new project named "Sales Tracker"
- [ ] Selected the project

### Enable APIs
- [ ] Enabled **Maps JavaScript API**
- [ ] Enabled **Places API**
- [ ] Enabled **Google Sheets API**

### Create API Keys
- [ ] Created **Maps API Key**
  - [ ] Copied and saved the key
  - [ ] Restricted key to Maps JavaScript API and Places API
- [ ] Created **Sheets API Key**
  - [ ] Copied and saved the key
  - [ ] Restricted key to Google Sheets API

### Setup OAuth
- [ ] Configured OAuth Consent Screen
  - [ ] Set app name: "Sales Tracker"
  - [ ] Added support email: rbyinc@gmail.com
  - [ ] Added test user: rbyinc@gmail.com
- [ ] Created OAuth Client ID
  - [ ] Selected "Web application"
  - [ ] Added authorized origin: `http://localhost:3000`
  - [ ] Added authorized origin: `http://localhost:5173`
  - [ ] Copied and saved Client ID

### Keys Saved
- [ ] Google Maps API Key: _______________
- [ ] Google Sheets API Key: _______________
- [ ] Google Client ID: _______________

---

## Part 2: Google Sheets Setup

### Create Sheet
- [ ] Created new Google Sheet
- [ ] Named it: "Sales Tracker Database"

### Create Tabs
- [ ] Tab 1: Named "Data"
  - [ ] Added 15 column headers (see GOOGLE-SHEET-TEMPLATE.txt)
- [ ] Tab 2: Named "Visit History"
  - [ ] Added same 15 column headers
- [ ] Tab 3: Named "Config"
  - [ ] Left empty
- [ ] Tab 4: Named "Authorized Users"
  - [ ] Added "Email" header in A1

### Get Sheet ID
- [ ] Copied Sheet ID from URL
- [ ] Sheet ID: _______________

### Share Sheet
- [ ] Set sharing to: "Anyone with the link"
- [ ] Set permission to: "Editor"

---

## Part 3: Configure App

### Edit Config File
- [ ] Opened `src/config.js`
- [ ] Replaced `YOUR_GOOGLE_MAPS_API_KEY_HERE` with actual key
- [ ] Replaced `YOUR_GOOGLE_CLIENT_ID_HERE` with actual Client ID
- [ ] Replaced `YOUR_GOOGLE_SHEETS_API_KEY_HERE` with actual key
- [ ] Replaced `YOUR_GOOGLE_SHEET_ID_HERE` with actual Sheet ID
- [ ] Verified admin email is: `rbyinc@gmail.com`
- [ ] Saved the file

---

## Part 4: Install and Run

### Install Node.js
- [ ] Downloaded Node.js from [nodejs.org](https://nodejs.org)
- [ ] Installed Node.js (LTS version)
- [ ] Restarted computer

### Install App Dependencies
- [ ] Opened Terminal/Command Prompt
- [ ] Navigated to project folder: `cd path/to/saletracker`
- [ ] Ran: `npm install`
- [ ] Waited for installation to complete (no errors)

### Run the App
- [ ] Ran: `npm run dev`
- [ ] Saw message: "Local: http://localhost:5173/"
- [ ] Opened browser to `http://localhost:5173/`
- [ ] App loaded successfully

---

## Part 5: Test the App

### Admin Login
- [ ] Saw "Sign in with Google" button
- [ ] Clicked sign-in button
- [ ] Signed in with: rbyinc@gmail.com
- [ ] Saw "Admin Setup" page
- [ ] Saw "ADMIN" badge in header

### Add Test User
- [ ] Added a test email to authorized users
- [ ] User appeared in the list
- [ ] No errors

### Test Map View
- [ ] Clicked "Continue to App"
- [ ] Saw Google Map
- [ ] Map centered on current location (or default location)
- [ ] Saw red markers for food places
- [ ] Can click on markers
- [ ] Can see location details

### Test Adding Visit
- [ ] Clicked a marker
- [ ] Clicked "Add Notes"
- [ ] Panel slid up from bottom (mobile) or from right (desktop)
- [ ] Filled out form:
  - [ ] Contact Person
  - [ ] Contact Title
  - [ ] Business Type (dropdown working)
  - [ ] Interest Level (dropdown working)
  - [ ] Visit Notes
- [ ] Saw calculated follow-up date
- [ ] Clicked "Save Visit"
- [ ] Saw success message
- [ ] Marker turned green

### Verify Data in Sheet
- [ ] Opened Google Sheet
- [ ] Checked "Data" tab: New row appeared
- [ ] Checked "Visit History" tab: Same visit appeared
- [ ] All fields filled correctly

---

## Part 6: Deploy (Optional)

### Choose Deployment Platform
- [ ] Decided on platform: ________________

### Build for Production
- [ ] Ran: `npm run build`
- [ ] Saw `dist` folder created
- [ ] No build errors

### Deploy to Platform
- [ ] Uploaded/deployed the app
- [ ] Got production URL: ________________
- [ ] Tested production URL in browser
- [ ] App loads and works

### Update OAuth Settings
- [ ] Went back to Google Cloud Console
- [ ] Opened OAuth Client credentials
- [ ] Added production URL to authorized origins
- [ ] Saved changes
- [ ] Tested sign-in on production URL

---

## Troubleshooting Log

If you encounter issues, document them here:

**Issue 1:**
- Problem: ________________________________
- Solution: ________________________________
- Resolved: [ ] Yes [ ] No

**Issue 2:**
- Problem: ________________________________
- Solution: ________________________________
- Resolved: [ ] Yes [ ] No

**Issue 3:**
- Problem: ________________________________
- Solution: ________________________________
- Resolved: [ ] Yes [ ] No

---

## Final Verification

- [ ] Admin can sign in
- [ ] Admin can add users
- [ ] Admin can remove users
- [ ] Salespeople can sign in (if authorized)
- [ ] Map shows food places
- [ ] GPS location works
- [ ] Can add visit notes
- [ ] Data saves to Google Sheet
- [ ] Markers turn green after visit
- [ ] Visit history shows correctly
- [ ] Follow-up dates calculate correctly (4 days, skip weekends)

---

## Next Steps

- [ ] Add all salesperson emails
- [ ] Send app URL to team
- [ ] Train team on how to use it
- [ ] Monitor Google Sheet for data
- [ ] Check follow-up dates regularly

---

## Important URLs

- **App (local)**: http://localhost:5173/
- **App (production)**: ________________________
- **Google Sheet**: ________________________
- **Google Cloud Console**: https://console.cloud.google.com/
- **Project Folder**: ________________________

---

## Support Resources

- **Quick Start**: [QUICK-START.md](QUICK-START.md)
- **Full Setup Guide**: [SETUP-GUIDE.md](SETUP-GUIDE.md)
- **Technical Docs**: [README.md](README.md)
- **Sheet Template**: [GOOGLE-SHEET-TEMPLATE.txt](GOOGLE-SHEET-TEMPLATE.txt)

---

**Setup Complete!** 🎉

Date completed: _______________
Completed by: _______________