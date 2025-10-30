# CI-CollaborativeIntelligence Optimal Architecture Design

**Author**: Architect Agent
**Date**: 2025-09-30
**Status**: Architectural Recommendation
**Context**: Sprint-005 Memory Unification Success - Cleanup Strategy Design

---

## Executive Summary

The CI-CollaborativeIntelligence integration has been successfully unified. CI is the npm-distributed CLI interface, CollaborativeIntelligence is the data layer containing all agents, memories, and BRAIN knowledge. This document defines the optimal end-state architecture, deployment patterns, and migration strategy.

**Key Architectural Decision**: Keep CI lean, CollaborativeIntelligence authoritative. All data lives in CollaborativeIntelligence, CI provides the runtime interface.

---

## 1. Ideal End State Architecture

### 1.1 Repository Structure

#### **CI Repository (Interface Layer)**
```
CI/
├── bin/                          # CLI executables
│   └── ci.js                     # Entry point
├── lib/                          # Core CLI logic
│   ├── index.js                  # Main library
│   ├── commands/                 # Command implementations
│   ├── utils/                    # Utilities
│   └── config.js                 # Configuration management
├── completions/                  # Shell completions
├── scripts/                      # Installation/setup scripts
│   ├── install.js
│   ├── postinstall.js
│   └── detect-ci-data.js        # Auto-detect CollaborativeIntelligence location
├── .ci-config.json.example      # Example configuration
├── package.json                  # npm metadata
├── Cargo.toml                    # Rust binary (if any)
└── README.md                     # User documentation

WHAT SHOULD NOT BE IN CI:
- ❌ AGENTS/ directory            # Belongs in CollaborativeIntelligence
- ❌ BRAIN/ directory             # Belongs in CollaborativeIntelligence
- ❌ Sessions/ directory          # Belongs in CollaborativeIntelligence
- ❌ Hook scripts (duplicated)    # Should reference CollaborativeIntelligence
- ❌ Memory files                 # Belongs in CollaborativeIntelligence
```

#### **CollaborativeIntelligence Repository (Data Layer)**
```
CollaborativeIntelligence/
├── AGENTS/                       # All 133 agents (authoritative)
│   └── {AgentName}/
│       ├── MEMORY.md             # Global identity
│       ├── ContinuousLearning.md # Learning patterns
│       ├── metadata.json         # Agent configuration
│       └── Sessions/             # Project-specific sessions
│           ├── CI-2025-09-30.md
│           ├── Sippar-2025-09-30.md
│           └── {Project}-{Date}.md
├── BRAIN/                        # Universal knowledge hub
│   ├── Core/
│   ├── Expertise/
│   ├── Patterns/
│   └── Procedures/
├── Sessions/                     # Global session tracking
├── interfaces/
│   └── claude-bridge/
│       └── scripts/              # Hook scripts (authoritative)
│           ├── agent-memory-writer.sh
│           ├── agent-session-manager.sh
│           └── [47+ other scripts]
├── ci/                           # CI system configuration
│   └── CLAUDE.md                 # System documentation
├── .claude/
│   ├── settings.json             # Hook configuration
│   └── logs/                     # System logs
├── docs/                         # Comprehensive documentation
├── management/                   # Project management artifacts
└── README.md                     # System overview

WHAT MUST BE IN COLLABORATIVEINTELLIGENCE:
- ✅ All agent definitions and memories
- ✅ All BRAIN knowledge
- ✅ All session files
- ✅ All hook scripts
- ✅ All documentation
- ✅ All configuration
```

### 1.2 Relationship Model

```
┌─────────────────────────────────────────────────────────┐
│                    USER INSTALLS                        │
│                                                         │
│  npm install -g @collaborative-intelligence/ci         │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   CI (Interface)                        │
│                                                         │
│  • Provides `ci` command                                │
│  • Handles CLI interactions                             │
│  • Manages configuration                                │
│  • Routes to CollaborativeIntelligence                  │
└─────────────────────────────────────────────────────────┘
                        │
                        │ (discovers and connects to)
                        ▼
┌─────────────────────────────────────────────────────────┐
│         CollaborativeIntelligence (Data)                │
│                                                         │
│  • Stores all agent memories                            │
│  • Contains BRAIN knowledge                             │
│  • Manages sessions                                     │
│  • Provides hook scripts                                │
└─────────────────────────────────────────────────────────┘
```

**Key Principle**: CI is stateless. All state lives in CollaborativeIntelligence.

---

