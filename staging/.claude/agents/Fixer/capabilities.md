# Fixer Agent - Capabilities & Routing Rules

## Quick Reference

**Primary Function**: Critical issue resolution coordinator
**Activation Keywords**: bug, error, crash, fix, broken, failing, critical, emergency
**Default Team**: Developer + Debugger
**Response Time**: <30 seconds to team assembly

## Routing Rules

### Trigger Patterns

Fixer activates when user input matches these patterns:

#### Critical Keywords
- `critical`, `urgent`, `emergency`, `p0`, `sev1`
- `crash`, `down`, `outage`, `failure`
- `broken`, `not working`, `stopped working`

#### Issue Keywords
- `bug`, `error`, `issue`, `problem`
- `failing`, `failed`, `fails`
- `exception`, `stacktrace`, `traceback`

#### Action Keywords
- `fix`, `repair`, `resolve`, `debug`
- `investigate bug`, `solve error`

### Pattern Matching Logic

```bash
# In agent-orchestrator.sh
route_pattern_fixer() {
    local input="$1"

    # Critical priority patterns (immediate Fixer activation)
    if [[ "$input" =~ (critical|urgent|emergency|sev1|p0) ]]; then
        return 0  # Activate Fixer with high priority
    fi

    # Bug/error patterns
    if [[ "$input" =~ (bug|error|crash|broken|failing) ]]; then
        return 0  # Activate Fixer
    fi

    # Fix action patterns
    if [[ "$input" =~ fix[[:space:]]+(.*)(bug|error|issue|problem) ]]; then
        return 0  # Activate Fixer
    fi

    return 1  # Do not activate Fixer
}
```

## Complexity Assessment Rules

### Low Complexity

**Indicators**:
- Single file/component mentioned
- Simple/minor/cosmetic in description
- Typo, formatting, documentation issues
- Clear error message with obvious cause

**Examples**:
- "fix typo in README"
- "simple bug in validation function"
- "minor UI alignment issue"

**Team Composition**: Developer + Debugger

**Estimated Resolution**: <1 hour

### Medium Complexity

**Indicators**:
- Multiple components/files affected
- Integration points mentioned
- API, database, authentication issues
- Performance degradation
- Regression from recent changes

**Examples**:
- "authentication failing after login"
- "API returning 500 errors intermittently"
- "database queries timing out"
- "memory usage increasing over time"

**Team Composition**: Developer + Debugger + Tester

**Estimated Resolution**: 1-4 hours

### High Complexity

**Indicators**:
- System-wide impact
- Architecture/design issues
- Security vulnerabilities
- Critical production issues
- Multiple subsystems involved
- Root cause unclear

**Examples**:
- "production crashes every 5 minutes"
- "security vulnerability in auth system"
- "cascade failure across microservices"
- "architectural flaw causing race conditions"

**Team Composition**: Developer + Debugger + Tester + Architect

**Estimated Resolution**: 4+ hours

## Dynamic Team Selection

### Base Team (Always Included)
- **Developer**: Implements the fix
- **Debugger**: Analyzes root cause

### Conditional Additions

#### Add Tester When:
- Medium or high complexity
- Multiple components affected
- Regression risk present
- Integration testing needed
- User-facing functionality

#### Add Architect When:
- High complexity only
- System design involved
- Architecture changes needed
- Security implications
- Performance critical path
- Scalability concerns

#### Add UI When:
- Frontend/interface issues
- Visual bugs
- User experience problems
- Accessibility issues

#### Add Database When:
- Data integrity issues
- Schema problems
- Query optimization needed
- Transaction failures

## Capability Matrix

| Capability | Developer | Debugger | Tester | Architect | UI | Database |
|------------|-----------|----------|--------|-----------|----|----|
| Code fixes | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Root cause analysis | ⚠️ | ✅ | ⚠️ | ✅ | ❌ | ⚠️ |
| Testing/validation | ⚠️ | ⚠️ | ✅ | ❌ | ⚠️ | ❌ |
| Architecture review | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| UI fixes | ⚠️ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Data fixes | ⚠️ | ❌ | ❌ | ❌ | ❌ | ✅ |

Legend: ✅ Primary | ⚠️ Secondary | ❌ Not responsible

## Response Protocols

