# Approval Message Templates - Native Mode

**Date**: October 8, 2025
**Agent**: UX
**Related**: APPROVAL_GATES_NATIVE_UX_SPECIFICATION.md

---

## Template Library

This document provides ready-to-use templates for all approval scenarios in Team SDK native mode.

---

## 1. File Operations

### Template: Large File Write

```markdown
🔧 FILE OPERATION APPROVAL REQUIRED

Operation: Write "{filename}" ({size}KB)
Severity: {severity}

File Details:
  • Path: {file_path}
  • Size: {size}KB ({line_count} lines)
  • Type: {file_type}
  • Status: {new_or_modified}

Impact:
  • {impact_description}
  • Estimated disk usage: +{size}KB

Reason: File size exceeds configured threshold ({threshold}KB).

⏱ Timeout: {timeout}s (default: Deny)

Actions:
  [Approve] [Deny] [Always Allow *.{extension}] [Configure Size Limit]
```

**Example**:
```markdown
🔧 FILE OPERATION APPROVAL REQUIRED

Operation: Write "APPROVAL_GATES_NATIVE_UX_SPECIFICATION.md" (48KB)
Severity: Medium

File Details:
  • Path: /AGENTS/UX/APPROVAL_GATES_NATIVE_UX_SPECIFICATION.md
  • Size: 48KB (1,247 lines)
  • Type: Markdown documentation
  • Status: New file

Impact:
  • New UX specification document created
  • Estimated disk usage: +48KB

Reason: File size exceeds configured threshold (10KB).

⏱ Timeout: 90s (default: Deny)

Actions:
  [Approve] [Deny] [Always Allow *.md] [Configure Size Limit]
```

---

### Template: Batch File Write

```markdown
📦 BATCH FILE OPERATION APPROVAL REQUIRED

Operation: Write {count} files (total {total_size}KB)
Severity: {severity}

Files (showing first {preview_count}):
{file_list}
{... and {remaining_count} more} [Show All]

Summary:
  • New files: {new_count}
  • Modified files: {modified_count}
  • Total size: {total_size}KB
  • Directories: {directory_count}

Impact:
  • {impact_description}
  • Estimated disk usage: +{total_size}KB

Reason: Operation affects {count} files (threshold: {threshold} files).

⏱ Timeout: {timeout}s (default: Deny)

Actions:
  [Approve All] [Deny All] [Review Each File] [Configure Batch Limit]
```

**Example**:
```markdown
📦 BATCH FILE OPERATION APPROVAL REQUIRED

Operation: Write 8 files (total 125KB)
Severity: Medium

Files (showing first 5):
  1. integrations/team-sdk/src/approval-ui.ts (22KB, new)
  2. integrations/team-sdk/src/approval-renderer.ts (18KB, new)
  3. integrations/team-sdk/src/approval-config.ts (15KB, new)
  4. integrations/team-sdk/test/approval-ui.test.ts (28KB, new)
  5. integrations/team-sdk/test/approval-renderer.test.ts (24KB, new)
... and 3 more [Show All]

Summary:
  • New files: 8
  • Modified files: 0
  • Total size: 125KB
  • Directories: 2 (src, test)

Impact:
  • New approval UI system components
  • Estimated disk usage: +125KB

Reason: Operation affects 8 files (threshold: 5 files).

⏱ Timeout: 90s (default: Deny)

Actions:
  [Approve All] [Deny All] [Review Each File] [Configure Batch Limit]
```

---

### Template: Critical File Modification

```markdown
🚨 CRITICAL FILE MODIFICATION APPROVAL REQUIRED

Operation: Modify "{filename}"
Severity: CRITICAL

File Details:
  • Path: {file_path}
  • Type: {file_type}
  • Criticality: {reason_critical}
  • Current size: {current_size}KB
  • New size: {new_size}KB

Changes:
{diff_summary}

[Show Full Diff]

Impact:
  • {impact_description}

Safety:
  ✅ Git history will be preserved
  ⚠️ Changes affect system configuration
  ℹ️ Backup available: {backup_path}

⏱ Timeout: 180s (default: DENY)

Actions:
  [Approve] [Deny] [Create Backup First] [Review Full Diff]
```

