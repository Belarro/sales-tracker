# Approval Gates - User Flow Diagrams

**Date**: October 8, 2025
**Agent**: UX
**Related**: APPROVAL_GATES_NATIVE_UX_SPECIFICATION.md

---

## Overview

This document provides detailed user flow diagrams for all approval gate scenarios in Team SDK native mode. Flows are presented in text-based diagram format optimized for clarity and implementation guidance.

---

## 1. Primary User Flows

### Flow 1.1: Standard Approval (Happy Path)

```
┌─────────────────────────────────────────────────────────────┐
│ USER INVOKES AGENT                                          │
│ "Build the approval gates UX specification"                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ AGENT PLANS OPERATION                                       │
│ • Analyze task requirements                                 │
│ • Determine files to create (3 files, 125KB total)         │
│ • Estimate cost and impact                                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ CHECK: APPROVAL NEEDED?                                     │
│ • File size > 10KB threshold? YES (48KB)                    │
│ • Batch count > 5 files? NO (3 files)                       │
│ • Cost > $0.50? NO ($0.15)                                  │
│ • Critical files? NO                                        │
│ RESULT: Approval required (file size threshold)            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ GENERATE APPROVAL REQUEST                                   │
│ • Severity: Medium (file size)                              │
│ • Timeout: 90 seconds                                       │
│ • Default action: Deny                                      │
│ • Options: [Approve] [Deny] [Always Allow] [Configure]     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ DISPLAY APPROVAL PROMPT TO USER                             │
│                                                             │
│  🔧 FILE OPERATION APPROVAL REQUIRED                        │
│                                                             │
│  Operation: Write 3 files (total 125KB)                     │
│  Severity: Medium                                           │
│                                                             │
│  Files:                                                     │
│    • APPROVAL_GATES_UX_SPEC.md (48KB, new)                 │
│    • APPROVAL_MESSAGE_TEMPLATES.md (52KB, new)             │
│    • APPROVAL_USER_FLOWS.md (25KB, new)                    │
│                                                             │
│  Impact: 3 new files, +125KB disk usage                     │
│  ⏱ Timeout: 90s (default: Deny)                            │
│                                                             │
│  [Approve] [Deny] [Always Allow *.md] [Configure]          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ USER REVIEWS REQUEST                                        │
│ • Reads file list                                           │
│ • Considers impact                                          │
│ • Decision time: ~8 seconds                                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ USER CLICKS [APPROVE]                                       │
│ Response captured: { action: 'approve', method: 'button' }  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ AGENT CONFIRMATION                                          │
│ "✅ Approved. Creating files now..."                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ EXECUTE OPERATION                                           │
│ • Write APPROVAL_GATES_UX_SPEC.md                          │
│ • Write APPROVAL_MESSAGE_TEMPLATES.md                       │
│ • Write APPROVAL_USER_FLOWS.md                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ OPERATION COMPLETE                                          │
│ "✅ Complete. Created 3 files totaling 125KB."              │
│                                                             │
│ Files:                                                      │
│ • /AGENTS/UX/APPROVAL_GATES_UX_SPEC.md                     │
│ • /AGENTS/UX/APPROVAL_MESSAGE_TEMPLATES.md                 │
│ • /AGENTS/UX/APPROVAL_USER_FLOWS.md                        │
└─────────────────────────────────────────────────────────────┘
```

**Duration**: 8-15 seconds (user review) + 2-3 seconds (execution)
**Success Rate**: 85% (typical approval scenario)

---

### Flow 1.2: Denial Path

