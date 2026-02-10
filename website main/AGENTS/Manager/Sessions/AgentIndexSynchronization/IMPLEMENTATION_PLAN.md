# Agent Index Synchronization Implementation Plan

## Overview

This document outlines the detailed implementation plan for adding the agent index synchronization module to our Rust CLI tool. The plan is structured in phases to ensure a systematic, testable approach to development.

## Project Structure

The module will be added to the existing CLI codebase with the following structure:

```
src/
├── commands/
│   ├── agent/
│   │   ├── mod.rs                 (updated to include sync_indices)
│   │   ├── create.rs              (existing)
│   │   ├── update.rs              (existing)
│   │   └── sync_indices.rs        (new)
│   └── mod.rs                     (updated to expose new commands)
│
├── lib/
│   ├── agent/
│   │   ├── mod.rs                 (updated)
│   │   ├── parser.rs              (new - for parsing AGENTS.md)
│   │   ├── index_generator.rs     (new - for generating AGENT_INDEX.md)
│   │   └── sync_checker.rs        (new - for checking discrepancies)
│   └── mod.rs                     (updated)
│
├── models/
│   ├── agent.rs                   (updated with new structures)
│   └── mod.rs                     (updated)
│
└── utils/
    ├── file_ops.rs                (updated if needed)
    └── mod.rs                     (unchanged)
```

## Implementation Phases

### Phase 1: Core Functionality (Days 1-2)

1. **Create Data Models**
   - Define `AgentInfo` struct to hold parsed agent data
   - Define `SyncResult` struct to represent comparison results
   - Define enums for discrepancy types

2. **Implement Parser for AGENTS.md**
   - Create regex patterns for extracting agent information
   - Implement parsing logic to extract name, role, and focus
   - Add error handling for malformed input
   - Write unit tests for parser

3. **Implement Index Generator**
   - Create function to generate markdown table from agent info
   - Implement sorting logic for consistent ordering
   - Add functionality to write to AGENT_INDEX.md
   - Write unit tests for generator

4. **Implement Sync Checker**
   - Create functions to compare parsed agent info with index content
   - Implement discrepancy detection logic
   - Add reporting functionality for identified issues
   - Write unit tests for checker

### Phase 2: Command Integration (Days 3-4)

1. **Create Command Implementation**
   - Implement `sync_indices` command in `commands/agent/sync_indices.rs`
   - Define command-line arguments and options
   - Implement main command flow
   - Add proper error handling and reporting

2. **Update Existing Commands**
   - Modify `create.rs` to support automatic synchronization
   - Modify `update.rs` to support automatic synchronization
   - Ensure proper command registration in `mod.rs`

3. **Add Configuration Support**
   - Update configuration structures to include sync-related options
   - Implement loading of sync configuration from project settings

4. **Write Integration Tests**
   - Create tests with sample AGENTS.md and AGENT_INDEX.md files
   - Test various command combinations and options
   - Verify correct behavior for all error conditions

### Phase 3: Refinement and Documentation (Day 5)

1. **Performance Optimization**
   - Profile command execution time
   - Optimize regex patterns if needed
   - Add caching mechanisms if beneficial

2. **Documentation**
   - Add rustdoc comments to all public functions and structs
   - Create examples for README.md
   - Document integration with other commands
   - Update user manual with new command

3. **Final Testing**
   - Conduct edge case testing
   - Test with very large agent files
   - Verify all error conditions are handled gracefully

4. **Code Review Preparation**
   - Ensure code style consistency
   - Verify test coverage
   - Prepare pull request

## Implementation Details

### AgentInfo Structure

```rust
#[derive(Debug, Clone, PartialEq)]
pub struct AgentInfo {
    pub name: String,
    pub role: String,
    pub focus: String,
}
```

### Parser Implementation

```rust
pub fn parse_agents_file(file_path: &Path) -> Result<Vec<AgentInfo>, Error> {
    let content = fs::read_to_string(file_path)?;
    
    let agent_pattern = Regex::new(
        r"### ([^-\n]+) - ([^\n]+)\n(?:.*?\n)*?- \*\*Focus\*\*: ([^\n]+)"
    )?;
    
    let mut agents = Vec::new();
    
    for captures in agent_pattern.captures_iter(&content) {
        agents.push(AgentInfo {
            name: captures[1].trim().to_string(),
            role: captures[2].trim().to_string(),
            focus: captures[3].trim().to_string(),
        });
    }
    
    Ok(agents)
}
```

### Index Generator

```rust
pub fn generate_agent_index(
    agents: &[AgentInfo], 
    file_path: &Path
) -> Result<(), Error> {
    let mut content = String::from("# Agent Index\n\n");
    content.push_str("| Agent Name | Role | Focus |\n");
    content.push_str("|------------|------|-------|\n");
    
    // Sort agents by name
    let mut sorted_agents = agents.to_vec();
    sorted_agents.sort_by(|a, b| a.name.cmp(&b.name));
    
    for agent in sorted_agents {
        content.push_str(&format!(
            "| {} | {} | {} |\n", 
            agent.name, agent.role, agent.focus
        ));
    }
    
    fs::write(file_path, content)?;
    
    Ok(())
}
```

### Discrepancy Checking

```rust
#[derive(Debug, PartialEq)]
pub enum DiscrepancyType {
    MissingFromIndex(String),
    MissingFromMain(String),
    DifferentRole { name: String, main: String, index: String },
    DifferentFocus { name: String, main: String, index: String },
}

pub struct SyncResult {
    pub has_discrepancies: bool,
    pub discrepancies: Vec<DiscrepancyType>,
}

pub fn check_discrepancies(
    main_agents: &[AgentInfo], 
    index_agents: &[AgentInfo]
) -> SyncResult {
    // Implementation details...
}
```

### Command Implementation

```rust
pub fn execute(args: &ArgMatches) -> Result<(), Error> {
    let check_only = args.is_present("check");
    let verbose = args.is_present("verbose");
    let force = args.is_present("force");
    
    // Implementation details...
}
```

## Dependencies

- `regex`: For parsing AGENTS.md
- `clap`: For command-line argument parsing (already used in project)
- `chrono`: For timestamping (already used in project)
- `colored`: For terminal coloring (already used in project)

## Testing Strategy

1. **Unit Tests**
   - Test parser with various input formats
   - Test index generator with different agent collections
   - Test discrepancy checker with various scenarios

2. **Integration Tests**
   - Test end-to-end functionality with sample files
   - Test error handling with malformed files
   - Test command-line options

3. **Edge Cases**
   - Empty AGENTS.md file
   - Missing AGENT_INDEX.md file
   - Malformed agent entries
   - Very large number of agents

## Success Criteria

- All unit and integration tests pass
- Command correctly identifies discrepancies
- Index generation matches expected format
- Automatic synchronization works with create/update commands
- Performance meets sub-50ms target for typical agent counts

## Rollout Plan

1. Implement and test in development environment
2. Create pull request for code review
3. Address feedback and finalize implementation
4. Merge to main branch
5. Update documentation
6. Release as part of next CLI version

## Future Enhancements

- Add support for custom index formats
- Implement two-way synchronization
- Add graphical representation of agent relationships
- Support for categorizing agents in the index