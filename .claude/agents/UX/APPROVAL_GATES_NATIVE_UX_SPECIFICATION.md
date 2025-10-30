# Approval Gates - Native Mode UX Specification

**Date**: October 8, 2025
**Version**: 1.0
**Status**: SPECIFICATION (Not Implemented)
**Agent**: UX
**Context**: Team SDK native mode integration with Claude Code

---

## Executive Summary

This document specifies the user experience for approval gates in Team SDK native mode. Unlike the CLI implementation (which uses terminal prompts and readline), native mode must integrate seamlessly with Claude Code's conversational UI.

**Core Principle**: Protective without being annoying - users should feel safe, informed, and in control, not interrupted or burdened.

---

## 1. Native Mode Approval Mechanism

### 1.1 How Native Approvals Work

In native mode (Claude Code UI), approval gates use **conversational approval prompts** instead of readline prompts:

```typescript
// When approval is needed, the agent:
1. Pauses execution
2. Sends a structured message to the user
3. Waits for user response (with timeout)
4. Resumes based on user decision
```

**Key Difference from CLI**:
- CLI: Blocking readline prompt in terminal
- Native: Conversational turn with structured approval request

### 1.2 Message Format

Approval requests use a **structured message format** that Claude Code can render specially:

```typescript
interface ApprovalRequest {
  type: 'approval_request';
  operation: string;           // "write_file", "delete_file", "bash_command", etc.
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: {
    description: string;       // Human-readable summary
    impact: string;            // What will change
    cost?: CostEstimate;       // Token/dollar estimate
    files?: string[];          // Affected files
    commands?: string[];       // Commands to execute
    agents?: string[];         // Agents involved
  };
  options: ApprovalOption[];   // Available actions
  timeout_seconds: number;     // How long to wait
  default_action?: string;     // What happens on timeout
}

interface ApprovalOption {
  id: string;                  // "approve", "deny", "always_allow", "configure"
  label: string;               // "Approve", "Deny", "Always Allow", "Configure"
  description: string;         // Tooltip/help text
  consequence: string;         // What happens if chosen
}

interface CostEstimate {
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
  dollars?: number;
  cache_savings?: number;
}
```

---

## 2. Approval Categories

### 2.1 File Operations

**Triggers**:
- Writing files (size threshold: >10KB or >100 lines)
- Deleting files
- Batch operations (>5 files in one operation)
- Modifying critical files (package.json, CLAUDE.md, etc.)

**Approval Message**:
```
🔧 FILE OPERATION APPROVAL REQUIRED

Operation: Write 3 files (total 25KB)
Severity: Medium

Files:
  • AGENTS/UX/APPROVAL_GATES_UX.md (12KB, new)
  • integrations/team-sdk/src/approval-ui.ts (8KB, new)
  • integrations/team-sdk/test/approval-ui.test.ts (5KB, new)

Impact:
  • 3 new files created
  • No existing files modified
  • Total disk usage: +25KB

⏱ Timeout: 60 seconds (default: Deny)

Actions:
  [Approve] [Deny] [Always Allow File Writes] [Configure Thresholds]
```

### 2.2 Command Execution

**Triggers**:
- Potentially dangerous commands (rm, dd, format, etc.)
- Network operations (curl, wget, git push)
- Long-running operations (>30s estimated)
- System modifications (sudo, chmod, etc.)

**Approval Message**:
```
⚠️ COMMAND EXECUTION APPROVAL REQUIRED

Command: git push origin feature-branch
Severity: High

Details:
  • Pushes 5 commits to remote repository
  • Affects: origin/feature-branch
  • Network operation (public GitHub)
  • Irreversible once executed

Risk Assessment:
  ⚠️ Publishes code to external server
  ✅ No forced push or branch deletion
  ✅ Target is feature branch (not main)

⏱ Timeout: 90 seconds (default: Deny)

Actions:
  [Approve] [Deny] [Always Allow Git Push] [Review Commits First]
```

### 2.3 Cost Thresholds

**Triggers**:
- Operation exceeds token limit (default: 50,000 tokens)
- Operation exceeds dollar limit (default: $0.50)
- Batch agent delegation (>3 agents)
- High-cost model invocation (Opus)

**Approval Message**:
```
💰 COST THRESHOLD APPROVAL REQUIRED

Operation: Delegate to 5 agents (Developer, Architect, Debugger, Tester, Documenter)
Severity: Medium

Cost Estimate:
  • Input tokens: 45,000 (~$0.135)
  • Output tokens: 30,000 est (~$0.450)
  • Total estimated: $0.585
  • Cache savings: -$0.120
  • Net cost: $0.465

This exceeds your configured threshold of $0.30 per operation.

Agents:
  1. Developer (analyze codebase)
  2. Architect (design system)
  3. Debugger (identify issues)
  4. Tester (validate solution)
  5. Documenter (create docs)

⏱ Timeout: 120 seconds (default: Deny)

Actions:
  [Approve] [Deny] [Approve and Raise Limit] [Configure Cost Limits]
```

### 2.4 Agent Delegation

**Triggers**:
- Delegating to >2 agents simultaneously
- Delegating to expensive agents (Opus-based)
- Recursive delegation (agent delegating to agent)
- External agent invocation (non-CI agents)

