# Agent Index Synchronization Command Specification

## Command Structure

The synchronization functionality will be incorporated into the existing CLI tool with the following command structure:

```
ci agent sync-indices [OPTIONS]
```

### Primary Command

- `ci`: Base CLI command
- `agent`: Subcommand for agent-related operations
- `sync-indices`: Specific operation to synchronize agent indices

### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--check` | `-c` | Only check for discrepancies without making changes | `false` |
| `--verbose` | `-v` | Display detailed information during processing | `false` |
| `--force` | `-f` | Force update even if files appear synchronized | `false` |
| `--auto` | `-a` | Enable automatic synchronization after agent operations | `false` |
| `--help` | `-h` | Display help information | - |

## Command Behavior

### Basic Usage

```bash
# Synchronize AGENT_INDEX.md with AGENTS.md
ci agent sync-indices

# Check for discrepancies without making changes
ci agent sync-indices --check

# Detailed output during synchronization
ci agent sync-indices --verbose
```

### Advanced Usage

```bash
# Force regeneration of index regardless of current state
ci agent sync-indices --force

# Enable automatic synchronization after agent operations
ci agent sync-indices --auto

# Check with detailed output
ci agent sync-indices --check --verbose
```

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success - Files synchronized or already in sync |
| 1 | General error - See error message |
| 2 | File access error - Cannot read or write files |
| 3 | Parse error - Issues parsing AGENTS.md |
| 4 | Discrepancies found (when using --check) |

## Output Format

### Standard Output

```
✓ AGENT_INDEX.md successfully synchronized with AGENTS.md
  - 25 agents processed
  - Last updated: 2025-05-17 14:32:15
```

### Verbose Output

```
🔍 Analyzing AGENTS.md...
  - Found 25 agents
  - Located in /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/docs/agent-system/agents-overview.md
  
🔄 Checking current AGENT_INDEX.md...
  - Found 24 agents
  - Located in /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/AGENT_INDEX.md
  
🔔 Discrepancies detected:
  - Missing in index: Developer
  - Different roles: Recommender
  - Different focus descriptions: Cartographer, Manager
  
📝 Updating AGENT_INDEX.md...
  - Generating new content
  - Writing to file
  
✓ Synchronization complete
  - 25 agents processed
  - Last updated: 2025-05-17 14:32:15
```

### Check-Only Mode

```
🔍 Checking for discrepancies...
  - AGENTS.md: 25 agents
  - AGENT_INDEX.md: 24 agents

🔔 Discrepancies found:
  - Missing in index: Developer
  - Different roles: Recommender
  - Different focus descriptions: Cartographer, Manager

ℹ No changes made (check-only mode)
```

## Integration with Other Commands

This command will be integrated with:

1. `ci agent create` - Optional flag to automatically sync after creation
2. `ci agent update` - Optional flag to automatically sync after update
3. `ci agent batch-create` - Optional flag to automatically sync after batch creation

## Configuration

The synchronization can be configured in the global CI configuration:

```toml
[agent]
auto_sync_indices = true   # Always sync after agent operations
verbose_sync = false       # Use verbose output during sync
```

## Help Text

```
ci agent sync-indices - Synchronize AGENTS.md and AGENT_INDEX.md

USAGE:
    ci agent sync-indices [OPTIONS]

OPTIONS:
    -c, --check      Only check for discrepancies without making changes
    -v, --verbose    Display detailed information during processing
    -f, --force      Force update even if files appear synchronized
    -a, --auto       Enable automatic synchronization after agent operations
    -h, --help       Print help information

DESCRIPTION:
    This command ensures consistency between the detailed agent information in 
    AGENTS.md and the summarized listing in AGENT_INDEX.md. It extracts agent 
    names, roles, and focus areas from AGENTS.md and updates AGENT_INDEX.md 
    accordingly.

EXAMPLES:
    ci agent sync-indices
    ci agent sync-indices --check --verbose
    ci agent sync-indices --force
```