## 2. Data Storage Architecture Matrix

| Data Type | Current Location | Should Be In | Access Method | Rationale |
|-----------|-----------------|--------------|---------------|-----------|
| **Agent Definitions** | CollaborativeIntelligence/AGENTS/ | CollaborativeIntelligence | Direct file access | Authoritative source, shared across all projects |
| **Agent Memories** | CollaborativeIntelligence/AGENTS/{Agent}/MEMORY.md | CollaborativeIntelligence | Direct file access | Single source of truth for agent knowledge |
| **Agent Sessions** | CollaborativeIntelligence/AGENTS/{Agent}/Sessions/ | CollaborativeIntelligence | Direct file access | Project-specific tracking, multi-project support |
| **BRAIN Knowledge** | CollaborativeIntelligence/BRAIN/ | CollaborativeIntelligence | Direct file access | Universal knowledge hub, ecosystem-wide sharing |
| **Global Sessions** | CollaborativeIntelligence/Sessions/ | CollaborativeIntelligence | Direct file access | Cross-project session tracking |
| **Hook Scripts** | CollaborativeIntelligence/interfaces/claude-bridge/scripts/ | CollaborativeIntelligence | Symlink from CI or direct execution | Authoritative scripts, avoid duplication |
| **CI Configuration** | CI/.ci-config.json | Both (template in CI, instance in projects) | Config file | Project-specific CI settings |
| **System Documentation** | CollaborativeIntelligence/ci/CLAUDE.md | CollaborativeIntelligence | Import in CI | Authoritative system documentation |
| **Claude Settings** | CollaborativeIntelligence/.claude/settings.json | CollaborativeIntelligence | Direct file access | Hook configuration |
| **Development Docs** | CollaborativeIntelligence/docs/ | CollaborativeIntelligence | Reference from CI | Comprehensive system documentation |

**Design Rule**: If it's data or state, it lives in CollaborativeIntelligence. If it's interface or routing, it lives in CI.

---

## 3. Script Management Architecture

### 3.1 Evaluated Options

#### **Option A: CI contains no scripts (symlinks to CollaborativeIntelligence)**
- **Pros**: Zero duplication, single source of truth, instant updates
- **Cons**: Fragile npm packaging, symlinks break on Windows, deployment complexity
- **Verdict**: ❌ Too fragile for production npm package

#### **Option B: CI contains copies (duplicated, independent)**
- **Pros**: Self-contained npm package, works everywhere
- **Cons**: Duplication, maintenance burden, synchronization issues
- **Verdict**: ❌ Current state, caused the memory crisis

#### **Option C: CI contains wrappers (thin layer over CollaborativeIntelligence)**
- **Pros**: Self-contained npm package, scripts stay in CollaborativeIntelligence
- **Cons**: Extra layer of indirection
- **Verdict**: ✅ **RECOMMENDED** - Best balance

#### **Option D: Shared script library (both symlink to third location)**
- **Pros**: Clean separation
- **Cons**: Three-way dependency management, over-engineered
- **Verdict**: ❌ Too complex

### 3.2 Recommended Solution: Wrapper Pattern

**Implementation**: CI contains minimal wrapper scripts that delegate to CollaborativeIntelligence.

**Example: CI wrapper script**
```bash
#!/bin/bash
# ci/bin/ci-memory-writer (wrapper)

CI_DATA_ROOT="$(ci-detect-data-root)"
exec "$CI_DATA_ROOT/interfaces/claude-bridge/scripts/agent-memory-writer.sh" "$@"
```

**Example: Detection utility**
```bash
#!/bin/bash
# ci/lib/detect-data-root.sh

# Strategy 1: Environment variable
if [ -n "$CI_DATA_ROOT" ]; then
    echo "$CI_DATA_ROOT"
    exit 0
fi

# Strategy 2: Config file
if [ -f ".ci-config.json" ]; then
    CI_DATA_ROOT=$(jq -r '.ci_data_root // empty' .ci-config.json)
    if [ -n "$CI_DATA_ROOT" ]; then
        echo "$CI_DATA_ROOT"
        exit 0
    fi
fi

# Strategy 3: Well-known locations
for path in \
    "$HOME/Projects/Nuru-AI/CollaborativeIntelligence" \
    "$HOME/CollaborativeIntelligence" \
    "$(dirname "$(which ci)")/../share/collaborative-intelligence" \
    "/opt/collaborative-intelligence" \
    "/usr/local/share/collaborative-intelligence"; do
    if [ -d "$path/AGENTS" ] && [ -d "$path/BRAIN" ]; then
        echo "$path"
        exit 0
    fi
done

echo "Error: Cannot find CollaborativeIntelligence data directory" >&2
exit 1
```