**Approval Message**:
```
🤝 AGENT DELEGATION APPROVAL REQUIRED

Operation: Developer → Architect → Database
Severity: Medium

Delegation Chain:
  1. Developer (you invoked)
     ↓ delegates to
  2. Architect (design database schema)
     ↓ delegates to
  3. Database (implement schema)

Estimated Cost:
  • 3 agent turns
  • ~60,000 tokens total
  • ~$0.40 estimated

Rationale:
  Developer needs architectural guidance before implementation.
  Architect requires database specialist for schema design.

⏱ Timeout: 90 seconds (default: Deny)

Actions:
  [Approve Chain] [Deny] [Approve First Level Only] [Configure Delegation Rules]
```

### 2.5 Destructive Operations

**Triggers**:
- File deletion (any file)
- Branch deletion (git branch -D)
- Force operations (git push -f, rm -rf)
- Schema changes (database migrations)

**Approval Message**:
```
🚨 DESTRUCTIVE OPERATION APPROVAL REQUIRED

Operation: Delete 12 files from /AGENTS/_archived/
Severity: Critical

Files to Delete:
  • AGENTS/_archived/OldAgent1/MEMORY.md (45KB)
  • AGENTS/_archived/OldAgent1/README.md (8KB)
  • ... (10 more files)

Impact:
  ⚠️ IRREVERSIBLE - Files will be permanently deleted
  ⚠️ Git history preserved (files tracked)
  ℹ️ Total size: 230KB

Safety Check:
  ✅ All files are in _archived directory
  ✅ No active agent files affected
  ⚠️ Cannot be undone without git restore

⏱ Timeout: 120 seconds (default: Deny)

Actions:
  [Approve Deletion] [Deny] [Move to Trash Instead] [Review Files First]
```

---

## 3. Approval Message Templates

### 3.1 High-Cost Operation

**Scenario**: Operation exceeds configured cost threshold

```markdown
💰 HIGH-COST OPERATION APPROVAL REQUIRED

Operation: {operation_name}
Severity: {severity_level}

Cost Breakdown:
  • Input tokens: {input_tokens:,} (~${input_cost})
  • Output tokens: {output_tokens:,} est (~${output_cost})
  • Cache read: {cache_tokens:,} (~${cache_savings} saved)
  • Total estimated: ${total_cost}

This exceeds your threshold of ${threshold}.

{operation_details}

Estimated Duration: {duration_estimate}

⏱ Timeout: {timeout_seconds}s (default: {default_action})

Actions:
  [Approve] [Deny] [Approve and Update Threshold] [Configure Limits]
```

### 3.2 Destructive Operation

**Scenario**: Operation will permanently delete or modify critical resources

```markdown
🚨 DESTRUCTIVE OPERATION APPROVAL REQUIRED

Operation: {operation_name}
Severity: CRITICAL

⚠️ WARNING: This operation cannot be undone!

Impact:
{impact_summary}

Affected Resources:
{resource_list}

Safety Checks:
{safety_check_results}

Are you sure you want to proceed?

⏱ Timeout: {timeout_seconds}s (default: DENY)

Actions:
  [Yes, I'm Sure] [No, Cancel] [Review Details First]
```

### 3.3 File Size Limit

**Scenario**: Writing a large file or batch of files

```markdown
📦 FILE SIZE APPROVAL REQUIRED

Operation: Write {file_count} file(s) totaling {total_size}
Severity: Medium

Files:
{file_list_with_sizes}

Impact:
  • {new_file_count} new files
  • {modified_file_count} modified files
  • Total disk usage: +{total_size}

This exceeds your configured limit of {threshold_size}.

⏱ Timeout: {timeout_seconds}s (default: Deny)

Actions:
  [Approve] [Deny] [Always Allow] [Configure Size Limits]
```

### 3.4 Batch Operation

**Scenario**: Operating on many files/resources at once

```markdown
📋 BATCH OPERATION APPROVAL REQUIRED

Operation: {operation_name} on {item_count} items
Severity: {severity_level}

Items (showing first 10):
{item_list_preview}
... and {remaining_count} more

Summary:
  • Total items: {item_count}
  • Estimated duration: {duration_estimate}
  • Estimated cost: {cost_estimate}

Impact:
{impact_summary}

⏱ Timeout: {timeout_seconds}s (default: {default_action})

Actions:
  [Approve All] [Deny All] [Review Items] [Approve First 5 Only]
```

### 3.5 Dangerous Command

**Scenario**: Executing a potentially harmful command

```markdown
⚠️ DANGEROUS COMMAND APPROVAL REQUIRED

Command: {command_string}
Severity: HIGH

Risk Analysis:
{risk_analysis}

What This Command Does:
{command_explanation}

Potential Risks:
{risk_list}

Safety Checks:
{safety_check_results}

⏱ Timeout: {timeout_seconds}s (default: DENY)

Actions:
  [Approve] [Deny] [Modify Command] [Always Allow This Command]
```

### 3.6 Agent Delegation Chain

**Scenario**: Agent wants to delegate to multiple other agents

```markdown
🤝 MULTI-AGENT DELEGATION APPROVAL REQUIRED

Operation: {primary_agent} → {delegation_chain}
Severity: {severity_level}

Delegation Flow:
{delegation_diagram}

Estimated Cost:
  • Agent turns: {agent_count}
  • Total tokens: {token_estimate:,}
  • Estimated cost: ${cost_estimate}

Rationale:
{delegation_rationale}

⏱ Timeout: {timeout_seconds}s (default: {default_action})

Actions:
  [Approve Full Chain] [Approve First Level Only] [Deny] [Configure Delegation Rules]
```

