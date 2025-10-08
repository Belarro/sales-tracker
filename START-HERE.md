# 🎯 START HERE - Sales Tracker

Welcome! You've received a complete, ready-to-use sales tracking application.

## What Is This?

A web app for food industry sales reps to track restaurant/cafe visits using:
- 📍 Google Maps (see all food businesses)
- 📊 Google Sheets (stores all data)
- 🔐 Google Sign-In (secure access)
- 📱 Works on phones and computers

## For Non-Technical Users

### 👉 Read This First: [QUICK-START.md](QUICK-START.md)

It will walk you through:
1. Getting Google API keys (15 min)
2. Creating Google Sheet (5 min)
3. Adding keys to app (3 min)
4. Running the app (7 min)

**Total time: ~30 minutes**

### Then Use These:

- **[SETUP-CHECKLIST.md](SETUP-CHECKLIST.md)** - Check off steps as you complete them
- **[GOOGLE-SHEET-TEMPLATE.txt](GOOGLE-SHEET-TEMPLATE.txt)** - Copy/paste sheet headers
- **[SETUP-GUIDE.md](SETUP-GUIDE.md)** - Detailed guide if you get stuck

## For Technical Users

```bash
# 1. Install dependencies
npm install

# 2. Add API keys to src/config.js
# - Google Maps API Key
# - Google Client ID (OAuth)
# - Google Sheets API Key
# - Google Sheet ID

# 3. Run dev server
npm run dev

# 4. Open http://localhost:5173
```

See **[README.md](README.md)** for technical details.

## Documentation Overview

### Getting Started (Pick based on your experience)
| File | Best For | Time Needed |
|------|----------|-------------|
| **[QUICK-START.md](QUICK-START.md)** | Non-technical users | 5 min read |
| **[SETUP-GUIDE.md](SETUP-GUIDE.md)** | Detailed step-by-step | 10 min read |
| **[README.md](README.md)** | Developers | 5 min read |

### During Setup
| File | Purpose |
|------|---------|
| **[SETUP-CHECKLIST.md](SETUP-CHECKLIST.md)** | Track your progress |
| **[GOOGLE-SHEET-TEMPLATE.txt](GOOGLE-SHEET-TEMPLATE.txt)** | Copy sheet headers |

### Understanding The App
| File | What You'll Learn |
|------|-------------------|
| **[PROJECT-SUMMARY.md](PROJECT-SUMMARY.md)** | Complete overview |
| **[HOW-IT-WORKS.md](HOW-IT-WORKS.md)** | Visual flow diagrams |

### Reference
| File | Content |
|------|---------|
| **[README.md](README.md)** | Technical documentation |
| **src/config.js** | Configuration options |

## What You'll Need

✅ Google account (you have: rbyinc@gmail.com)
✅ 30 minutes of time
✅ Computer with internet
✅ Web browser

That's it! Everything else is free.

## The 4 Key Steps

```
1. Get Google API Keys
   ↓
2. Create Google Sheet
   ↓
3. Add Keys to config.js
   ↓
4. Run the App
```

## Admin Email

Already configured to: **rbyinc@gmail.com**

This email has full admin access to:
- Add/remove users
- Manage authorization
- View all data

## File Structure (What Each File Does)

```
📄 START-HERE.md              ← You are here!
📄 QUICK-START.md             ← Go here next!

📁 Documentation/
   📄 SETUP-GUIDE.md          ← Detailed instructions
   📄 SETUP-CHECKLIST.md      ← Track progress
   📄 GOOGLE-SHEET-TEMPLATE.txt ← Copy/paste
   📄 PROJECT-SUMMARY.md      ← Overview
   📄 HOW-IT-WORKS.md         ← Visual guide
   📄 README.md               ← Technical docs

📁 src/
   📝 config.js               ← ADD YOUR API KEYS HERE
   📁 components/             ← App UI code
   📁 utils/                  ← Helper functions
   📁 styles/                 ← CSS styling

📄 package.json               ← Dependencies
📄 vite.config.js             ← Build config
📄 index.html                 ← HTML entry
```

## Quick Access Links

### To Setup:
- **Non-technical**: [QUICK-START.md](QUICK-START.md)
- **Technical**: [README.md](README.md)
- **Checklist**: [SETUP-CHECKLIST.md](SETUP-CHECKLIST.md)

### To Learn:
- **Overview**: [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md)
- **How it works**: [HOW-IT-WORKS.md](HOW-IT-WORKS.md)

### To Reference:
- **Sheet template**: [GOOGLE-SHEET-TEMPLATE.txt](GOOGLE-SHEET-TEMPLATE.txt)
- **Troubleshooting**: [SETUP-GUIDE.md#troubleshooting](SETUP-GUIDE.md#troubleshooting)

## Your Next Step

### If you're non-technical:
👉 **Open [QUICK-START.md](QUICK-START.md) now!**

### If you're a developer:
👉 **Open [README.md](README.md) for quick setup**

## Questions?

All answers are in the documentation:

- **"How do I set this up?"** → [QUICK-START.md](QUICK-START.md)
- **"What does it do?"** → [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md)
- **"How does it work?"** → [HOW-IT-WORKS.md](HOW-IT-WORKS.md)
- **"I'm stuck!"** → [SETUP-GUIDE.md Troubleshooting](SETUP-GUIDE.md#troubleshooting)
- **"What files do I edit?"** → Just `src/config.js`

## Common Issues

Before setup:
- ❓ "I don't know coding" → That's fine! Follow [QUICK-START.md](QUICK-START.md)
- ❓ "Is it really free?" → Yes! All services used are free
- ❓ "How long does it take?" → 30 minutes for complete setup

During setup:
- ❌ "Failed to initialize" → Check API keys in config.js
- ❌ "Access denied" → Add user email in Admin Setup
- ❌ "Map not loading" → Enable Maps API in Google Cloud

See [SETUP-GUIDE.md](SETUP-GUIDE.md) for detailed solutions.

## Features

✅ Google Maps with GPS location
✅ Find all food businesses nearby
✅ Add visit notes and contacts
✅ Track interest levels
✅ Automatic follow-up dates (4 business days)
✅ Complete visit history
✅ Color-coded markers (red=unvisited, green=visited)
✅ Admin panel to manage users
✅ Google Sheets database (easy to view/export)
✅ Mobile-friendly responsive design
✅ Secure Google authentication

## Technology

Built with:
- React 18 (UI framework)
- Google Maps API (mapping)
- Google Sheets API (database)
- Google OAuth (authentication)
- Vite (build tool)

No complicated setup, no expensive hosting, no hidden costs.

## Support

### Self-Help Resources:
1. Check the documentation (it's very detailed!)
2. Look at browser console for errors (Right-click → Inspect → Console)
3. Verify Google Cloud setup
4. Check API keys in config.js

### Troubleshooting Guide:
[SETUP-GUIDE.md#troubleshooting](SETUP-GUIDE.md#troubleshooting)

## Ready?

Choose your path:

### 🔰 New to coding?
**Start here**: [QUICK-START.md](QUICK-START.md)

### 💻 Developer?
**Start here**: [README.md](README.md)

### 🤔 Want to understand it first?
**Start here**: [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md)

---

**You're just 30 minutes away from a working sales tracker!** 🚀

Let's get started! 👉 [QUICK-START.md](QUICK-START.md)