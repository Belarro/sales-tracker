# Memory File Naming Analysis

## Current Inconsistencies

### 1. Naming Patterns Found
- **Standard**: `MEMORY.md` (used by most agents)
- **Agent-prefixed**: `{AgentName}_memory.md` (lowercase 'memory')
- **Legacy naming**: `The{AgentName}_memory.md`
- **Backup files**: `MEMORY.md.bak`

### 2. Specific Inconsistencies

#### Agents with Multiple Memory Files
- **Architect**:
  - `Architect_memory.md`
  - `MEMORY.md`
  
- **Fixer**:
  - `Fixer_memory.md`
  - `MEMORY.md`
  - `TheFixer_memory.md` (legacy from rename)

- **Manager**:
  - `Manager_memory.md`
  - `MEMORY.md`

#### Agents with Backup Files
- **Overviewer**: Has `MEMORY.md.bak`
- **Recommender**: Has `MEMORY.md.bak`

#### Agents Following Standard
Most agents correctly use only `MEMORY.md`

### 3. Root Causes
1. **Incomplete Renaming**: Agent renames left old memory files (TheFixer → Fixer)
2. **Duplicate Patterns**: Some agents have both standard and agent-prefixed versions
3. **Backup Files**: .bak files weren't cleaned up after operations
4. **Template Files**: Streamliner contains template that may propagate inconsistency

## Standardization Recommendations

### 1. Primary Standard
All agents should have a single `MEMORY.md` file containing:
- Long-term memory (core identity)
- Short-term memory (current state)
- Agent-specific memory structures

### 2. Remove Duplicates
- Delete `{AgentName}_memory.md` files after merging content
- Remove legacy files from previous names
- Clean up `.bak` files

### 3. File Structure Standard
```
AGENTS/
└── {AgentName}/
    ├── README.md          # Agent description
    ├── MEMORY.md          # Memory architecture
    ├── ContinuousLearning.md  # Learning framework
    └── Sessions/          # Session records
        └── README.md      # Session index
```

### 4. Content Structure Standard
Each MEMORY.md should follow:
1. Title: `# {AgentName} Memory Architecture`
2. Long-Term Memory section
3. Short-Term Memory section
4. Agent-specific structures as needed

## Implementation Plan

### Phase 1: Clean Duplicates
1. Merge content from duplicate files
2. Delete redundant files
3. Remove backup files

### Phase 2: Standardize Structure
1. Ensure all MEMORY.md follow standard format
2. Update titles to match agent names
3. Verify content organization

### Phase 3: Update Templates
1. Fix Streamliner's template
2. Create standard memory template
3. Document standards

### Phase 4: Validation
1. Create script to check conformity
2. Add to CI/CD pipeline
3. Document in contribution guidelines