### 3.7 External Network Operation

**Scenario**: Operation will access external network

```markdown
🌐 NETWORK OPERATION APPROVAL REQUIRED

Operation: {operation_name}
Severity: {severity_level}

Network Activity:
  • Protocol: {protocol}
  • Destination: {destination_url}
  • Data sent: {data_summary}
  • Data received: {receive_estimate}

Security:
  {security_checks}

Purpose:
{operation_purpose}

⏱ Timeout: {timeout_seconds}s (default: Deny)

Actions:
  [Approve] [Deny] [Always Allow {domain}] [Review Request Details]
```

### 3.8 Configuration Change

**Scenario**: Modifying system or project configuration

```markdown
⚙️ CONFIGURATION CHANGE APPROVAL REQUIRED

Operation: Modify {config_file}
Severity: {severity_level}

Changes:
{change_diff}

Impact:
{impact_summary}

Affected:
  • Agents: {affected_agents}
  • Features: {affected_features}
  • Users: {affected_users}

Rollback:
{rollback_instructions}

⏱ Timeout: {timeout_seconds}s (default: Deny)

Actions:
  [Approve] [Deny] [Preview Full Diff] [Create Backup First]
```

### 3.9 Database Migration

**Scenario**: Schema changes or data migrations

```markdown
🗄️ DATABASE MIGRATION APPROVAL REQUIRED

Migration: {migration_name}
Severity: CRITICAL

Schema Changes:
{schema_diff}

Data Impact:
  • Rows affected: {row_count:,}
  • Tables modified: {table_count}
  • Downtime: {downtime_estimate}

Safety:
  {safety_checks}

Rollback Plan:
{rollback_plan}

⏱ Timeout: {timeout_seconds}s (default: DENY)

Actions:
  [Approve Migration] [Deny] [Run in Dry-Run Mode] [Review Migration Script]
```

### 3.10 Timeout Warning

**Scenario**: Approval timeout approaching

```markdown
⏰ APPROVAL TIMEOUT WARNING

{original_approval_request}

⚠️ Time remaining: {seconds_remaining} seconds

If you don't respond, the default action will be: {default_action}

Actions:
  [Approve] [Deny] [Extend Timeout] [Configure]
```

---

## 4. Configuration UI Design

### 4.1 Approval Settings Interface

**Location**: Accessible via "Configure" button on any approval prompt, or via settings

```markdown
⚙️ APPROVAL GATE CONFIGURATION

### Global Settings

Auto-Approve Mode: [OFF] [ON]
  ⚠️ Warning: Disables all approval gates (not recommended)

Default Timeout: [60] seconds
  How long to wait for approval before applying default action

Verbose Logging: [OFF] [ON]
  Show detailed approval logs in console

---

### File Operation Thresholds

File Size Limit: [10] KB
  Approve writing files larger than this

Batch Operation Limit: [5] files
  Approve operations affecting more than this many files

Critical Files: [Configure List]
  Always require approval for these files:
    • package.json
    • CLAUDE.md
    • .env
    • [+ Add File]

---

### Command Execution Rules

Dangerous Commands: [Always Ask] [Auto-Deny] [Auto-Approve]
  How to handle potentially dangerous commands

Network Operations: [Always Ask] [Auto-Deny] [Auto-Approve]
  How to handle commands that access the network

Whitelisted Commands: [Configure List]
  Never ask approval for these commands:
    • git status
    • git diff
    • npm test
    • [+ Add Command]

Blacklisted Commands: [Configure List]
  Always deny these commands:
    • rm -rf /
    • dd if=/dev/zero
    • [+ Add Command]

---

### Cost Thresholds

Token Limit per Operation: [50,000] tokens
  Approve operations exceeding this token count

Dollar Limit per Operation: $[0.50]
  Approve operations exceeding this cost

Batch Agent Limit: [3] agents
  Approve delegating to more than this many agents

High-Cost Model Alert: [ON] [OFF]
  Warn when using expensive models (Opus)

---

### Agent Delegation Rules

Max Delegation Depth: [2] levels
  Allow agents to delegate this many levels deep

Auto-Approve Agents: [Configure List]
  Never ask approval when delegating to:
    • Debugger
    • [+ Add Agent]

Require Approval Agents: [Configure List]
  Always ask approval when delegating to:
    • Database
    • Infrastructurer
    • [+ Add Agent]

---

### Timeout Behavior

Default Action on Timeout: [Deny] [Approve] [Extend]
  What to do when approval times out

Timeout Warning: [15] seconds before timeout
  Show warning when this much time remains

Allow Timeout Extension: [ON] [OFF]
  Let users extend timeout when warning appears

---

[Save Settings] [Reset to Defaults] [Export Config] [Import Config]
```

### 4.2 Whitelist Management

```markdown
🟢 WHITELIST CONFIGURATION

### File Operations

Whitelisted Directories:
  • /tmp/ (auto-approve all operations)
  • /AGENTS/*/Sessions/ (auto-approve session logs)
  • [+ Add Directory]

Whitelisted File Patterns:
  • *.test.ts (auto-approve test files)
  • *.md (auto-approve markdown files)
  • [+ Add Pattern]

---

### Commands

Whitelisted Commands:
  • git status
  • git diff
  • npm test
  • pytest
  • [+ Add Command]

Whitelisted Command Patterns:
  • git log *
  • ls *
  • [+ Add Pattern]

---

### Agents

Auto-Approve Delegation:
  • Debugger
  • Documenter
  • [+ Add Agent]

---

[Save Whitelist] [Reset] [Export] [Import]
```

