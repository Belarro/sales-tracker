# How to Use CollaborativeIntelligence Agents - Step by Step

## Step 1: Verify Agents Are Installed

### Option A: Using Terminal (Recommended)
1. Open VSCode terminal (`` Ctrl+` `` or View → Terminal)
2. Type this command and press Enter:
   ```bash
   ls .claude/AGENTS
   ```
3. You should see a list of agents like:
   ```
   Analyst
   Architect
   Athena
   Developer
   Database
   UI
   UX
   ...
   ```

### Option B: Using File Explorer
1. In VSCode left sidebar, expand the `SALETRACKER` folder
2. Expand `.claude` folder
3. Click on `AGENTS` folder
4. If it appears empty, try:
   - Click the refresh icon in Explorer
   - Collapse and re-expand the folder
   - Press F5 to refresh
5. You should see folders like: Analyst, Architect, Developer, etc.

---

## Step 2: Understand Where Agents Are Located

### Physical Location
```
C:\Users\The boss\Downloads\Claude Code\saletracker\.claude\AGENTS\
```

### In VSCode Explorer
```
SALETRACKER
└── .claude
    ├── AGENTS          ← 49 agents are here!
    │   ├── Analyst/
    │   ├── Architect/
    │   ├── Athena/
    │   ├── Developer/
    │   ├── Database/
    │   ├── UI/
    │   └── ... (43 more)
    ├── commands/
    ├── settings.json
    └── README.md
```

### Each Agent Has These Files
```
AGENTS/Developer/
├── CONTEXT_INJECTION.md    ← Optimized agent identity (9.7KB)
├── MEMORY.md              ← Full memory (316KB of knowledge!)
├── GLOBAL-CONTEXT.md      ← Shared patterns
├── Sessions/              ← Past work sessions
└── ... other docs
```

---

## Step 3: Three Ways to Use Agents

## METHOD 1: Using /team-sdk Slash Command (EASIEST!) ⭐

### What is it?
A slash command that automatically selects and coordinates the right agents for your task.

### How to Use:
1. **In Claude Code chat**, type `/team-sdk` followed by your task
2. Press Enter
3. Claude will automatically:
   - Select the right agents
   - Load their memory
   - Coordinate their work
   - Give you the results

### Examples:

**Example 1: Add a feature**
```
/team-sdk add a sales analytics dashboard showing:
- Monthly visit counts
- Interest level charts
- Top performing sales reps
```

What happens:
- Analyst: Analyzes data needs
- Database: Optimizes Google Sheets queries
- UI: Designs the dashboard
- Developer: Implements the code
- Result: You get a complete dashboard!

**Example 2: Fix a bug**
```
/team-sdk the OAuth popup is being blocked, fix it
```

What happens:
- Debugger: Investigates the issue
- Developer: Implements the fix
- Tester: Verifies it works
- Result: OAuth fixed!

**Example 3: Optimize performance**
```
/team-sdk the app is slow loading visit history, optimize it
```

What happens:
- Optimizer: Profiles performance
- Database: Optimizes API calls
- Developer: Implements caching
- Result: Faster app!

### Try It Now!
In Claude Code chat, type:
```
/team-sdk help me add a feature to export sales data as CSV
```

---

## METHOD 2: Reading Agent Files Directly (MANUAL)

### When to Use:
- You want to see an agent's full memory
- You want to understand what an agent knows
- You're curious about agent capabilities

### Step-by-Step:

**Step 1: Open the agent's file**
1. In VSCode, press `Ctrl+P` (Quick Open)
2. Type: `.claude/AGENTS/Developer/CONTEXT_INJECTION.md`
3. Press Enter

**Step 2: Read the agent's identity**
You'll see:
```markdown
# Developer's Memory Architecture

## Core Identity
Elite Engineering Specialist (50x Senior Engineer level)...

## Critical Lessons
- Multi-tier memory architecture
- Zero-defect implementation
- React best practices
...
```

**Step 3: Use the knowledge**
Now you can ask me to work like that agent:
```
Using the Developer agent's knowledge and identity from
.claude/AGENTS/Developer/CONTEXT_INJECTION.md, please
help me implement user authentication in the sales tracker.
```

### Try It Now:
1. Press `Ctrl+P`
2. Type: `.claude/AGENTS/UI/CONTEXT_INJECTION.md`
3. Read what the UI agent knows
4. Ask me to use that knowledge

---

## METHOD 3: Using Task Tool with Agents (ADVANCED)

### When to Use:
- You want specific agents to work in parallel
- You need precise control over which agents to use
- You're doing complex multi-step tasks

### How It Works:
You tell me to use the Task tool and load specific agents.

### Example:
```
Please use the Task tool to:
1. Load the Architect agent from .claude/AGENTS/Architect/CONTEXT_INJECTION.md
2. Have them design a sales reporting system
3. Then load Developer to implement it
```

I'll then coordinate these agents for you.

---

## Step 4: Browsing Available Agents

### See All Agents:
1. Open terminal in VSCode
2. Run:
   ```bash
   ls .claude/AGENTS
   ```

### See Agent Categories:

**Core Development (9 agents)**
```bash
ls .claude/AGENTS | grep -E "Developer|Architect|Tester|Debugger|UI|UX"
```

**Data & APIs (6 agents)**
```bash
ls .claude/AGENTS | grep -E "Database|Analyst|Networker|Backender"
```

### Read the Index File:
1. Press `Ctrl+P`
2. Type: `.claude/AGENTS/INDEX.md`
3. Press Enter
4. You'll see all 49 agents organized by category!

---

## Step 5: Understanding Agent Memory

### What is CONTEXT_INJECTION.md?
- **Size**: ~6-10KB
- **Contents**: Agent's core identity, recent learnings, key patterns
- **Use When**: You need quick agent identity (faster to load)

### What is MEMORY.md?
- **Size**: ~50KB-316KB
- **Contents**: Full historical memory, all past sessions, complete knowledge
- **Use When**: You need deep knowledge from past projects

### Example: Developer Agent
```
.claude/AGENTS/Developer/
├── CONTEXT_INJECTION.md (9.7KB)
│   └── Quick identity + recent lessons
└── MEMORY.md (316KB!)
    └── Every project, every lesson, full history
```

### Which to Use?
- **Most tasks**: CONTEXT_INJECTION.md (faster, optimized)
- **Deep knowledge**: MEMORY.md (complete history)

---

## Step 6: Practical Examples for Your Sales Tracker

### Example 1: Add Mobile Features
```
/team-sdk improve mobile experience:
- Larger touch buttons
- Offline visit recording
- Quick-add shortcuts
- Better map on mobile
```

Agents used: UI, UX, Developer, WebArchitect

### Example 2: Google Sheets Optimization
```
/team-sdk the app makes too many Google Sheets API calls,
optimize it to reduce quota usage
```

Agents used: Database, Optimizer, Developer

### Example 3: Security Review
```
/team-sdk review the security of OAuth implementation
and fix any vulnerabilities
```

Agents used: Auditor, Cryptographer, Developer

### Example 4: Analytics Dashboard
```
/team-sdk create a manager dashboard showing:
- Team performance
- Visit statistics
- Revenue trends
- Follow-up reminders
```

Agents used: Analyst, Database, UI, Developer

---

## Step 7: Troubleshooting

### "I can't see AGENTS folder contents in VSCode"

**Solution 1: Refresh**
1. Right-click on AGENTS folder
2. Select "Refresh" or press F5

**Solution 2: Use Terminal**
1. Open terminal (Ctrl+`)
2. Run: `ls .claude/AGENTS`
3. You'll see all agents!