```
┌─────────────────────────────────────────────────────────────┐
│ USER INVOKES AGENT                                          │
│ "Delete all archived agents from 2020-2023"                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ AGENT PLANS OPERATION                                       │
│ • Scan _archived directory                                  │
│ • Identify 45 files (1.2MB) across 15 agents                │
│ • Mark as destructive operation                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ CHECK: APPROVAL NEEDED?                                     │
│ • Destructive operation? YES                                │
│ • Batch count > 5? YES (45 files)                           │
│ RESULT: CRITICAL approval required                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ GENERATE APPROVAL REQUEST                                   │
│ • Severity: CRITICAL (destructive + batch)                  │
│ • Timeout: 180 seconds                                      │
│ • Default action: DENY                                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ DISPLAY CRITICAL APPROVAL PROMPT                            │
│                                                             │
│  🚨 DESTRUCTIVE BATCH OPERATION                             │
│                                                             │
│  Operation: Delete 45 archived agent files                  │
│  Severity: CRITICAL                                         │
│                                                             │
│  ⚠️ WARNING: This will permanently delete 45 files!         │
│                                                             │
│  Files (showing first 10):                                  │
│    • AGENTS/_archived/OldAgent1/MEMORY.md (145KB)          │
│    • AGENTS/_archived/OldAgent1/README.md (8KB)            │
│    ... and 43 more [Show All]                              │
│                                                             │
│  Impact: 1.2MB freed, historical data lost                  │
│  Rollback: git checkout HEAD -- AGENTS/_archived/           │
│  ⏱ Timeout: 180s (default: DENY)                           │
│                                                             │
│  [Yes, Delete All] [No, Cancel] [Review Files] [Delete 5]  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ USER REVIEWS REQUEST                                        │
│ • Sees "CRITICAL" severity                                  │
│ • Notices 45 files affected                                 │
│ • Considers if deletion is really needed                    │
│ • Decision: Too risky, cancel                               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ USER CLICKS [NO, CANCEL]                                    │
│ Response: { action: 'deny', method: 'button' }              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ OPERATION CANCELLED                                         │
│ "⛔ Operation cancelled. No files were deleted."            │
│                                                             │
│ Would you like to:                                          │
│ • [Delete 5 Oldest Only] - Gradual cleanup                  │
│ • [Move to Trash] - Safer alternative                       │
│ • [Review File List] - See what would be deleted            │
│ • [Cancel Task] - Abort entirely                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ USER CHOOSES ALTERNATIVE                                    │
│ [Delete 5 Oldest Only] - clicked                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ NEW APPROVAL REQUEST (Reduced Scope)                        │
│ • Severity: High (still destructive, but smaller)           │
│ • 5 files instead of 45                                     │
│ • User approves                                             │
│ • Operation executes successfully                           │
└─────────────────────────────────────────────────────────────┘
```

**Key Insight**: Denial leads to alternatives, not dead-end.

---

### Flow 1.3: Timeout Path

```
┌─────────────────────────────────────────────────────────────┐
│ USER INVOKES AGENT                                          │
│ "Run comprehensive test suite with coverage analysis"       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ AGENT PLANS OPERATION                                       │
│ • Command: npm test -- --coverage                           │
│ • Duration estimate: 45-60 seconds                          │
│ • Resource intensive: 80-100% CPU                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ CHECK: APPROVAL NEEDED?                                     │
│ • Long-running command? YES (>30s)                          │
│ RESULT: Approval required                                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ DISPLAY APPROVAL PROMPT                                     │
│ Timeout: 120 seconds, Warning at: 105s (15s remaining)      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ USER SEES PROMPT                                            │
│ • User gets distracted by phone call                        │
│ • Time passes: 0s → 30s → 60s → 90s → 105s                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ TIMEOUT WARNING (at 105s)                                   │
│                                                             │
│  ⏰ APPROVAL TIMEOUT WARNING                                │
│                                                             │
│  ⚠️ TIME REMAINING: 15 SECONDS                              │
│                                                             │
│  If you don't respond, this operation will be DENIED.       │
│                                                             │
│  [Approve] [Deny] [Extend Timeout +30s]                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ USER STILL DISTRACTED                                       │
│ • Phone call continues                                      │
│ • Time: 105s → 110s → 115s → 120s                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ TIMEOUT REACHED (120s)                                      │
│ Default action: DENY (per configuration)                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ OPERATION DENIED (Automatic)                                │
│                                                             │
│  ⏱️ APPROVAL TIMEOUT                                        │
│                                                             │
│  The approval request for "Run comprehensive test suite"    │
│  timed out after 120 seconds.                               │
│                                                             │
│  Default action applied: DENY                               │
│  Result: ⛔ Operation cancelled.                             │
│                                                             │
│  Recovery Options:                                          │
│  • [Retry Now] - Run the same command again                 │
│  • [Increase Timeout to 300s] - Allow more time             │
│  • [Auto-Approve npm test] - Skip approval for tests        │
│  • [Cancel Task] - Abort entirely                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ USER RETURNS (from phone call)                              │
│ • Sees timeout message                                      │
│ • Clicks [Retry Now]                                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ NEW APPROVAL REQUEST                                        │
│ • User now attentive                                        │
│ • Approves immediately                                      │
│ • Operation executes successfully                           │
└─────────────────────────────────────────────────────────────┘
```