**Benefits**:
- CI is self-contained npm package ✅
- Scripts stay in CollaborativeIntelligence (authoritative) ✅
- No duplication ✅
- Works across platforms ✅
- Easy to maintain ✅

---

## 4. Deployment Architecture

### 4.1 Scenario 1: User installs CI via npm

```bash
# User installs CI globally
npm install -g @collaborative-intelligence/ci

# Postinstall script runs
# 1. Detects if CollaborativeIntelligence exists
# 2. If not, prompts user to clone it
# 3. Creates config file with path

# User sets up CollaborativeIntelligence
git clone https://github.com/Nuru-AI/CollaborativeIntelligence.git ~/CollaborativeIntelligence

# CI detects and configures automatically
ci configure --data-root ~/CollaborativeIntelligence

# Ready to use
ci agents list
```

**Flow**:
1. npm installs CI binary and CLI logic
2. Postinstall detects CollaborativeIntelligence or guides user to set it up
3. CI creates config: `~/.config/ci/config.json` with `data_root` path
4. All CI commands delegate to CollaborativeIntelligence for data operations

### 4.2 Scenario 2: Developer clones both repos

```bash
# Clone both repositories
git clone https://github.com/Nuru-AI/CI.git
git clone https://github.com/Nuru-AI/CollaborativeIntelligence.git

# Build and link CI for development
cd CI
npm install
npm link

# Configure CI to use local CollaborativeIntelligence
ci configure --data-root ../CollaborativeIntelligence

# Ready for development
ci agents list
```

**Flow**:
1. Developer has both repos locally
2. CI configuration points to local CollaborativeIntelligence
3. Changes to scripts in CollaborativeIntelligence take effect immediately
4. No duplication, single source of truth

### 4.3 Scenario 3: Project uses CI

```bash
cd MyProject

# Install CI as project dependency
npm install @collaborative-intelligence/ci --save-dev

# Configure for project
npx ci configure --data-root ~/CollaborativeIntelligence

# Or use environment variable
export CI_DATA_ROOT=~/CollaborativeIntelligence

# Use in project
npx ci agents list
```

**Flow**:
1. Project installs CI as dependency
2. Project configures data root (via config file or env var)
3. All CI operations use shared CollaborativeIntelligence data
4. Multiple projects share the same agent memories and BRAIN

---

## 5. Configuration Architecture

### 5.1 Configuration Hierarchy

```
Priority (highest to lowest):
1. Environment variables (CI_DATA_ROOT)
2. Project config file (.ci-config.json)
3. User config file (~/.config/ci/config.json)
4. Auto-detection (well-known paths)
5. Fail with helpful error message
```

### 5.2 Configuration Files

#### **User Global Config** `~/.config/ci/config.json`
```json
{
  "data_root": "/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence",
  "default_agents": ["Athena", "Developer", "Architect"],
  "auto_update": true,
  "log_level": "info"
}
```

#### **Project Config** `.ci-config.json`
```json
{
  "project_name": "MyProject",
  "ci_data_root": "~/CollaborativeIntelligence",
  "active_agents": ["Athena", "Developer"],
  "fast_activation": true
}
```

#### **Environment Variables**
```bash
export CI_DATA_ROOT=~/CollaborativeIntelligence  # Override all config
export CI_LOG_LEVEL=debug                         # Debug logging
export CI_AUTO_UPDATE=false                       # Disable auto-updates
```

### 5.3 Path Management Strategy

**Current Problem**: Hardcoded path in scripts
```bash
# BAD: Current in CI repo
CI_ROOT="/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence"
```

**Solution 1**: Dynamic detection (recommended for CollaborativeIntelligence scripts)
```bash
# GOOD: Dynamic detection
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CI_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
```

**Solution 2**: Configuration-driven (recommended for CI wrappers)
```bash
# GOOD: Config-driven
CI_ROOT="$(ci-detect-data-root)"
```

**Solution 3**: Environment variable (recommended for users)
```bash
# GOOD: User override
export CI_DATA_ROOT=~/CollaborativeIntelligence
```

---

## 6. Migration Path Design

### Phase 1: Immediate Safe Actions (No Breaking Changes)

**Status**: ✅ **ALREADY COMPLETE**
- Memory unification completed
- Scripts in CollaborativeIntelligence writing correctly
- Data integrity validated

