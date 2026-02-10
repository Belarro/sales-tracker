# Admin Emails - Google Sheets Setup

## Overview
Admin emails are now automatically synced with Google Sheets! This means:
- ✅ Changes take effect immediately (no server restart needed)
- ✅ You can add/remove admins directly in the app OR in the Google Sheet
- ✅ Admins from your `.env` file are automatically included
- ✅ No more manual copy-paste to `.env` file

## Setup Instructions

### Step 1: Create the "Admin Emails" Sheet Tab

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1TCRdV8PMdElo2J6ZcM2rUQwRWV0RNDFcq0EXdl9lGaQ/edit

2. Click the **+** button at the bottom to create a new sheet tab

3. Name it exactly: `Admin Emails`

4. In the new sheet, add a header in cell A1:
   ```
   Admin Email
   ```

5. (Optional) Add your existing admin emails in column A, starting from A2:
   ```
   A1: Admin Email
   A2: rbyinc@gmail.com
   A3: mintzer.elad@gmail.com
   A4: ronbenyohanan@gmail.com
   A5: j.r.a.kistenich@gmail.com
   ```

### Step 2: Format the Sheet (Optional but Recommended)

1. Select row 1 (the header row)
2. Make it bold
3. Add a background color (e.g., light blue)
4. Freeze the header row: View → Freeze → 1 row

### Step 3: Test It!

1. Go back to your Sales Tracker app
2. Navigate to **Manage Users** (admin panel)
3. Scroll to the **Admin Emails Management** section
4. Click the **🔄 Refresh List** button
5. You should see all admins from both `.env` and the Google Sheet

## How It Works

### Adding Admin Emails

**Option 1: Using the App (Recommended)**
1. Go to Manage Users → Admin Emails Management
2. Enter the email address
3. Click "Add Admin"
4. Done! Changes are saved to Google Sheets immediately

**Option 2: Directly in Google Sheets**
1. Open the "Admin Emails" sheet tab
2. Add the email in the next empty row in column A
3. Go back to the app and click "🔄 Refresh List"

### Removing Admin Emails

**Option 1: Using the App (Recommended)**
1. Go to Manage Users → Admin Emails Management
2. Find the admin you want to remove
3. Click "Remove" button next to their email
4. Confirm the removal
5. Done! Changes are saved to Google Sheets immediately

**Option 2: Directly in Google Sheets**
1. Open the "Admin Emails" sheet tab
2. Delete the row with the email
3. Go back to the app and click "🔄 Refresh List"

## Important Notes

- **`.env` Admins**: Admins listed in your `.env` file (`VITE_ADMIN_EMAILS`) are automatically included and will always appear in the list. They cannot be removed from the app (you'd need to update `.env` for that).

- **Duplicates**: The system automatically removes duplicates. If an email is in both `.env` and Google Sheets, it only appears once.

- **Refresh**: If you add/remove admins directly in Google Sheets, use the "🔄 Refresh List" button in the app to see the changes.

- **Instant Effect**: Changes made in the app take effect immediately - no need to restart the server!

## Sheet Structure

Your "Admin Emails" sheet should look like this:

| A |
|---|
| **Admin Email** |
| admin1@example.com |
| admin2@example.com |
| admin3@example.com |

## Troubleshooting

### "Failed to add admin" Error
- Make sure the "Admin Emails" sheet tab exists in your Google Sheet
- Check that the sheet name is exactly `Admin Emails` (case-sensitive)
- Verify you have edit permissions on the Google Sheet

### Admin doesn't appear in the list
1. Click the "🔄 Refresh List" button
2. Check the browser console (F12 → Console) for errors
3. Make sure the email is in column A of the "Admin Emails" sheet

### Can't remove an admin from `.env`
- Admins from `.env` file are permanent and appear in the list but can only be removed by editing the `.env` file
- To remove them, edit `.env` and restart the server
- This is by design - `.env` admins are the "super admins"

## Migration from Old System

If you were using the old manual copy-paste system:

1. Create the "Admin Emails" sheet as described above
2. The admins from your `.env` file will still work automatically
3. You can now add new admins without touching `.env`
4. Keep at least one admin in `.env` as a backup!

---

**That's it!** Admin email management is now fully automated with Google Sheets. 🎉
