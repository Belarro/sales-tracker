# Memory Bridge Usage Examples

This document provides practical examples of using the enhanced memory bridge features, including segmentation and compression.

## Basic Memory Bridge Operations

### Initialize Database

```bash
# Initialize a new memory database
./ci-tools/lib/rust-memory-bridge.sh init_database

# Initialize with force option (overwrites existing)
./ci-tools/lib/rust-memory-bridge.sh init_database true
```

### Set Memory Mode

```bash
# Use database-only mode
./ci-tools/lib/rust-memory-bridge.sh set_memory_mode db

# Use legacy-only mode
./ci-tools/lib/rust-memory-bridge.sh set_memory_mode legacy

# Use dual mode (both systems)
./ci-tools/lib/rust-memory-bridge.sh set_memory_mode dual
```

### Get Memory System Status

```bash
# Get status in default format (json)
./ci-tools/lib/rust-memory-bridge.sh get_memory_system_status

# Get status in markdown format
./ci-tools/lib/rust-memory-bridge.sh get_memory_system_status markdown
```

## Memory Segmentation Examples

### Configure Segmentation

```bash
# Enable segmentation with default settings
./ci-tools/lib/rust-memory-bridge.sh set_memory_segmentation true

# Configure with custom segment size and overlap
./ci-tools/lib/rust-memory-bridge.sh set_memory_segmentation true 8192 512

# Disable segmentation
./ci-tools/lib/rust-memory-bridge.sh set_memory_segmentation false
```

### Load Specific Memory Segments

```bash
# Load all segments for an agent (with segmentation enabled)
./ci-tools/lib/rust-memory-bridge.sh load_agent_memory "Athena" "general" "markdown"

# Load a specific context with segmentation
./ci-tools/lib/rust-memory-bridge.sh load_agent_memory "Athena" "memory_optimization" "markdown"

# Load a specific segment by ID
./ci-tools/lib/rust-memory-bridge.sh load_agent_memory "Athena" "memory_optimization" "markdown" "segment-123"
```

## Memory Compression Integration

While compression is primarily handled by the Rust components, you can integrate it with the memory bridge:

### Creating Agent Cache with Compression

```bash
# Export compression settings for the bridge
export MEMORY_COMPRESSION_ENABLED=true
export MEMORY_COMPRESSION_METHOD=hybrid
export MEMORY_COMPRESSION_LEVEL=6

# Create agent cache (with compression settings active)
./ci-tools/lib/rust-memory-bridge.sh create_agent_cache "Athena" "/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence" "memory_optimization" "Testing memory compression"
```

### Working with Compressed Memory

```bash
# Load and automatically decompress memory
./ci-tools/lib/rust-memory-bridge.sh load_agent_memory "Athena" "general" "markdown"
```

## Advanced Usage Examples

### Full Agent Memory Migration

```bash
# Migrate a single agent to the new database
./ci-tools/lib/rust-memory-bridge.sh migrate_agent_memory "Athena" false

# Migrate all agents with force option
./ci-tools/lib/rust-memory-bridge.sh migrate_agent_memory "all" true

# Migrate and compress in one operation
export MEMORY_COMPRESSION_ENABLED=true
./ci-tools/lib/rust-memory-bridge.sh migrate_agent_memory "Athena" true
```

### Memory Validation

```bash
# Validate an agent's memory integrity
./ci-tools/lib/rust-memory-bridge.sh validate_agent_memory "Athena"

# Validate and output in JSON format
./ci-tools/lib/rust-memory-bridge.sh validate_agent_memory "Athena" "json"
```

## Integration with Shell Scripts

### Sourcing the Bridge in Scripts

```bash
#!/usr/bin/env bash
# Example script using memory bridge functions

# Source the memory bridge
source "$(dirname "$0")/../lib/rust-memory-bridge.sh"

# Enable debug logging
export MEMORY_BRIDGE_DEBUG=true

# Set up configuration
set_memory_mode "dual"
set_memory_segmentation true 4096 256

# Load agent memory with segmentation
agent_memory=$(load_agent_memory "Athena" "memory_optimization" "markdown")

# Process the memory data
echo "Loaded memory for Athena:"
echo "$agent_memory"
```

### Using in Agent Activation Scripts