**Key Insight**: Timeouts are recoverable with clear next steps.

---

## 2. Configuration Flows

### Flow 2.1: In-Context Configuration

```
┌─────────────────────────────────────────────────────────────┐
│ USER RECEIVES APPROVAL REQUEST                              │
│ Operation: Write large file (48KB)                          │
│ [Approve] [Deny] [Always Allow] [Configure] ←─ User clicks  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ QUICK CONFIGURATION DIALOG                                  │
│                                                             │
│  ⚙️ QUICK CONFIGURATION                                     │
│                                                             │
│  Based on: Write APPROVAL_GATES_UX_SPEC.md (48KB)          │
│                                                             │
│  Quick Actions:                                             │
│  ☑ Always approve this specific file                        │
│  ☐ Always approve *.md files in /AGENTS/UX/                │
│  ☐ Always approve files up to 100KB                        │
│  ☐ Never ask for *.md files (any size)                     │
│                                                             │
│  Or [Open Full Settings] for complete configuration         │
│                                                             │
│  [Apply Selected] [Cancel]                                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ USER SELECTS OPTIONS                                        │
│ ☑ Always approve this specific file                         │
│ ☑ Always approve files up to 100KB                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ USER CLICKS [APPLY SELECTED]                                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ UPDATE CONFIGURATION                                        │
│ • Add to whitelist: APPROVAL_GATES_UX_SPEC.md               │
│ • Update threshold: file_size_kb = 100                      │
│ • Save to .team-sdk-config.json                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ RE-EVALUATE ORIGINAL REQUEST                                │
│ • File now in whitelist? YES                                │
│ • Auto-approve                                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ CONFIRMATION & EXECUTION                                    │
│                                                             │
│  ✅ CONFIGURATION UPDATED                                   │
│                                                             │
│  Changes:                                                   │
│  • Added to whitelist: APPROVAL_GATES_UX_SPEC.md            │
│  • File size threshold: 10KB → 100KB                        │
│                                                             │
│  This operation has been auto-approved based on new rules.  │
│                                                             │
│  Proceeding now...                                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ OPERATION EXECUTES                                          │
│ File written successfully                                   │
└─────────────────────────────────────────────────────────────┘
```

**Duration**: 10-20 seconds (configuration) + immediate execution
**Key Insight**: Configuration happens in context, not separate UI.

---

### Flow 2.2: Full Settings Access

