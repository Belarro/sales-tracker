# CollaborativeIntelligence Agents - Sales Tracker Installation

## Installation Complete! ✅

Your **Sales Tracker** (Food Business CRM) now has full access to CollaborativeIntelligence agents with complete memory and persistent context.

## What's Installed

### Directory Structure
```
saletracker/.claude/
├── AGENTS/              # 50+ specialized agents with full memory (19MB)
│   ├── Developer/       # Elite engineering specialist
│   ├── Architect/       # System design expert
│   ├── UI/              # User interface specialist
│   ├── Database/        # Database optimization (Google Sheets!)
│   ├── WebArchitect/    # Web architecture specialist
│   ├── Debugger/        # Issue investigation
│   ├── Tester/          # Quality assurance
│   ├── Optimizer/       # Performance optimization
│   └── ...              # 42+ more agents
├── commands/            # Slash commands
│   ├── team-sdk.md      # Team coordination command
│   └── team-sdk-cli.md  # CLI automation
├── settings.json        # Project configuration
└── README.md           # This file
```

### Agent Statistics
- **Total Agents**: 50+ specialized agents
- **With CONTEXT_INJECTION.md**: 49 agents (optimized context)
- **With MEMORY.md**: 104 memory files (persistent knowledge)
- **Total Size**: 19MB of agent intelligence
- **Developer Memory**: 316KB of engineering knowledge

## Project-Specific Agents for Sales Tracker

These agents are especially useful for your Food Business CRM:

### Frontend Development
- **UI**: React 18 + Vite UI components, responsive design
- **WebArchitect**: Web architecture, PWA optimization
- **Developer**: React implementation, state management
- **Refactorer**: Code quality, component refactoring

### API & Backend Integration
- **Database**: Google Sheets API optimization, data modeling
- **Networker**: API integration, authentication flows
- **Backender**: Backend logic, data synchronization

### Maps & Geolocation
- **Developer**: Google Maps API integration
- **UI**: Interactive map components, marker rendering
- **Optimizer**: Map performance, clustering, caching

### Authentication & Security
- **Cryptographer**: OAuth 2.0, Google Identity Services
- **Auditor**: Security review, authentication flows
- **Enforcer**: Authorization, admin panel security

### Data & Analytics
- **Analyst**: Sales analytics, visit tracking insights
- **Database**: Google Sheets schema optimization
- **Researcher**: Best practices for CRM systems

### Quality & Testing
- **Tester**: Component testing, integration tests
- **Debugger**: Bug investigation, issue resolution
- **Verifier**: Validation, data integrity

## How to Use

### Method 1: Using Slash Commands (Recommended)

In Claude Code, use `/team-sdk` for any task:

```
/team-sdk add a sales analytics dashboard showing visit statistics
/team-sdk optimize the Google Maps marker clustering for performance
/team-sdk implement offline support for recording visits without internet
/team-sdk add export functionality to download visit data as CSV
/team-sdk improve the mobile UI for easier field use
```

### Method 2: Specific Use Cases

**Adding Features:**
```
/team-sdk add a feature to schedule follow-up reminders with push notifications
```
Engages: Architect → Developer → UI → Tester

**Fixing Bugs:**
```
/team-sdk the map markers aren't updating after a visit is logged, fix this
```
Engages: Debugger → Developer → Tester

**Optimization:**
```
/team-sdk optimize the Google Sheets API calls to reduce latency
```
Engages: Database → Optimizer → Developer

**Design Improvements:**
```
/team-sdk redesign the visit logging form to be more intuitive
```
Engages: UI → UX → Developer

## Example Workflows

### Example 1: Add Analytics Dashboard
```
/team-sdk create a sales analytics dashboard with:
- Daily/weekly/monthly visit counts
- Interest level distribution charts
- Follow-up calendar
- Top performing sales reps
```

**What happens:**
1. **Analyst**: Analyzes data structure and metrics needed
2. **Database**: Optimizes Google Sheets queries for aggregations
3. **UI**: Designs dashboard components and charts
4. **Developer**: Implements React components
5. **Tester**: Validates functionality

### Example 2: Improve Mobile Experience
```
/team-sdk optimize the app for mobile sales reps in the field:
- Larger touch targets
- Offline visit recording
- Quick action buttons
- GPS accuracy improvements
```