**Example**:
```markdown
🚨 CRITICAL FILE MODIFICATION APPROVAL REQUIRED

Operation: Modify "package.json"
Severity: CRITICAL

File Details:
  • Path: /package.json
  • Type: NPM package configuration
  • Criticality: System dependency manifest
  • Current size: 2.4KB
  • New size: 2.6KB

Changes:
  + Added dependency: "@anthropic-ai/claude-agent-sdk": "^1.0.0"
  + Added devDependency: "@types/node": "^20.0.0"
  ~ Modified script: "test:approval": "node --test test/approval-*.test.ts"

[Show Full Diff]

Impact:
  • 2 new dependencies will be installed
  • Test script command updated
  • Requires npm install to apply changes

Safety:
  ✅ Git history will be preserved
  ⚠️ Changes affect project dependencies
  ℹ️ Backup available: .git/package.json.backup

⏱ Timeout: 180s (default: DENY)

Actions:
  [Approve] [Deny] [Create Backup First] [Review Full Diff]
```

---

### Template: File Deletion

```markdown
🗑️ FILE DELETION APPROVAL REQUIRED

Operation: Delete {count} file(s)
Severity: {severity}

Files to Delete:
{file_list}

Impact:
  ⚠️ IRREVERSIBLE - Files will be permanently deleted
  {impact_details}

Safety Check:
  {safety_checks}

Total Size: {total_size}KB

⏱ Timeout: {timeout}s (default: DENY)

Actions:
  [Approve Deletion] [Deny] [Move to Trash] [Review Files]
```

**Example**:
```markdown
🗑️ FILE DELETION APPROVAL REQUIRED

Operation: Delete 3 files
Severity: High

Files to Delete:
  • AGENTS/_archived/OldAgent/MEMORY.md (145KB)
  • AGENTS/_archived/OldAgent/README.md (8KB)
  • AGENTS/_archived/OldAgent/metadata.json (0.5KB)

Impact:
  ⚠️ IRREVERSIBLE - Files will be permanently deleted
  • 3 files removed from _archived directory
  • Historical agent data will be lost

Safety Check:
  ✅ All files are in _archived directory (safe to delete)
  ✅ No active references found in codebase
  ⚠️ Git history will preserve content (can restore)

Total Size: 153.5KB

⏱ Timeout: 120s (default: DENY)

Actions:
  [Approve Deletion] [Deny] [Move to Trash] [Review Files]
```

---

## 2. Command Execution

### Template: Dangerous Command

```markdown
⚠️ DANGEROUS COMMAND APPROVAL REQUIRED

Command: {command}
Severity: {severity}

Risk Analysis:
  {risk_assessment}

What This Command Does:
  {explanation}

Potential Risks:
  {risk_list}

Safety Checks:
  {safety_checks}

Estimated Duration: {duration}

⏱ Timeout: {timeout}s (default: DENY)

Actions:
  [Approve] [Deny] [Modify Command] [Always Allow]
```

**Example**:
```markdown
⚠️ DANGEROUS COMMAND APPROVAL REQUIRED

Command: rm -rf /tmp/ci-build-*
Severity: High

Risk Analysis:
  ⚠️ Recursive deletion (rm -rf)
  ✅ Limited to /tmp directory (safe location)
  ✅ Wildcard pattern limits scope
  ⚠️ Cannot be undone

What This Command Does:
  Recursively deletes all directories in /tmp matching pattern "ci-build-*"

Potential Risks:
  • Accidental deletion if pattern is too broad
  • Could delete active build artifacts
  • No confirmation prompt (force flag)

Safety Checks:
  ✅ Target is temporary directory (/tmp)
  ✅ Pattern is specific (ci-build-*)
  ⚠️ No dry-run option available
  ℹ️ Estimated matches: 3 directories (~450MB)

Estimated Duration: 2-3 seconds

⏱ Timeout: 90s (default: DENY)

Actions:
  [Approve] [Deny] [Dry Run First] [Always Allow rm in /tmp]
```

---

### Template: Network Operation