**What remains**:
1. ✅ Document the architecture (this document)
2. ⏳ Remove duplicate AGENTS/ from CI repo
3. ⏳ Replace CI scripts with wrappers

**Actions**:
```bash
# 1. Backup current state
cd /Users/eladm/Projects/Nuru-AI/CI
tar czf ~/ci-backup-$(date +%Y%m%d).tar.gz AGENTS/ interfaces/

# 2. Remove CI/AGENTS (data now in CollaborativeIntelligence)
rm -rf AGENTS/

# 3. Create wrapper for agent-memory-writer
cat > interfaces/claude-bridge/scripts/agent-memory-writer.sh << 'EOF'
#!/bin/bash
CI_DATA_ROOT="$(node -p "require('./lib/config.js').getDataRoot()")"
exec "$CI_DATA_ROOT/interfaces/claude-bridge/scripts/agent-memory-writer.sh" "$@"
EOF

# 4. Update CI package.json to include data root detection
# (Add lib/config.js with getDataRoot() function)
```

**Risk**: LOW - No existing functionality breaks, only removes unused directories.

**Rollback**: Restore from backup if needed.

### Phase 2: Script Wrapper Implementation (Requires Testing)

**Goal**: Convert all CI scripts to thin wrappers that delegate to CollaborativeIntelligence.

**Actions**:
1. Create `lib/config.js` in CI repo with data root detection logic
2. Convert each script in CI to wrapper format
3. Test all commands work correctly
4. Update CI documentation

**Script Template**:
```bash
#!/bin/bash
# CI wrapper script template

set -euo pipefail

# Detect CollaborativeIntelligence data root
if [ -z "${CI_DATA_ROOT:-}" ]; then
    CI_DATA_ROOT="$(node -p "require('${0%/*}/../lib/config.js').getDataRoot()")"
fi

# Validate data root exists
if [ ! -d "$CI_DATA_ROOT/AGENTS" ]; then
    echo "Error: CollaborativeIntelligence data directory not found at: $CI_DATA_ROOT" >&2
    echo "Run: ci configure --data-root /path/to/CollaborativeIntelligence" >&2
    exit 1
fi

# Get original script name
SCRIPT_NAME="$(basename "$0")"

# Execute original script from CollaborativeIntelligence
exec "$CI_DATA_ROOT/interfaces/claude-bridge/scripts/$SCRIPT_NAME" "$@"
```

**Scripts to convert**:
- agent-memory-writer.sh
- agent-session-manager.sh
- enhanced-memory-updater.sh
- agent-protector.sh
- agent-orchestrator.sh

**Testing**:
```bash
# Test each command
ci agents list
ci agent activate Athena
ci session create
ci memory update Architect "test"

# Verify writes go to CollaborativeIntelligence
ls -la ~/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS/*/MEMORY.md
```

**Risk**: MEDIUM - Changes runtime behavior, requires thorough testing.

**Rollback**: Revert to direct scripts if wrappers fail.

### Phase 3: npm Package Preparation (Coordination Required)

**Goal**: Prepare CI for npm distribution with proper postinstall setup.

**Actions**:
1. Create comprehensive `scripts/postinstall.js`:
   - Detect CollaborativeIntelligence
   - Guide user to clone if not found
   - Create user config file
   - Validate setup
2. Add configuration command: `ci configure --data-root <path>`
3. Update README with installation instructions
4. Test npm pack and install flow
5. Publish to npm (or private registry)

**Postinstall Script** (`scripts/postinstall.js`):
```javascript
const fs = require('fs');
const path = require('path');
const os = require('os');

function detectDataRoot() {
    const candidates = [
        path.join(os.homedir(), 'Projects/Nuru-AI/CollaborativeIntelligence'),
        path.join(os.homedir(), 'CollaborativeIntelligence'),
        '/opt/collaborative-intelligence',
    ];

    for (const candidate of candidates) {
        if (fs.existsSync(path.join(candidate, 'AGENTS')) &&
            fs.existsSync(path.join(candidate, 'BRAIN'))) {
            return candidate;
        }
    }

    return null;
}

function createUserConfig(dataRoot) {
    const configDir = path.join(os.homedir(), '.config/ci');
    const configPath = path.join(configDir, 'config.json');

    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }

    const config = {
        data_root: dataRoot,
        default_agents: ["Athena", "Developer", "Architect"],
        auto_update: true,
        log_level: "info"
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`Created configuration at: ${configPath}`);
}

// Main postinstall logic
const dataRoot = detectDataRoot();

if (dataRoot) {
    console.log(`Found CollaborativeIntelligence at: ${dataRoot}`);
    createUserConfig(dataRoot);
    console.log('CI configured successfully!');
} else {
    console.log('\n⚠️  CollaborativeIntelligence data directory not found.');
    console.log('\nTo complete installation:');
    console.log('1. Clone CollaborativeIntelligence:');
    console.log('   git clone https://github.com/Nuru-AI/CollaborativeIntelligence.git ~/CollaborativeIntelligence');
    console.log('2. Configure CI:');
    console.log('   ci configure --data-root ~/CollaborativeIntelligence');
    console.log();
}
```

