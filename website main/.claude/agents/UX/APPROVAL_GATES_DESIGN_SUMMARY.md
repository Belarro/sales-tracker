# Approval Gates - Native Mode UX Design Summary

**Date**: October 8, 2025
**Agent**: UX
**Status**: SPECIFICATION COMPLETE
**Next Phase**: Technical Implementation

---

## Executive Summary

This document summarizes the complete UX design for approval gates in Team SDK native mode (Claude Code integration). The design prioritizes user safety without creating friction, providing clear information, and learning from user behavior over time.

**Core Philosophy**: Protective without being annoying.

---

## Deliverables

### 1. UX Specification
**File**: `APPROVAL_GATES_NATIVE_UX_SPECIFICATION.md` (1,247 lines)

**Contents**:
- Native mode approval mechanism (conversational vs CLI)
- 5 approval categories (file ops, commands, cost, delegation, destructive)
- Message format specifications with structured data types
- Configuration UI design (quick config + full settings)
- User flow diagrams (conceptual)
- Timeout and error handling UX
- Accessibility considerations
- Success metrics and future enhancements

**Key Innovation**: Approval requests integrate seamlessly with Claude Code's conversational UI using structured message blocks with inline action buttons.

---

### 2. Message Templates
**File**: `APPROVAL_MESSAGE_TEMPLATES.md` (856 lines)

**Contents**:
- 25+ ready-to-use templates covering all scenarios
- File operations (large files, batch, critical files, deletions)
- Command execution (dangerous, network, long-running)
- Cost thresholds (high-cost, token limits)
- Agent delegation (multi-agent chains, expensive models)
- Special scenarios (destructive batch, config changes)
- Error templates (invalid response, network, system errors)
- Success templates (approval granted, denied, whitelist updated)

**Key Feature**: All templates include severity indicators, timeout information, impact summaries, and recovery options.

---

### 3. User Flow Diagrams
**File**: `APPROVAL_GATES_USER_FLOWS.md` (947 lines)

**Contents**:
- 8 primary user flows (approval, denial, timeout, config, errors)
- Decision trees (severity determination, whitelist evaluation)
- State diagrams (approval lifecycle)
- Interaction patterns (progressive trust building)
- Accessibility flows (keyboard navigation, screen reader support)
- Flow summary table with success criteria and durations

**Key Insight**: User flows demonstrate how the system learns from user behavior and reduces interruptions over time while maintaining safety.

---

## Design Principles

### 1. Safety First
- Default action is always safe (Deny)
- Critical operations have longer timeouts (180s)
- Destructive operations require explicit confirmation
- Blacklist prevents dangerous operations entirely
- Error conditions fail closed (deny operation)

### 2. Progressive Disclosure
- Summary view by default
- Expandable details for complex information
- "Show more" for long lists
- Collapsible technical sections
- Context-sensitive help

### 3. Clear Communication
- Every approval shows: what, why, impact, consequences
- Severity indicated with colors and icons
- Timeout countdown visible
- Cost breakdowns transparent
- Recovery options always provided

### 4. User Learning
- Whitelist suggestions based on patterns
- Quick configuration in context
- "Always allow" options for trusted operations
- System adapts to user preferences
- Fewer interruptions over time

### 5. Graceful Degradation
- Timeouts are recoverable (retry options)
- Errors don't lose work (operations paused)
- Network issues handled with retries
- Invalid responses get helpful guidance
- Denials suggest alternatives

---

## Key Features

### Approval Categories

1. **File Operations**
   - Large files (>10KB configurable)
   - Batch operations (>5 files configurable)
   - Critical files (package.json, CLAUDE.md, etc.)
   - Destructive deletions

2. **Command Execution**
   - Dangerous commands (rm -rf, dd, etc.)
   - Network operations (git push, curl, wget)
   - Long-running commands (>30s)
   - System modifications (sudo, chmod)

3. **Cost Thresholds**
   - Token limits (>50,000 configurable)
   - Dollar limits (>$0.50 configurable)
   - Batch agent delegation (>3 agents)
   - High-cost model usage (Opus)

4. **Agent Delegation**
   - Multi-agent chains (>2 levels)
   - Expensive agent invocation
   - Recursive delegation
   - External agent access

5. **Destructive Operations**
   - File/directory deletion
   - Force operations (git push -f)
   - Schema changes
   - Irreversible actions

---

## Configuration System

### Three-Tier Configuration

#### 1. Quick Configuration (In-Context)
- Appears when user clicks [Configure] on approval prompt
- Context-aware suggestions based on current operation
- Checkbox options for common actions:
  - "Always approve this specific operation"
  - "Always approve similar operations"
  - "Always approve operations in this directory"
  - "Always approve operations by this agent"
- Immediate application with re-evaluation

