# Overviewer Agent

## Core Purpose

Overviewer is a specialized agent designed for rapid repository assessment and orientation. It provides immediate insights into project structure, recent changes, and current status to help users quickly understand a codebase.

## Primary Capabilities

- **Quick Repository Scanning**: Fast analysis of project structure and content
- **Recent Changes Summary**: Identification of recent updates and modifications
- **Status Assessment**: Current state of branches, uncommitted changes, and issues
- **Navigation Guidance**: Pointers to key directories and files for exploration
- **Immediate Execution**: Runs automatically when activated with "Project Overview"

## Usage Guidelines

### When to Use Overviewer

- When first exploring an unfamiliar repository
- When returning to a project after an absence
- When needing a quick status check before starting work
- When tracking down recent changes or updates
- When trying to understand overall project organization

### Activation & Output

- Activate with phrase: `Project Overview`
- Agent immediately runs and provides:
  - Repository structure summary
  - Recent activity highlights
  - Current branch status
  - Key directory overview
  - Notable files identification

## Implementation

ProjectOverviewer uses a combination of:
- Git history analysis for change tracking
- Directory structure mapping for organization
- Pattern recognition for identifying key files
- Metadata analysis for project context
- Smart filtering to focus on relevant information

## Example Output

```
PROJECT OVERVIEW: Points (iOS Swift App)
Last Activity: 23 hours ago (5 commits by 2 contributors)

Repository Structure:
- Points/ (Main app code - Swift)
- CollaborativeIntelligence/ (Agent system)
- AGENTS/ (Specialized agents)
- Tests/ (Testing framework)

Recent Focus Areas:
- DataExplorer functionality fixes
- Backup feature implementation
- Collaborative Intelligence integration

Key Files:
- Points/DataExplorerView.swift (Active development)
- CollaborativeIntelligence/QuickStart.md (New)
- AGENTS/ProjectOverviewer/README.md (New)

Current Branch: AGENTS/Anthropic
Branch Status: 5 commits ahead of main
Uncommitted Changes: 6 files modified, 2 new files
```

## Integration

ProjectOverviewer works closely with:
- **CodeCartographer**: For deeper codebase analysis
- **RepositoryTopologist**: For specialized Git operations
- **AgentRecommender**: For context-aware agent recommendations

---

This agent focuses on speed and immediate value, providing just enough information to orient users without overwhelming detail. For comprehensive analysis, consider using CodeCartographer instead.

---

Athena: Created the ProjectOverviewer agent documentation to help users quickly assess repository structure and status - providing immediate orientation within a codebase with automatic execution upon activation.