### 4.3 Quick Configuration (In-Context)

When user clicks "Configure" on an approval prompt:

```markdown
⚙️ QUICK CONFIGURATION

Based on current operation: {operation_name}

Quick Actions:
  □ Always approve this specific operation
  □ Always approve similar operations
  □ Always approve operations in this directory
  □ Always approve operations by this agent

Or [Open Full Settings] to configure all thresholds.

[Apply] [Cancel]
```

---

## 5. User Flow Diagrams (Conceptual)

### 5.1 File Write Approval Flow

```
User invokes agent
      ↓
Agent wants to write large file (15KB)
      ↓
[CHECK] File size > threshold (10KB)?
      ↓ YES
Approval request sent to user
      ↓
User sees approval prompt in conversation
      ↓
┌─────────────────┬──────────────┬────────────────┬──────────────┐
│ [Approve]       │ [Deny]       │ [Always Allow] │ [Configure]  │
└─────────────────┴──────────────┴────────────────┴──────────────┘
      ↓                ↓                ↓                ↓
File written      Operation      Whitelist        Settings
                  cancelled      updated +        UI opened
                                 file written
```

### 5.2 Cost Threshold Approval Flow

```
Agent plans expensive operation
      ↓
[ESTIMATE] Calculate cost: $0.65
      ↓
[CHECK] Cost > threshold ($0.50)?
      ↓ YES
Approval request with cost breakdown
      ↓
User sees cost estimate and impact
      ↓
┌─────────────┬────────┬──────────────────────┬────────────┐
│ [Approve]   │ [Deny] │ [Approve + Raise]    │ [Configure]│
└─────────────┴────────┴──────────────────────┴────────────┘
      ↓            ↓            ↓                    ↓
Execute        Cancel    Execute +             Settings
operation               threshold=$1.00
```

### 5.3 Timeout Warning Flow

```
Approval request sent (timeout: 60s)
      ↓
User viewing... (45s elapsed)
      ↓
[TIMER] 15 seconds remaining?
      ↓ YES
Timeout warning shown
      ↓
┌─────────────┬────────┬──────────────────┐
│ [Approve]   │ [Deny] │ [Extend Timeout] │
└─────────────┴────────┴──────────────────┘
      ↓            ↓            ↓
Execute        Cancel    +30s added,
operation               continue waiting
      ↓
[TIMER] Timeout reached (60s)?
      ↓ YES (no user action)
Apply default action (Deny)
      ↓
Operation cancelled
      ↓
User notified: "Approval timeout - operation denied"
```

### 5.4 Agent Delegation Approval Flow

```
Agent A wants to delegate to Agent B
      ↓
[CHECK] Delegation allowed?
      ├─ Agent B in whitelist? → YES → Auto-approve
      ├─ Agent B in blacklist? → YES → Auto-deny
      └─ Neither? → Request approval
            ↓
Approval request with delegation context
      ↓
User sees delegation chain and cost
      ↓
┌──────────────────┬────────┬──────────────────────┬────────────┐
│ [Approve Chain]  │ [Deny] │ [First Level Only]   │ [Configure]│
└──────────────────┴────────┴──────────────────────┴────────────┘
      ↓                ↓              ↓                    ↓
A→B→C executed    Cancel      A→B only,          Settings
                              block B→C
```

### 5.5 Configuration Update Flow

```
User clicks [Configure] on approval prompt
      ↓
Quick configuration dialog shown
      ↓
┌──────────────────────────────────────────────────┐
│ ⚙️ QUICK CONFIGURATION                           │
│                                                  │
│ □ Always approve this operation                  │
│ □ Always approve similar operations              │
│ □ Always approve operations in this directory    │
│                                                  │
│ [Apply] [Open Full Settings] [Cancel]           │
└──────────────────────────────────────────────────┘
      ↓
User selects option(s) and clicks [Apply]
      ↓
Configuration updated in .team-sdk-config.json
      ↓
Original approval auto-approved (based on new rule)
      ↓
Operation executes
      ↓
User notified: "Configuration updated + operation approved"
```

---

## 6. Native Mode Considerations

### 6.1 Claude Code UI Integration

**Display Mechanism**:
- Approval requests appear as special message blocks in conversation
- Differentiated visual styling (border, background, icons)
- Action buttons rendered inline (not separate UI)
- Collapsible details sections for long content

**Example Rendering**:
```
┌─────────────────────────────────────────────────────────────┐
│ 🔧 FILE OPERATION APPROVAL REQUIRED                         │
│                                                             │
│ Operation: Write 3 files (total 25KB)                       │
│ Severity: Medium                                            │
│                                                             │
│ Files:                                                      │
│   • AGENTS/UX/APPROVAL_GATES_UX.md (12KB, new)             │
│   • integrations/team-sdk/src/approval-ui.ts (8KB, new)    │
│   • ... (1 more) [Show All]                                │
│                                                             │
│ Impact:                                                     │
│   • 3 new files created                                     │
│   • Total disk usage: +25KB                                 │
│                                                             │
│ ⏱ Timeout: 60 seconds (default: Deny)                      │
│                                                             │
│ [Approve] [Deny] [Always Allow] [Configure]                │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Response Handling

**User Response Methods**:

1. **Button Clicks** (preferred):
   - Inline action buttons in approval message
   - One-click approval/denial
   - Immediate feedback

2. **Text Responses** (fallback):
   - User types: "approve", "deny", "yes", "no"
   - Natural language interpretation
   - More flexible but less guided

3. **Timeout** (automatic):
   - Timer shown in approval message
   - Warning at configured threshold (e.g., 15s remaining)
   - Default action applied on timeout

**Implementation**:
```typescript
interface ApprovalResponse {
  action: 'approve' | 'deny' | 'always_allow' | 'configure' | 'extend_timeout';
  timestamp: number;
  response_time_ms: number;
  method: 'button' | 'text' | 'timeout';
  config_changes?: ConfigUpdate[];
}
```

### 6.3 Conversation Flow

**Approval Request Pattern**:
```
[User] Build the approval gates UX specification

