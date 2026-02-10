# Sequential Commit Protocol

## Overview
The Sequential Commit Protocol is a systematic approach to organizing and committing repository changes in logical, coherent groups. This process ensures clean git history, proper file organization, and comprehensive documentation of changes.

## Protocol Definition
A "sequential commit request" refers to the complete process of:
1. **Repository Analysis** - Understanding current state and untracked files
2. **Comprehensive .gitignore Creation** - Filtering generated and large files
3. **Logical Grouping** - Organizing files into coherent commit groups
4. **Sequential Commits** - Creating commits in dependency order
5. **Repository Push** - Synchronizing with remote repository

## Sequential Commit Process

### Phase 1: Repository Analysis & Cleanup
```bash
# Analyze current repository state
git status

# Review directory structure
ls -la

# Identify large files and generated artifacts
find . -name "*.dSYM" -o -name "dist" -o -name "out" -o -name "*.pdf"
```

### Phase 2: Comprehensive .gitignore Implementation
**Create/update .gitignore with patterns for:**
- Build artifacts: `dist/`, `out/`, `.next/`, `build/`
- Debug symbols: `*.dSYM/`, compiled binaries
- Large files: `*.pdf`, `*.zip`, `*.tar.gz`, videos
- Platform-specific: `.DS_Store`, `Thumbs.db`, `._*`
- Development tools: `.vscode/`, `.idea/`, cache directories
- Generated documentation and temporary files

**Commit .gitignore first:**
```bash
git add .gitignore
git commit -m "Add comprehensive .gitignore for [PROJECT] project"
```

### Phase 3: Logical File Grouping Strategy

#### Group 1: Project Foundation
- Configuration files: `.env.example`, `Makefile`, `docker-compose.yml`
- Package managers: `package.json`, `requirements.txt`
- Basic project setup files

#### Group 2: Infrastructure & Architecture  
- `infrastructure/` directory
- `services/` microservices
- Deployment configurations
- Database schemas and migrations

#### Group 3: Automation & Scripts
- `scripts/` directory
- Shell scripts for deployment and testing
- Build automation tools

#### Group 4: Content & Data Structure
- Content directories (`tours/`, `content/`)
- Templates and data structures
- Sample data and configurations

#### Group 5: Source Code & Components
- React components and libraries
- Core application code
- UI/UX implementations

#### Group 6: Development Tools
- CLI tools and utilities
- Testing infrastructure
- Build scripts and automation

#### Group 7: Documentation Layers
- **Technical Documentation**: Architecture, APIs, specifications
- **Implementation Guides**: Step-by-step instructions
- **Reference Materials**: Detailed technical references
- **Project Management**: Status reports, tracking documents
- **Business Documentation**: Strategy, analysis, requirements

#### Group 8: Project Updates
- Modified existing files
- Configuration updates
- Documentation enhancements

### Phase 4: Sequential Commit Execution

For each logical group:
```bash
# Stage files for the group
git add [group_files]

# Create descriptive commit message
git commit -m "$(cat <<'EOF'
[TITLE]: Brief description of group purpose

[DETAILED_DESCRIPTION]:
- Specific file 1: Purpose and functionality
- Specific file 2: Purpose and functionality
- Specific file 3: Purpose and functionality

[IMPACT_STATEMENT]: How this contributes to project goals

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### Phase 5: Repository Synchronization
```bash
# Review commit history
git log --oneline -20

# Verify clean working directory
git status

# Push to remote repository
git push origin main
```

## Commit Message Standards

### Structure Template
```
[GROUP_TYPE]: [BRIEF_DESCRIPTION]

[DETAILED_SECTION]:
- Component 1: Specific purpose
- Component 2: Specific purpose  
- Component 3: Specific purpose

[IMPACT_STATEMENT]

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Group Type Examples
- **Add**: New functionality or files
- **Update**: Modifications to existing files
- **Configure**: Configuration and setup files
- **Implement**: Core functionality implementation
- **Document**: Documentation additions
- **Infrastructure**: System architecture components

## Quality Assurance Checklist

### Pre-Commit Verification
- [ ] All generated files properly ignored by .gitignore
- [ ] No sensitive information (keys, passwords) included
- [ ] File grouping follows logical dependency order
- [ ] Commit messages are descriptive and consistent
- [ ] Large binary files excluded from repository

### Post-Commit Verification
- [ ] `git status` shows clean working directory
- [ ] All intended files properly committed
- [ ] Commit history is logical and readable
- [ ] No unintended files included in commits

### Push Verification
- [ ] Remote repository successfully updated
- [ ] Local and remote branches synchronized
- [ ] No push conflicts or errors
- [ ] Repository structure maintained integrity

## Benefits of Sequential Commit Protocol

### Clean Git History
- Logical commit progression
- Easy to understand project evolution
- Clear separation of concerns
- Reviewable changes in context

### Repository Organization
- Systematic file organization
- Proper separation of generated vs source files
- Consistent documentation structure
- Maintainable codebase architecture

### Collaboration Enhancement
- Clear commit messages for team understanding
- Logical change groupings for code review
- Consistent development practices
- Reduced merge conflicts

### Project Management
- Trackable progress through commit history
- Documentation of architectural decisions
- Clear project milestone markers
- Audit trail for changes

## Common Patterns & Anti-Patterns

### ✅ Good Practices
- Start with .gitignore to filter unnecessary files
- Group related files together logically
- Write descriptive commit messages with context
- Follow dependency order (foundation → implementation → documentation)
- Verify clean working directory before push

### ❌ Anti-Patterns  
- Committing generated files or build artifacts
- Creating massive commits with unrelated changes
- Vague commit messages without context
- Ignoring dependency relationships between files
- Pushing without verifying repository state

## Customization Guidelines

### Project-Specific Adaptations
- Adjust .gitignore patterns for project technology stack
- Modify grouping strategy based on project structure
- Customize commit message templates for team standards
- Adapt quality checklist for specific requirements

### Technology Stack Considerations
- **Node.js**: Include `node_modules/`, `.next/`, `dist/`
- **Python**: Include `__pycache__/`, `*.pyc`, `.venv/`
- **Rust**: Include `target/`, `*.lock`
- **Docker**: Include generated containers and build artifacts
- **Database**: Include generated migrations and seed data

## Integration with Other Protocols

### Repository Boundary Enforcement
- Ensure sequential commits respect repository isolation
- Maintain clear separation between different projects
- Document cross-repository dependencies appropriately

### Change Impact Analysis
- Assess impact of each commit group on other components
- Document breaking changes or API modifications
- Include migration guides for significant changes

### Version Control Best Practices
- Tag significant milestones after major commit sequences
- Create branches for experimental or high-risk changes
- Maintain consistent branching strategy across commits

---

**Protocol Version**: 1.0  
**Last Updated**: August 2, 2025  
**Maintained By**: Topologist Agent  
**Status**: Active