# How The Sales Tracker Works

A visual guide to understanding the app flow.

## Overview Diagram

```
┌─────────────┐
│   Browser   │  ← You open this
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Sales       │
│ Tracker App │  ← React app runs here
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌────────────┐  ┌──────────────┐
│  Google    │  │   Google     │
│  Cloud     │  │   Sheets     │
│  APIs      │  │  Database    │
└────────────┘  └──────────────┘
   │                    │
   ├─ Maps API         └─ Stores all data
   ├─ Places API
   └─ OAuth
```

---

## User Flow

### 1. First Time Admin Setup

```
Step 1: Open app
   │
   ▼
Step 2: See "Sign in with Google" button
   │
   ▼
Step 3: Click button → Google login popup
   │
   ▼
Step 4: Sign in with rbyinc@gmail.com
   │
   ▼
Step 5: App checks: "Is this the admin email?"
   │
   ├─ YES → Show Admin Setup page
   │
   ▼
Step 6: Admin Setup Page
   │
   ├─ Add user emails
   ├─ Remove user emails
   └─ Continue to app
   │
   ▼
Step 7: See the map with food places
```

### 2. Salesperson Login

```
Step 1: Open app
   │
   ▼
Step 2: Click "Sign in with Google"
   │
   ▼
Step 3: Sign in with their email
   │
   ▼
Step 4: App checks Google Sheet:
   │      "Is this email in Authorized Users tab?"
   │
   ├─ YES → Show map
   │
   └─ NO → Show "Access Denied"
```

### 3. Adding a Visit

```
Step 1: See map with markers
   │
   ├─ Red markers = Not visited
   └─ Green markers = Already visited
   │
   ▼
Step 2: Click any red marker
   │
   ▼
Step 3: Info popup appears
   │
   ├─ Business name
   ├─ Address
   ├─ Phone (if available)
   └─ Website link
   │
   ▼
Step 4: Click "Add Notes"
   │
   ▼
Step 5: Panel slides up with form
   │
   ▼
Step 6: Fill out form
   │
   ├─ Contact person
   ├─ Contact title
   ├─ Phone & email
   ├─ Business type (dropdown)
   ├─ Interest level (dropdown)
   ├─ Visit notes
   └─ Follow-up date (auto-calculated)
   │
   ▼
Step 7: Click "Save Visit"
   │
   ▼
Step 8: App saves to Google Sheets:
   │
   ├─ New row in "Data" tab
   └─ New row in "Visit History" tab
   │
   ▼
Step 9: Success message + marker turns green
```

---

## Data Flow

### When You Save a Visit

```
┌──────────────────┐
│  Fill out form   │
└────────┬─────────┘
         │
         ▼
┌────────────────────────┐
│  Click "Save Visit"    │
└────────┬───────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  App processes:                 │
│  - Current timestamp            │
│  - User email (who saved it)    │
│  - All form data                │
│  - Calculated follow-up date    │
└────────┬────────────────────────┘
         │
         ├──────────────────┬────────────────────┐
         │                  │                    │
         ▼                  ▼                    ▼
   ┌──────────┐      ┌─────────────┐     ┌──────────┐
   │   Data   │      │Visit History│     │   Map    │
   │   Tab    │      │     Tab     │     │ Updates  │
   └──────────┘      └─────────────┘     └──────────┘
         │                  │                    │
         │                  │                    │
    Updates row       Adds new row        Marker turns
    for location      (keeps history)        green
```

### What Gets Stored

```
Google Sheet: "Data" Tab
┌──────────────┬───────────┬──────────────┬─────────────┬─────┐
│  Timestamp   │ Sales Rep │Location Name │   Address   │ ... │
├──────────────┼───────────┼──────────────┼─────────────┼─────┤
│ 2024-01-15   │john@email │ Pizza Palace │ 123 Main St │ ... │
│ 10:30 AM     │           │              │             │     │
└──────────────┴───────────┴──────────────┴─────────────┴─────┘

If John visits Pizza Palace again tomorrow:
→ This row UPDATES with new information

Google Sheet: "Visit History" Tab
┌──────────────┬───────────┬──────────────┬─────────────┬─────┐
│  Timestamp   │ Sales Rep │Location Name │   Address   │ ... │
├──────────────┼───────────┼──────────────┼─────────────┼─────┤
│ 2024-01-15   │john@email │ Pizza Palace │ 123 Main St │ ... │
│ 10:30 AM     │           │              │             │     │
├──────────────┼───────────┼──────────────┼─────────────┼─────┤
│ 2024-01-16   │john@email │ Pizza Palace │ 123 Main St │ ... │
│ 2:00 PM      │           │              │             │     │
└──────────────┴───────────┴──────────────┴─────────────┴─────┘

If John visits Pizza Palace again tomorrow:
→ A NEW row is ADDED (keeps full history)
```

---

## How Authentication Works

```
User clicks "Sign in with Google"
   │
   ▼
Google popup appears
   │
   ▼
User enters Google credentials
   │
   ▼
Google verifies user
   │
   ├─ If successful:
   │     │
   │     ▼
   │  Google sends back:
   │  - User's email
   │  - User's name
   │  - User's profile picture
   │
   ▼
App receives user info
   │
   ▼
App checks:
   │
   ├─ Is email = rbyinc@gmail.com?
   │  │
   │  ├─ YES → Admin access
   │  │        Show Admin Setup
   │  │
   │  └─ NO → Continue checking...
   │
   ▼
App reads "Authorized Users" tab from Google Sheet
   │
   ▼
Is user's email in the list?
   │
   ├─ YES → Grant access
   │        Show map
   │
   └─ NO → Deny access
           Show "Access Denied"
```

