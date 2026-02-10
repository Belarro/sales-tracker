# CI-CollaborativeIntelligence Architecture - Executive Summary

**Date**: 2025-09-30
**Status**: Architectural Recommendation
**Author**: Architect Agent

---

## TL;DR

**CI** = npm-distributed CLI interface (stateless)
**CollaborativeIntelligence** = Data layer with all agents, memories, BRAIN (authoritative)

**Key Decision**: Use wrapper pattern. CI contains thin wrappers that delegate to authoritative scripts in CollaborativeIntelligence.

---

## The Problem We Solved

Sprint-005 revealed memory unification crisis: CI repo had duplicate AGENTS/ and scripts, causing split-brain syndrome. Scripts were writing to CI instead of CollaborativeIntelligence.

**Root Cause**: Copied scripts instead of referencing authoritative source.

---

## The Solution

### 1. Clear Ownership Boundaries

```
CI Repository (Interface):
- npm package
- CLI commands
- Wrapper scripts (thin delegation)
- User configuration

CollaborativeIntelligence Repository (Data):
- All 133 agents + memories (authoritative)
- BRAIN knowledge repository
- All hook scripts (authoritative)
- System documentation
```

### 2. Wrapper Pattern

Instead of duplicating scripts, CI contains wrappers:

```bash
# CI wrapper (5 lines)
#!/bin/bash
CI_DATA_ROOT="$(ci-detect-data-root)"
exec "$CI_DATA_ROOT/interfaces/claude-bridge/scripts/agent-memory-writer.sh" "$@"
```

**Benefits**:
- Zero duplication ✅
- Single source of truth ✅
- Works as npm package ✅
- Platform independent ✅

### 3. Configuration Hierarchy

```
Priority (highest to lowest):
1. Environment variable: CI_DATA_ROOT
2. Project config: .ci-config.json
3. User config: ~/.config/ci/config.json
4. Auto-detection: well-known paths
5. Error with helpful message
```

---

## Deployment Patterns

### Global Installation (Most Common)
```bash
npm install -g @collaborative-intelligence/ci
git clone https://github.com/Nuru-AI/CollaborativeIntelligence.git ~/CollaborativeIntelligence
ci configure --data-root ~/CollaborativeIntelligence
```

### Project Dependency
```bash
npm install @collaborative-intelligence/ci --save-dev
export CI_DATA_ROOT=~/CollaborativeIntelligence
npx ci agents list
```

### Development Setup
```bash
git clone https://github.com/Nuru-AI/CI.git
git clone https://github.com/Nuru-AI/CollaborativeIntelligence.git
cd CI && npm link
ci configure --data-root ../CollaborativeIntelligence
```

---

## Data Architecture

| Data Type | Lives In | Why |
|-----------|----------|-----|
| Agent memories | CollaborativeIntelligence | Single source of truth |
| BRAIN knowledge | CollaborativeIntelligence | Universal, multi-project |
| Session files | CollaborativeIntelligence | Project-specific tracking |
| Hook scripts | CollaborativeIntelligence | Authoritative implementation |
| CLI logic | CI | Interface layer |
| Wrappers | CI | Delegation layer |

**Rule**: If it's data or state → CollaborativeIntelligence. If it's interface or routing → CI.

---

## Implementation Phases

### Phase 1: NOW ✅ (Safe, Non-Breaking)
- ✅ Memory unification complete
- ⏳ Remove CI/AGENTS directory
- ⏳ Create first wrapper script

**Timeline**: 1 day | **Risk**: LOW

### Phase 2: NEXT (Requires Testing)
- Convert all scripts to wrappers
- Create data root detection utility
- Test all CI commands
- Update documentation

**Timeline**: 3-5 days | **Risk**: MEDIUM

### Phase 3: LATER (Coordination Required)
- Create postinstall script
- Add `ci configure` command
- Prepare for npm publication
- User migration

**Timeline**: 1-2 weeks | **Risk**: MEDIUM

---

## Key Architectural Decisions

