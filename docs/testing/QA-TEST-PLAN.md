# Sales Tracker — QA Test Plan

**Version:** 1.0
**Date:** 27 March 2026
**Prepared by:** QA & UI/UX Review
**App:** Sales Tracker (React + Google Sheets + Google Maps)

---

## How to Use This Document

- Work through each section in order (Phase 1 → 5)
- Check off each test as you complete it
- Mark PASS / FAIL / BLOCKED next to each item
- If FAIL: note the actual behavior and screenshot if possible
- Tests marked with ⚡ are critical — block release if failed

---

## TABLE OF CONTENTS

1. [Authentication & Login](#1-authentication--login)
2. [Map View](#2-map-view)
3. [Location Panel (Visit Form)](#3-location-panel-visit-form)
4. [List View](#4-list-view)
5. [Today's Tasks & Follow-Up System](#5-todays-tasks--follow-up-system)
6. [Pipeline & Stage Progression](#6-pipeline--stage-progression)
7. [Follow-Up Messages & Actions](#7-follow-up-messages--actions)
8. [Admin Panel](#8-admin-panel)
9. [Google Sheets Data Integrity](#9-google-sheets-data-integrity)
10. [Google Calendar Integration](#10-google-calendar-integration)
11. [Notifications & Reminders](#11-notifications--reminders)
12. [Date Logic & Snapping](#12-date-logic--snapping)
13. [Mobile & Responsive](#13-mobile--responsive)
14. [Security & Permissions](#14-security--permissions)
15. [Edge Cases & Stress Tests](#15-edge-cases--stress-tests)
16. [End-to-End Flows](#16-end-to-end-flows)
17. [Google Apps Script (Sheet Backend)](#17-google-apps-script-sheet-backend)
18. [Deployment Checklist](#18-deployment-checklist)

---

## 1. Authentication & Login

### 1.1 Google Sign-In

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡1.1.1 | Click "Sign in with Google" | OAuth popup opens, user selects account | |
| 1.1.2 | Cancel the OAuth popup | App shows "Sign-in was cancelled" message | |
| 1.1.3 | Block popup in browser settings, then sign in | App shows "Popup blocked" message | |
| ⚡1.1.4 | Complete OAuth flow with authorized email | Login succeeds, app loads | |
| ⚡1.1.5 | Complete OAuth flow with unauthorized email | App shows "not authorized" error | |
| 1.1.6 | Disable network during OAuth | Graceful error, not blank screen | |

### 1.2 Name Input

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1.2.1 | After OAuth, name input modal appears | Modal shows with text input | |
| 1.2.2 | Submit blank name | Validation prevents submission | |
| 1.2.3 | Enter name and submit | Name saved, app loads | |
| 1.2.4 | Log out, log back in | Previous name pre-filled (from localStorage) | |

### 1.3 Token Lifecycle

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡1.3.1 | Wait 1 hour without refreshing | Token expires, app prompts re-login | |
| 1.3.2 | Refresh the page after login | Token lost, must re-login (expected behavior) | |
| 1.3.3 | Click "Sign Out" | Token revoked, redirected to login screen | |
| 1.3.4 | After sign out, check `window.googleAccessToken` in console | Should be `undefined` / cleared | |

---

## 2. Map View

### 2.1 Map Loading

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡2.1.1 | Open Map tab | Google Map loads with POI labels visible | |
| 2.1.2 | Allow GPS permission | Blue pulsing marker at your location | |
| 2.1.3 | Deny GPS permission | Map defaults to Berlin center (52.52, 13.40) | |
| 2.1.4 | Click "My Location" button | Map recenters on GPS position | |

### 2.2 POI Interaction

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡2.2.1 | Click a restaurant/cafe POI on the map | Location Panel opens with name, address, phone, website pre-filled | |
| 2.2.2 | Click a POI that was already visited | Panel opens with saved contact info + notes | |
| 2.2.3 | Click "Quick Add" button | Finds nearest restaurant within 50m, opens panel | |
| 2.2.4 | Click "Quick Add" with no restaurants nearby | Creates generic "New Location" entry | |

### 2.3 Markers

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡2.3.1 | Save a visit with "Interested" | Marker turns blue on map | |
| 2.3.2 | Save with "Not Interested" | Marker turns red | |
| 2.3.3 | Save with "Follow Up" | Marker turns yellow | |
| 2.3.4 | Save with "Closed Deal" | Marker turns green | |
| 2.3.5 | Save with "Pending" | Marker turns gray | |
| 2.3.6 | Visit same location multiple times | Marker shows visit count badge (2, 3, etc.) | |
| 2.3.7 | Location counter in header | Shows correct total count | |

### 2.4 First-Time Hint

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 2.4.1 | First time opening map | Hint banner appears | |
| 2.4.2 | Wait 12 seconds | Hint auto-dismisses | |
| 2.4.3 | Click "Got it" | Hint dismissed, saved to localStorage | |
| 2.4.4 | Reopen app | Hint does NOT appear again | |

---

## 3. Location Panel (Visit Form)

### 3.1 Form Fields

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡3.1.1 | Panel opens from map click | Location name + address in header | |
| 3.1.2 | Contact Name field | Accepts any text | |
| 3.1.3 | Contact Title dropdown | Shows: Owner, Chef, Manager, etc. | |
| 3.1.4 | Phone country code selector | Options: +49, +43, +44, +1, +972 | |
| 3.1.5 | Phone number field | Accepts digits | |
| 3.1.6 | Email field | Accepts any text (no strict validation) | |
| 3.1.7 | Business Types dropdown | Shows 40+ cuisine options | |
| 3.1.8 | Website field | Accepts URLs | |
| 3.1.9 | Sample Given toggle | Switches between YES / NO | |

### 3.2 Interest Level Selection

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡3.2.1 | Click "Interested" | Button highlights blue | |
| ⚡3.2.2 | Click "Not Interested" | Button highlights red | |
| ⚡3.2.3 | Click "Follow Up" | Button highlights yellow, follow-up date auto-set (+7 days, snapped) | |
| 3.2.4 | Click "Pending" | Button highlights gray | |
| 3.2.5 | Click "Closed Deal" | Button highlights green, pipeline auto-sets to "closed_won" | |
| 3.2.6 | Click "Not Interested" | Pipeline auto-sets to "closed_lost" | |

### 3.3 Follow-Up Date Presets

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 3.3.1 | Select "Interested" | Follow-up date auto-set to +7 days (snapped to Mon/Thu) | |
| 3.3.2 | Click "3 Days" preset | Date set to +3 days (snapped to Mon/Thu) | |
| 3.3.3 | Click "1 Week" preset | Date set to +7 days (snapped to Mon/Thu) | |
| 3.3.4 | Click "2 Weeks" preset | Date set to +14 days (snapped to Mon/Thu) | |

### 3.4 Pipeline Stage Buttons

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 3.4.1 | 11 stage buttons visible | New, FU1-FU4, Ordered, Delivery, Post-Del, Active, Inactive, Won, Lost | |
| 3.4.2 | Click a stage button | Highlights and saves to sheet immediately | |
| 3.4.3 | Reopen same location | Correct stage still highlighted | |

### 3.5 Notes & Templates

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 3.5.1 | Note template dropdown | Shows templates from sheet | |
| 3.5.2 | Select a template | Text inserted into notes | |
| 3.5.3 | Add custom template (via Admin) | Appears in dropdown on next panel open | |

### 3.6 Save & Validation

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡3.6.1 | Save without selecting interest level | Error: "Please select an outcome" | |
| ⚡3.6.2 | Save with interest level + all optional fields blank | Saves successfully | |
| ⚡3.6.3 | Save with all fields filled | Saves, shows "Visit logged", panel auto-closes after ~1.2 sec | |
| 3.6.4 | Save same location again with changes | Updates existing row (no duplicate) | |
| 3.6.5 | Check Visit History tab in Google Sheet | New row appended (every save) | |

### 3.7 Archive & Delete

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 3.7.1 | Click "Archive" | Location hidden from map + list | |
| 3.7.2 | Archived location still in Google Sheet | Column R = "YES" | |
| 3.7.3 | Click "Delete" | Location permanently removed from sheet | |
| ⚡3.7.4 | Delete is irreversible | No undo available (expected) | |

### 3.8 Phone Number Handling

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 3.8.1 | Enter German mobile: code +49, number 01591234567 | Stored as +491591234567 (no double prefix) | |
| 3.8.2 | Display stored phone | Shows German format (0159...) in UI | |
| 3.8.3 | vCard export | Downloads .vcf with correct phone, name, org, email | |

---

## 4. List View

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡4.1 | Open List tab | All non-archived locations displayed | |
| 4.2 | Sort by "Recent" | Newest visits first | |
| 4.3 | Sort by "Name" | Alphabetical A-Z | |
| 4.4 | Filter "Interested" | Shows Interested + Closed Deal | |
| 4.5 | Filter "Follow Up" | Shows Follow Up + Pending | |
| 4.6 | Filter "Not Interested" | Shows only Not Interested | |
| 4.7 | Click a row | Opens LocationPanel with that location's data | |
| 4.8 | Click "Export CSV" | Downloads .csv with all fields | |
| 4.9 | CSV has quotes/newlines in notes | Properly escaped in export | |
| 4.10 | No locations exist | Shows "No visits found" empty state | |
| 4.11 | Search box | Filters by name, address, or contact | |

---

## 5. Today's Tasks & Follow-Up System

This is the core workflow engine. Test thoroughly.

### 5.1 Task Categories

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡5.1.1 | Location with nextActionDate < today | Appears in "Overdue" section (red) | |
| ⚡5.1.2 | Location with nextActionDate = today | Appears in "Today" section (green) | |
| ⚡5.1.3 | Location with nextActionDate = tomorrow | Appears in "Upcoming" section (blue) | |
| 5.1.4 | Location with nextActionDate = today + 3 days | Still in "Upcoming" (within 3-day window) | |
| 5.1.5 | Location with nextActionDate = today + 4 days | NOT shown (outside window) | |
| 5.1.6 | Overdue sorted oldest first | Most overdue at top | |
| 5.1.7 | Urgency labels | "-5d overdue", "Due today", "In 2d" etc. | |

### 5.2 Task Card Content

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 5.2.1 | Card shows location name | Correct | |
| 5.2.2 | Card shows contact person | Correct | |
| 5.2.3 | Card shows pipeline stage label | Correct human-readable label | |
| 5.2.4 | Card shows follow-up message preview | Body text from template | |

### 5.3 Overdue Badge

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 5.3.1 | 0 overdue tasks | No badge on Tasks nav button | |
| 5.3.2 | 3 overdue tasks | Badge shows "3" on Tasks nav button | |

---

## 6. Pipeline & Stage Progression

### 6.1 Stage Flow

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡6.1.1 | new_visit → Mark Done | Advances to follow_up_1 (same day) | |
| ⚡6.1.2 | follow_up_1 → Mark Done | Advances to follow_up_2 (+2 days) | |
| ⚡6.1.3 | follow_up_2 → Mark Done | Advances to follow_up_3 (+5 days) | |
| ⚡6.1.4 | follow_up_3 → Mark Done | Advances to follow_up_4 (+7 days) | |
| 6.1.5 | follow_up_4 → Mark Done | Advances to closed_lost (terminal) | |
| ⚡6.1.6 | order_confirmed → Mark Done | Advances to delivery_reminder (needs delivery date) | |
| 6.1.7 | delivery_reminder → Mark Done | Advances to post_delivery (+2 days) | |
| 6.1.8 | post_delivery → Mark Done | Advances to active_customer (+42 days) | |
| 6.1.9 | active_customer → Mark Done | Stays active_customer (+42 days, recurring) | |
| 6.1.10 | closed_won → Mark Done | Should NOT advance (terminal) | |
| 6.1.11 | closed_lost → Mark Done | Should NOT advance (terminal) | |

### 6.2 Data Updates on Mark Done

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡6.2.1 | pipelineStage column updated | Correct next stage written to sheet col S | |
| ⚡6.2.2 | followUpCount incremented | +1 from previous value in col T | |
| ⚡6.2.3 | lastFollowUpDate set | Today's date in col U | |
| ⚡6.2.4 | nextActionDate set | Calculated date (snapped to Mon/Thu) in col V | |
| 6.2.5 | notesInternal log entry | "[27.03.2026] follow up 1 sent → next: follow up 2 on 30.03.2026" in col Z | |

---

## 7. Follow-Up Messages & Actions

### 7.1 Message Templates

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡7.1.1 | new_visit message (EN) | Contains contact name, intro text | |
| ⚡7.1.2 | new_visit message (DE) | Contains "Ron von Belarro", German text | |
| 7.1.3 | follow_up_1 message | Contains menu link: belarro.com/for-chefs?c=NAME&n=CONTACT | |
| 7.1.4 | order_confirmed message | Contains delivery date | |
| 7.1.5 | Language auto-detection | location.language='DE' → German template used | |
| 7.1.6 | Language auto-detection | location.language='EN' → English template used | |

### 7.2 Quick Actions

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡7.2.1 | "Copy" button | Copies message text to clipboard | |
| 7.2.2 | After copy | Button shows checkmark for ~2 sec, then reverts | |
| ⚡7.2.3 | "Send WA" button (phone exists) | Opens wa.me link with pre-filled message | |
| 7.2.4 | "Send WA" button (no phone) | Button disabled or hidden | |
| 7.2.5 | "Send Email" button (email exists) | Opens mailto: with subject + body | |
| 7.2.6 | "Send Email" button (no email) | Button disabled or hidden | |
| 7.2.7 | "Calendar" button | Opens Google Calendar event creation URL | |
| 7.2.8 | "Menu" button | Sends belarro.com/for-chefs link via WA or copies | |

### 7.3 Mark Done Flow

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡7.3.1 | Click "Mark Done" | Date picker appears | |
| 7.3.2 | For order_confirmed stage | Date picker says "Pick delivery Tuesday" | |
| 7.3.3 | For other stages | Date picker says "Next follow-up date" | |
| ⚡7.3.4 | Select date and confirm | Pipeline advances, sheet updated, task disappears from today | |
| 7.3.5 | Selected date snaps to Mon/Thu | Verify in sheet col V | |
| 7.3.6 | For order_confirmed: after Mark Done | Opens WhatsApp/Email with delivery date message | |
| ⚡7.3.7 | Calendar event auto-created | Silent creation (no tab opens), event in Google Calendar | |

---

## 8. Admin Panel

### 8.1 Access Control

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡8.1.1 | Admin user sees "Users" and "Sheet" buttons in header | Visible | |
| ⚡8.1.2 | Non-admin user | "Users" and "Sheet" buttons NOT visible | |

### 8.2 Manage Admins

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 8.2.1 | System admin (from .env) shown | Locked, can't remove | |
| 8.2.2 | Sheet admin shown | Can be removed | |
| 8.2.3 | Add admin email | Appended to Admin Emails sheet tab | |
| 8.2.4 | Add email without "@" | Validation error | |

### 8.3 Manage Team Access

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡8.3.1 | Add authorized user email | Appended to Authorized Users tab | |
| ⚡8.3.2 | New user logs in after being added | Access granted | |
| ⚡8.3.3 | Remove authorized user | Deleted from sheet | |
| 8.3.4 | Removed user tries to log in | "Not authorized" error | |

### 8.4 Note Templates

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 8.4.1 | Add note template | Appended to Note Templates tab | |
| 8.4.2 | Empty template text | Validation error | |
| 8.4.3 | Remove template | Deleted from sheet | |
| 8.4.4 | Refresh button | Reloads from sheet | |

---

## 9. Google Sheets Data Integrity

### 9.1 Read/Write Operations

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡9.1.1 | Save new location | New row appended to Data tab (cols A-Z) | |
| ⚡9.1.2 | Save existing location (same name + address) | Existing row UPDATED, no duplicate | |
| ⚡9.1.3 | Every save | New row APPENDED to Visit History tab | |
| 9.1.4 | Pipeline update via Mark Done | Only cols S-Z updated, A-R untouched | |
| 9.1.5 | Existing values preserved | updatePipelineData uses ?? to keep non-provided fields | |

### 9.2 Formula Injection Prevention

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡9.2.1 | Enter "=SUM(A1)" as notes | Stored as "'=SUM(A1)" in sheet (escaped) | |
| 9.2.2 | Enter "+cmd" as notes | Stored as "'+cmd" (escaped) | |
| 9.2.3 | Enter "-100" as notes | Stored as "'-100" (escaped) | |
| 9.2.4 | Enter "+491591234567" as phone | Stored as "+491591234567" (NOT escaped — phone exempt) | |

### 9.3 Sheet Structure

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 9.3.1 | Data tab has cols A-Z with correct headers | Match template exactly | |
| 9.3.2 | Visit History tab same structure | Match Data tab | |
| 9.3.3 | Authorized Users tab col B | Emails listed | |
| 9.3.4 | Note Templates tab col A | Template texts listed | |
| 9.3.5 | Admin Emails tab col A | Admin emails listed | |

---

## 10. Google Calendar Integration

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡10.1 | Mark Done creates calendar event | Event in primary calendar with correct date | |
| 10.2 | Event title | "Follow-up: {contactPerson} — {locationName}" | |
| 10.3 | Event description | Stage label + message body | |
| 10.4 | Event location | Business address | |
| 10.5 | Event reminders | 2 reminders: at time + 30 min before | |
| 10.6 | Monday recurring reminder | Weekly event, RRULE:FREQ=WEEKLY;BYDAY=MO | |
| 10.7 | Thursday recurring reminder | Weekly event, RRULE:FREQ=WEEKLY;BYDAY=TH | |
| 10.8 | Calendar API error | Alert shown, task completion NOT blocked | |

---

## 11. Notifications & Reminders

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 11.1 | Open Settings dropdown | NotificationSettings panel appears | |
| 11.2 | Request notification permission | Browser permission dialog shown | |
| 11.3 | Permission denied | Error message, toggle disabled | |
| 11.4 | Permission granted | Toggle enabled | |
| 11.5 | Enable morning reminder | Toggle saves to localStorage | |
| 11.6 | Set time to 07:30, wait until 07:30 | Notification fires: "X overdue + Y today + Z upcoming" | |
| 11.7 | Check notification fires only once per day | `lastNotifDate` in localStorage matches today | |
| 11.8 | Add Monday 8am reminder | Button disabled after adding, calendar event created | |
| 11.9 | Add Thursday 8am reminder | Button disabled after adding, calendar event created | |

---

## 12. Date Logic & Snapping

### 12.1 Follow-Up Date Snapping

All follow-up dates snap to Monday (1) or Thursday (4).

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡12.1.1 | Today = Monday, select "Follow Up" | Date = next Monday (+7 days) | |
| ⚡12.1.2 | Today = Tuesday, select "+3 days" | Snaps to Thursday | |
| ⚡12.1.3 | Today = Friday, select "+3 days" | Snaps to Monday | |
| 12.1.4 | Today = Sunday, select "+1 day" | Snaps to Monday | |
| 12.1.5 | Today = Wednesday, select "+1 week" | Snaps to next Thursday (8 days) or Monday (5 days) | |

### 12.2 Date Parsing

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 12.2.1 | Parse "25.03.2026" (EU format) | Correct date object | |
| 12.2.2 | Parse "25-03-2026" (dash format) | Correct date object | |
| 12.2.3 | Parse "2026-03-25" (ISO format) | Correct date object | |
| 12.2.4 | Parse null/empty | Returns null (no crash) | |

### 12.3 Edge Cases

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 12.3.1 | Year boundary: Dec 31 → Jan follow-up | Correct year (2027, not 2026) | |
| 12.3.2 | Leap year: Feb 28 + 3 days | March 3 (or Feb 29 if leap year) | |
| 12.3.3 | Timestamp format | "27-03-2026 14:30" pattern | |

---

## 13. Mobile & Responsive

### 13.1 Layout Tests

Test on: iPhone 12 (390px), Pixel 5 (393px), iPad (768px), Desktop (1440px)

| # | Test | Device | Expected Result | Status |
|---|------|--------|-----------------|--------|
| ⚡13.1.1 | All text readable, no overflow | Mobile | No horizontal scroll | |
| ⚡13.1.2 | Buttons minimum 44px height | Mobile | Touch-friendly | |
| 13.1.3 | Dashboard panel | Mobile | Full-screen overlay | |
| 13.1.4 | Dashboard panel | Desktop | Sidebar | |
| 13.1.5 | Location panel width | Mobile | Full width | |
| 13.1.6 | Location panel width | Desktop | Max 440px | |
| ⚡13.1.7 | Bottom navigation | Mobile | Sticky, visible, usable | |
| 13.1.8 | Portrait → Landscape | Mobile | Layout adapts, no breakage | |

### 13.2 Touch & Gestures

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 13.2.1 | Tap POI on map | Opens location panel | |
| 13.2.2 | Android back button | Closes panel / navigates back (useBackButton hook) | |
| 13.2.3 | Soft keyboard opens on input focus | Form scrolls to keep input visible | |

---

## 14. Security & Permissions

### 14.1 Authorization

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡14.1.1 | Admin from .env → access admin panel | Granted | |
| ⚡14.1.2 | Admin from sheet → access admin panel | Granted | |
| ⚡14.1.3 | Authorized user → access app, NOT admin | App: yes, Admin buttons: hidden | |
| ⚡14.1.4 | Unauthorized email → login | Blocked: "not authorized" | |
| 14.1.5 | Admin removed from sheet but in .env | Still admin (env overrides) | |
| 14.1.6 | Remove from Authorized Users, try login | Blocked | |

### 14.2 Token Security

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 14.2.1 | Check localStorage for token | Token NOT in localStorage (memory only) | |
| 14.2.2 | Sign out | Token revoked at Google | |
| 14.2.3 | Close browser, reopen | Must re-authenticate | |

### 14.3 Data Security

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| ⚡14.3.1 | All authorized users see all locations | No row-level access control (expected) | |
| 14.3.2 | Archived locations | Hidden from UI, still in sheet | |

---

## 15. Edge Cases & Stress Tests

### 15.1 Data Edge Cases

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 15.1.1 | Location with no phone | WA button disabled, email still works | |
| 15.1.2 | Location with no email | Email button disabled, WA still works | |
| 15.1.3 | Contact name with special chars (ü, é, ñ) | Displays correctly everywhere | |
| 15.1.4 | Very long location name (100+ chars) | Text wraps, no overflow | |
| 15.1.5 | Duplicate location (same name + address saved twice) | Updates existing row, no duplicate | |
| 15.1.6 | Zero locations in sheet | Map empty, list shows "No visits found" | |
| 15.1.7 | All locations archived | Map empty, list shows "No visits found" | |

### 15.2 Rapid Actions

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 15.2.1 | Click "Mark Done" twice quickly | Only one update sent (debounce) | |
| 15.2.2 | Click "Save" twice quickly | Only one save executed | |
| 15.2.3 | Switch views rapidly (map → list → tasks) | No crash, correct view loads | |

### 15.3 Network Issues

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 15.3.1 | Lose network during save | Error message shown | |
| 15.3.2 | Slow network (3G throttle in DevTools) | App still usable, loading states visible | |
| 15.3.3 | Sheet API returns 401 (expired token) | Triggers re-login | |
| 15.3.4 | Sheet API returns 403 (wrong permissions) | Shows "Access denied" error | |

### 15.4 Performance

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 15.4.1 | Load app with 100 locations | Map + list load < 2 sec | |
| 15.4.2 | Load app with 500 locations | Map + list load < 5 sec | |
| 15.4.3 | Search/filter 500 locations | Results appear < 100ms | |
| 15.4.4 | Save location (network) | Completes < 2 sec | |

---

## 16. End-to-End Flows

### Flow 1: New Visit → Follow-Ups → Closed Deal ⚡

This is the **golden path**. Every step must pass.

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Open Map, click a restaurant POI | Panel opens with pre-filled data | |
| 2 | Add contact name, phone, select "Interested" | Form valid | |
| 3 | Save | "Visit logged", panel closes, marker on map | |
| 4 | Open Tasks view | Location appears (today or upcoming) | |
| 5 | Click "Send WA" | WhatsApp opens with follow_up_1 message | |
| 6 | Click "Mark Done", pick date | Pipeline → follow_up_2, date snapped to Mon/Thu | |
| 7 | Check Google Sheet | pipelineStage=follow_up_2, followUpCount=1, notesInternal logged | |
| 8 | Check Google Calendar | Follow-up event created for next date | |
| 9 | Wait until follow_up_2 date, repeat Mark Done | Pipeline → follow_up_3 | |
| 10 | Continue until order_confirmed | Mark Done asks for delivery Tuesday | |
| 11 | Select delivery date | WhatsApp opens with delivery confirmation | |
| 12 | After delivery, mark post_delivery done | Pipeline → active_customer (+42 days) | |
| 13 | Verify full notesInternal log in sheet | All stages logged with timestamps | |

### Flow 2: Admin User Management ⚡

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Login as admin | See "Users" button | |
| 2 | Open Admin, add new user email | Email appears in list | |
| 3 | New user logs in (different browser/incognito) | Access granted | |
| 4 | Admin removes user | User disappears from list | |
| 5 | Removed user refreshes/re-logs in | "Not authorized" error | |

### Flow 3: Notification Reminder

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Enable notifications in Settings | Permission granted | |
| 2 | Set time to current time + 1 min | Saved | |
| 3 | Wait 1 minute | Browser notification: "X overdue + Y today + Z upcoming" | |
| 4 | Check next day | Notification fires again (once per day) | |

### Flow 4: Multi-Device Sync

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Login on phone, save a new visit | Saved to Google Sheet | |
| 2 | Login on desktop/tablet | Same location visible in map + list | |
| 3 | Update location on desktop | Phone shows update on next refresh | |

---

## 17. Google Apps Script (Sheet Backend)

These run inside the Google Sheet (Extensions → Apps Script).

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 17.1 | Run `setupAllTriggers()` | 3 daily triggers created (8am) | |
| 17.2 | Run `colorFollowUpDates()` | Row backgrounds match pipeline stage colors | |
| 17.3 | Overdue > 7 days | nextActionDate cell (col V) turns red | |
| 17.4 | Overdue 1-7 days | nextActionDate cell turns yellow | |
| 17.5 | Due today | nextActionDate cell turns green | |
| 17.6 | Run `colorAutomationStatus()` | "pending" = yellow, "sent" = green, "failed" = red in col X | |
| 17.7 | Run `sendFollowUpDigest()` on Monday | Email sent with overdue + today + upcoming tasks | |
| 17.8 | Run `sendFollowUpDigest()` on Tuesday | No email sent (only Mon + Thu) | |
| 17.9 | Run `sendFollowUpDigest()` on Thursday | Email sent | |
| 17.10 | Digest email content | Lists location name, contact, days until due | |

---

## 18. Deployment Checklist

### Environment Variables

| # | Variable | Set? | Status |
|---|----------|------|--------|
| 18.1 | VITE_GOOGLE_CLIENT_ID | | |
| 18.2 | VITE_GOOGLE_MAPS_API_KEY | | |
| 18.3 | VITE_GOOGLE_SHEETS_API_KEY | | |
| 18.4 | VITE_GOOGLE_SHEET_ID | | |
| 18.5 | VITE_ADMIN_EMAILS | | |

### Google Cloud APIs Enabled

| # | API | Enabled? | Status |
|---|-----|----------|--------|
| 18.6 | Maps JavaScript API | | |
| 18.7 | Places API (New) | | |
| 18.8 | Google Sheets API v4 | | |
| 18.9 | Google Calendar API | | |
| 18.10 | Google Identity Services | | |

### Sheet Setup

| # | Check | Done? | Status |
|---|-------|-------|--------|
| 18.11 | All 6 tabs created (Data, Visit History, Config, Authorized Users, Note Templates, Admin Emails) | | |
| 18.12 | Column headers match template (A-Z) | | |
| 18.13 | Sheet shared "Anyone with link" → Editor | | |
| 18.14 | Google Apps Script installed | | |
| 18.15 | Triggers set (daily 8am) | | |

### Build & Deploy

| # | Check | Done? | Status |
|---|-------|-------|--------|
| 18.16 | `npm run build` succeeds with no errors | | |
| 18.17 | No console errors in production build | | |
| 18.18 | HTTPS enabled (required for OAuth) | | |
| 18.19 | OAuth redirect URIs include production domain | | |
| 18.20 | First admin user can log in | | |

---

## Known Limitations (Not Bugs)

1. **Page refresh requires re-login** — token stored in memory only
2. **No pagination** — all locations loaded at once (may slow down at 10k+ rows)
3. **No offline editing** — Sheets API requires network
4. **No undo for delete** — permanent removal
5. **No dark mode** — single theme only
6. **No audit log** — use Google Sheets revision history instead
7. **Formula injection** — only leading chars blocked (=, +, -, @)

---

## Testing Tools

| Tool | Purpose |
|------|---------|
| Chrome DevTools | Inspect, console errors, network throttle |
| Chrome Device Mode | Simulate iPhone 12, Pixel 5, iPad |
| Lighthouse | Performance score |
| Postman | Test Sheets/Calendar API directly |
| Multiple browsers | Cross-browser (Chrome, Safari, Firefox) |
| Incognito window | Test unauthorized user login |

---

**Total test cases: 180+**
**Critical (⚡): 45**
**Estimated manual execution time: 3-4 hours**

Start with Phase 1 (Critical ⚡ tests), then work through the rest. Any ⚡ failure = must fix before release.