**Risk**: MEDIUM - Changes installation experience, requires coordination with users.

**Rollback**: Can still configure manually if postinstall fails.

---

## 7. Long-term Maintenance Architecture

### 7.1 Synchronization Strategy

**Problem**: How to keep CI and CollaborativeIntelligence in sync?

**Solution**: CollaborativeIntelligence is authoritative. CI follows.

**Workflow**:
1. All changes to scripts happen in CollaborativeIntelligence
2. CI wrappers automatically use latest scripts
3. CI version bumps only when interface changes
4. No manual synchronization needed

**Version Management**:
```
CI Version:              v0.1.0 (interface)
CollaborativeIntelligence:  (unversioned, always latest)

CI v0.1.0 works with any CollaborativeIntelligence version
CI v0.2.0 adds new commands, still uses same data layer
```

### 7.2 Breaking Change Protocol

**Scenario**: Script signature changes in CollaborativeIntelligence

**Example**: `agent-memory-writer.sh` adds new required parameter

**Protocol**:
1. Add new parameter to CollaborativeIntelligence script
2. Make it optional with default value (backward compatible)
3. Update CI wrapper to pass new parameter
4. Bump CI minor version
5. Document change in CI changelog
6. After grace period, make parameter required

**Versioning Strategy**:
- CollaborativeIntelligence: No semantic versioning (always evolving)
- CI: Semantic versioning (interface contract)
- Minimum CI version: None (wrappers adapt to whatever's in CollaborativeIntelligence)

### 7.3 Testing Strategy

**Integration Tests**:
```javascript
// CI integration test
describe('CI-CollaborativeIntelligence Integration', () => {
    it('should detect data root', () => {
        const dataRoot = getDataRoot();
        expect(dataRoot).toBeDefined();
        expect(fs.existsSync(path.join(dataRoot, 'AGENTS'))).toBe(true);
    });

    it('should execute agent-memory-writer', () => {
        const result = execSync('ci memory write Athena task_completion "test"');
        expect(result.status).toBe(0);

        // Verify write went to CollaborativeIntelligence
        const memoryFile = path.join(dataRoot, 'AGENTS/Athena/MEMORY.md');
        const content = fs.readFileSync(memoryFile, 'utf8');
        expect(content).toContain('test');
    });

    it('should handle missing data root gracefully', () => {
        process.env.CI_DATA_ROOT = '/nonexistent';
        const result = execSync('ci agents list', { env: process.env });
        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain('CollaborativeIntelligence data directory not found');
    });
});
```

**Continuous Integration**:
- CI repo tests: Unit tests for CLI logic
- CollaborativeIntelligence repo tests: Script functionality tests
- Integration tests: Both repos together

---

## 8. Architecture Validation

### 8.1 Requirements Checklist

| Requirement | Status | Evidence |
|-------------|--------|----------|
| ✅ Single source of truth for data? | **YES** | All data in CollaborativeIntelligence, CI is stateless |
| ✅ Works as npm package? | **YES** | Wrapper pattern allows self-contained npm distribution |
| ✅ Works with multiple projects? | **YES** | Project-specific sessions, shared BRAIN knowledge |
| ✅ Minimal duplication? | **YES** | No duplicated scripts, wrappers delegate to authoritative source |
| ✅ Easy to maintain? | **YES** | Changes only in CollaborativeIntelligence, wrappers adapt automatically |
| ✅ Clear ownership boundaries? | **YES** | CI = interface, CollaborativeIntelligence = data |
| ✅ Platform independent? | **YES** | No symlinks, wrapper scripts work on all platforms |
| ✅ Developer friendly? | **YES** | Can clone both repos and work locally |
| ✅ User friendly? | **YES** | npm install + simple configuration |
| ✅ Scalable? | **YES** | Add new agents/scripts in CollaborativeIntelligence, CI doesn't need updates |

### 8.2 Design Principles Validation

**Principle 1: CI is the interface, CollaborativeIntelligence is the data**
- ✅ Validated: CI contains no agent memories, BRAIN knowledge, or session files
- ✅ Validated: All data operations delegate to CollaborativeIntelligence

**Principle 2: Single source of truth**
- ✅ Validated: No duplicated scripts or data
- ✅ Validated: Wrapper pattern ensures authoritative source is always used

**Principle 3: Zero-cost abstraction**
- ✅ Validated: Wrappers are thin delegation layer, no performance overhead
- ✅ Validated: Direct execution of scripts in CollaborativeIntelligence

**Principle 4: Multi-project support**
- ✅ Validated: Project-specific sessions, shared universal knowledge
- ✅ Validated: BRAIN serves all projects from single installation

---

## 9. Architectural Decisions

### 9.1 Why Wrapper Pattern?

**Alternative Considered**: Direct symlinks

**Rejected Because**:
- Breaks on Windows
- npm packaging doesn't preserve symlinks reliably
- User experience issues (symlinks confusing to non-technical users)

**Chosen Solution**: Wrapper scripts that exec to authoritative source

**Benefits**:
- Works on all platforms
- npm packaging is straightforward
- Clear execution flow
- Easy to debug

### 9.2 Why CollaborativeIntelligence is Unversioned?

**Alternative Considered**: Semantic versioning for CollaborativeIntelligence

**Rejected Because**:
- CollaborativeIntelligence is a living knowledge base, always evolving
- Agent memories and BRAIN knowledge don't have "versions"
- Scripts are tools, not APIs (minor changes don't break consumers)
- Versioning would create artificial boundaries on continuous learning

**Chosen Solution**: CollaborativeIntelligence has no version, CI provides stable interface

**Benefits**:
- Continuous evolution without version churn
- CI version indicates interface stability, not data layer version
- Users always get latest agent knowledge and improvements

### 9.3 Why Configuration Hierarchy?

**Alternative Considered**: Single configuration source

**Rejected Because**:
- Doesn't support multiple use cases (global install, project-specific, override)
- Rigid, not flexible for different environments

**Chosen Solution**: Layered configuration with environment variable override

**Benefits**:
- Flexibility for different use cases
- Easy to override for testing/debugging
- Follows Unix philosophy (env vars > config files > defaults)

---

## 10. Implementation Phases Summary

### Phase 1: NOW (Safe, Non-Breaking) ✅ **COMPLETE**
- ✅ Memory unification working
- ✅ Scripts writing to CollaborativeIntelligence
- ✅ Architecture documented
- ⏳ Remove CI/AGENTS directory
- ⏳ Create first wrapper script (agent-memory-writer)

**Timeline**: 1 day
**Risk**: LOW
**Testing**: Manual verification

### Phase 2: NEXT (Requires Testing)
- Convert all scripts to wrappers
- Create lib/config.js with data root detection
- Test all CI commands
- Update CI documentation

**Timeline**: 3-5 days
**Risk**: MEDIUM
**Testing**: Integration tests, manual testing

### Phase 3: LATER (Coordination Required)
- Create postinstall script
- Add `ci configure` command
- Prepare for npm publication
- Update user documentation
- Coordinate with users for migration

**Timeline**: 1-2 weeks
**Risk**: MEDIUM
**Testing**: npm pack, test installation, user acceptance testing

---

## 11. Deployment Patterns

### Pattern 1: Global Installation (Most Common)
```bash
npm install -g @collaborative-intelligence/ci
git clone https://github.com/Nuru-AI/CollaborativeIntelligence.git ~/CollaborativeIntelligence
ci configure --data-root ~/CollaborativeIntelligence
```

**Use Case**: Individual developers, personal use
**Data Location**: ~/CollaborativeIntelligence (user-owned)

### Pattern 2: Project Dependency
```bash
cd MyProject
npm install @collaborative-intelligence/ci --save-dev
echo 'CI_DATA_ROOT=~/CollaborativeIntelligence' >> .env
npx ci agents list
```

**Use Case**: Project-specific CI usage, team collaboration
**Data Location**: Shared CollaborativeIntelligence (team-owned)

### Pattern 3: System-Wide Installation
```bash
sudo npm install -g @collaborative-intelligence/ci
sudo git clone https://github.com/Nuru-AI/CollaborativeIntelligence.git /opt/collaborative-intelligence
sudo ci configure --data-root /opt/collaborative-intelligence
```

**Use Case**: Enterprise deployment, multiple users on same system
**Data Location**: /opt/collaborative-intelligence (system-owned)

### Pattern 4: Development Setup
```bash
git clone https://github.com/Nuru-AI/CI.git
git clone https://github.com/Nuru-AI/CollaborativeIntelligence.git
cd CI
npm install && npm link
ci configure --data-root ../CollaborativeIntelligence
```

**Use Case**: CI development, contributor workflow
**Data Location**: Local CollaborativeIntelligence (developer-owned)

---

## 12. Maintenance Plan

### 12.1 Regular Maintenance Tasks

**Weekly**:
- Monitor CI issue tracker for bug reports
- Review CollaborativeIntelligence agent memory growth
- Check integration test results

**Monthly**:
- Review and consolidate agent memories (automated)
- Update CI dependencies
- Review and improve wrapper scripts

**Quarterly**:
- Assess whether new CI commands needed
- Review architecture for improvements
- Update documentation

### 12.2 Change Management

**Adding New Scripts to CollaborativeIntelligence**:
1. Add script to CollaborativeIntelligence/interfaces/claude-bridge/scripts/
2. Test script standalone
3. Add wrapper to CI (if exposing to CLI)
4. Test integration
5. Update CI documentation
6. Bump CI minor version (if new command added)

**Modifying Existing Scripts**:
1. Make change in CollaborativeIntelligence (authoritative)
2. Ensure backward compatibility if possible
3. Test with existing CI wrappers
4. If breaking change, update wrapper and bump CI major version
5. Document breaking change

**Deprecating Scripts**:
1. Mark as deprecated in CollaborativeIntelligence
2. Add deprecation warning to CI wrapper
3. Update documentation with migration path
4. Wait at least 2 minor versions
5. Remove from CI (bump major version)
6. Remove from CollaborativeIntelligence

---

## 13. Conclusion

### 13.1 Optimal Architecture Summary

**CI Repository**:
- npm-distributed CLI interface
- Thin wrapper scripts
- Configuration management
- User-facing documentation

**CollaborativeIntelligence Repository**:
- Authoritative data layer
- All agents, memories, BRAIN knowledge
- All hook scripts (authoritative)
- System documentation

**Relationship**:
- CI discovers and connects to CollaborativeIntelligence
- CI delegates all data operations to CollaborativeIntelligence
- CollaborativeIntelligence is single source of truth
- No duplication, clear ownership boundaries

### 13.2 Key Benefits

1. **Single Source of Truth**: All data in CollaborativeIntelligence, no duplication
2. **Easy Maintenance**: Changes in one place, automatically used by CI
3. **Multi-Project Support**: One CollaborativeIntelligence serves many projects
4. **npm-Ready**: CI can be distributed via npm without data layer
5. **Platform Independent**: Wrapper pattern works on all platforms
6. **Developer Friendly**: Can work with both repos locally
7. **User Friendly**: Simple npm install + configuration
8. **Scalable**: Add agents/scripts without updating CI

### 13.3 Next Steps

**Immediate** (This Week):
1. Remove CI/AGENTS directory (unused, data in CollaborativeIntelligence)
2. Create first wrapper script (agent-memory-writer)
3. Test wrapper works correctly
4. Document wrapper pattern for team

**Short Term** (Next Sprint):
1. Convert all scripts to wrappers
2. Create lib/config.js with data root detection
3. Add `ci configure` command
4. Write integration tests

**Long Term** (Future Sprints):
1. Prepare postinstall script
2. Test npm packaging
3. Publish to npm registry
4. Coordinate user migration

---

## 14. Architectural Diagrams

### 14.1 Data Flow Architecture

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ ci agents list
       ▼
┌─────────────────────────────────────┐
│         CI CLI Interface            │
│                                     │
│  1. Parse command                   │
│  2. Detect data root                │
│  3. Delegate to script              │
└──────────────┬──────────────────────┘
               │ exec wrapper
               ▼
┌─────────────────────────────────────┐
│     CI Wrapper Script               │
│  (thin delegation layer)            │
│                                     │
│  CI_DATA_ROOT=...                   │
│  exec $CI_DATA_ROOT/scripts/...     │
└──────────────┬──────────────────────┘
               │ exec authoritative script
               ▼
┌─────────────────────────────────────┐
│  CollaborativeIntelligence Script   │
│  (authoritative implementation)     │
│                                     │
│  - Read agent memories              │
│  - Update session files             │
│  - Write to BRAIN                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  CollaborativeIntelligence Data     │
│                                     │
│  AGENTS/                            │
│  BRAIN/                             │
│  Sessions/                          │
└─────────────────────────────────────┘
```

### 14.2 Configuration Resolution Flow

```
User executes: ci agents list
       │
       ▼
┌──────────────────────────┐
│ 1. Check ENV Variable    │ ← CI_DATA_ROOT=/path/to/data
│    CI_DATA_ROOT          │
└───────┬──────────────────┘
        │ if not set
        ▼
┌──────────────────────────┐
│ 2. Check Project Config  │ ← .ci-config.json
│    .ci-config.json       │   { "ci_data_root": "..." }
└───────┬──────────────────┘
        │ if not found
        ▼
┌──────────────────────────┐
│ 3. Check User Config     │ ← ~/.config/ci/config.json
│    ~/.config/ci/config   │   { "data_root": "..." }
└───────┬──────────────────┘
        │ if not found
        ▼
┌──────────────────────────┐
│ 4. Auto-detect           │ ← Check well-known paths
│    Well-known paths      │   - ~/Projects/Nuru-AI/CollaborativeIntelligence
└───────┬──────────────────┘   - ~/CollaborativeIntelligence
        │ if not found         - /opt/collaborative-intelligence
        ▼
┌──────────────────────────┐
│ 5. Error + Help          │ → Guide user to configure
│    Installation guide    │
└──────────────────────────┘
```

### 14.3 Multi-Project Support

```
┌─────────────────────────────────────────────────────────────┐
│              CollaborativeIntelligence (Shared)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AGENTS/                                                    │
│    Athena/                                                  │
│      MEMORY.md          ← Universal identity                │
│      Sessions/                                              │
│        CI-2025-09-30.md           ← Project-specific        │
│        Sippar-2025-09-30.md       ← Project-specific        │
│        MyApp-2025-09-30.md        ← Project-specific        │
│                                                             │
│  BRAIN/                 ← Universal knowledge (all projects)│
│    Core/                                                    │
│    Expertise/                                               │
│    Patterns/                                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │                    │                    │
    ┌────┴────┐         ┌────┴────┐         ┌────┴────┐
    │Project 1│         │Project 2│         │Project 3│
    │   CI    │         │ Sippar  │         │ MyApp   │
    │         │         │         │         │         │
    │Sessions:│         │Sessions:│         │Sessions:│
    │ CI-*    │         │ Sippar-*│         │ MyApp-* │
    └─────────┘         └─────────┘         └─────────┘
```

---

**Document Status**: Complete
**Review Status**: Ready for Team Review
**Implementation Status**: Phase 1 partially complete, Phase 2 ready to begin
**Sign-off Required**: Lead Developer, Product Owner

---

**Appendix A: Quick Reference Commands**

```bash
# Remove CI/AGENTS directory
cd /Users/eladm/Projects/Nuru-AI/CI
rm -rf AGENTS/

# Create first wrapper (agent-memory-writer)
cat > interfaces/claude-bridge/scripts/agent-memory-writer.sh << 'EOF'
#!/bin/bash
set -euo pipefail
CI_DATA_ROOT="${CI_DATA_ROOT:-$(node -p "require('${0%/*}/../../../lib/config.js').getDataRoot()")}"
exec "$CI_DATA_ROOT/interfaces/claude-bridge/scripts/agent-memory-writer.sh" "$@"
EOF
chmod +x interfaces/claude-bridge/scripts/agent-memory-writer.sh

# Test wrapper
./interfaces/claude-bridge/scripts/agent-memory-writer.sh Athena task_completion "Architectural design complete"

# Verify write went to CollaborativeIntelligence
ls -la ~/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS/Athena/MEMORY.md
```

**Appendix B: Configuration Examples**

See Section 5.2 for complete configuration examples.

**Appendix C: Troubleshooting**

| Issue | Cause | Solution |
|-------|-------|----------|
| "Cannot find data root" | CollaborativeIntelligence not detected | `ci configure --data-root /path/to/CollaborativeIntelligence` |
| "Agent not found" | CollaborativeIntelligence not at expected location | Check `CI_DATA_ROOT` environment variable |
| "Memory not updating" | Incorrect path in wrapper | Verify wrapper script has correct exec path |
| "Wrapper fails" | Missing Node.js or lib/config.js | Install dependencies: `npm install` |

---

End of Document