---

## How Map Works

```
App loads map
   │
   ▼
Request user's GPS location
   │
   ├─ User allows → Get coordinates
   │                (lat, lng)
   │
   └─ User denies → Use default location
                    (New York City)
   │
   ▼
Center map on location
   │
   ▼
Search for food places:
   │
   └─ Query: "restaurants, cafes, bakeries, food
              within 5km radius"
   │
   ▼
Google Places API returns results
   │
   └─ Gets: Name, Address, Phone, Website, Coordinates
   │
   ▼
For each place:
   │
   ├─ Check: Has this been visited?
   │         (Check Google Sheet "Data" tab)
   │
   ├─ If YES → Show GREEN marker
   │
   └─ If NO → Show RED marker
   │
   ▼
Display all markers on map
```

---

## How Follow-up Date Works

```
User saves a visit on: Monday, January 15, 2024
   │
   ▼
Add 4 days
   │
   └─ Result: Friday, January 19, 2024
   │
   ▼
Check: Is it a weekend?
   │
   ├─ If Friday (not weekend) → Use January 19
   │
   ├─ If Saturday → Move to Monday (+2 days)
   │
   └─ If Sunday → Move to Monday (+1 day)
   │
   ▼
Save follow-up date to Google Sheet

Example scenarios:

Visit on Monday → Follow-up on Friday (4 days)
Visit on Tuesday → Follow-up on Monday (4 days, but lands on Sat, moves to Mon)
Visit on Wednesday → Follow-up on Tuesday (4 days, but lands on Sun, moves to Mon)
Visit on Thursday → Follow-up on Monday (4 days)
Visit on Friday → Follow-up on Thursday (4 days)
```

---

## How Admin User Management Works

```
Admin clicks "Manage Users"
   │
   ▼
Shows Admin Setup page
   │
   ├─────────────┐
   │             │
   ▼             ▼
Add User      Remove User
   │             │
   │             │
Type email    Click "Remove" button
   │             │
   │             │
Click "Add"   Confirm removal
   │             │
   │             │
   ▼             ▼
App adds to   App removes from
Google Sheet  Google Sheet
   │             │
   │             │
   └──────┬──────┘
          │
          ▼
    Update list
       │
       ▼
   User sees updated
   authorized list
```

---

## Technology Stack Explained

```
┌─────────────────────────────────────────────────┐
│              USER'S BROWSER                     │
│  ┌───────────────────────────────────────────┐ │
│  │           React App (UI)                  │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │  Components:                        │ │ │
│  │  │  - Login                            │ │ │
│  │  │  - Admin Setup                      │ │ │
│  │  │  - Map View                         │ │ │
│  │  │  - Location Panel                   │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  │                                           │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │  Utilities:                         │ │ │
│  │  │  - Google Auth                      │ │ │
│  │  │  - Google Sheets API                │ │ │
│  │  │  - Date Calculator                  │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  │                                           │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │  Styles (CSS)                       │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌─────────────┐ ┌─────────┐ ┌─────────────┐
│   Google    │ │ Google  │ │   Google    │
│   Maps      │ │  Auth   │ │   Sheets    │
│    API      │ │  (OAuth)│ │     API     │
└─────────────┘ └─────────┘ └─────────────┘
     Shows          Verifies     Stores
     map &          users        data
     places
```

---

## Deployment Options

### Option 1: Local (Your Computer)

```
You: Open Terminal
   │
   ▼
Run: npm run dev
   │
   ▼
App runs at: http://localhost:5173
   │
   ▼
Only accessible on your computer
(Good for testing)
```

### Option 2: Online Deployment

```
You: Run npm run build
   │
   ▼
Creates "dist" folder
   │
   ▼
Upload to Netlify/Vercel/GitHub Pages
   │
   ▼
Get URL: https://your-app.netlify.app
   │
   ▼
Accessible anywhere in the world
(Good for your team)
```

---

## Security Flow

```
┌──────────────────┐
│  User tries to   │
│   access app     │
└────────┬─────────┘
         │
         ▼
    ┌────────┐
    │ Signed │
    │  in?   │
    └───┬────┘
        │
    NO  │  YES
    ────┤────►
        │        ▼
        │   ┌─────────┐
        │   │ Check   │
        │   │ email   │
        │   └────┬────┘
        │        │
        │        ├─ Admin email?
        │        │     │
        │        │     ├─ YES → Full access
        │        │     │
        │        │     └─ NO → Check authorization
        │        │              │
        │        │              ├─ In list? → Grant access
        │        │              │
        │        │              └─ Not in list? → Deny
        │        │
        ▼        ▼
   Show login  Access granted/denied
```

---

## Summary

The app is essentially:

1. **A React website** that runs in the browser
2. **Connected to Google Maps** to show food places
3. **Connected to Google Sheets** to store visit data
4. **Secured by Google OAuth** so only authorized people can use it
5. **Mobile-friendly** so it works on phones and computers

Simple, effective, and ready to use! 🚀