# Sales Tracker - Complete Setup Guide

This guide will walk you through setting up your Sales Tracker app step by step. **No coding knowledge required!** Just follow each step carefully.

---

## Table of Contents

1. [Part 1: Google Cloud Setup (15 minutes)](#part-1-google-cloud-setup)
2. [Part 2: Google Sheets Setup (5 minutes)](#part-2-google-sheets-setup)
3. [Part 3: Configure the App (5 minutes)](#part-3-configure-the-app)
4. [Part 4: Install and Run the App (5 minutes)](#part-4-install-and-run-the-app)
5. [Part 5: Deploy Online (Optional - 10 minutes)](#part-5-deploy-online)
6. [Part 6: How to Use the App](#part-6-how-to-use-the-app)
7. [Troubleshooting](#troubleshooting)

---

## Part 1: Google Cloud Setup

You need to get API keys from Google to use Google Maps, Google Sign-In, and Google Sheets.

### Step 1.1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account (use rbyinc@gmail.com)
3. Click the **"Select a project"** dropdown at the top
4. Click **"NEW PROJECT"**
5. Enter project name: `Sales Tracker`
6. Click **"CREATE"**
7. Wait a few seconds, then click **"SELECT PROJECT"**

### Step 1.2: Enable Required APIs

#### Enable Google Maps JavaScript API

1. In the left sidebar, click **"APIs & Services"** → **"Library"**
2. In the search box, type: `Maps JavaScript API`
3. Click on **"Maps JavaScript API"**
4. Click the blue **"ENABLE"** button
5. Wait for it to enable

#### Enable Google Places API

1. Click **"Library"** in the left sidebar again
2. Search for: `Places API`
3. Click on **"Places API"**
4. Click **"ENABLE"**

#### Enable Google Sheets API

1. Click **"Library"** again
2. Search for: `Google Sheets API`
3. Click on **"Google Sheets API"**
4. Click **"ENABLE"**

### Step 1.3: Create API Keys

#### Create Maps API Key

1. In the left sidebar, click **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"API key"**
4. A popup will show your API key - **COPY IT** and save it in a notepad
5. Label it: `Google Maps API Key`
6. Click **"RESTRICT KEY"** (recommended for security)
7. Under "API restrictions", select **"Restrict key"**
8. Check these APIs:
   - Maps JavaScript API
   - Places API
9. Click **"SAVE"**

#### Create Sheets API Key

1. Click **"+ CREATE CREDENTIALS"** again
2. Select **"API key"**
3. Copy this key and save it as: `Google Sheets API Key`
4. Click **"RESTRICT KEY"**
5. Under "API restrictions", select **"Restrict key"**
6. Check: **Google Sheets API**
7. Click **"SAVE"**

### Step 1.4: Create OAuth 2.0 Client ID (for Google Sign-In)

1. Still in **"Credentials"**, click **"+ CREATE CREDENTIALS"**
2. Select **"OAuth client ID"**
3. If you see a message about consent screen:
   - Click **"CONFIGURE CONSENT SCREEN"**
   - Select **"External"**
   - Click **"CREATE"**
   - Fill in:
     - App name: `Sales Tracker`
     - User support email: `rbyinc@gmail.com`
     - Developer contact: `rbyinc@gmail.com`
   - Click **"SAVE AND CONTINUE"**
   - On "Scopes" page, click **"SAVE AND CONTINUE"**
   - On "Test users" page, click **"ADD USERS"**
   - Add your email: `rbyinc@gmail.com`
   - Click **"ADD"**, then **"SAVE AND CONTINUE"**
   - Click **"BACK TO DASHBOARD"**
4. Go back to **"Credentials"** in the left sidebar
5. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
6. Application type: **"Web application"**
7. Name: `Sales Tracker Web Client`
8. Under "Authorized JavaScript origins", click **"+ ADD URI"**:
   - Add: `http://localhost:3000`
   - Click **"+ ADD URI"** again
   - Add: `http://localhost:5173` (Vite dev server)
9. Click **"CREATE"**
10. A popup shows your Client ID - **COPY IT** and save as: `Google Client ID`
11. Click **"OK"**

**IMPORTANT**: Save all three keys somewhere safe:
- ✅ Google Maps API Key
- ✅ Google Sheets API Key
- ✅ Google Client ID

---

## Part 2: Google Sheets Setup

Now let's create the Google Sheet that will store your sales data.

### Step 2.1: Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"Blank"** to create a new spreadsheet
3. Name it: `Sales Tracker Database` (at the top left)

### Step 2.2: Create the Required Tabs

Your sheet needs 4 tabs. Let's create them:

#### Tab 1: Data (Main sales data)

1. The first tab is already there, rename it to: **`Data`**
2. In the first row, add these column headers (copy and paste):

```
Timestamp	Sales Rep	Location Name	Business Address	Business Phone	Business Email	Business Website	Contact Person	Contact Title	Direct Phone	Direct Email	Business Types	Interest Level	Visit Notes	Follow-up Date
```

#### Tab 2: Visit History (All visits)

1. Click the **"+"** button at the bottom to add a new tab
2. Rename it to: **`Visit History`**
3. Add the same headers as the Data tab:

```
Timestamp	Sales Rep	Location Name	Business Address	Business Phone	Business Email	Business Website	Contact Person	Contact Title	Direct Phone	Direct Email	Business Types	Interest Level	Visit Notes	Follow-up Date
```

#### Tab 3: Config (App configuration)

1. Add another tab, name it: **`Config`**
2. This tab is for future use - leave it empty for now

#### Tab 4: Authorized Users

1. Add one more tab, name it: **`Authorized Users`**
2. In cell A1, type: `Email`
3. This is where authorized user emails will be stored

### Step 2.3: Get Your Sheet ID

1. Look at the URL in your browser. It looks like:
   ```
   https://docs.google.com/spreadsheets/d/XXXXXXXXXXXXXXXXXXXXXXXXXX/edit
   ```
2. Copy the long string between `/d/` and `/edit` - this is your **Sheet ID**
3. Save it as: `Google Sheet ID`

### Step 2.4: Share the Sheet

1. Click the **"Share"** button (top right)
2. Under "General access", click **"Restricted"**
3. Change it to: **"Anyone with the link"** → **"Editor"**
4. Click **"Done"**

**Why?** This allows the app to read and write data using the API keys.

---

## Part 3: Configure the App

Now let's add your API keys to the app.

### Step 3.1: Open the Config File

1. Open the folder where you saved this project
2. Navigate to: `src` → `config.js`
3. Open `config.js` in any text editor (Notepad, TextEdit, VS Code, etc.)

### Step 3.2: Add Your API Keys

You'll see lines that look like this:

```javascript
GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE',
GOOGLE_SHEETS_API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY_HERE',
GOOGLE_SHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE',
```

Replace each one with your actual keys (keep the quotes):

```javascript
GOOGLE_MAPS_API_KEY: 'AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx',
GOOGLE_CLIENT_ID: '123456789-xxxxxxxxxxxxxxx.apps.googleusercontent.com',
GOOGLE_SHEETS_API_KEY: 'AIzaSyDyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
GOOGLE_SHEET_ID: '1AbC123xYz-xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
```

### Step 3.3: Save the File

1. Save the file (Ctrl+S or Cmd+S)
2. Close the text editor

**IMPORTANT**: The admin email is already set to `rbyinc@gmail.com` in the config file.

---

## Part 4: Install and Run the App

Now let's get the app running on your computer.

### Step 4.1: Install Node.js (if you don't have it)

1. Go to [nodejs.org](https://nodejs.org)
2. Download the **LTS version** (recommended)
3. Run the installer
4. Follow the installation steps (keep all defaults)
5. Restart your computer

### Step 4.2: Install App Dependencies

1. Open **Command Prompt** (Windows) or **Terminal** (Mac)
2. Navigate to your project folder:
   ```bash
   cd path/to/saletracker
   ```
   Example: `cd C:\Users\YourName\Downloads\saletracker`
3. Run this command:
   ```bash
   npm install
   ```
4. Wait for it to finish (takes 1-2 minutes)

### Step 4.3: Run the App

1. In the same terminal, run:
   ```bash
   npm run dev
   ```
2. You'll see a message like:
   ```
   Local: http://localhost:5173/
   ```
3. Open your web browser and go to: `http://localhost:5173/`

**🎉 Your app should now be running!**

---

## Part 5: Deploy Online (Optional)

Want to access your app from anywhere? Deploy it for free!

### Option 1: Netlify (Easiest)

1. Go to [netlify.com](https://netlify.com)
2. Sign up with your Google account
3. Click **"Add new site"** → **"Deploy manually"**
4. In your terminal (in the project folder), run:
   ```bash
   npm run build
   ```
5. Drag the `dist` folder to Netlify
6. Wait for deployment
7. You'll get a URL like: `https://your-app.netlify.app`

**IMPORTANT**: After deploying, go back to Google Cloud Console:
1. Go to **Credentials** → Your OAuth Client ID
2. Under **"Authorized JavaScript origins"**, add your Netlify URL
3. Click **"SAVE"**

### Option 2: GitHub Pages

1. Create a GitHub account (if you don't have one)
2. Install GitHub Desktop
3. Create a new repository: `sales-tracker`
4. Add your project files
5. In `vite.config.js`, add:
   ```javascript
   export default defineConfig({
     plugins: [react()],
     base: '/sales-tracker/'
   })
   ```
6. Run: `npm run build`
7. Push the `dist` folder to the `gh-pages` branch
8. Enable GitHub Pages in repository settings

---

## Part 6: How to Use the App

### For Admin (First Time)

1. Open the app
2. Click **"Sign in with Google"**
3. Sign in with `rbyinc@gmail.com`
4. You'll see the **Admin Setup** page
5. Add salesperson emails one by one:
   - Type email → Click "Add User"
6. When done, click **"Continue to App"**
7. You'll see the map with food places near you

### For Salespeople

1. Admin sends them the app URL
2. They click **"Sign in with Google"**
3. They sign in with their email (that admin authorized)
4. They see the map with food locations

### Adding Visit Notes

1. **Red markers** = Not visited yet
2. **Green markers** = Already visited
3. Click any marker to see location details
4. Click **"Add Notes"** or **"View Details & Add Notes"**
5. Fill in the form:
   - Contact person name
   - Contact title (Manager, Owner, etc.)
   - Phone and email (optional)
   - Business type (dropdown)
   - Interest level (Interested, Not Interested, etc.)
   - Visit notes (what you discussed)
6. Follow-up date is automatically calculated (4 business days)
7. Click **"Save Visit"**
8. The marker turns green!

### Viewing Visit History

- When you open a location that's been visited before
- Scroll down to see **"Visit History"**
- Shows all previous visits with dates, notes, and who visited

### Managing Users (Admin Only)

1. Click **"Manage Users"** in the header
2. Add or remove users anytime
3. Click **"Continue to App"** to go back to the map

---

## Troubleshooting

### "Failed to initialize" error

**Problem**: API keys not configured properly

**Solution**:
1. Check that you replaced ALL placeholders in `config.js`
2. Make sure you kept the quotes around each key
3. Verify keys are correct (no extra spaces)

### "You are not authorized" error

**Problem**: User email not in authorized list

**Solution**:
1. Sign in as admin (rbyinc@gmail.com)
2. Go to "Manage Users"
3. Add the user's email

### Map not showing

**Problem**: Google Maps API not enabled or key incorrect

**Solution**:
1. Go to Google Cloud Console
2. Check that Maps JavaScript API is enabled
3. Check that your API key is correct in `config.js`
4. Make sure API key has Maps JavaScript API restriction

### "Failed to save visit" error

**Problem**: Google Sheets permissions or API issue

**Solution**:
1. Check that your Sheet is shared with "Anyone with the link - Editor"
2. Verify Google Sheets API is enabled in Cloud Console
3. Check that Sheet ID in `config.js` is correct

### Sign-in button not appearing

**Problem**: OAuth Client ID issue

**Solution**:
1. Check that your Client ID in `config.js` is correct
2. In Google Cloud Console, verify your OAuth client has these origins:
   - `http://localhost:5173`
   - `http://localhost:3000`
   - Your deployment URL (if deployed)

### GPS not working

**Problem**: Browser permissions

**Solution**:
1. Your browser will ask for location permission
2. Click **"Allow"**
3. If you denied it, go to browser settings → Site settings → Location
4. Allow location for your app URL

---

## Need Help?

If you run into issues:

1. Check the browser console for errors:
   - Right-click anywhere → "Inspect"
   - Click "Console" tab
2. Make sure all APIs are enabled in Google Cloud
3. Verify all keys in `config.js` are correct
4. Check that Google Sheet is shared properly

---

## Summary Checklist

Before running the app, make sure you have:

- ✅ Created Google Cloud project
- ✅ Enabled Maps JavaScript API, Places API, Sheets API
- ✅ Created Maps API Key
- ✅ Created Sheets API Key
- ✅ Created OAuth Client ID
- ✅ Created Google Sheet with 4 tabs (Data, Visit History, Config, Authorized Users)
- ✅ Got Sheet ID from URL
- ✅ Shared sheet with "Anyone with link - Editor"
- ✅ Added all keys to `config.js`
- ✅ Installed Node.js
- ✅ Ran `npm install`
- ✅ Ran `npm run dev`

**You're all set! Happy tracking! 🎉**