#### 2. Full Settings (Comprehensive)
- Accessible via quick config or settings menu
- Tabbed interface: Global, File Ops, Commands, Cost, Delegation
- All thresholds configurable
- Whitelist/blacklist management
- Timeout behavior settings
- Export/import configuration

#### 3. Configuration File (.team-sdk-config.json)
- JSON format for programmatic access
- Git-ignored (user-specific preferences)
- Backup created on every save
- Validation on load
- Defaults provided if missing

---

## User Experience Highlights

### Intelligent Defaults
- **Auto-approve**: OFF (safety first)
- **Default timeout**: 60-180s (severity-based)
- **Default action**: Deny (safe fallback)
- **Warning threshold**: 15s before timeout
- **Cost limit**: $0.50 per operation
- **Token limit**: 50,000 per operation

### Timeout Behavior
- **Warning at 15s remaining**: User notified, can extend
- **Extend option**: +30s when warning shown
- **Configurable default**: Deny, Approve, or Extend
- **Visual countdown**: Always visible
- **Timeout expiration**: Clear message with recovery options

### Error Handling
- **Network errors**: Auto-retry with exponential backoff
- **Invalid responses**: Helpful guidance, not rejection
- **System errors**: Safe denial with detailed logs
- **Timeout errors**: One-click retry available
- **Configuration errors**: Validation with clear messages

### Accessibility
- **Screen reader support**: All elements have ARIA labels
- **Keyboard navigation**: Full keyboard access (Tab, Enter, Escape)
- **High contrast**: Color-blind safe palette
- **Large touch targets**: 44x44 points minimum
- **Clear language**: No jargon, simple explanations

---

## Example Scenarios

### Scenario 1: Developer Writing Tests
**Initial State**: No trust established, default thresholds

```
Operation 1: Write approval-gates.test.ts (15KB)
→ APPROVAL REQUIRED (exceeds 10KB)
→ User approves

Operation 2: Write approval-ui.test.ts (18KB)
→ APPROVAL REQUIRED
→ User clicks "Always Allow *.test.ts"
→ WHITELIST UPDATED

Operation 3: Write approval-config.test.ts (12KB)
→ AUTO-APPROVED (matches *.test.ts)
→ No interruption

Result: 3 operations, 2 approvals, 1 auto-approved
Trust established: *.test.ts whitelisted
Future sessions: All *.test.ts auto-approved
```

---

### Scenario 2: Cost-Conscious User
**Initial State**: Cost limit $0.50

```
Operation: Analyze codebase with 5 agents
Estimated cost: $3.00

APPROVAL REQUEST:
  💰 HIGH-COST OPERATION
  Cost: $3.00 (threshold: $0.50)

  Alternatives:
  • Use 3 agents (save 40%): $1.80
  • Use Haiku model (save 90%): $0.30
  • Limit context (save 30%): $2.10

  [Approve $3.00] [Use 3 Agents] [Use Haiku] [Deny]

User clicks: [Use 3 Agents]
→ Operation modified (5→3 agents)
→ New cost: $1.80
→ Executes successfully

Result: Cost reduced by 40% through intelligent alternatives
```

---

### Scenario 3: Distracted User (Timeout)
**Initial State**: User starts task, gets phone call

```
Operation: Run comprehensive test suite
Timeout: 120s, Warning at 105s

0s: Approval request shown
0-105s: User on phone (distracted)
105s: ⏰ WARNING - 15 seconds remaining!
      [Approve] [Deny] [Extend +30s]
105-120s: User still on phone
120s: TIMEOUT REACHED
      Default action: DENY
      Operation cancelled

User returns (125s):
  ⏱️ APPROVAL TIMEOUT
  Operation denied after 120s timeout.

  Recovery Options:
  • [Retry Now] ← User clicks
  • [Increase Timeout to 300s]
  • [Auto-Approve npm test]

NEW APPROVAL REQUEST:
  User now attentive
  Approves immediately
  Operation executes successfully

Result: Timeout handled gracefully, one-click recovery
```

---

## Implementation Considerations

### Technical Requirements

1. **Message Format**:
   - Structured approval request type
   - Claude Code should recognize and render specially
   - Fallback to text-based format if unsupported

2. **Response Handling**:
   - Button clicks (preferred)
   - Text responses (fallback)
   - Timeout automatic (background timer)

3. **Configuration Persistence**:
   - `.team-sdk-config.json` in repository root
   - Git-ignored by default
   - Backed up on every save

4. **State Management**:
   - Approval requests tracked with unique IDs
   - Timeout timers managed centrally
   - Configuration changes applied immediately

5. **Error Recovery**:
   - Network retry with exponential backoff
   - State preserved across errors
   - Rollback capability for config changes

---