[Agent] I'll create a comprehensive UX spec. This will involve writing
        several files totaling about 30KB. Let me request approval first.

        [APPROVAL REQUEST BLOCK - as designed above]

[User] [Clicks "Approve"]

[Agent] ✅ Approved. Creating files now...

        [Proceeds with operation]

[Agent] ✅ Complete. Created 3 files totaling 28KB.
```

**Denial Pattern**:
```
[User] Delete all archived agents

[Agent] This will permanently delete 45 files (1.2MB) from AGENTS/_archived/.
        Let me request approval for this destructive operation.

        [APPROVAL REQUEST BLOCK]

[User] [Clicks "Deny"]

[Agent] ⛔ Operation cancelled. No files were deleted.

        Would you like me to:
        • Move files to trash instead?
        • Create a backup first, then delete?
        • Review the file list before deciding?
```

**Timeout Pattern**:
```
[User] Run the expensive test suite

[Agent] This will invoke 8 agents and cost approximately $2.50.

        [APPROVAL REQUEST BLOCK - timeout: 120s]

        [... 105s pass with no user response ...]

[Agent] ⏰ WARNING: Approval timeout in 15 seconds.
        Default action: DENY

        [Extend Timeout button appears]

        [... 15s pass ...]

[Agent] ⏱️ Approval timeout reached. Operation denied per your settings.

        You can run this operation by invoking me again, or adjust the
        cost threshold in settings to avoid future approvals.
```

### 6.4 Visual Design Guidelines

**Color Coding**:
- 🟢 Low severity (green accent)
- 🟡 Medium severity (yellow accent)
- 🟠 High severity (orange accent)
- 🔴 Critical severity (red accent)

**Icons**:
- 🔧 File operations
- ⚠️ Dangerous commands
- 💰 Cost thresholds
- 🤝 Agent delegation
- 🚨 Destructive operations
- 🌐 Network operations
- ⚙️ Configuration changes
- 🗄️ Database operations
- ⏰ Timeout warnings

**Typography**:
- **Bold**: Operation name, severity level
- *Italic*: Explanatory text, consequences
- `Monospace`: File paths, commands, code
- Regular: Details, descriptions

**Layout**:
- Operation summary at top (1-2 lines)
- Severity indicator prominent
- Details collapsible for long content
- Impact summary clear and scannable
- Timeout countdown visible
- Action buttons at bottom, full width

---

## 7. Timeout and Error Handling UX

### 7.1 Timeout Behavior

**Default Timeouts by Severity**:
- Low: 60 seconds (default: Deny)
- Medium: 90 seconds (default: Deny)
- High: 120 seconds (default: Deny)
- Critical: 180 seconds (default: Deny)

**Timeout Warning**:
```markdown
⏰ APPROVAL TIMEOUT WARNING

{original_approval_request}

⚠️ Time remaining: {seconds_remaining} seconds

If you don't respond, this operation will be DENIED.

[Approve Now] [Deny Now] [Extend Timeout +30s]
```

**Timeout Expiration**:
```markdown
⏱️ APPROVAL TIMEOUT

The approval request for "{operation_name}" timed out after {timeout_seconds} seconds.

Default action applied: {default_action}

Result: {result_message}

You can:
• Adjust timeout duration in settings
• Change the default timeout action
• Invoke the operation again to retry
```

### 7.2 Error Handling

**Invalid Response**:
```markdown
❌ INVALID RESPONSE

Your response "{user_input}" was not recognized.

Please use one of the action buttons, or type:
  • "approve" or "yes" to approve
  • "deny" or "no" to deny
  • "configure" to adjust settings

⏱ Time remaining: {seconds_remaining} seconds
```

**Network Failure**:
```markdown
🌐 NETWORK ERROR

Unable to process approval request due to connection issue.

The operation has been paused. Please:
  1. Check your internet connection
  2. Click [Retry] to resend your approval
  3. Or click [Cancel] to abort the operation

[Retry] [Cancel]
```

**System Error**:
```markdown
⚠️ APPROVAL SYSTEM ERROR

An error occurred while processing your approval:
{error_message}

The operation has been DENIED for safety.

You can:
  • Try again (error may be transient)
  • Check approval gate logs: {log_path}
  • Report this issue: {issue_url}

[Try Again] [View Logs] [Report Issue]
```

### 7.3 Recovery Flows

**After Denial**:
```markdown
⛔ OPERATION DENIED

{operation_name} was denied per your request.

No changes were made to your system.

Would you like to:
  • [Modify Operation] - Adjust parameters and try again
  • [Configure Rules] - Update approval settings
  • [Cancel] - Abort this task entirely
