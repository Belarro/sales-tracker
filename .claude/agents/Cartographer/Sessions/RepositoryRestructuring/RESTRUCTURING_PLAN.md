# Repository Restructuring Plan

## Current Issues

1. **Inconsistent Directory Naming**: Mix of uppercase (e.g., `AGENTS`, `CACHE`) and lowercase (e.g., `scripts`, `agent_cache`) directories
2. **Scattered Documentation**: Documentation files spread across multiple locations
3. **Unclear Resource Organization**: Implementation files, tools, and configuration mixed at the root level
4. **Inconsistent Casing in Directories**: `BENCHMARKS` vs `Benchmarks`, `CACHE` vs `cache`
5. **Ambiguous Category Boundaries**: Overlap between `Architectures`, `Plans`, and `Documentation` directories
6. **Orphaned Files**: Several files at the root level that belong in specific directories

## Restructuring Goals

1. **Standardize Naming Conventions**: Adopt consistent casing for all directories
2. **Centralize Similar Resources**: Group related files and directories 
3. **Improve Navigation**: Create logical hierarchy for easier discovery
4. **Reduce Root Clutter**: Move files from root to appropriate subdirectories
5. **Simplify Maintenance**: Organize related components close together
6. **Enhance Discoverability**: Make it easier to find specific resources

## Implementation Plan

### Phase 1: Directory Structure Standardization

**Approach**: Standardize on lowercase directory names for all non-agent directories and keep `AGENTS` uppercase to maintain its special status.

| Current Directory | New Directory |
|-------------------|---------------|
| `AGENTS` | Remains `AGENTS` (maintain special status) |
| `BENCHMARKS` | `benchmarks` |
| `CACHE` | `cache` |
| `CRITICAL_SYSTEM_ISSUES` | `critical-system-issues` |
| `MARKDOWN_DESIGNS` | `markdown-designs` |
| `OPTIMIZATIONS` | `optimizations` |
| `PRIORITY` | `priority` |
| `SPECS` | `specs` |
| `SYSTEMS` | `systems` |

### Phase 2: Resource Consolidation

1. **Code Implementation**
   - Move all implementation code to a new `src` directory
   - Consolidate `ci-tools`, `scripts`, and root-level implementation files
   - Structure as:
     ```
     src/
     ├── cli/         (CLI implementation)
     ├── core/        (Core functionality)
     ├── tools/       (Tools and utilities)
     ├── plugins/     (Plugin system)
     └── db/          (Database implementation)
     ```

2. **Documentation Organization**
   - Create a unified `docs` directory with categorized subdirectories:
     ```
     docs/
     ├── architecture/     (System architecture docs)
     ├── agents/           (Agent-specific documentation)
     ├── protocols/        (Protocol documentation)
     ├── user-guides/      (End-user documentation)
     ├── developer/        (Developer documentation)
     └── specifications/   (Detailed specifications)
     ```

3. **Configuration and Templates**
   - Create a `config` directory for all configuration files
   - Create a `templates` directory for all templates

4. **Tools and Scripts Consolidation**
   - Move all scripts to a unified `scripts` directory with subdirectories by purpose

### Phase 3: Project Organization

1. **Create a `projects` directory** to contain all project-specific files
   - Consolidate existing projects and project-related files

2. **Create a `lib` directory** for shared libraries and modules
   - Move reusable code components here

3. **Create a `tests` directory** for all test files and test data

### Phase 4: Special Resources

1. **Data Management**
   - Consolidate all data-related resources in the `data` directory
   - Organize with clear subdirectories

2. **Kanji Project Isolation**
   - Keep the `Kanji` project as a separate directory due to its unique nature

3. **Knowledge Registry**
   - Maintain `KnowledgeRegistry` as a separate entity

## Implementation Strategy

We will implement this restructuring in stages:

1. **Analysis & Planning**:
   - ✅ Complete directory mapping
   - ✅ Create detailed restructuring plan
   - ✅ Define new directory structure

2. **Preparation**:
   - Create new directory structure without moving files
   - Update key configuration files to reflect planned changes
   - Create git branch for restructuring work

3. **Migration**:
   - Execute directory renaming
   - Move files to new locations
   - Update references in documentation
   - Fix import paths in code

4. **Validation**:
   - Verify all references are updated
   - Test system functionality
   - Document new structure

5. **Finalization**:
   - Clean up empty directories
   - Update README and documentation
   - Create PR for the changes

## Directory Structure Mapping

### Current → New Structure

```
CollaborativeIntelligence/
├── AGENTS/                       → AGENTS/  (unchanged)
├── BENCHMARKS/                   → benchmarks/
├── CACHE/                        → cache/
├── Architectures/                → docs/architecture/
├── Documentation/                → docs/
├── KnowledgeRegistry/            → knowledge-registry/
├── MARKDOWN_DESIGNS/             → markdown-designs/
├── OPTIMIZATIONS/                → optimizations/
├── Plans/                        → docs/plans/
├── Projects/                     → projects/
├── Protocols/                    → protocols/
├── SPECS/                        → specs/
├── SYSTEMS/                      → systems/
├── Sessions/                     → sessions/
├── Terminal/                     → src/terminal/
├── Visions/                      → docs/visions/
├── agent_cache/                  → src/agent-cache/
├── ci-rust-minimal/              → src/cli/minimal/
├── ci-tools/                     → src/cli/tools/
├── scripts/                      → scripts/
└── various root files            → appropriate subdirectories
```

## Implementation Timeline

1. **Day 1**: Directory structure standardization (Phase 1)
2. **Day 2**: Code implementation reorganization (Phase 2-1)
3. **Day 3**: Documentation and configuration reorganization (Phase 2-2 & 2-3)
4. **Day 4**: Tools and scripts consolidation (Phase 2-4)
5. **Day 5**: Project organization and special resources (Phase 3 & 4)
6. **Day 6**: Validation and finalization

## Risks and Mitigations

1. **Risk**: Breaking existing references in code and documentation
   - **Mitigation**: Use automated search and replace for path updates

2. **Risk**: System functionality disruption
   - **Mitigation**: Implement changes in a separate branch and test thoroughly

3. **Risk**: Loss of git history for moved files
   - **Mitigation**: Use `git mv` to preserve history when moving files

4. **Risk**: Conflicts with ongoing development
   - **Mitigation**: Coordinate with team to minimize conflicts

## Expected Benefits

1. Improved discoverability of code and documentation
2. Reduced cognitive load when navigating the repository
3. Easier onboarding for new contributors
4. More consistent naming and organization patterns
5. Better separation of concerns between different resource types
6. Enhanced maintainability through logical grouping