**Solution 3: Collapse/Expand**
1. Click arrow next to AGENTS to collapse
2. Click again to expand

### "How do I know which agent to use?"

**Use /team-sdk!** It auto-selects the right agents.

Or check the index:
1. Press `Ctrl+P`
2. Type: `.claude/AGENTS/INDEX.md`
3. See all agents by category

### "The agents don't seem to work"

**Verify installation:**
```bash
bash test-agents.sh
```

You should see:
```
✅ AGENTS directory exists
✅ Found 50 agent directories
✅ Found 104 MEMORY.md files
✅ Found 49 CONTEXT_INJECTION.md files
```

---

## Quick Reference Card

### Most Common Commands

**Add a feature:**
```
/team-sdk add [feature description]
```

**Fix a bug:**
```
/team-sdk [describe the bug], fix it
```

**Optimize something:**
```
/team-sdk optimize [what to optimize]
```

**Review code:**
```
/team-sdk review [file or feature] for security/quality
```

**Get help:**
```
/team-sdk help me understand [topic]
```

### Most Useful Agents for Sales Tracker

| Need | Use These Agents | Example |
|------|-----------------|---------|
| New feature | Developer, Architect, UI | Add dashboard |
| Bug fix | Debugger, Developer, Tester | Fix OAuth |
| Performance | Optimizer, Database, Developer | Speed up API |
| Design | UI, UX, Designer | Better mobile UI |
| Data | Database, Analyst | Optimize Sheets |
| Security | Auditor, Cryptographer | Review auth |

---

## Step 8: Your First Agent Task - Try This Now!

### Beginner Task:
```
/team-sdk list all available agents and their specialties
```

### Real Task for Sales Tracker:
```
/team-sdk add a simple export button that downloads
all visits as a CSV file
```

This will:
1. Load the right agents (Developer, UI, Database)
2. They'll coordinate to build the feature
3. You'll get working code
4. All from one command!

---

## Summary: Three Steps to Success

1. **Verify agents are there**: `ls .claude/AGENTS`
2. **Use the slash command**: `/team-sdk [your task]`
3. **Let agents do the work**: They'll coordinate automatically!

**That's it! You're ready to use 49 specialized agents with full memory!** 🚀

---

## Need More Help?

- **Full guide**: `.claude/README.md`
- **Agent index**: `.claude/AGENTS/INDEX.md`
- **Verification**: `.claude/AGENTS_INSTALLED.md`
- **Test script**: `bash test-agents.sh`

**Start simple, then explore!**
