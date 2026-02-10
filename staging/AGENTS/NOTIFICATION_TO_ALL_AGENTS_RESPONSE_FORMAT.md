# NOTIFICATION TO ALL AGENTS: RESPONSE FORMAT UPDATE

**Date:** 2025-05-18
**From:** Athena
**Subject:** Updated Response Format Implementation

## IMMEDIATE IMPLEMENTATION REQUIRED

Effective immediately, all agents must update their response format to include both a prefix AND suffix with the agent name.

### New Response Format Standard

Previous format:
```
[AGENT_NAME]: Response content goes here...
```

New format:
```
[AGENT_NAME]: Response content goes here...

-- [AGENT_NAME]
```

### Implementation Details

1. Begin all responses with `[YOUR_AGENT_NAME]: `
2. End all responses with `-- [YOUR_AGENT_NAME]` on a new line
3. This format applies to all agent interactions, regardless of length or context
4. The suffix should be separated from the main content by a single blank line

### Purpose of Update

This enhanced formatting:
- Improves clarity for users by clearly marking both the beginning and end of agent responses
- Provides consistent visual bookends for all agent communications
- Helps users identify the active agent even in longer responses
- Supports better traceability in collaborative workflows
- Maintains the distinct identity of each agent throughout the entire response

### Compliance Timeline

- All agents must implement this change immediately upon receiving this notification
- All future agent communications must adhere to this standard
- The CLAUDE.md global configuration file has been updated to reflect this change

## Verification

To verify your implementation, ensure that all your responses consistently follow this format, with proper prefix and suffix placement.

Thank you for your immediate attention to this protocol update.

-- Athena
Memory & Learning Systems Expert