```markdown
🌐 NETWORK OPERATION APPROVAL REQUIRED

Command: {command}
Severity: {severity}

Network Activity:
  • Protocol: {protocol}
  • Destination: {destination}
  • Direction: {direction}
  • Data sent: {data_summary}
  • Data received: {receive_estimate}

Security:
  {security_checks}

Purpose:
  {purpose}

Estimated Duration: {duration}

⏱ Timeout: {timeout}s (default: Deny)

Actions:
  [Approve] [Deny] [Always Allow {domain}] [Review Details]
```

**Example**:
```markdown
🌐 NETWORK OPERATION APPROVAL REQUIRED

Command: git push origin feature/approval-gates
Severity: High

Network Activity:
  • Protocol: HTTPS (SSH)
  • Destination: github.com/Nuru-AI/CollaborativeIntelligence
  • Direction: Outbound (push)
  • Data sent: 5 commits (~12KB compressed)
  • Data received: Status response (~1KB)

Security:
  ✅ HTTPS/SSH encrypted connection
  ✅ Authenticated with SSH key
  ✅ Target is known repository
  ⚠️ Publishes code to remote server

Purpose:
  Push local feature branch to remote repository for collaboration

Commits:
  1. feat: Add approval gates UX specification (a1b2c3d)
  2. feat: Add approval message templates (b2c3d4e)
  3. test: Add approval UI tests (c3d4e5f)
  4. docs: Update integration docs (d4e5f6g)
  5. fix: Correct timeout handling (e5f6g7h)

[Show Full Commit Details]

Estimated Duration: 3-5 seconds

⏱ Timeout: 90s (default: Deny)

Actions:
  [Approve] [Deny] [Always Allow github.com] [Review Commits]
```

---

### Template: Long-Running Command

```markdown
⏳ LONG-RUNNING COMMAND APPROVAL REQUIRED

Command: {command}
Severity: {severity}

Duration:
  • Estimated: {duration_estimate}
  • Min: {duration_min}
  • Max: {duration_max}

Resource Usage:
  • CPU: {cpu_usage}
  • Memory: {memory_usage}
  • Disk I/O: {disk_io}

What This Command Does:
  {explanation}

Progress Tracking:
  {progress_info}

⏱ Timeout: {timeout}s (default: Deny)

Actions:
  [Approve] [Deny] [Run in Background] [Configure Alert]
```

**Example**:
```markdown
⏳ LONG-RUNNING COMMAND APPROVAL REQUIRED

Command: npm test -- --coverage
Severity: Medium

Duration:
  • Estimated: 45-60 seconds
  • Min: 30 seconds (if cache hit)
  • Max: 90 seconds (cold start)

Resource Usage:
  • CPU: 80-100% (multi-threaded)
  • Memory: ~500MB
  • Disk I/O: Moderate (coverage reports)

What This Command Does:
  Runs full test suite with code coverage analysis
  • 156 test files
  • ~1,200 individual tests
  • Coverage report generation

Progress Tracking:
  ✅ Console output will show progress
  ✅ Can cancel with Ctrl+C
  ℹ️ Results saved to coverage/ directory

⏱ Timeout: 120s (default: Deny)

Actions:
  [Approve] [Deny] [Run in Background] [Skip Coverage]
```

---

## 3. Cost Thresholds

### Template: High-Cost Operation

```markdown
💰 HIGH-COST OPERATION APPROVAL REQUIRED

Operation: {operation_name}
Severity: {severity}

Cost Breakdown:
  • Input tokens: {input_tokens:,} (~${input_cost})
  • Output tokens: {output_tokens:,} est (~${output_cost})
  • Cache read: {cache_tokens:,} (~${cache_savings} saved)
  • Cache write: {cache_write_tokens:,} (~${cache_write_cost})
  • Total estimated: ${total_cost}

This exceeds your configured threshold of ${threshold}.

{operation_details}

Estimated Duration: {duration}

⏱ Timeout: {timeout}s (default: Deny)

Actions:
  [Approve] [Deny] [Approve and Raise Limit] [Configure Thresholds]
```