```
┌─────────────────────────────────────────────────────────────┐
│ USER CLICKS [Open Full Settings]                            │
│ (from quick config or directly from approval prompt)        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ SETTINGS INTERFACE DISPLAYED                                │
│                                                             │
│  ⚙️ APPROVAL GATE CONFIGURATION                             │
│                                                             │
│  [Global] [File Ops] [Commands] [Cost] [Delegation]        │
│                                                             │
│  === GLOBAL SETTINGS ===                                    │
│                                                             │
│  Auto-Approve Mode: ○ OFF ● ON                              │
│    ⚠️ Warning: Disables all approval gates                  │
│                                                             │
│  Default Timeout: [90] seconds                              │
│    How long to wait before applying default action          │
│                                                             │
│  Verbose Logging: ○ OFF ● ON                                │
│    Show detailed approval logs                              │
│                                                             │
│  --- FILE OPERATION THRESHOLDS ---                          │
│                                                             │
│  File Size Limit: [100] KB  (was: 10KB)                     │
│  Batch Limit: [5] files                                     │
│                                                             │
│  Critical Files: [Configure List ▼]                         │
│    • package.json                                           │
│    • CLAUDE.md                                              │
│    • .env                                                   │
│    [+ Add File]                                             │
│                                                             │
│  [Save Settings] [Reset to Defaults] [Export] [Import]      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ USER ADJUSTS SETTINGS                                       │
│ • File Size Limit: 10KB → 100KB                             │
│ • Default Timeout: 90s → 120s                               │
│ • Adds "*.test.ts" to whitelist patterns                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ USER CLICKS [SAVE SETTINGS]                                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ VALIDATE & SAVE CONFIGURATION                               │
│ • Validate all values (ranges, formats)                     │
│ • Write to .team-sdk-config.json                            │
│ • Create backup: .team-sdk-config.json.backup               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ CONFIRMATION MESSAGE                                        │
│                                                             │
│  ✅ SETTINGS SAVED                                          │
│                                                             │
│  Changes applied:                                           │
│  • File size limit: 10KB → 100KB                            │
│  • Default timeout: 90s → 120s                              │
│  • Whitelist pattern added: *.test.ts                       │
│                                                             │
│  Settings saved to: .team-sdk-config.json                   │
│  Backup created: .team-sdk-config.json.backup               │
│                                                             │
│  These settings will apply to all future operations.        │
│                                                             │
│  [Close] [Undo Changes] [Export Settings]                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ RETURN TO ORIGINAL CONTEXT                                  │
│ • If from approval prompt: Re-evaluate with new settings    │
│ • If from settings menu: Close settings interface           │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Special Scenario Flows

### Flow 3.1: Cost Threshold with Optimization

```
┌─────────────────────────────────────────────────────────────┐
│ USER REQUESTS EXPENSIVE OPERATION                           │
│ "Analyze codebase with 5 specialized agents"               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ AGENT ESTIMATES COST                                        │
│ • 5 agents × ~40,000 tokens each                            │
│ • Total: ~200,000 tokens                                    │
│ • Estimated cost: $3.00                                     │
│ • User threshold: $0.50                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ APPROVAL REQUEST WITH ALTERNATIVES                          │
│                                                             │
│  💰 HIGH-COST OPERATION APPROVAL                            │
│                                                             │
│  Operation: Analyze codebase with 5 agents                  │
│  Cost: $3.00 (threshold: $0.50)                             │
│  Severity: High                                             │
│                                                             │
│  Agents: Developer, Architect, Debugger, Tester, Documenter │
│                                                             │
│  Alternatives to reduce cost:                               │
│  • Use 3 agents instead of 5 (save ~40%)                    │
│  • Run sequentially not parallel (same cost, more control)  │
│  • Use Haiku model instead of Sonnet (save ~90%)            │
│  • Limit codebase context (save ~30%)                       │
│                                                             │
│  [Approve $3.00] [Use 3 Agents] [Use Haiku] [Deny]         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─────────────────┬──────────────────┬────────┐
                 │                 │                  │        │
                 v                 v                  v        v
         ┌───────────┐    ┌────────────┐    ┌────────────┐   │
         │ Approve   │    │ Use 3      │    │ Use Haiku  │   │
         │ $3.00     │    │ Agents     │    │ Model      │   │
         └─────┬─────┘    └──────┬─────┘    └──────┬─────┘   │
               │                 │                  │         │
               v                 v                  v         v
         Execute           New request       New request    Cancel
         (5 agents,        (3 agents,        (5 agents,
         $3.00)            ~$1.80)           Haiku, ~$0.30)