```

**After Timeout**:
```markdown
⏱️ APPROVAL TIMEOUT - OPERATION DENIED

{operation_name} was denied due to timeout.

You can:
  • [Retry Now] - Invoke the same operation again
  • [Adjust Timeout] - Increase timeout duration in settings
  • [Auto-Approve] - Add this operation to whitelist
  • [Cancel Task] - Abort entirely
```

**After Error**:
```markdown
⚠️ APPROVAL ERROR - OPERATION CANCELLED

An error prevented approval processing.

Safety Action: Operation was cancelled (no changes made).

Recovery Options:
  • [View Error Details] - See full error log
  • [Retry Operation] - Attempt approval again
  • [Report Bug] - Submit error report
  • [Configure Fallback] - Set error handling behavior
```

---

## 8. Implementation Recommendations

### 8.1 Technical Architecture

**Approval Request Flow**:
```typescript
// In orchestrator.ts
async function executeWithApproval(
  operation: Operation,
  config: ApprovalGateConfig
): Promise<OperationResult> {

  // 1. Check if approval needed
  const needsApproval = evaluateApprovalRules(operation, config);
  if (!needsApproval) {
    return executeOperation(operation);
  }

  // 2. Generate approval request
  const request = generateApprovalRequest(operation, config);

  // 3. Send to user (in native mode, this is a special message)
  const response = await requestUserApproval(request);

  // 4. Process response
  switch (response.action) {
    case 'approve':
      return executeOperation(operation);

    case 'deny':
      throw new OperationDeniedError('User denied approval');

    case 'always_allow':
      await updateWhitelist(operation, response.config_changes);
      return executeOperation(operation);

    case 'configure':
      await openConfigurationUI(request);
      // Wait for configuration, then re-request approval
      return executeWithApproval(operation, config);

    case 'extend_timeout':
      request.timeout_seconds += 30;
      return executeWithApproval(operation, config);

    default:
      throw new InvalidResponseError(response.action);
  }
}
```

### 8.2 Configuration Persistence

**Config File**: `.team-sdk-config.json`

```json
{
  "approval_gates": {
    "enabled": true,
    "auto_approve": false,
    "verbose": false,
    "default_timeout": 60,

    "thresholds": {
      "file_size_kb": 10,
      "batch_operation_count": 5,
      "token_limit": 50000,
      "cost_limit_usd": 0.50,
      "agent_delegation_limit": 3
    },

    "timeouts": {
      "low_severity": 60,
      "medium_severity": 90,
      "high_severity": 120,
      "critical_severity": 180,
      "default_action": "deny",
      "warning_seconds": 15,
      "allow_extension": true
    },

    "whitelists": {
      "directories": ["/tmp/", "/AGENTS/*/Sessions/"],
      "file_patterns": ["*.test.ts", "*.md"],
      "commands": ["git status", "git diff", "npm test"],
      "command_patterns": ["git log *", "ls *"],
      "agents": ["Debugger", "Documenter"]
    },

    "blacklists": {
      "commands": ["rm -rf /", "dd if=/dev/zero"],
      "agents": []
    },

    "critical_files": [
      "package.json",
      "CLAUDE.md",
      ".env",
      ".team-sdk-config.json"
    ]
  }
}
```

### 8.3 Approval Request Rendering

**Message Format for Native Mode**:
```typescript
interface ApprovalMessage {
  role: 'assistant';
  content: [
    {
      type: 'approval_request';
      operation: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      details: ApprovalDetails;
      options: ApprovalOption[];
      timeout_seconds: number;
      default_action: string;
    }
  ];
}

