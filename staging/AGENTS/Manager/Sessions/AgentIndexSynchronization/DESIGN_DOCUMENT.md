# Agent Index Synchronization Module Design

## Overview
The Agent Index Synchronization Module will be a component of our Rust CLI tool that ensures consistency between the canonical agent information in `AGENTS.md` and the summarized agent listing in `AGENT_INDEX.md`.

## Problem Statement
Currently, the `AGENTS.md` and `AGENT_INDEX.md` files can become out of sync when new agents are added or existing agents are modified. This occurs because:

1. Agent creation or updates modify `AGENTS.md` through the Streamliner's `update-agent-registry.py` script
2. The `AGENT_INDEX.md` file is not automatically updated to reflect these changes
3. Manual updates to either file can introduce inconsistencies

## Solution Design

### Command Structure
```
ci agent sync-indices [--check] [--verbose]
```

Options:
- `--check`: Only check for discrepancies without making changes
- `--verbose`: Display detailed information during processing

### Module Components

#### 1. AgentsParser
- Responsible for parsing the `AGENTS.md` file to extract agent information
- Uses regex patterns to identify agent sections and extract name, role, and focus
- Returns a structured representation of all agents

#### 2. IndexGenerator
- Takes parsed agent information and generates the `AGENT_INDEX.md` file
- Sorts agents alphabetically by name
- Creates consistent table format with headers

#### 3. SyncChecker
- Compares the content of `AGENTS.md` and `AGENT_INDEX.md` 
- Identifies discrepancies including:
  - Agents missing from the index
  - Agents in the index but not in the main file
  - Differences in role or focus descriptions

#### 4. SyncCommand
- Main command implementation that integrates the above components
- Handles command-line arguments
- Executes the appropriate operations (check or update)
- Provides feedback to the user

### Workflow

1. Parse command-line arguments to determine execution mode
2. Use AgentsParser to extract information from AGENTS.md
3. If in check-only mode:
   - Use SyncChecker to identify and report discrepancies
   - Exit without making changes
4. If in update mode:
   - First check for discrepancies (optional reporting with --verbose)
   - If discrepancies exist, generate new AGENT_INDEX.md
   - Report success and statistics (agents processed, etc.)

### Error Handling

The module will handle various error conditions including:
- Missing files
- Permission issues
- Malformed file content
- Regex matching failures

All errors will be clearly reported with specific error codes and messages.

## Integration

This module will be integrated with:

1. The agent creation command to automatically sync indices after agent creation
2. The agent update command to ensure indices remain in sync
3. Available as a standalone command for manual execution

## Performance Considerations

- The implementation will use efficient parsing techniques
- Files will only be rewritten when actual changes are needed
- Operations are optimized for the expected file sizes (dozens of agents)

## Testing Strategy

1. Unit tests for each component
2. Integration tests with sample AGENTS.md and AGENT_INDEX.md files
3. Edge case testing with malformed input files
4. Performance testing with large agent counts

## Implementation Plan

### Phase 1: Basic Implementation
- Implement core parsing and generation logic
- Create standalone command

### Phase 2: Integration
- Connect to agent creation and update workflows
- Add error handling and reporting

### Phase 3: Testing and Refinement
- Comprehensive test suite
- Performance optimization if needed
- Documentation

## Metrics for Success

1. Zero manual synchronization needed after implementation
2. Clear reporting of any discrepancies
3. <50ms execution time for typical agent counts
4. 100% accuracy in maintaining consistency between files