### Immediate Response (< 1 minute)
- Team assembly complete
- Initial diagnosis started
- Communication channels established
- Context gathered

### Short-term Response (< 30 minutes)
- Root cause identified or narrowed down
- Fix approach determined
- Implementation begun
- Progress updates provided

### Resolution Target
- **Low complexity**: < 1 hour
- **Medium complexity**: < 4 hours
- **High complexity**: < 1 day

## Context Gathering

When Fixer activates, it automatically gathers:

### From Git
- Current branch
- Recent commits
- Modified files
- Unstaged changes

### From Project
- Project type (detected from files)
- Framework/language
- Dependencies
- Test setup

### From User
- Issue description
- Steps to reproduce (if provided)
- Expected vs actual behavior
- Error messages/logs

## Escalation Rules

### Escalate to Manual Mode When:
- User specifies custom team composition
- Issue requires domain-specific expertise
- External dependencies block progress
- Multiple failed resolution attempts

### Escalate Priority When:
- Production system affected
- Security vulnerability confirmed
- Data loss risk identified
- User count impacted > threshold

## Success Validation

Before marking issue as resolved, verify:
1. ✅ Root cause identified and documented
2. ✅ Fix implemented and code reviewed
3. ✅ Tests pass (existing + new tests added)
4. ✅ No regressions introduced
5. ✅ User confirms issue resolved (if applicable)
6. ✅ Documentation updated

## Learning and Improvement

After each resolution, Fixer updates:

### Issue Patterns Database
```json
{
  "issue_type": "authentication_failure",
  "complexity": "medium",
  "team_used": ["developer", "debugger", "tester"],
  "resolution_time": "2.5 hours",
  "success": true,
  "patterns_observed": ["jwt_expiration", "token_validation"]
}
```

### Team Effectiveness Metrics
```json
{
  "team_composition": "developer+debugger",
  "success_rate": 0.92,
  "avg_resolution_time": "1.2 hours",
  "issue_types": ["low_complexity"]
}
```

## Integration Examples

### Example 1: Simple Bug
```bash
User: "fix bug in login validation"

Fixer Analysis:
- Keywords: fix, bug, login, validation
- Complexity: Medium (auth-related)
- Team: developer, debugger, tester

Output: [Fixer]: Assembling team for authentication bug fix -- Fixer
        Complexity: Medium
        Team: Developer, Debugger, Tester
        Estimated: 2-3 hours
```

### Example 2: Critical Production Issue
```bash
User: "emergency: production API crashing every 5 minutes"

Fixer Analysis:
- Keywords: emergency, production, crashing, API
- Complexity: High (critical + system-wide)
- Team: developer, debugger, tester, architect

Output: [Fixer]: 🚨 CRITICAL ISSUE DETECTED 🚨 -- Fixer
        Priority: P0
        Team: Developer, Debugger, Tester, Architect
        Status: Immediate response mode activated
```

### Example 3: Documentation Fix
```bash
User: "fix typo in API documentation"

Fixer Analysis:
- Keywords: fix, typo, documentation
- Complexity: Low (docs only)
- Team: developer

Output: [Fixer]: Simple documentation fix identified -- Fixer
        Complexity: Low
        Team: Developer
        Estimated: <15 minutes
```

## Command Integration

### Fixer-Specific Commands (Future Phase 2)
```bash
/fix <description>              # Direct Fixer activation
/fix status                     # Current issues being resolved
/fix history                    # Recent fixes
/fix patterns                   # Common issue patterns learned
```

### Current Phase 1 Integration
```bash
/team fix <description>         # Routes to Fixer
/team <description>             # Auto-routes if patterns match
```

## Performance Benchmarks

Target performance metrics:

- **Pattern Matching**: <10ms
- **Complexity Assessment**: <50ms
- **Team Selection**: <100ms
- **Total Routing Time**: <200ms
- **First Response**: <30s

## Error Handling

### When Fixer Cannot Route
1. Display available smart routing agents
2. Suggest manual team creation
3. Offer intent-based alternatives
4. Fall back to Phase 0.5 intent detection

### When Team Selection Unclear
1. Default to base team (Developer + Debugger)
2. Notify user of uncertainty
3. Offer to add specialists manually
4. Proceed with conservative approach

---

**Version**: 1.0.0
**Last Updated**: 2025-09-30
**Integration Status**: Phase 1 Development