**What happens:**
1. **UX**: Analyzes mobile user experience
2. **UI**: Designs mobile-first interface
3. **Developer**: Implements PWA features
4. **WebArchitect**: Optimizes offline caching
5. **Tester**: Tests on mobile devices

### Example 3: Google Sheets Optimization
```
/team-sdk the app is slow when loading visit history, optimize the Google Sheets API usage
```

**What happens:**
1. **Debugger**: Profiles API calls and identifies bottlenecks
2. **Database**: Designs caching strategy and batch queries
3. **Developer**: Implements optimizations
4. **Optimizer**: Validates performance improvements

## Agent Memory Highlights

Your agents remember lessons from previous projects:

### Developer Agent
- Multi-tier memory architecture patterns
- React best practices and performance optimization
- API integration techniques
- Zero-defect implementation strategies

### Database Agent
- Google Sheets API optimization patterns
- Data modeling for CRM systems
- Caching strategies for external APIs
- Batch operation techniques

### UI Agent
- React component design patterns
- Responsive mobile-first design
- Google Maps integration
- Progressive Web App (PWA) best practices

## Configuration

### Settings ([settings.json](settings.json))
```json
{
  "workingDirectory": "c:/Users/The boss/Downloads/Claude Code/saletracker",
  "agentsDirectory": "c:/Users/The boss/Downloads/Claude Code/saletracker/.claude/AGENTS",
  "team-sdk": {
    "enabled": true,
    "ciRoot": "c:/Users/The boss/Downloads/Claude Code/collaborativeintelligence",
    "cliPath": ".../integrations/team-sdk/dist/cli.js"
  }
}
```

## Current Sales Tracker Features

Your agents are aware of:
- ✅ Google Authentication (OAuth 2.0)
- ✅ Google Maps + Places API integration
- ✅ Google Sheets as database
- ✅ React 18 + Vite frontend
- ✅ Visit tracking and history
- ✅ Contact management
- ✅ Interest level tracking
- ✅ Automatic follow-up scheduling
- ✅ Admin panel
- ✅ Mobile-responsive design

## Quick Commands

Try these in Claude Code:

```
# Add features
/team-sdk add sales territory mapping with color-coded regions

# Fix issues
/team-sdk fix the OAuth popup being blocked on production

# Optimize
/team-sdk reduce the Google Sheets API quota usage

# Improve UX
/team-sdk make the visit logging flow faster for field sales reps

# Add analytics
/team-sdk create a sales leaderboard showing top performers

# Mobile improvements
/team-sdk add quick-add buttons for common visit types
```

## Integration with Main CI System

- **Main CI**: `c:/Users/The boss/Downloads/Claude Code/collaborativeintelligence`
- **Team SDK**: Shared CLI across all projects
- **Local Agents**: Full copy with memory in `.claude/AGENTS/`
- **Agent Updates**: Sync from main CI when needed

## Troubleshooting

### Slash commands not working?
1. Restart Claude Code to load new commands
2. Verify `.claude/commands/team-sdk.md` exists
3. Check settings.json configuration

### Agents can't find memory?
1. Verify path: `.claude/AGENTS/` (uppercase!)
2. Check agent has CONTEXT_INJECTION.md or MEMORY.md
3. Ensure settings.json paths are correct

### Team SDK CLI not found?
1. Verify Team SDK is built in main CI
2. Check CLI path in settings.json
3. Run `npm run build` in CollaborativeIntelligence root

## Next Steps

1. **Try it**: `/team-sdk help me improve the sales tracker`
2. **Explore**: Browse `.claude/AGENTS/` to see all specialists
3. **Customize**: Add project context to agent memory files
4. **Build**: Use agents to add features, fix bugs, optimize

## Resources

- **Main README**: [../README.md](../README.md) - Sales Tracker documentation
- **CI Documentation**: CollaborativeIntelligence/README.md
- **Team SDK**: integrations/team-sdk/README.md
- **Quick Start**: [../QUICK-START.md](../QUICK-START.md)
- **Setup Guide**: [../SETUP-GUIDE.md](../SETUP-GUIDE.md)

---

**Ready to use 50+ specialized agents with full memory on your Sales Tracker!** 🚀

Start with: `/team-sdk add a feature to export visit data to Excel`
