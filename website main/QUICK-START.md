# Quick Start Guide

**For someone with zero coding knowledge**

## What You Need Before Starting

1. A Google account (you'll use: rbyinc@gmail.com)
2. About 30 minutes of time
3. A computer with internet

## Simple 5-Step Process

### Step 1: Get Google API Keys (15 min)
👉 **Go to**: [Google Cloud Console](https://console.cloud.google.com/)

Do this:
1. Create new project called "Sales Tracker"
2. Enable these 3 things:
   - Maps JavaScript API
   - Places API
   - Google Sheets API
3. Create 3 keys (you'll get long strings of text):
   - Maps API Key
   - Sheets API Key
   - OAuth Client ID

📖 **Detailed instructions**: See [SETUP-GUIDE.md Part 1](SETUP-GUIDE.md#part-1-google-cloud-setup)

### Step 2: Create Your Google Sheet (5 min)
👉 **Go to**: [Google Sheets](https://sheets.google.com)

Do this:
1. Create a new blank sheet
2. Name it: "Sales Tracker Database"
3. Create 4 tabs:
   - **Data** (with 15 column headers)
   - **Visit History** (same 15 column headers)
   - **Config** (empty)
   - **Authorized Users** (one header: "Email")
4. Share it: "Anyone with the link" → "Editor"
5. Copy the Sheet ID from the URL

📖 **Detailed instructions**: See [SETUP-GUIDE.md Part 2](SETUP-GUIDE.md#part-2-google-sheets-setup)

### Step 3: Add Keys to the App (3 min)

1. Find this file: `src/config.js`
2. Open it with Notepad (or any text editor)
3. Replace these lines with your actual keys:
   ```javascript
   GOOGLE_MAPS_API_KEY: 'paste-your-maps-key-here',
   GOOGLE_CLIENT_ID: 'paste-your-client-id-here',
   GOOGLE_SHEETS_API_KEY: 'paste-your-sheets-key-here',
   GOOGLE_SHEET_ID: 'paste-your-sheet-id-here',
   ```
4. Save the file

### Step 4: Install Node.js (5 min)

**First time only:**
1. Go to [nodejs.org](https://nodejs.org)
2. Download the big green button (LTS version)
3. Install it (click Next, Next, Next...)
4. Restart your computer

### Step 5: Run the App (2 min)

**On Windows:**
1. Press `Windows + R`
2. Type: `cmd` and press Enter
3. Type: `cd ` then drag your project folder into the window
4. Press Enter
5. Type: `npm install` and press Enter (wait 2 minutes)
6. Type: `npm run dev` and press Enter
7. Open browser and go to: `http://localhost:5173`

**On Mac:**
1. Press `Cmd + Space`
2. Type: `terminal` and press Enter
3. Type: `cd ` then drag your project folder into the window
4. Press Enter
5. Type: `npm install` and press Enter (wait 2 minutes)
6. Type: `npm run dev` and press Enter
7. Open browser and go to: `http://localhost:5173`

## You're Done! 🎉

Now you can:
1. Sign in with rbyinc@gmail.com
2. Add your salespeople's emails
3. They can sign in and start tracking visits!

## Need More Help?

- **Full detailed guide**: [SETUP-GUIDE.md](SETUP-GUIDE.md)
- **Technical info**: [README.md](README.md)
- **Got an error?**: See [Troubleshooting section](SETUP-GUIDE.md#troubleshooting)

## Most Common Mistake

❌ **Forgetting to add your keys to config.js**

Make sure you:
- Opened the right file: `src/config.js`
- Replaced ALL FOUR placeholders with your actual keys
- Kept the quotes around the keys
- Saved the file

## What Each File Does (Simple Explanation)

- `src/config.js` - **You edit this one** (add your API keys here)
- `SETUP-GUIDE.md` - Step-by-step instructions with screenshots
- `README.md` - Technical documentation (for developers)
- `package.json` - List of code libraries the app uses
- `src/components/` - The different parts of the app (login, map, forms)
- `src/utils/` - Helper code for Google Sheets, dates, etc.

## Commands You'll Use

```bash
npm install          # Install the app (first time only)
npm run dev          # Run the app on your computer
npm run build        # Prepare the app for putting online
```

## After Setup - Using the App

### As Admin (rbyinc@gmail.com):
1. Sign in
2. See "Admin Setup" page
3. Add salesperson emails → They get access
4. Click "Continue to App" → See the map
5. Use it like a salesperson (add visits, etc.)
6. Click "Manage Users" anytime to add/remove people

### As Salesperson:
1. Sign in with your email (admin must add you first)
2. See map with food places near you
3. **Red dots** = Not visited yet
4. **Green dots** = Already visited
5. Click any dot → See business info
6. Click "Add Notes" → Fill the form → Save
7. Dot turns green!
8. Can visit same place multiple times (history is saved)

## Tips

💡 Keep your browser at `localhost:5173` - that's your app!
💡 Don't close the terminal/command prompt - that's running your app
💡 Press `Ctrl+C` in terminal to stop the app
💡 Type `npm run dev` again to restart it

## Want to Put It Online?

So anyone can access it from anywhere:

**Easiest way - Netlify (FREE):**
1. Go to [netlify.com](https://netlify.com)
2. Sign up (use Google sign-in)
3. Run: `npm run build` in terminal
4. Drag the `dist` folder to Netlify website
5. You get a URL like: `https://your-sales-tracker.netlify.app`
6. **Important**: Add this URL to Google Cloud Console → OAuth → Authorized origins

📖 **Full deploy guide**: [SETUP-GUIDE.md Part 5](SETUP-GUIDE.md#part-5-deploy-online)

---

**That's it! You now have a working sales tracking app! 🚀**