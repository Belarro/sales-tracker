# 🔴 URGENT: OAuth Configuration Required for Saving Visits

**Last Verified:** 2025-10-09
**Status:** 🟡 OAuth configuration pending (app authentication is active)

## Current Issue

Visits **cannot be saved** to Google Sheets because OAuth is not properly configured in Google Cloud Console.

**Error:** `403 - Request had insufficient authentication scopes`

**Why:** Google Sheets API requires OAuth authentication (not just API key) for **write operations**.

**App Status:** Authentication is ENABLED in `src/App.jsx` (not bypassed). Users will see the login screen. Once OAuth is properly configured in Google Cloud Console, the full app will work.

---

## What Ron Needs to Do (15 minutes)

### Problem Summary

✅ **Google Sheet exists and is publicly editable**
✅ **API key is configured**
✅ **OAuth Client ID is configured**
❌ **OAuth Client ID doesn't allow localhost:3000**
❌ **OAuth doesn't have Sheets scope**

---

## Step 1: Add localhost:3000 to OAuth Authorized Origins

**Current error when app loads:**
```
[GSI_LOGGER]: The given origin is not allowed for the given client ID
```

**Fix:**

1. Go to: **https://console.cloud.google.com/apis/credentials**
2. Find: OAuth 2.0 Client ID `794302779341-uis3hrehssvi3iiaoev113t5k67h6cb7...`
3. Click **Edit** (pencil icon)
4. Under **"Authorized JavaScript origins"**, click **"+ ADD URI"**
5. Add:
   ```
   http://localhost:3000
   ```
6. Also add (for flexibility):
   ```
   http://localhost:3001
   http://localhost:5173
   ```
7. Click **"SAVE"**
8. Wait 2 minutes for changes to propagate

---

## Step 2: Add Sheets Scope to OAuth Consent Screen

**Current issue:** OAuth can sign you in, but doesn't have permission to access Sheets.

**Fix:**

1. Go to: **https://console.cloud.google.com/apis/credentials/consent**
2. Click **"EDIT APP"** button
3. Click **"SCOPES"** in the navigation (Step 2)
4. Click **"ADD OR REMOVE SCOPES"**
5. In the filter/search box, type: `spreadsheets`
6. Check the box next to:
   ```
   https://www.googleapis.com/auth/spreadsheets
   ```
   Description: "See, edit, create, and delete all your Google Sheets spreadsheets"
7. Click **"UPDATE"** at the bottom
8. Click **"SAVE AND CONTINUE"** through the remaining steps
9. Click **"BACK TO DASHBOARD"**

---

## Step 3: Verify APIs are Enabled

Make sure these APIs are enabled:

1. Go to: **https://console.cloud.google.com/apis/dashboard**
2. Verify you see:
   - ✅ **Google Sheets API**
   - ✅ **Maps JavaScript API**
   - ✅ **Places API** (or "Places API (Legacy)")

If any are missing:
1. Go to: https://console.cloud.google.com/apis/library
2. Search for the missing API
3. Click **"ENABLE"**

---

## Step 4: Test the Fix

After Ron completes Steps 1-3:

1. **Wait 2-3 minutes** for Google's changes to propagate
2. **Refresh the app**: http://localhost:3000/
3. **Hard refresh**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. You should see a **Google Sign-In popup** (this is normal now)
5. Sign in with your Google account
6. Grant permission to access Google Sheets (click "Allow")
7. Try clicking a marker and saving a visit

---

## Expected Behavior After Fix

### Before Fix:
```
❌ [GSI_LOGGER]: The given origin is not allowed
❌ Error saving location data: 403 - insufficient authentication scopes
```

### After Fix:
```
✅ Google Sign-In popup appears
✅ You sign in and grant Sheets access
✅ Visit saves successfully: "Visit saved successfully!"
✅ Data appears in Google Sheet
```

---

## Why This Is Needed

### API Key vs OAuth

**API Key (what we tried first):**
- ✅ Can READ from public sheets
- ❌ Cannot WRITE to sheets (even public ones)
- ❌ Not sufficient for this app

**OAuth (what we need):**
- ✅ Can READ from sheets
- ✅ Can WRITE to sheets
- ✅ User grants permission explicitly
- ✅ Required for saving visits

### Trade-off

**Benefit:** Visits can be saved properly
**Cost:** Users need to sign in with Google and grant Sheets access
**Security:** Each user explicitly grants permission (better security)

---

## Troubleshooting

### Still Getting "origin is not allowed"?

**Verify:**
1. localhost:3000 is in **Authorized JavaScript origins** (not Redirect URIs)
2. Saved the changes
3. Waited 2-3 minutes
4. Hard refreshed the browser

### Still Getting 403 errors?

**Verify:**
1. OAuth consent screen has `...auth/spreadsheets` scope
2. You signed in when prompted
3. You clicked "Allow" on the permissions screen
4. Google Sheet is still shared as "Anyone with link - Editor"

### Sign-in popup appears but immediately closes?

**Causes:**
- localhost:3000 not in Authorized origins
- OAuth consent screen not published/approved
- Browser blocking popups

**Fix:**
- Check OAuth origins again
- Allow popups for localhost:3000
- Try incognito mode

### "This app hasn't been verified"?

**This is normal for development.**

1. Click "Advanced"
2. Click "Go to Sales Tracker (unsafe)"
3. Grant permissions

In production, you'd verify the app with Google.

---

## Alternative: Service Account (Advanced)

If you don't want users to sign in, you could use a **Service Account** instead:

**Pros:**
- No user sign-in required
- Good for backend/automated processes

**Cons:**
- More complex setup
- Need to share Sheet with service account email
- Can't track which user made changes

For now, **OAuth is simpler and better** for a team-based sales tracker.

---

## Quick Reference

| Step | What | Where |
|------|------|-------|
| 1 | Add localhost origins | https://console.cloud.google.com/apis/credentials |
| 2 | Add Sheets scope | https://console.cloud.google.com/apis/credentials/consent |
| 3 | Verify APIs enabled | https://console.cloud.google.com/apis/dashboard |
| 4 | Test | http://localhost:3000/ |

---

## After This Works

Once visits are saving successfully:

1. **Test thoroughly:**
   - Save multiple visits
   - Check they appear in Google Sheet
   - Verify visit history shows correctly

2. **Next steps:**
   - Re-enable app authentication (currently disabled)
   - Add authorized users to the Sheet
   - Test with multiple team members

---

**Status:** ⏳ Waiting for Ron to configure OAuth
**ETA:** 15 minutes of Google Cloud Console work
**Priority:** 🔴 CRITICAL - App cannot save data without this

---

**Questions?** Let me know what error messages you see and I can help troubleshoot!