**Example**:
```markdown
💰 HIGH-COST OPERATION APPROVAL REQUIRED

Operation: Generate comprehensive test suite for approval gates
Severity: Medium

Cost Breakdown:
  • Input tokens: 45,000 (~$0.135)
    - Context: 30,000 tokens (codebase)
    - Instruction: 15,000 tokens (requirements)
  • Output tokens: 60,000 est (~$0.900)
    - Test files: ~50,000 tokens
    - Documentation: ~10,000 tokens
  • Cache read: 25,000 (~$0.025 saved)
  • Cache write: 30,000 (~$0.030)
  • Total estimated: $1.04
  • Net (with cache): $0.99

This exceeds your configured threshold of $0.50.

Operation Details:
  • Generate 8 test files covering all approval scenarios
  • Create integration tests for native mode
  • Generate test data fixtures
  • Document test coverage

Model: Claude Sonnet 4.5
Estimated Duration: 60-90 seconds

⏱ Timeout: 120s (default: Deny)

Actions:
  [Approve] [Deny] [Approve and Raise to $1.50] [Configure Thresholds]
```

---

### Template: Token Limit Exceeded

```markdown
🔢 TOKEN LIMIT EXCEEDED

Operation: {operation_name}
Severity: {severity}

Token Usage:
  • Input: {input_tokens:,} tokens
  • Output (estimated): {output_tokens:,} tokens
  • Total: {total_tokens:,} tokens
  • Your limit: {threshold:,} tokens
  • Exceeded by: {excess:,} tokens ({excess_percent}%)

Cost Impact:
  • Estimated cost: ${cost}
  • With cache savings: ${cost_with_cache}

Why This Is High:
  {explanation}

Alternatives:
  {alternatives}

⏱ Timeout: {timeout}s (default: Deny)

Actions:
  [Approve] [Deny] [Reduce Scope] [Configure Token Limit]
```

**Example**:
```markdown
🔢 TOKEN LIMIT EXCEEDED

Operation: Comprehensive codebase analysis with 5 agents
Severity: High

Token Usage:
  • Input: 120,000 tokens
    - Codebase context: 80,000 tokens
    - Agent instructions: 40,000 tokens
  • Output (estimated): 80,000 tokens
    - 5 agent analyses: ~16,000 each
  • Total: 200,000 tokens
  • Your limit: 50,000 tokens
  • Exceeded by: 150,000 tokens (300%)

Cost Impact:
  • Estimated cost: $3.00
  • With cache savings: ~$2.40

Why This Is High:
  • Delegating to 5 specialized agents
  • Full codebase context for each agent
  • Comprehensive analysis outputs

Alternatives:
  • Run agents sequentially (same total cost, but gradual)
  • Reduce number of agents to 3 (save ~40%)
  • Limit codebase context (save ~30%)
  • Use lower-cost model (Haiku: save ~90%)

⏱ Timeout: 120s (default: Deny)

Actions:
  [Approve] [Deny] [Reduce to 3 Agents] [Configure Token Limit]
```

---

## 4. Agent Delegation

### Template: Multi-Agent Delegation

```markdown
🤝 MULTI-AGENT DELEGATION APPROVAL REQUIRED

Operation: {primary_agent} → {delegation_chain}
Severity: {severity}

Delegation Flow:
{delegation_diagram}

Agents:
{agent_list}

Estimated Cost:
  • Agent turns: {agent_count}
  • Total tokens: {token_estimate:,}
  • Estimated cost: ${cost_estimate}

Rationale:
  {delegation_rationale}

⏱ Timeout: {timeout}s (default: Deny)

Actions:
  [Approve Full Chain] [Approve First Level Only] [Deny] [Configure Rules]
```