```

**Key Insight**: Present cost-reduction alternatives inline.

---

### Flow 3.2: Cascading Approvals (Agent Delegation Chain)

```
┌─────────────────────────────────────────────────────────────┐
│ USER INVOKES: @agent-developer                              │
│ "Implement approval gates UI for native mode"              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ DEVELOPER AGENT PLANS                                       │
│ "I need UX to design the interface first"                  │
│ Plans to delegate: Developer → UX                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ APPROVAL REQUEST #1: Developer → UX                         │
│                                                             │
│  🤝 AGENT DELEGATION APPROVAL                               │
│                                                             │
│  Developer wants to delegate to UX                          │
│  Cost: ~$0.40, Duration: 60-90s                             │
│                                                             │
│  [Approve] [Deny]                                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v (User approves)
┌─────────────────────────────────────────────────────────────┐
│ UX AGENT EXECUTES                                           │
│ "I'll design the interface. I need to write 3 large files." │
│ Plans to write: 3 files × 40KB each = 120KB total          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ APPROVAL REQUEST #2: UX → Write Files                       │
│                                                             │
│  🔧 FILE OPERATION APPROVAL                                 │
│                                                             │
│  UX wants to write 3 files (120KB total)                    │
│  Files: UX spec, templates, flow diagrams                   │
│                                                             │
│  [Approve] [Deny]                                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v (User approves)
┌─────────────────────────────────────────────────────────────┐
│ FILES WRITTEN                                               │
│ UX returns results to Developer                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ DEVELOPER CONTINUES                                         │
│ "Now I'll implement the UI components based on UX design"   │
│ Plans to delegate: Developer → Architect (for structure)    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ APPROVAL REQUEST #3: Developer → Architect                  │
│                                                             │
│  🤝 AGENT DELEGATION APPROVAL (Chain: 2 levels)             │
│                                                             │
│  Developer → Architect (database schema design)             │
│                                                             │
│  Note: This is the 3rd approval in this task.               │
│  Consider enabling auto-approve for trusted agents.         │
│                                                             │
│  [Approve] [Deny] [Always Approve Developer→Architect]      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v (User selects [Always Approve])
┌─────────────────────────────────────────────────────────────┐
│ WHITELIST UPDATED & EXECUTION                               │
│ • Added: Developer→Architect to auto-approve list           │
│ • Architect executes without further approval               │
│ • Future Developer→Architect delegations auto-approved      │
└─────────────────────────────────────────────────────────────┘
```

**Key Insight**: System learns from repeated patterns and suggests whitelist.

---

## 4. Error Recovery Flows

### Flow 4.1: Network Error During Approval

```
┌─────────────────────────────────────────────────────────────┐
│ APPROVAL REQUEST SENT                                       │
│ User clicks [Approve]                                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ PROCESSING APPROVAL...                                      │
│ Spinner/loading indicator shown                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ NETWORK ERROR OCCURS                                        │
│ Connection lost while processing                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ ERROR MESSAGE DISPLAYED                                     │
│                                                             │
│  🌐 NETWORK ERROR                                           │
│                                                             │
│  Unable to process approval request due to connection issue.│
│                                                             │
│  The operation has been paused (no changes made).           │
│                                                             │
│  Status:                                                    │
│  • Error: Connection timeout                                │
│  • Retry attempt: 1 of 3                                    │
│  • Next retry in: 5 seconds                                 │
│                                                             │
│  [Retry Now] [Cancel Operation] [Configure Retry]           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├──────────────┬─────────────────┐
                 │              │                 │
                 v              v                 v
         Auto retry      User clicks        User clicks
         (in 5s)         [Retry Now]        [Cancel]
                 │              │                 │
                 v              v                 v
         ┌────────────────────────┐        ┌──────────────┐
         │ Retry approval         │        │ Operation    │
         │ processing             │        │ cancelled    │
         ├────────────────────────┤        │ No changes   │
         │ If success: Execute    │        └──────────────┘
         │ If fail: Show error    │
         └────────────────────────┘
