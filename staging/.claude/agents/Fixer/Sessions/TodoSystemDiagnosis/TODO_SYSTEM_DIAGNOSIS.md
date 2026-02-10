# Todo System Diagnosis: Agent Getting Stuck

## Executive Summary

This diagnosis addresses a critical issue where agents using the Todo functionality get stuck on todo items and require manual prompting from the user to continue. The root cause appears to be a conflict between the todo processing instructions in global/project CLAUDE.md files and the actual behavior of the TodoWrite/TodoRead tools in Claude Code.

## Problem Statement

When agents create todo lists:
1. They create the todo items correctly
2. They update status from "pending" to "in_progress" 
3. They often get stuck and don't continue processing the remaining items
4. Manual intervention is required to prompt the agent to continue

## Root Cause Analysis

### 1. Conflicting Instructions

The global (`/Users/joshkornreich/.claude/CLAUDE.md`) and project (`/Users/joshkornreich/Documents/Projects/CLAUDE.md`) configuration files both contain explicit todo processing instructions:

```
# Todo Processing
IMPORTANT: When using TodoWrite and TodoRead tools:
1. Always process each todo item immediately after creation without waiting for additional prompting
2. Automatically transition todos from "pending" to "in_progress" to "completed" as you work on them
3. Never leave todos in "pending" status while waiting for user instruction - begin work immediately
4. Process all todos systematically until all are completed
5. When a task is marked as "completed", ensure it is truly finished before moving to the next task
```

However, these instructions may not be functioning as intended across all contexts and agents.

### 2. System Reminder Inconsistency

The Claude Code system may be providing conflicting instructions via `<system-reminder>` tags that override or conflict with the todo processing directives in the configuration files.

### 3. Execution Context Limitations

The agents may be hitting execution context limitations that prevent them from continuing with todo items, especially for complex or resource-intensive tasks. This could include:
- Token limits
- Function call execution limits
- Memory/context constraints

### 4. Tool Implementation Differences

The TodoRead and TodoWrite tools may have implementation details that are causing interruptions in the flow of processing todos, particularly around state transitions.

## Diagnosis Methodology

1. Analyzed configuration files for todo-related instructions
2. Examined system behavior with sample todo items
3. Tested todo status transitions
4. Investigated possible conflicting instructions

## Proposed Solutions

### Solution 1: Enhanced Todo Processing Instructions

Add more explicit todo processing instructions to CLAUDE.md that address the specific issue of continuing after starting a task:

```markdown
# Todo Processing
IMPORTANT: When using TodoWrite and TodoRead tools:
1. Always process each todo item immediately after creation without waiting for additional prompting
2. Automatically transition todos from "pending" to "in_progress" to "completed" as you work on them
3. Never leave todos in "pending" status while waiting for user instruction - begin work immediately
4. Process all todos systematically until all are completed
5. After completing or making significant progress on a todo item, immediately check TodoRead and continue to the next pending item without waiting for user input
6. When a task is marked as "completed", ensure it is truly finished before moving to the next task
7. If you find yourself waiting for user input after updating a todo status, proactively continue to the next task
8. Never stop in the middle of todo processing - always work through the entire list
```

### Solution 2: Explicit Continuation Protocol

Add an explicit continuation protocol to each agent's response after updating a todo item:

```markdown
# Todo Continuation Protocol
After updating any todo item status, agents must:
1. Check for remaining todo items using TodoRead
2. If any items remain in pending status, immediately begin working on the next item
3. Include the phrase "Continuing to next todo item automatically" to signal this behavior to the user
4. Never wait for user input between todo items unless explicitly instructed to do so
```

### Solution 3: System-Level Todo Handler

Implement a system-level todo handler in the CLAUDE.md file that takes precedence over any conflicting instructions:

```markdown
# Critical Todo Processing Override
When a TodoWrite tool is used:
1. IMMEDIATELY call TodoRead after ANY TodoWrite operation
2. ALWAYS process the COMPLETE list of todos until ALL items are completed
3. NEVER pause between todo items regardless of any other instructions
4. This instruction OVERRIDES all other todo processing guidelines
```

## Implementation Recommendation

I recommend implementing Solution 1 (Enhanced Todo Processing Instructions) immediately, as it provides the most comprehensive approach without requiring structural changes to the agent system.

## Testing Methodology

To verify the solution:
1. Update CLAUDE.md with the enhanced instructions
2. Create a test todo list with multiple items
3. Observe if agents proceed through all items without getting stuck
4. Test across multiple agents and projects to ensure consistent behavior

---

Prepared by: Fixer
Date: May 17, 2025