**Example**:
```markdown
🤝 MULTI-AGENT DELEGATION APPROVAL REQUIRED

Operation: UX → Developer → Architect → Database
Severity: Medium

Delegation Flow:
  UX (primary)
    ↓ Design approval gates UI
  Developer
    ↓ Implement UI components
  Architect
    ↓ Design database schema for approval logs
  Database
    ↓ Implement schema and queries

Agents:
  1. UX - Create UX specification (you invoked)
  2. Developer - Implement UI components (delegated)
  3. Architect - Design database schema (sub-delegated)
  4. Database - Implement schema (sub-sub-delegated)

Estimated Cost:
  • Agent turns: 4
  • Total tokens: ~85,000
    - UX: 20,000 (spec creation)
    - Developer: 30,000 (implementation)
    - Architect: 20,000 (schema design)
    - Database: 15,000 (schema implementation)
  • Estimated cost: $1.28

Rationale:
  UX needs Developer to implement the designed UI.
  Developer needs Architect to design database for audit logs.
  Architect needs Database to implement the designed schema.

⏱ Timeout: 90s (default: Deny)

Actions:
  [Approve Full Chain] [Approve First Level Only] [Deny] [Configure Rules]
```

---

### Template: Expensive Agent Invocation

```markdown
💎 EXPENSIVE AGENT INVOCATION

Agent: {agent_name}
Model: {model}
Severity: {severity}

Cost Estimate:
  • Model: {model} ({cost_per_token} per token)
  • Estimated tokens: {token_estimate:,}
  • Estimated cost: ${cost_estimate}
  • Compared to Sonnet: {cost_multiplier}x more expensive

Why This Agent/Model:
  {rationale}

Alternatives:
  {alternatives}

⏱ Timeout: {timeout}s (default: Deny)

Actions:
  [Approve] [Deny] [Use Sonnet Instead] [Configure Model Preferences]
```

**Example**:
```markdown
💎 EXPENSIVE AGENT INVOCATION

Agent: Architect
Model: Opus
Severity: High

Cost Estimate:
  • Model: Claude Opus 4 ($15/$75 per million tokens)
  • Estimated tokens: 50,000 input + 30,000 output
  • Estimated cost: $3.00
  • Compared to Sonnet: 5x more expensive

Why This Agent/Model:
  Architect requires high-reasoning capability for complex system design.
  Opus provides superior architectural insight for critical decisions.

Task: Design distributed approval gate system with multi-region support

Alternatives:
  • Use Sonnet instead (~$0.60 cost, 80% quality)
  • Break task into smaller pieces (same total cost, more control)
  • Review existing patterns first (might not need new design)

⏱ Timeout: 120s (default: Deny)

Actions:
  [Approve Opus] [Use Sonnet Instead] [Deny] [Configure Model Preferences]
```

---

## 5. Special Scenarios

### Template: Destructive Batch Operation

```markdown
🚨 DESTRUCTIVE BATCH OPERATION

Operation: {operation_name}
Severity: CRITICAL

⚠️ WARNING: This will permanently affect {count} resources!

Items (showing first {preview_count}):
{item_list}
{... and {remaining_count} more}

[Show All Items]

Impact:
  {impact_summary}

Safety Checks:
  {safety_checks}

Rollback:
  {rollback_info}

⏱ Timeout: {timeout}s (default: DENY)

Actions:
  [Yes, I'm Sure] [No, Cancel] [Review All Items] [Dry Run First]
```

**Example**:
```markdown
🚨 DESTRUCTIVE BATCH OPERATION

Operation: Delete all archived agents (2020-2023)
Severity: CRITICAL

⚠️ WARNING: This will permanently delete 45 files (1.2MB)!

Files (showing first 10):
  1. AGENTS/_archived/OldAgent1/MEMORY.md (145KB)
  2. AGENTS/_archived/OldAgent1/README.md (8KB)
  3. AGENTS/_archived/OldAgent2/MEMORY.md (234KB)
  4. AGENTS/_archived/OldAgent2/README.md (12KB)
  5. AGENTS/_archived/OldAgent3/MEMORY.md (89KB)
  ... and 40 more

[Show All 45 Files]

Impact:
  • 45 files permanently deleted
  • 15 agent directories removed
  • 1.2MB disk space freed
  • Historical agent data lost (but preserved in git)

Safety Checks:
  ✅ All files are in _archived directory
  ✅ No active references in codebase
  ✅ Git history preserves all content
  ⚠️ Cannot undo without git restore

Rollback:
  If needed, restore with: git checkout HEAD -- AGENTS/_archived/

⏱ Timeout: 180s (default: DENY)

Actions:
  [Yes, Delete All 45 Files] [No, Cancel] [Review Files] [Delete 5 Oldest Only]
```