### Why Wrapper Pattern?
**Rejected**: Symlinks (break on Windows, npm packaging issues)
**Rejected**: Duplication (caused current crisis)
**Chosen**: Wrappers (works everywhere, zero duplication)

### Why CollaborativeIntelligence is Unversioned?
It's a living knowledge base, always evolving. Agent memories don't have "versions". CI provides versioned interface, CollaborativeIntelligence is continuous.

### Why Configuration Hierarchy?
Flexibility for different use cases: global install, project-specific, development, testing. Follows Unix philosophy (env vars > config > defaults).

---

## Multi-Project Support

```
CollaborativeIntelligence (One Instance)
├── AGENTS/
│   └── Athena/
│       ├── MEMORY.md              ← Universal identity
│       └── Sessions/
│           ├── CI-2025-09-30.md        ← Project 1
│           ├── Sippar-2025-09-30.md    ← Project 2
│           └── MyApp-2025-09-30.md     ← Project 3
└── BRAIN/                         ← Shared knowledge

Multiple Projects → One CollaborativeIntelligence → Collective Intelligence
```

---

## Validation Checklist

| Requirement | Status |
|-------------|--------|
| ✅ Single source of truth | YES - All data in CollaborativeIntelligence |
| ✅ Works as npm package | YES - Wrapper pattern allows distribution |
| ✅ Multi-project support | YES - Project-specific sessions, shared BRAIN |
| ✅ Minimal duplication | YES - Wrappers delegate to authoritative source |
| ✅ Easy maintenance | YES - Changes in one place |
| ✅ Clear boundaries | YES - CI=interface, CollaborativeIntelligence=data |
| ✅ Platform independent | YES - No symlinks, works everywhere |
| ✅ Developer friendly | YES - Can work with both repos locally |
| ✅ User friendly | YES - npm install + configure |
| ✅ Scalable | YES - Add agents without updating CI |

---

## Next Steps

**This Week**:
1. Remove CI/AGENTS directory (data in CollaborativeIntelligence)
2. Create first wrapper (agent-memory-writer)
3. Test wrapper execution
4. Document pattern for team

**Next Sprint**:
1. Convert all scripts to wrappers
2. Create lib/config.js (data root detection)
3. Add `ci configure` command
4. Write integration tests

**Future**:
1. Postinstall script
2. npm packaging
3. Publication
4. User migration

---

## Quick Reference

### Remove CI/AGENTS
```bash
cd /Users/eladm/Projects/Nuru-AI/CI
tar czf ~/ci-backup-$(date +%Y%m%d).tar.gz AGENTS/
rm -rf AGENTS/
```

### Create Wrapper Template
```bash
#!/bin/bash
set -euo pipefail
CI_DATA_ROOT="${CI_DATA_ROOT:-$(ci-detect-data-root)}"
if [ ! -d "$CI_DATA_ROOT/AGENTS" ]; then
    echo "Error: CollaborativeIntelligence not found at: $CI_DATA_ROOT"
    echo "Run: ci configure --data-root /path/to/CollaborativeIntelligence"
    exit 1
fi
SCRIPT_NAME="$(basename "$0")"
exec "$CI_DATA_ROOT/interfaces/claude-bridge/scripts/$SCRIPT_NAME" "$@"
```

### Configure CI
```bash
# Environment variable (override everything)
export CI_DATA_ROOT=~/CollaborativeIntelligence

# User config (persistent)
ci configure --data-root ~/CollaborativeIntelligence

# Project config (per-project)
echo '{"ci_data_root": "~/CollaborativeIntelligence"}' > .ci-config.json
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| "Cannot find data root" | `ci configure --data-root /path/to/CollaborativeIntelligence` |
| "Agent not found" | Check `echo $CI_DATA_ROOT` points to correct location |
| "Memory not updating" | Verify `ls $CI_DATA_ROOT/AGENTS/*/MEMORY.md` exists |

---

**Full Document**: See `CI_OPTIMAL_ARCHITECTURE_DESIGN.md` for complete details.

**Questions**: Contact Architect agent or review architecture documentation.

---