// Claude Code should recognize 'approval_request' type and render specially
```

**Fallback (if special rendering not available)**:
```typescript
// Render as structured text with clear formatting
function formatApprovalRequest(request: ApprovalRequest): string {
  return `
${getSeverityIcon(request.severity)} ${request.operation.toUpperCase()} APPROVAL REQUIRED

Operation: ${request.details.description}
Severity: ${request.severity}

${formatDetails(request.details)}

⏱ Timeout: ${request.timeout_seconds} seconds (default: ${request.default_action})

Actions:
${request.options.map(opt => `  [${opt.label}]`).join(' ')}

Please respond with one of: ${request.options.map(o => o.id).join(', ')}
`;
}
```

### 8.4 User Response Parsing

**Button Response** (preferred):
```typescript
// User clicks button → message with structured data
{
  type: 'approval_response',
  request_id: 'abc123',
  action: 'approve',
  method: 'button',
  timestamp: 1696723200000
}
```

**Text Response** (fallback):
```typescript
// User types message → parse natural language
function parseApprovalResponse(text: string): ApprovalAction {
  const normalized = text.trim().toLowerCase();

  // Direct matches
  if (['approve', 'yes', 'y', 'ok', 'allow'].includes(normalized)) {
    return 'approve';
  }
  if (['deny', 'no', 'n', 'cancel', 'reject'].includes(normalized)) {
    return 'deny';
  }
  if (normalized.includes('always')) {
    return 'always_allow';
  }
  if (normalized.includes('configure') || normalized.includes('settings')) {
    return 'configure';
  }
  if (normalized.includes('extend') || normalized.includes('more time')) {
    return 'extend_timeout';
  }

  throw new InvalidResponseError(text);
}
```

### 8.5 Timeout Implementation

**Timer with Warning**:
```typescript
async function requestUserApprovalWithTimeout(
  request: ApprovalRequest,
  config: ApprovalGateConfig
): Promise<ApprovalResponse> {

  return new Promise((resolve, reject) => {
    let warningShown = false;
    const startTime = Date.now();
    const timeoutMs = request.timeout_seconds * 1000;
    const warningMs = timeoutMs - (config.timeouts.warning_seconds * 1000);

    // Warning timer
    const warningTimer = setTimeout(() => {
      if (!warningShown) {
        warningShown = true;
        showTimeoutWarning(request, config.timeouts.warning_seconds);
      }
    }, warningMs);

    // Timeout timer
    const timeoutTimer = setTimeout(() => {
      clearTimeout(warningTimer);
      const response: ApprovalResponse = {
        action: config.timeouts.default_action as ApprovalAction,
        timestamp: Date.now(),
        response_time_ms: Date.now() - startTime,
        method: 'timeout'
      };
      showTimeoutExpired(request, response);
      resolve(response);
    }, timeoutMs);

    // User response handler
    onUserResponse((response: ApprovalResponse) => {
      clearTimeout(warningTimer);
      clearTimeout(timeoutTimer);
      response.timestamp = Date.now();
      response.response_time_ms = Date.now() - startTime;
      resolve(response);
    });

    // Timeout extension handler
    onTimeoutExtension(() => {
      clearTimeout(timeoutTimer);
      // Restart with extended timeout
      request.timeout_seconds += 30;
      resolve(requestUserApprovalWithTimeout(request, config));
    });
  });
}
```

---

## 9. Testing Scenarios

### 9.1 File Operation Tests

**Test 1: Large File Write**:
```typescript
// Given: Threshold = 10KB
// When: Agent writes 15KB file
// Then: Approval request shown with:
//   - File path and size
//   - "New file" indicator
//   - Medium severity
//   - 60s timeout
```

**Test 2: Batch File Write**:
```typescript
// Given: Batch limit = 5 files
// When: Agent writes 8 files
// Then: Approval request shown with:
//   - List of all 8 files
//   - Total size
//   - Medium severity
//   - Option to approve all or review individually
```

**Test 3: Critical File Modification**:
```typescript
// Given: package.json in critical files list
// When: Agent modifies package.json
// Then: Approval request shown with:
//   - Diff of changes
//   - "Critical file" warning
//   - High severity
//   - 120s timeout
```

### 9.2 Command Execution Tests

**Test 4: Dangerous Command**:
```typescript
// Given: "rm -rf" in blacklist
// When: Agent tries to run "rm -rf /tmp/build"
// Then: Approval request shown with:
//   - Command string
//   - Risk analysis
//   - Critical severity
//   - Default action: DENY
```

**Test 5: Network Operation**:
```typescript
// Given: Network operations require approval
// When: Agent runs "git push origin main"
// Then: Approval request shown with:
//   - Command and target
//   - Network warning
//   - High severity
//   - Option to review commits first
```

### 9.3 Cost Threshold Tests

**Test 6: High-Cost Operation**:
```typescript
// Given: Cost limit = $0.50
// When: Agent plans $0.75 operation
// Then: Approval request shown with:
//   - Cost breakdown
//   - Token estimates
//   - Medium severity
//   - Option to approve and raise limit
```

**Test 7: Batch Agent Delegation**:
```typescript
// Given: Agent delegation limit = 3
// When: Agent delegates to 5 agents
// Then: Approval request shown with:
//   - Agent list
//   - Cost estimate
//   - Delegation flow diagram
//   - Medium severity
```

### 9.4 Timeout Tests

**Test 8: Timeout Warning**:
```typescript
// Given: Timeout = 60s, warning = 15s
// When: 45 seconds pass with no response
// Then: Warning message shown with:
//   - Countdown
//   - Default action reminder
//   - Extend timeout button
```

**Test 9: Timeout Expiration**:
```typescript
// Given: Timeout = 60s, default = Deny
// When: 60 seconds pass with no response
// Then: Operation denied and user notified:
//   - "Timeout reached"
//   - "Operation denied"
//   - Recovery options
```

### 9.5 Configuration Tests

**Test 10: Whitelist Update**:
```typescript
// Given: User clicks "Always Allow"
// When: Approval processed
// Then:
//   - Config file updated
//   - Operation executed
//   - User notified of whitelist addition
//   - Future similar operations auto-approved
```

**Test 11: Configuration UI**:
```typescript
// Given: User clicks "Configure"
// When: Configuration UI shown
// Then:
//   - All thresholds displayed
//   - Current values shown
//   - Changes saved to .team-sdk-config.json
//   - Original operation re-evaluated with new rules
```

---

## 10. Accessibility and Usability

### 10.1 Accessibility Considerations

**Screen Reader Support**:
- All approval requests have clear ARIA labels
- Severity levels announced (e.g., "Critical severity operation")
- Timeout countdown announced at intervals
- Action buttons have descriptive labels

**Keyboard Navigation**:
- Tab through action buttons
- Enter/Space to activate
- Escape to deny (safe default)
- Arrow keys for dropdown options

**Visual Accessibility**:
- High contrast for severity indicators
- Color-blind safe palette
- Icon + text (not icon alone)
- Adequate font sizes

### 10.2 Usability Principles

**Progressive Disclosure**:
- Summary view by default
- Expandable details sections
- "Show more" for long lists
- Collapsible technical information

**Clear Consequences**:
- Every action button has tooltip
- Consequences stated explicitly
- Reversibility indicated
- Default action clearly marked

**Error Prevention**:
- Destructive operations require confirmation
- Critical operations have longer timeouts
- Default action is always safe (Deny)
- Easy to undo configuration changes

**Feedback**:
- Immediate response to button clicks
- Progress indicators for operations
- Success/failure messages
- Clear next steps

### 10.3 Mobile Considerations

**Touch Targets**:
- Action buttons minimum 44x44 points
- Adequate spacing between buttons
- Swipe gestures for quick approve/deny
- Haptic feedback on important actions

**Screen Size**:
- Responsive layout for small screens
- Scrollable detail sections
- Sticky action buttons at bottom
- Collapsible headers

---

## 11. Success Metrics

### 11.1 User Experience Metrics

**Efficiency**:
- Average time to approve: <5 seconds
- Timeout rate: <5% of requests
- Configuration abandonment: <10%
- Approval request clarity rating: >4/5

**Safety**:
- Unintended approvals: <1%
- Regretted approvals: <2%
- Post-approval issues: <3%
- User-reported safety concerns: 0

**Satisfaction**:
- "Too many prompts" complaints: <5%
- "Didn't understand" feedback: <3%
- Overall satisfaction: >4/5
- Would recommend: >80%

### 11.2 System Metrics

**Performance**:
- Approval request generation: <100ms
- UI render time: <200ms
- Response processing: <50ms
- Configuration save: <100ms

**Reliability**:
- Approval system uptime: >99.9%
- Timeout accuracy: ±500ms
- Message delivery: 100%
- Config persistence: 100%

---

## 12. Future Enhancements

### 12.1 Intelligent Approvals

**Machine Learning**:
- Learn user preferences over time
- Suggest whitelist additions based on patterns
- Predict likely approval/denial
- Adjust thresholds automatically

**Context Awareness**:
- Different rules for different projects
- Time-of-day sensitivity (be more careful late at night)
- Fatigue detection (stricter when user is tired)
- Risk assessment based on recent activity

### 12.2 Advanced Features

**Approval Groups**:
- Require approval from multiple people (team settings)
- Delegated approval authority
- Approval chains (manager approval for high-cost ops)
- Emergency override procedures

**Audit Trail**:
- Complete log of all approvals
- Who approved what and when
- Cost tracking over time
- Approval pattern analysis

**Integration**:
- Slack/Teams notifications for approvals
- Mobile app for remote approvals
- API for external approval systems
- Webhook integration

---

## 13. Appendices

### Appendix A: Comparison with CLI Mode

| Aspect | CLI Mode | Native Mode |
|--------|----------|-------------|
| **UI** | Terminal readline prompt | Conversational message block |
| **Actions** | Type "y/n" | Click buttons or type |
| **Timeout** | Terminal timeout | Conversational timeout with warning |
| **Visual** | ASCII art, ANSI colors | Rich formatting, icons, colors |
| **Config** | Via flags and config file | Via in-context UI and config file |
| **Feedback** | Console logs | Conversational messages |
| **Mobile** | Not supported | Touch-friendly |
| **Screen Reader** | Limited | Full ARIA support |

### Appendix B: Security Considerations

**Approval Bypass Prevention**:
- Approval gates cannot be disabled without explicit user action
- Configuration changes logged
- Whitelists have size limits to prevent abuse
- Critical operations always require approval (no bypass)

**Data Privacy**:
- Approval logs don't contain sensitive data
- Configuration stored locally only
- No telemetry without consent
- User data never sent to external servers

**Attack Vectors**:
- Malicious agents cannot auto-approve
- Timeout manipulation prevented
- Configuration tampering detected
- Injection attacks mitigated (sanitized inputs)

### Appendix C: Error Messages Reference

| Error Code | Message | User Action |
|------------|---------|-------------|
| `ERR_TIMEOUT` | Approval timeout reached | Retry operation or adjust timeout |
| `ERR_INVALID_RESPONSE` | Response not recognized | Use action buttons or valid text |
| `ERR_NETWORK` | Network error during approval | Check connection and retry |
| `ERR_CONFIG` | Configuration error | Reset config or fix syntax |
| `ERR_SYSTEM` | System error in approval gate | Check logs and report |
| `ERR_PERMISSION` | Permission denied for operation | Check file permissions |

### Appendix D: Default Configuration Values

```json
{
  "default_timeout": 60,
  "warning_seconds": 15,
  "default_action": "deny",

  "thresholds": {
    "file_size_kb": 10,
    "batch_operation_count": 5,
    "token_limit": 50000,
    "cost_limit_usd": 0.50,
    "agent_delegation_limit": 3
  },

  "timeouts_by_severity": {
    "low": 60,
    "medium": 90,
    "high": 120,
    "critical": 180
  }
}
```

---

## Document Metadata

**Filename**: `/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS/UX/APPROVAL_GATES_NATIVE_UX_SPECIFICATION.md`

**Version**: 1.0
**Date**: October 8, 2025
**Author**: UX Agent
**Status**: SPECIFICATION (Not Implemented)
**Related Files**:
- `/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/integrations/team-sdk/src/approval-gates.ts` (CLI implementation)
- `/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/integrations/team-sdk/test/approval-gates.test.ts` (CLI tests)

**Next Steps**:
1. Review specification with stakeholders
2. Design technical implementation for native mode
3. Create approval UI components
4. Implement approval request/response flow
5. Build configuration interface
6. Test with real users
7. Iterate based on feedback

---

**End of Specification**