---

### Template: Configuration Change Impact

```markdown
⚙️ CONFIGURATION CHANGE APPROVAL

Operation: Modify {config_file}
Severity: {severity}

Changes:
{change_summary}

[Show Full Diff]

Impact:
{impact_list}

Affected:
  • Agents: {affected_agents}
  • Features: {affected_features}
  • Users: {affected_users}

Rollback:
  {rollback_instructions}

⏱ Timeout: {timeout}s (default: Deny)

Actions:
  [Approve] [Deny] [Preview Impact] [Create Backup First]
```

**Example**:
```markdown
⚙️ CONFIGURATION CHANGE APPROVAL

Operation: Modify .team-sdk-config.json
Severity: High

Changes:
  • approval_gates.auto_approve: false → true
  • approval_gates.thresholds.cost_limit_usd: $0.50 → $5.00
  • approval_gates.default_timeout: 60s → 180s

[Show Full Diff]

Impact:
  ⚠️ AUTO-APPROVE ENABLED - All operations will proceed without confirmation
  ⚠️ Cost limit increased 10x - Expensive operations allowed
  ℹ️ Timeout tripled - More time to review approvals

Affected:
  • Agents: All agents (system-wide configuration)
  • Features: Approval gates, cost controls, timeout behavior
  • Users: All users of this repository

Rollback:
  Changes saved to .team-sdk-config.json.backup
  Restore with: mv .team-sdk-config.json.backup .team-sdk-config.json

⏱ Timeout: 120s (default: Deny)

Actions:
  [Approve Changes] [Deny] [Preview Impact] [Backup First]
```

---

### Template: Timeout Warning

```markdown
⏰ APPROVAL TIMEOUT WARNING

{original_approval_message}

---

⚠️ TIME REMAINING: {seconds_remaining} SECONDS

If you don't respond, the default action will be: {default_action}

Actions:
  [Approve] [Deny] [Extend Timeout +30s] [Configure]
```

**Example**:
```markdown
⏰ APPROVAL TIMEOUT WARNING

💰 HIGH-COST OPERATION APPROVAL REQUIRED

Operation: Generate comprehensive test suite
Cost: $1.04 (threshold: $0.50)

---

⚠️ TIME REMAINING: 15 SECONDS

If you don't respond, this operation will be DENIED.

Actions:
  [Approve] [Deny] [Extend Timeout +30s] [Configure]
```

---

### Template: Approval Denied (Timeout)

```markdown
⏱️ APPROVAL TIMEOUT

The approval request for "{operation_name}" timed out after {timeout} seconds.

Default action applied: {default_action}

Result: {result_message}

Recovery Options:
  • [Retry Operation] - Invoke the same operation again
  • [Adjust Timeout] - Increase timeout duration in settings
  • [Auto-Approve Similar] - Add this operation to whitelist
  • [Cancel Task] - Abort entirely

Statistics:
  • Request sent: {timestamp_sent}
  • Timeout reached: {timestamp_timeout}
  • Duration: {duration}s
```

**Example**:
```markdown
⏱️ APPROVAL TIMEOUT

The approval request for "Write comprehensive approval gates specification (48KB)" timed out after 90 seconds.

Default action applied: DENY

Result: ⛔ Operation cancelled. File was not created.

Recovery Options:
  • [Retry Now] - Create the file again (will request approval)
  • [Increase Timeout to 180s] - Allow more time for large file approvals
  • [Auto-Approve *.md Files] - Skip approval for markdown files
  • [Cancel Specification Task] - Abort this task entirely

Statistics:
  • Request sent: 2025-10-08 14:23:45
  • Timeout reached: 2025-10-08 14:25:15
  • Duration: 90s
```

---

## 6. Error Templates

### Template: Invalid Response

```markdown
❌ INVALID RESPONSE

Your response "{user_input}" was not recognized.

Valid responses:
  • Click one of the action buttons above
  • Type: "approve", "yes", "y" (to approve)
  • Type: "deny", "no", "n" (to deny)
  • Type: "configure", "settings" (to open configuration)
  • Type: "extend" (to extend timeout)

⏱ Time remaining: {seconds_remaining} seconds

Please respond now.
```