```

**Key Insight**: Errors are recoverable with clear retry options.

---

### Flow 4.2: Invalid Response Handling

```
┌─────────────────────────────────────────────────────────────┐
│ APPROVAL REQUEST DISPLAYED                                  │
│ [Approve] [Deny] [Configure]                                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ USER TYPES TEXT RESPONSE (instead of clicking button)       │
│ User types: "maybe later"                                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ PARSE RESPONSE                                              │
│ • Not in approved keywords (yes, no, approve, deny)         │
│ • Ambiguous response                                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ INVALID RESPONSE ERROR                                      │
│                                                             │
│  ❌ INVALID RESPONSE                                        │
│                                                             │
│  Your response "maybe later" was not recognized.            │
│                                                             │
│  Valid responses:                                           │
│  • Click [Approve] or [Deny] buttons above                  │
│  • Type: "approve", "yes", "y" (to approve)                 │
│  • Type: "deny", "no", "n" (to deny)                        │
│                                                             │
│  ⏱ Time remaining: 65 seconds                               │
│                                                             │
│  Please respond now.                                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ USER TRIES AGAIN                                            │
│ Clicks [Deny] button                                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ VALID RESPONSE PROCESSED                                    │
│ Operation denied successfully                               │
└─────────────────────────────────────────────────────────────┘
```

**Key Insight**: Clear error messages guide users to correct format.

---

## 5. Decision Trees

### Decision Tree 5.1: Approval Severity Determination

```
START: Agent plans operation
    │
    v
Is operation DESTRUCTIVE? (delete, force, irreversible)
    │
    ├─ YES → Severity = CRITICAL
    │         Timeout = 180s
    │         Default = DENY
    │         ⚠️ Extra confirmation required
    │
    └─ NO → Continue evaluation
            │
            v
        Does it exceed COST threshold? ($0.50)
            │
            ├─ YES → Severity = HIGH
            │         Timeout = 120s
            │         Default = Deny
            │         💰 Show cost alternatives
            │
            └─ NO → Continue evaluation
                    │
                    v
                Does it exceed FILE SIZE or BATCH threshold?
                    │
                    ├─ YES → Severity = MEDIUM
                    │         Timeout = 90s
                    │         Default = Deny
                    │         📦 Show file details
                    │
                    └─ NO → Severity = LOW
                            Timeout = 60s
                            Default = Deny
                            ℹ️ Simple approval
```

---

### Decision Tree 5.2: Whitelist Evaluation

```
START: Check if approval needed
    │
    v
Is operation in BLACKLIST?
    │
    ├─ YES → ALWAYS DENY (no approval prompt)
    │         Show: "Operation blocked by policy"
    │
    └─ NO → Continue
            │
            v
        Is operation in WHITELIST?
            │
            ├─ YES → AUTO-APPROVE (no prompt)
            │         Log approval
            │         Execute operation
            │
            └─ NO → Continue
                    │
                    v
                Does operation match WHITELIST PATTERN?
                    │
                    ├─ YES → AUTO-APPROVE
                    │         (e.g., *.test.ts matches "*.test.ts" pattern)
                    │
                    └─ NO → Continue
                            │
                            v
                        Is operation in WHITELISTED DIRECTORY?
                            │
                            ├─ YES → AUTO-APPROVE
                            │         (e.g., /tmp/ is whitelisted)
                            │
                            └─ NO → REQUIRE APPROVAL
                                    Show approval prompt
```

---

## 6. State Diagrams

### State Diagram 6.1: Approval Request Lifecycle

```
┌─────────────┐
│   PLANNED   │  ← Agent plans operation
└──────┬──────┘
       │
       v
┌─────────────┐
│  EVALUATING │  ← Check thresholds, whitelist, blacklist
└──────┬──────┘
       │
       ├─ Blacklisted → [BLOCKED]
       ├─ Whitelisted → [APPROVED]
       │
       v
┌─────────────┐
│   PENDING   │  ← Waiting for user response
└──────┬──────┘
       │
       ├─ Timeout approaching → [WARNING]
       ├─ Timeout reached → [TIMEOUT]
       ├─ User approves → [APPROVED]
       ├─ User denies → [DENIED]
       └─ User configures → [CONFIGURING]
                                   │
                                   v
                            ┌─────────────┐
                            │ CONFIGURING │
                            └──────┬──────┘
                                   │
                                   v
                            Config updated
                                   │
                                   v
                            Re-evaluate → Back to [EVALUATING]

