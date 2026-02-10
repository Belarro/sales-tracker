# Authentication Fix Guide

## Changes Made

### 1. Environment Variables Setup ✅
- Created [.env](.env) file with your API keys (secure, not committed to git)
- Created [.env.example](.env.example) as a template for others
- Updated [src/config.js](src/config.js) to read from environment variables
- API keys are now hidden from source code

### 2. Improved Error Handling ✅
- Added retry logic for failed API calls (up to 3 attempts)
- Better error messages for users (specific to the problem)
- Validation of configuration on startup
- Graceful handling of token failures

### 3. Token Management ✅
- Created [src/utils/tokenManager.js](src/utils/tokenManager.js) for token refresh
- Automatic token expiration detection
- Silent token refresh capability
- Proper token cleanup on errors

---

## What You Need to Do Now

### Step 1: Fix OAuth App Status (CRITICAL)

Your OAuth app is in **Testing mode**, which causes multi-user login issues.

#### Option A: Make it Internal (If you have Google Workspace)
1. Go to https://console.cloud.google.com
2. Navigate to: **APIs & Services** → **OAuth consent screen**
3. Click **"Make Internal"**
4. ✅ Done! No verification needed, unlimited users in your organization

#### Option B: Add All Test Users (Quick Fix)
1. Go to https://console.cloud.google.com
2. Navigate to: **APIs & Services** → **OAuth consent screen**
3. Scroll to **"Test users"** section
4. Click **"ADD USERS"**
5. Add ALL emails that need access (sales team members):
   ```
   rbyinc@gmail.com
   mintzer.elad@gmail.com
   [add other team members]
   ```
6. Click **"SAVE"**

#### Option C: Publish the App (For Public Use)
1. Go to https://console.cloud.google.com
2. Navigate to: **APIs & Services** → **OAuth consent screen**
3. Click **"PUBLISH APP"**
4. Google may require verification (can take days/weeks)
5. Until verified, you're limited to 100 test users

**Recommended:** Use Option A or B for immediate fix.

---

### Step 2: Verify Authorized Domains

1. In Google Cloud Console: **APIs & Services** → **OAuth consent screen**
2. Check **"Authorized domains"** section
3. Make sure these are added:
   ```
   sales.novabauer.com
   novabauer.com
   localhost (for development)
   ```
4. If not, click **"ADD DOMAIN"** and add them

---

### Step 3: Update OAuth Redirect URIs

1. Go to: **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Under **"Authorized JavaScript origins"**, make sure you have:
   ```
   https://sales.novabauer.com
   http://localhost:5173
   http://localhost
   ```
4. Under **"Authorized redirect URIs"**, make sure you have:
   ```
   https://sales.novabauer.com
   https://sales.novabauer.com/
   http://localhost:5173
   http://localhost
   ```
5. Click **"SAVE"**

---

### Step 4: Test the Changes

1. **Stop your dev server** if it's running (Ctrl+C)
2. **Restart the dev server**:
   ```bash
   npm run dev
   ```
3. **Open the app** in your browser
4. **Test sign-in** with your account
5. **Check the console** for any errors (F12 → Console tab)

---

### Step 5: Test Multi-User Login

#### Test Scenario 1: Same Device, Different Users
1. User A signs in
2. User A signs out
3. User B signs in
4. ✅ Should work without issues

#### Test Scenario 2: Multiple Devices Simultaneously
1. User A signs in on Device 1
2. User B signs in on Device 2 (at the same time)
3. ✅ Both should be able to use the app

If this fails, your OAuth app is still in Testing mode with insufficient test users.

---

## Common Issues & Solutions

### Issue 1: "Sign in failed" or "Access blocked"
**Solution:** Add the user to test users list (see Step 1, Option B)

### Issue 2: "Configuration error: Missing Google Client ID"
**Solution:**
1. Check [.env](.env) file exists in the project root
2. Verify `VITE_GOOGLE_CLIENT_ID` is set
3. Restart the dev server (`npm run dev`)

### Issue 3: "Popup blocked"
**Solution:** Allow popups for your site in browser settings

### Issue 4: Token expired errors
**Solution:** The token manager should handle this automatically now. If issues persist:
1. Sign out
2. Clear browser cache
3. Sign in again

### Issue 5: "Failed to initialize Sheets API"
**Solution:**
1. Check `VITE_GOOGLE_SHEETS_API_KEY` in [.env](.env)
2. Verify the API key has access to Sheets API in Google Cloud Console
3. Check Sheet permissions - the app needs edit access

---

## For Production Deployment

When you deploy to production (sales.novabauer.com):

1. **Create production environment variables** on your hosting platform:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_key
   VITE_GOOGLE_CLIENT_ID=your_client_id
   VITE_GOOGLE_SHEETS_API_KEY=your_key
   VITE_GOOGLE_SHEET_ID=your_sheet_id
   VITE_ADMIN_EMAILS=email1@example.com,email2@example.com
   ```

2. **Update OAuth settings** in Google Cloud Console:
   - Add production URL to Authorized JavaScript origins
   - Add production URL to Authorized redirect URIs

3. **Publish OAuth app** or keep as Internal if using Google Workspace

---

## Security Notes

- ✅ API keys are now in `.env` (not committed to git)
- ✅ The `.env` file is in `.gitignore`
- ⚠️ Never share your `.env` file
- ⚠️ Use different API keys for development and production
- ⚠️ Regularly rotate API keys for security

---

## Need Help?

### Check These Files:
- [src/config.js](src/config.js) - Configuration setup
- [src/components/Login.jsx](src/components/Login.jsx) - Login flow
- [src/utils/tokenManager.js](src/utils/tokenManager.js) - Token management
- [.env](.env) - Your secret keys (do NOT share this)

### Debugging:
1. Open browser console (F12)
2. Look for messages starting with ✅, ⚠️, or ❌
3. Check for red error messages
4. Share the error messages if you need help

---

## What's Next?

After fixing authentication:
1. Test with your team
2. Ensure everyone can sign in simultaneously
3. Monitor for any login issues
4. Consider migrating to a proper backend (Firebase) for long-term scalability

Current setup is good for **5-20 users**. For more, you'll need a database backend.