---

### Template: System Error

```markdown
⚠️ APPROVAL SYSTEM ERROR

An error occurred while processing your approval:

Error: {error_message}

The operation has been DENIED for safety.

Recovery:
  • [Try Again] - Retry approval (error may be transient)
  • [View Logs] - See detailed error information
  • [Report Issue] - Submit bug report
  • [Disable Approvals] - Continue without approval gates (not recommended)

Error Details:
  • Code: {error_code}
  • Time: {timestamp}
  • Context: {error_context}
```

---

### Template: Network Error

```markdown
🌐 NETWORK ERROR

Unable to process approval request due to connection issue.

The operation has been paused.

Please:
  1. Check your internet connection
  2. Click [Retry] to resend your approval
  3. Or click [Cancel] to abort the operation

Status:
  • Error: {error_message}
  • Retry attempt: {retry_count} of {max_retries}
  • Next retry in: {retry_delay}s

[Retry Now] [Cancel Operation] [Configure Retry Behavior]
```

---

## 7. Success Templates

### Template: Approval Granted

```markdown
✅ APPROVAL GRANTED

Operation "{operation_name}" was approved.

Proceeding now...

{operation_in_progress_indicator}
```

---

### Template: Approval Denied

```markdown
⛔ APPROVAL DENIED

Operation "{operation_name}" was denied per your request.

No changes were made to your system.

Would you like to:
  • [Modify Operation] - Adjust parameters and try again
  • [Configure Rules] - Update approval settings
  • [Cancel Task] - Abort this task entirely
```

---

### Template: Whitelist Updated

```markdown
✅ WHITELIST UPDATED

Added to whitelist: {whitelist_entry}

This operation has been approved and will be auto-approved in the future.

Proceeding now...

Settings saved to: .team-sdk-config.json

You can review/modify your whitelist in settings.
```

---

## Template Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `{operation_name}` | Name of the operation | "Write large specification file" |
| `{severity}` | Severity level | "Low", "Medium", "High", "Critical" |
| `{filename}` | File name | "APPROVAL_GATES_UX.md" |
| `{file_path}` | Full file path | "/AGENTS/UX/APPROVAL_GATES_UX.md" |
| `{size}` | File size in KB | "48" |
| `{line_count}` | Number of lines | "1,247" |
| `{count}` | Count of items | "8" |
| `{total_size}` | Total size | "125" |
| `{threshold}` | Configured threshold | "10", "$0.50", "5 files" |
| `{timeout}` | Timeout in seconds | "90" |
| `{default_action}` | Default action on timeout | "Deny" |
| `{command}` | Command string | "git push origin main" |
| `{input_tokens}` | Input token count | "45,000" |
| `{output_tokens}` | Output token count | "60,000" |
| `{total_cost}` | Total cost estimate | "$1.04" |
| `{agent_name}` | Agent name | "Developer" |
| `{agent_count}` | Number of agents | "5" |
| `{duration}` | Estimated duration | "60-90 seconds" |

---

## Usage Notes

### When to Use Each Template

1. **File Operations**: Any file write/modify/delete that exceeds configured thresholds
2. **Command Execution**: Potentially dangerous or long-running commands
3. **Cost Thresholds**: Operations that exceed token or dollar limits
4. **Agent Delegation**: When agents delegate to other agents
5. **Special Scenarios**: Complex or unusual operations
6. **Errors**: When approval system encounters issues
7. **Success**: Confirmation messages after approval processed

### Customization

All templates can be customized by:
- Adjusting severity thresholds
- Modifying timeout values
- Adding/removing action buttons
- Changing default actions
- Customizing visual styling (icons, colors)

### Accessibility

All templates include:
- Clear severity indicators
- Descriptive action button labels
- Timeout countdown
- Recovery options
- Consequences clearly stated

---

**File**: `/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS/UX/APPROVAL_MESSAGE_TEMPLATES.md`
**Lines**: 856
**Related**: APPROVAL_GATES_NATIVE_UX_SPECIFICATION.md
