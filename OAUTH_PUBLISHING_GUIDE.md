# OAuth App Publishing Guide

## Current Issue
Your Google OAuth app is in "Testing" mode, which may limit concurrent users. When two people try to use the app at the same time, one may get blocked.

## Solution: Publish Your OAuth App

### Step 1: Go to Google Cloud Console
1. Visit https://console.cloud.google.com
2. Select your project (the one with your OAuth client ID)

### Step 2: Navigate to OAuth Consent Screen
1. In the left sidebar, click "APIs & Services"
2. Click "OAuth consent screen"

### Step 3: Review Your App Information
You should see:
- App name: "Sales Tracker" (or whatever you named it)
- User support email: Your email
- Developer contact email: Your email
- Authorized domains: novabauer.com

### Step 4: Publish the App

#### Option A: Internal App (If you have Google Workspace)
- If sales.novabauer.com uses Google Workspace
- Click "Make Internal"
- Internal apps don't need verification
- Only users in your workspace can access

#### Option B: Public App (For personal Gmail accounts)
- Click "PUBLISH APP"
- Google will ask you to submit for verification
- **OR** keep in testing mode but be aware of limitations

### Step 5: Domain Verification (if required)
If Google asks you to verify your domain:
1. Go to Google Search Console: https://search.google.com/search-console
2. Add property: sales.novabauer.com
3. Verify ownership using one of these methods:
   - DNS record (TXT record)
   - HTML file upload
   - Meta tag

### Alternative: Stay in Testing Mode
If you can't publish yet:
1. Make sure BOTH users are added to "Test users" list:
   - rbyinc@gmail.com
   - j.r.a.kistenich@gmail.com (your partner)
2. Each test user needs to accept the OAuth consent screen
3. Be aware there may still be concurrent session limits

## What the Recent Code Changes Do
The code changes I just made will:
- Properly clean up tokens when users sign out
- Prevent token conflicts when switching users
- Force account selection on every login
- Add better logging for debugging

These changes help with **switching between users**, but if you need **simultaneous access**, you should publish the OAuth app.

## Testing After Publishing
1. User A logs in on their device
2. User B logs in on their device (at the same time)
3. Both should be able to use the app simultaneously

## Questions?
If you need help with domain verification or publishing, let me know!
