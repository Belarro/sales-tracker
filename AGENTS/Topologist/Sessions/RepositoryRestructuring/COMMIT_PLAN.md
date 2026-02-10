# Repository Restructuring Commit Plan

## Overview
This plan organizes the current changes into logical groups for structured commits, ensuring proper repository organization and attribution.

## Group 1: CI Infrastructure Restructuring
**Description**: Reorganize CI scripts and tools into a more logical directory structure, moving from ci-tools/ to specialized locations.

**Files**:
- Moved: ci-tools/lib/agent-activator.sh → agent_cache/legacy/agent-activator.sh
- Moved: ci-tools/CI → ci-rust-minimal/legacy/CI
- Moved: ci-tools/CI.refactored → ci-rust-minimal/legacy/CI.refactored
- Deleted: ci-tools/CI.original
- Moved: ci-tools/templates/CLAUDE.md.template → core/templates/CLAUDE.md.template
- Moved: ci-tools/README.md → docs/guides/ci-tools/README.md
- Moved: ci-tools/USAGE.md → docs/guides/ci-tools/USAGE.md
- Moved: ci-tools/lib/common.sh → scripts/legacy/common.sh
- Moved: ci-tools/lib/rust-memory-bridge.sh → scripts/legacy/rust-memory-bridge.sh
- Moved: ci-tools/test/* → scripts/tests/legacy/*

**Modified**:
- CI (main script)
- scripts/legacy/rust-memory-bridge.sh (updates for new location)
- .gitignore (updated patterns for restructured directories)

**Size Impact**: 
- Files moved: 14
- Lines deleted: 594
- Estimated repository size change: -594 lines

**Attributed to**: Refactorer, Topologist

## Group 2: Memory System Rust Implementation
**Description**: Implementation of memory system components in Rust, replacing bash scripts for improved performance and reliability.

**New Files**:
- scripts/memory_bridge.rs
- scripts/memory_cache.rs
- scripts/memory_integration.rs
- scripts/migration_plan.rs
- scripts/memory_activation_model.rs
- scripts/memory_segment_parser.rs
- scripts/memory_updater.rs
- scripts/unified_memory_cli.rs
- scripts/legacy/memory-loader.sh
- scripts/legacy/update_references.sh
- docs/guides/ci-tools/MIGRATION.md

**Modified**:
- scripts/Cargo.toml (updated dependencies and targets)
- .collaborative-intelligence.json (configuration updates)

**Size Impact**:
- New Rust code: ~3,500 lines
- Estimated repository size change: +3,500 lines

**Attributed to**: Database, Memory, Refactorer

## Group 3: Athena Memory Optimization Integration
**Description**: Integration of Athena's memory optimization system with documentation and implementation reports.

**New Files**:
- AGENTS/Athena/Sessions/MemoryOptimizationIntegration/IMPLEMENTATION_REPORT.md
- AGENTS/Athena/Sessions/MemoryOptimizationIntegration/MEMORY_FEATURES_DOCUMENTATION.md
- AGENTS/Athena/Sessions/MemoryOptimizationIntegration/USAGE_EXAMPLES.md

**Size Impact**:
- New documentation: ~500 lines
- Estimated repository size change: +500 lines

**Attributed to**: Athena

## Group 4: Agent Session Metadata
**Description**: Updates to agent session tracking and metadata.

**New Files**:
- AGENTS/Refactorer/Sessions/1747714608.json
- AGENTS/Refactorer/metadata.json
- AGENTS/Refactorer/working_1747714608.md
- AGENTS/Topologist/Sessions/1747716369.json
- AGENTS/Topologist/metadata.json
- AGENTS/Topologist/working_1747716369.md

**Size Impact**:
- New metadata files: ~100 lines
- Estimated repository size change: +100 lines

**Attributed to**: Refactorer, Topologist

## Total Impact
- Files moved or renamed: 14
- New files: ~20
- Lines added: ~4,100
- Lines deleted: ~600
- Net change: +3,500 lines

## Recommendations
1. Commit Group 1 first as it establishes the new directory structure
2. Commit Group 2 next as it adds the core Rust implementation
3. Commit Group 3 after as it depends on the memory system
4. Commit Group 4 last as it's lower priority metadata

Each commit should include a detailed message describing the purpose and impact of the changes.