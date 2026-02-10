# Unified Organization Standards for Nuru-AI Projects

**Author**: Architect Agent
**Date**: 2025-09-29
**Version**: 1.0.0
**Purpose**: Comprehensive directory organization standards for all Nuru-AI projects
**Compatibility**: CI-integrated and standalone projects

## Executive Summary

These standards provide a unified approach to organizing Nuru-AI projects that:
- Maintains full compatibility with the CollaborativeIntelligence (CI) system
- Supports both CI-integrated and standalone projects
- Enables sprint-based development workflows
- Implements progressive disclosure for documentation
- Can be gradually adopted without breaking existing systems

## Core Directory Structure

### Level 1: Project Root

```
project-name/
├── src/                    # All source code (mandatory)
├── tests/                  # Root-level tests (mandatory)
├── tools/                  # Development and build tools (mandatory)
├── docs/                   # Documentation with progressive disclosure (mandatory)
├── .ci/                    # CI integration (created by installer)
├── .claude/                # Claude Code configuration (created by installer)
├── AGENTS/                 # Agent memories (CI projects only - DO NOT CREATE MANUALLY)
├── .github/                # GitHub Actions and templates
├── .vscode/                # VS Code configuration
├── config/                 # Configuration files
├── scripts/                # Utility scripts
└── archive/                # Deprecated/archived code
```

### Level 2: Source Code Organization (src/)

```
src/
├── core/                   # Core business logic
├── api/                    # API endpoints and handlers
├── services/               # Service layer
├── models/                 # Data models and schemas
├── utils/                  # Utility functions
├── interfaces/             # External interfaces and integrations
├── components/             # UI components (if applicable)
└── lib/                    # Internal libraries
```

### Level 3: Testing Structure

**Dual testing directories for comprehensive coverage:**

```
tests/                      # Integration and E2E tests
├── integration/
├── e2e/
├── fixtures/
└── mocks/

tools/testing/              # Unit tests and test utilities
├── unit/
├── benchmarks/
├── coverage/
└── utils/
```

### Level 4: Documentation with Progressive Disclosure

```
docs/
├── README.md               # Entry point with progressive links
├── INDEX.md                # Documentation index
├── development/            # Development documentation
│   ├── sprints/           # Sprint management
│   │   ├── sprint-XXX/    # Individual sprint folders
│   │   │   ├── README.md
│   │   │   ├── planning/
│   │   │   ├── progress/
│   │   │   └── completion/
│   │   └── sprint-management.md
│   ├── architecture/
│   ├── guides/
│   └── standards/
├── api/                    # API documentation
├── deployment/             # Deployment guides
├── operations/             # Operational procedures
└── business/              # Business documentation
```

## Sprint Management Structure

### Sprint Directory Organization

Each sprint follows a standardized structure:

```
docs/development/sprints/sprint-XXX/
├── README.md              # Sprint overview and objectives
├── planning/              # Planning documents
│   ├── objectives.md
│   ├── tasks.md
│   └── resources.md
├── progress/              # Daily progress tracking
│   ├── day-01.md
│   ├── day-02.md
│   └── ...
├── completion/            # Completion artifacts
│   ├── report.md
│   ├── metrics.md
│   └── retrospective.md
└── artifacts/            # Sprint deliverables
```

### Sprint Numbering Convention

- Format: `sprint-XXX` (e.g., sprint-001, sprint-002)
- Always use 3-digit padding for consistency
- Sequential numbering across project lifetime
- Never reuse sprint numbers

## CI System Integration

### Critical CI Paths (DO NOT MODIFY)

```
# These paths are managed by CI system - DO NOT CREATE MANUALLY
AGENTS/{AgentName}/         # Agent memory directories
AGENTS/{AgentName}/MEMORY.md
AGENTS/{AgentName}/Sessions/
.ci/                       # CI configuration
.claude/                   # Claude Code hooks
```

### Memory System Dependencies

The CI memory system expects these exact paths:
- Agent memories: `$CI_ROOT/AGENTS/{AgentName}/`
- Session files: `$CI_ROOT/AGENTS/{AgentName}/Sessions/{project}-{date}.md`
- Hook configuration: `.claude/settings.json`

### Installation Creates

When CI is installed in a project:
1. `.ci/` directory - CI configuration and metadata
2. `.claude/` directory - Hook configuration
3. Does NOT create `AGENTS/` - this remains in CI repository only

## Progressive Disclosure Pattern

