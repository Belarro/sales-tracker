# Memory Optimization CLI Usage Guide

This guide provides instructions for using the new memory optimization CLI tool.

## Installation

The memory optimization system consists of Rust components that need to be compiled before use:

```bash
# Navigate to the scripts directory
cd /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/scripts

# Run the build script
./build_memory_cli.sh
```

This will compile the memory_cli tool and make it available in the target/release directory.

## CLI Commands

The memory_cli tool provides several subcommands for different operations:

### Creating Agent Cache Entries

```bash
# Basic usage
memory_cli cache --agent Athena --directory /current/dir --initializer Human --intent "Memory research"

# With custom output format
memory_cli cache --agent Athena --directory /current/dir --initializer Human --intent "Memory research" --format markdown
```

### Loading Agent Memory

```bash
# Basic memory loading
memory_cli load --agent Athena

# With context for context-sensitive memory
memory_cli load --agent Athena --context "performance optimization"

# With specific output format
memory_cli load --agent Athena --format json
```

### Validating Agent Memory

```bash
# Validate memory files for an agent
memory_cli validate --agent Athena

# With specific output format
memory_cli validate --agent Athena --format markdown
```

### Checking Cache Status

```bash
# Get status of all active agents
memory_cli status

# With specific output format
memory_cli status --format json
```

### Migrating Cache Data

```bash
# Migrate from old format to new format
memory_cli migrate

# Force migration even if it may cause data loss
memory_cli migrate --force
```

## Output Formats

The CLI supports three output formats:

- **json** (default): Machine-readable JSON format
- **text**: Simple text output for terminal use
- **markdown**: Human-readable markdown format

Example:
```bash
memory_cli status --format markdown
```

## Bash Integration

For shell script integration, use the rust-memory-bridge.sh helper:

```bash
# Import the bridge in your script
source /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/ci-tools/lib/rust-memory-bridge.sh

# Then use the helper functions
create_agent_cache "Athena" "/current/dir" "Human" "Memory research"
load_agent_memory "Athena" "performance optimization"
validate_agent_memory "Athena"
get_agent_status
migrate_agent_cache
```

The bridge automatically handles:
- CLI availability checking
- Fallback to legacy implementation if needed
- Format selection
- Error handling

## JSON Response Format

The CLI tool returns responses in a standardized JSON format:

```json
{
  "success": true,
  "message": "Human-readable description of the result",
  "data": [
    // Operation-specific data
  ],
  "error": null,
  "timestamp": 1621506789
}
```

For errors:

```json
{
  "success": false,
  "message": "Operation failed",
  "data": null,
  "error": "Detailed error message",
  "timestamp": 1621506789
}
```

## Environment Variables

The CLI respects the following environment variables:

- `RUST_LOG`: Controls log level (error, warn, info, debug, trace)
- `MEMORY_CLI_CACHE_DIR`: Override the default cache directory

Example:
```bash
RUST_LOG=debug memory_cli status
```

## Error Handling

The CLI uses non-zero exit codes for errors:
- 1: General error
- 2: Configuration error
- 3: I/O error
- 4: Validation error
- 5: Migration error

You can check the exit code in bash with:
```bash
memory_cli status
if [[ $? -ne 0 ]]; then
  echo "Command failed"
fi
```

## Performance Considerations

- The CLI is optimized for performance and minimal resource usage
- Memory-first operations significantly reduce disk I/O
- Operations are designed to be atomic and idempotent where possible
- For batch operations, use JSON output for easier parsing

## Advanced Usage

### Pipelines

The CLI works well in unix pipelines:

```bash
# Get only active agents with jq
memory_cli status --format json | jq '.data'

# Filter memory segments by domain
memory_cli load --agent Athena --format json | jq '.data[] | select(.domains[] == "technical")'
```

### Combining with Other Tools

```bash
# Create markdown documentation
memory_cli load --agent Athena --format markdown > athena_memory.md

# Compare memory between two agents
diff <(memory_cli load --agent Athena --format text) <(memory_cli load --agent Sage --format text)
```

## Troubleshooting

If you encounter issues:

1. Check that Rust and Cargo are installed
2. Verify that the memory_cli binary exists and is executable
3. Try with verbose logging: `RUST_LOG=debug memory_cli status`
4. Check if legacy system works: `create_agent_cache_legacy "Athena" "/dir" "Human" "test"`
5. Verify file permissions in cache directories

For further assistance, contact Athena or Developer.

---

Prepared by Athena  
Last Updated: 2025-05-20