### Integration Points

**With Team SDK**:
- `approval-gates.ts` (CLI mode) provides foundation
- Native mode extends with conversational UI
- Shared configuration format
- Common approval logic

**With Claude Code**:
- Approval requests as special message blocks
- Action buttons rendered inline
- Timeout countdown in UI
- Settings accessible from prompt

**With CollaborativeIntelligence**:
- Agent delegation approval
- Cost tracking across agents
- Whitelist per project/repo
- Session-based learning

---

## Success Metrics

### User Experience Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Average approval time | <5 seconds | Time from prompt to response |
| Timeout rate | <5% | Timeouts / total approvals |
| Configuration abandonment | <10% | Config started but not saved |
| Approval clarity | >4/5 | User rating of prompt clarity |
| Unintended approvals | <1% | User regret rate |
| "Too many prompts" complaints | <5% | User feedback analysis |

### System Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Approval request generation | <100ms | Time to generate prompt |
| UI render time | <200ms | Time to display in UI |
| Response processing | <50ms | Time to process user action |
| Config save time | <100ms | Time to persist settings |
| Timeout accuracy | ±500ms | Actual vs expected timeout |

### Safety Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Post-approval issues | <3% | Problems after approval |
| Dangerous operations blocked | 100% | Blacklist effectiveness |
| Error-state safety | 100% | Fail-closed rate |
| Recovery success rate | >95% | Successful error recoveries |

---

## Future Enhancements

### Phase 2 Features

1. **Machine Learning**:
   - Learn user approval patterns
   - Suggest whitelist additions proactively
   - Predict likely user response
   - Adjust thresholds automatically

2. **Context Awareness**:
   - Different rules per project
   - Time-of-day sensitivity
   - Workload-based adjustments
   - Team-based policies

3. **Advanced Approvals**:
   - Multi-user approval (team settings)
   - Delegated approval authority
   - Approval chains for high-risk ops
   - Emergency override procedures

4. **Analytics**:
   - Approval pattern analysis
   - Cost tracking over time
   - Efficiency metrics dashboard
   - Recommendation engine

---

## Next Steps

### For Implementation Team

1. **Review Specifications**:
   - Read all 3 design documents
   - Validate technical feasibility
   - Identify integration challenges
   - Estimate implementation effort

2. **Create Technical Design**:
   - API design for approval requests
   - State management architecture
   - UI component specifications
   - Configuration schema finalization

3. **Prototype Core Flows**:
   - Basic approval request/response
   - Timeout handling
   - Quick configuration
   - Error recovery

4. **User Testing**:
   - Test with real users
   - Gather feedback on message clarity
   - Validate timeout durations
   - Iterate on design

5. **Production Implementation**:
   - Full feature implementation
   - Comprehensive testing
   - Documentation
   - Deployment

---

## Related Files

### Design Documents
- **APPROVAL_GATES_NATIVE_UX_SPECIFICATION.md** - Complete UX specification
- **APPROVAL_MESSAGE_TEMPLATES.md** - All message templates
- **APPROVAL_GATES_USER_FLOWS.md** - Detailed user flows

### Implementation Reference
- **/integrations/team-sdk/src/approval-gates.ts** - CLI implementation
- **/integrations/team-sdk/test/approval-gates.test.ts** - CLI tests
- **/integrations/team-sdk/src/types.ts** - Type definitions

### Related Documentation
- **/docs/integration/claude-code/NATIVE_AGENT_SDK_SOLUTION.md** - Native mode architecture
- **/TEAM_SDK_INTEGRATION_PLAN.md** - Overall integration plan

---

## Questions for Stakeholders

1. **Timeout Defaults**: Are 60-180s appropriate for different severity levels?
2. **Cost Thresholds**: Is $0.50 per operation a reasonable default limit?
3. **Whitelist Scope**: Should whitelists be per-user, per-project, or both?
4. **Button Labels**: Are "Approve/Deny" clear, or would "Yes/No" be better?
5. **Error Behavior**: Should network errors auto-retry or require user action?
6. **Mobile Support**: Is mobile approval a priority for Phase 1?

---

## Design Credits

**UX Agent** (CollaborativeIntelligence)
- User experience design
- Message template creation
- Flow diagram design
- Accessibility considerations

**Based On**:
- CLI implementation by Team SDK team
- Claude Code integration requirements
- User feedback from beta testing
- Industry best practices for approval gates

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-08 | Initial design complete | UX Agent |

---

**File**: `/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS/UX/APPROVAL_GATES_DESIGN_SUMMARY.md`

**Total Design Package**:
- 4 documents
- 3,050 total lines
- Comprehensive UX specification
- Ready for implementation

**Status**: SPECIFICATION COMPLETE ✅
**Next**: Technical implementation and user testing