### Documentation Layering

```markdown
# Component Name

## Quick Start (Level 1)
Essential information for immediate use.

## Core Concepts (Level 2)
<details>
<summary>Click to expand core concepts</summary>

Detailed explanations of fundamental concepts.

</details>

## Advanced Usage (Level 3)
<details>
<summary>Click to expand advanced usage</summary>

Complex patterns and advanced features.

</details>

## Implementation Details (Level 4)
<details>
<summary>Click to expand implementation details</summary>

Internal architecture and technical details.

</details>
```

### Navigation Hierarchy

1. **README.md** - Project overview with links to major sections
2. **INDEX.md** - Complete documentation index
3. **Section READMEs** - Section overviews with progressive links
4. **Topic Documents** - Detailed documentation with collapsible sections

## Migration Strategy

### For Existing Projects

#### Phase 1: Non-Breaking Additions
```bash
# Add new structure without removing old
mkdir -p src tests tools/testing docs/development/sprints
```

#### Phase 2: Gradual Migration
```bash
# Move code to src/ maintaining functionality
# Update imports and paths
# Test thoroughly after each move
```

#### Phase 3: Cleanup
```bash
# Archive old structure
mkdir -p archive/old-structure
# Move deprecated items to archive
```

### For New Projects

Use the standard structure from the beginning:

```bash
# Initialize new project
mkdir project-name && cd project-name
mkdir -p src/{core,api,services,models,utils}
mkdir -p tests/{integration,e2e,fixtures}
mkdir -p tools/testing/{unit,benchmarks}
mkdir -p docs/development/sprints
```

## Compatibility Matrix

| Feature | CI-Integrated | Standalone | Notes |
|---------|--------------|------------|-------|
| src/ directory | ✅ | ✅ | Universal |
| tests/ directory | ✅ | ✅ | Universal |
| tools/testing/ | ✅ | ✅ | Universal |
| docs/development/sprints/ | ✅ | ✅ | Universal |
| AGENTS/ directory | ✅ (CI repo only) | ❌ | Never in project root |
| .ci/ directory | ✅ | Optional | Created by installer |
| .claude/ directory | ✅ | Optional | Created by installer |
| Progressive disclosure | ✅ | ✅ | Universal pattern |

## Implementation Guidelines

### For DirectoryOrganizer

1. **Detection Phase**
   - Check for CI integration (`.ci/` exists)
   - Identify current structure
   - Assess migration complexity

2. **Planning Phase**
   - Generate migration plan
   - Identify breaking changes
   - Create rollback strategy

3. **Execution Phase**
   - Create new directories
   - Migrate files preserving git history
   - Update configuration files
   - Test after each major change

4. **Validation Phase**
   - Verify CI hooks still work
   - Test build processes
   - Validate documentation links
   - Ensure tests pass

### Critical Rules

1. **NEVER create AGENTS/ in project root** - This breaks CI memory system
2. **NEVER modify .ci/ or .claude/ manually** - Managed by CI installer
3. **ALWAYS preserve git history** during migrations
4. **ALWAYS test CI hooks** after structure changes
5. **ALWAYS use src/ for source code** - Not source/ or other variants

## Monitoring and Compliance

### Health Checks

```bash
# Verify structure compliance
find . -type d -name "source" # Should return nothing
find . -type d -name "src" # Should exist
test -d "tests" && echo "✓ tests/" || echo "✗ Missing tests/"
test -d "tools/testing" && echo "✓ tools/testing/" || echo "✗ Missing tools/testing/"
```

### CI Memory System Check

```bash
# For CI-integrated projects only
if [ -d ".ci" ]; then
    # Verify AGENTS is NOT in project root
    if [ -d "AGENTS" ]; then
        echo "ERROR: AGENTS/ should not exist in project root!"
    fi

    # Verify CI memory paths work
    CI_ROOT="$HOME/Projects/Nuru-AI/CollaborativeIntelligence"
    if [ -d "$CI_ROOT/AGENTS" ]; then
        echo "✓ CI memory system accessible"
    fi
fi
```

## Version History

- **v1.0.0** (2025-09-29): Initial unified standards based on investigation findings

## References

- CI Memory System: `/interfaces/claude-bridge/scripts/enhanced-memory-updater.sh`
- Sprint Management: `/docs/development/sprint-management.md`
- Progressive Disclosure Examples: `/rabbi/docs/README.md`
- CI Configuration: `/ci/CLAUDE.md`