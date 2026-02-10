# Sales Tracker - Project Configuration

## 🎯 How to Use CollaborativeIntelligence Agents

### ✅ Agents are Already Installed!
Your project has **49+ specialized agents** installed in `.claude/agents/`

### Three Ways to Use Agents:

#### **Method 1: `/team-sdk` Command (EASIEST!)** ⭐
Type in Claude Code chat:
```
/team-sdk add a sales analytics dashboard
/team-sdk optimize Google Sheets API performance
/team-sdk fix OAuth authentication issues
```
The system automatically selects and coordinates the right agents!

#### **Method 2: Direct Agent Loading**
Ask Claude to read an agent's context:
```
Read .claude/agents/Developer/CONTEXT_INJECTION.md
```
Then work with that agent's expertise.

#### **Method 3: Team SDK CLI**
Use the command line:
```bash
node "c:/Users/The boss/Downloads/Claude Code/collaborativeintelligence/integrations/team-sdk/dist/cli.js" \
  "improve mobile UI" \
  --agents UI,UX,Developer
```

### ⚠️ Important Note
The `/agents` command will show "No agents found" - this is EXPECTED! CollaborativeIntelligence uses a different system than Claude Code's native agents. Use `/team-sdk` instead.

---

## Project Overview

**Sales Tracker** - A web-based CRM application for food industry sales representatives. Track visits to restaurants, cafes, and food establishments with Google Maps integration and Google Sheets as a database.

### Tech Stack
- **Frontend**: React 18 + Vite
- **Maps**: Google Maps JavaScript API + Places API
- **Authentication**: Google Identity Services (OAuth 2.0)
- **Database**: Google Sheets API v4
- **Styling**: Pure CSS (no frameworks)

### Key Features
- Google Authentication with authorized user management
- Interactive map with GPS integration
- Visit tracking with contact management
- Automatic follow-up date calculations
- Visit history tracking
- Color-coded location markers
- Admin panel for user management
- Mobile-friendly responsive design

## Project-Specific Context

### Core Components
- `src/components/Login.jsx` - Google sign-in component
- `src/components/AdminSetup.jsx` - User management interface
- `src/components/MapView.jsx` - Google Maps with food places
- `src/components/LocationPanel.jsx` - Visit notes form and history
- `src/utils/googleAuth.js` - Authentication utilities
- `src/utils/googleSheets.js` - Sheets API integration
- `src/utils/dateUtils.js` - Follow-up date calculations

### Active Development Areas
- Google Sheets API integration
- Google Maps and Places API integration
- User authentication and authorization
- Visit tracking and history management
- Mobile responsiveness
- Business data management

### Configuration
- Main config: `src/config.js` (API keys, admin settings, options)
- Vite config: `vite.config.js`
- Dependencies: `package.json`

## Available Agents (49 total)

### **Core Development**
Developer, Architect, Tester, Debugger, Refactorer, Engineer

### **Web & UI**
WebArchitect, Backender, Applicationer, UI, UX, Renderer

### **Analysis**
Analyst, Athena, Auditor, Researcher, Topologist, Cartographer, Verifier

### **Data & Infrastructure**
Database, Infrastructurer, Networker, Cryptographer, Basher, Automator

### **Optimization**
Optimizer, Benchmarker, Cacher

### **Documentation**
Documenter, Writer, Scholar, Memory, SageKeeper

### **Management**
Manager, Planner, General, Enforcer, ClaudeCodeIntegrator, NotionManager

### **Specialized**
Rustist, Binarian, Linguist, Consolidator, DirectoryOrganizer, Fixer, Deliverer, Trader, Visionary, Reactor

## Quick Commands

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Agent Testing
```bash
./test-agents.sh     # Verify agents are working
```

## 📚 More Help

- Read `.claude/HOW_TO_USE_AGENTS.md` for detailed examples
- Read `.claude/AGENTS_INSTALLED.md` for installation verification
- Read `.claude/QUICK_START.md` for quick start guide