```bash
#!/usr/bin/env bash
# Example agent activation with memory optimization

# Source the memory bridge
source "$(dirname "$0")/../lib/rust-memory-bridge.sh"

# Get agent name from arguments
agent_name="$1"
context="${2:-general}"

# Use optimized memory loading if available
if [[ "$MEMORY_OPTIMIZATION_AVAILABLE" == "true" ]]; then
  # Enable segmentation for large memory files
  if [[ "$agent_name" == "Athena" || "$agent_name" == "Scholar" ]]; then
    set_memory_segmentation true 8192 512
  else
    set_memory_segmentation true 4096 256
  fi
  
  # Load memory with optimization
  agent_memory=$(load_agent_memory "$agent_name" "$context" "markdown")
else
  # Fall back to legacy loading
  agent_memory=$(cat "/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS/$agent_name/MEMORY.md")
fi

# Create cache entry
create_agent_cache "$agent_name" "$(pwd)" "$context" "Activating with optimized memory"

# Display memory to stdout for agent context
echo "$agent_memory"
```

## Performance Testing Examples

### Benchmarking Memory Loading Times

```bash
#!/usr/bin/env bash
# Memory loading benchmark

# Source the memory bridge
source "$(dirname "$0")/../lib/rust-memory-bridge.sh"

agent_name="Athena"
iterations=10

# Test legacy mode
set_memory_mode "legacy"
set_memory_segmentation false

echo "Testing legacy mode:"
start_time=$(date +%s.%N)
for ((i=1; i<=$iterations; i++)); do
  load_agent_memory "$agent_name" "general" "markdown" > /dev/null
done
end_time=$(date +%s.%N)
legacy_time=$(echo "$end_time - $start_time" | bc)
echo "Legacy mode took $legacy_time seconds for $iterations iterations"

# Test optimized mode with segmentation
set_memory_mode "db"
set_memory_segmentation true 4096 256

echo "Testing optimized mode:"
start_time=$(date +%s.%N)
for ((i=1; i<=$iterations; i++)); do
  load_agent_memory "$agent_name" "general" "markdown" > /dev/null
done
end_time=$(date +%s.%N)
optimized_time=$(echo "$end_time - $start_time" | bc)
echo "Optimized mode took $optimized_time seconds for $iterations iterations"

# Calculate improvement
improvement=$(echo "scale=2; (($legacy_time - $optimized_time) / $legacy_time) * 100" | bc)
echo "Improvement: $improvement%"
```

## Error Handling Examples

### Using the New Error Handling

```bash
#!/usr/bin/env bash
# Example showing error handling

# Source the memory bridge
source "$(dirname "$0")/../lib/rust-memory-bridge.sh"

# Attempt to load memory for non-existent agent
if load_agent_memory "NonExistentAgent" "general" "markdown" > /dev/null; then
  echo "Successfully loaded memory (unexpected)"
else
  error_code=$?
  echo "Failed to load memory with error code: $error_code"
fi

# Attempt database operations with validation
if ! check_database; then
  echo "Database not available, initializing..."
  if init_database; then
    echo "Database initialized successfully"
  else
    error_log 100 "Failed to initialize database, falling back to legacy mode"
    set_memory_mode "legacy"
  fi
fi
```

## Integration with Rust Memory Commands

The memory bridge provides a seamless way to interact with Rust-based memory tools. Here's how to use them together:

```bash
#!/usr/bin/env bash
# Example showing Rust tool integration

# Source the memory bridge
source "$(dirname "$0")/../lib/rust-memory-bridge.sh"

# Prepare directories
memory_cli_dir="/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/target/release"
agent_name="Athena"
agent_dir="/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS/$agent_name"

# Use Rust memory tools directly if available
if [[ -x "$memory_cli_dir/memory_compression" ]]; then
  echo "Using Rust memory compression tool..."
  
  # Compress memory file
  "$memory_cli_dir/memory_compression" compress \
    --input "$agent_dir/MEMORY.md" \
    --output "$agent_dir/MEMORY.compressed" \
    --method hybrid \
    --level 9
    
  echo "Memory compressed successfully"
  
  # Use the memory bridge to load the compressed memory
  load_agent_memory "$agent_name" "general" "markdown"
else
  echo "Rust memory tools not available, using bridge functions only"
  
  # Use bridge functions
  set_memory_mode "legacy"
  load_agent_memory "$agent_name" "general" "markdown"
fi
```

---

These examples demonstrate the versatility and power of the enhanced memory bridge system with its segmentation and compression capabilities. The bridge provides a unified interface to both legacy and optimized components while enabling advanced memory management features.

Prepared by Athena
Date: 2025-05-20