┌─────────────┐
│  APPROVED   │  → Execute operation → [EXECUTING]
└─────────────┘                            │
                                           v
                                    ┌─────────────┐
                                    │  COMPLETE   │
                                    └─────────────┘

┌─────────────┐
│   DENIED    │  → Operation cancelled → [CANCELLED]
└─────────────┘

┌─────────────┐
│   TIMEOUT   │  → Apply default action
└──────┬──────┘      │
       │             v
       │      Default = Deny → [CANCELLED]
       │      Default = Approve → [EXECUTING]
       │
       └─ User can retry → Back to [PLANNED]
```

---

## 7. Interaction Patterns

### Pattern 7.1: Progressive Trust Building

```
Session 1 (Cold Start - No Trust Established):
┌─────────────────────────────────────────────────────────────┐
│ Operation 1: Write 3 files                                  │
│ → APPROVAL REQUIRED (user approves)                         │
│                                                             │
│ Operation 2: Write 2 more files                             │
│ → APPROVAL REQUIRED (user approves)                         │
│                                                             │
│ Operation 3: Write 4 files                                  │
│ → APPROVAL REQUIRED (user clicks "Always Allow *.md")       │
│ → WHITELIST UPDATED                                         │
│                                                             │
│ Operation 4: Write 5 *.md files                             │
│ → AUTO-APPROVED (whitelist match)                           │
│ → No interruption                                           │
└─────────────────────────────────────────────────────────────┘

Session 2 (Trust Established):
┌─────────────────────────────────────────────────────────────┐
│ Operation 1: Write *.md file                                │
│ → AUTO-APPROVED (whitelist from previous session)           │
│                                                             │
│ Operation 2: Delete critical file                           │
│ → APPROVAL REQUIRED (critical operation, always ask)        │
│ → User approves with confirmation                           │
└─────────────────────────────────────────────────────────────┘

Result: Fewer interruptions over time, but safety maintained.
```

---

## 8. Accessibility Flows

### Flow 8.1: Keyboard Navigation

```
User Flow (Keyboard Only):
┌─────────────────────────────────────────────────────────────┐
│ 1. Approval prompt appears                                  │
│    Focus automatically on [Approve] button                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ 2. User navigation:                                         │
│    • TAB: Move to [Deny] button                             │
│    • TAB: Move to [Always Allow] button                     │
│    • TAB: Move to [Configure] button                        │
│    • SHIFT+TAB: Move backwards                              │
│    • ENTER/SPACE: Activate focused button                   │
│    • ESCAPE: Quick deny (safety default)                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│ 3. Screen reader announces:                                 │
│    "File operation approval required. Medium severity."     │
│    "Write 3 files totaling 125 KB."                         │
│    "Approve button. Press Enter to approve."                │
│    "Time remaining: 85 seconds. Default action: Deny."      │
└─────────────────────────────────────────────────────────────┘
```

---

## Flow Summary Table

| Flow ID | Flow Name | Primary User Goal | Success Criteria | Duration |
|---------|-----------|-------------------|------------------|----------|
| 1.1 | Standard Approval | Approve safe operation | Operation executes | 8-15s |
| 1.2 | Denial Path | Reject risky operation | Operation cancelled safely | 10-30s |
| 1.3 | Timeout Path | Handle missed approval | Recovery options clear | 120s+ |
| 2.1 | In-Context Config | Quick settings update | Settings saved & applied | 10-20s |
| 2.2 | Full Settings | Comprehensive config | All settings accessible | 30-60s |
| 3.1 | Cost Optimization | Reduce expensive operation | Lower cost alternative chosen | 15-30s |
| 3.2 | Delegation Chain | Multi-agent approval | Chain approved or optimized | 20-40s |
| 4.1 | Network Error | Recover from connection loss | Retry successful | 5-15s |
| 4.2 | Invalid Response | Fix incorrect input | Valid response submitted | 5-10s |

---

**File**: `/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS/UX/APPROVAL_GATES_USER_FLOWS.md`
**Lines**: 947
**Related**: APPROVAL_GATES_NATIVE_UX_SPECIFICATION.md, APPROVAL_MESSAGE_TEMPLATES.md
