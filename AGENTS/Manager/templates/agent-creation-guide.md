# Comprehensive Agent Creation Guide

## Overview

This guide provides complete instructions for creating new agents in the Collaborative Intelligence System. With the integration of Streamliner's automation tools, agent creation is now 60% faster while maintaining high quality standards.

## Quick Start

### Single Agent Creation
```bash
# Basic creation
./scripts/create-agent.sh AgentName "Agent Role"

# With description
./scripts/create-agent.sh AgentName "Agent Role" "Detailed agent description"
```

### Batch Agent Creation
```bash
# Create multiple agents from config
./scripts/batch-create-agents.sh batch-config.json
```

### Pre-Creation Validation
```bash
# Validate before creation
./scripts/validate-agent.sh AgentName "Agent Role" --check-similarity
```

## Detailed Process

### 1. Planning Phase

Before creating an agent, consider:

1. **Necessity**: Is this functionality truly unique?
2. **Similarity**: Are there existing agents with overlapping roles?
3. **Integration**: How will this agent interact with others?
4. **Scope**: Is the role well-defined and bounded?

### 2. Validation Phase

Run validation to ensure:
- Name follows conventions (alphanumeric, starts with letter)
- No existing agent with same name
- Role is clearly defined
- No high similarity with existing agents

```bash
./scripts/validate-agent.sh MyNewAgent "Data validation specialist" --check-similarity
```

### 3. Creation Phase

#### Option A: Single Agent (Recommended)
```bash
./scripts/create-agent.sh DataValidator "Data validation and integrity specialist" \
  "Ensures data consistency and validity across all system operations"
```

#### Option B: Batch Creation
Create a JSON configuration file:

```json
{
  "agents": [
    {
      "name": "DataValidator",
      "role": "Data validation specialist",
      "description": "Ensures data integrity across the system"
    },
    {
      "name": "ErrorHandler",
      "role": "Error management specialist",
      "description": "Handles system errors and exceptions gracefully"
    }
  ]
}
```

Then run:
```bash
./scripts/batch-create-agents.sh agents-config.json
```

### 4. Post-Creation Tasks

After creation, complete these tasks:

1. **Review Generated Files**
   - Check `README.md` for accuracy
   - Verify `MEMORY.md` structure
   - Examine `ContinuousLearning.md` framework

2. **Update Templates**
   - Fill in `[TO BE FILLED]` sections
   - Add specific responsibilities
   - Define integration points
   - Set success metrics

3. **Update Registry**
   - Ensure `AGENTS.md` is updated
   - Add complete agent profile
   - Document relationships

4. **Configure Integration**
   - Define communication protocols
   - Establish data exchange formats
   - Set up collaboration patterns

## File Structure

Each agent follows this standard structure:

```
AGENTS/AgentName/
├── README.md              # Core identity and documentation
├── MEMORY.md              # Memory architecture
├── ContinuousLearning.md  # Learning framework
├── Sessions/              # Session records
│   └── README.md         # Session organization
└── creation-report.md     # Creation details
```

## Naming Conventions

### Agent Names
- Start with uppercase letter
- Use PascalCase (e.g., DataValidator, ErrorHandler)
- Be descriptive but concise
- Avoid generic terms (e.g., Helper, Manager)

### File Names
- Core files use standard names (README.md, MEMORY.md)
- Session directories use date-project format
- Scripts use kebab-case (create-agent.sh)

## Template Customization

### README.md Template Structure
```markdown
# AgentName Agent

## Purpose
[Clear, concise purpose statement]

## Core Identity
As AgentName, I specialize in [specialization]. My primary focus is on [focus areas].

## Primary Responsibilities
- [Specific responsibility 1]
- [Specific responsibility 2]
- [Specific responsibility 3]

## Activation Context
Activate me when:
- [Specific use case 1]
- [Specific use case 2]
- [Specific use case 3]

## Operational Guidelines
- [Guideline 1]
- [Guideline 2]
- [Guideline 3]

## Integration Points
I work closely with:
- **AgentName**: [How we collaborate]
- **AgentName**: [How we collaborate]

## Success Metrics
I measure success through:
- [Metric 1]
- [Metric 2]
- [Metric 3]
```

### MEMORY.md Template Structure
```markdown
# AgentName Memory Architecture

## Long-Term Memory: Core Identity

### Fundamental Purpose
[Core purpose statement]

### Guiding Principles
1. [Principle 1]
2. [Principle 2]
3. [Principle 3]

### Core Frameworks
[Framework descriptions]

## Short-Term Memory: Current Initiatives

### Active Focus Areas
1. [Current focus 1]
2. [Current focus 2]

### Immediate Next Steps
1. [Next step 1]
2. [Next step 2]

### Contextual Prompts for Session Resumption
- [Context prompt 1]
- [Context prompt 2]
```

## Validation Rules

### Name Validation
- Must start with a letter
- Only alphanumeric characters allowed
- Length: 3-30 characters
- No reserved names (Manager, System, Admin)

### Role Validation
- Must be descriptive
- Length: 5-100 characters
- Should indicate specialization

### Similarity Checking
- Name similarity threshold: 70%
- Role similarity threshold: 60%
- High similarity warning: 80%

## Best Practices

### 1. Before Creation
- Run similarity check
- Validate unique purpose
- Plan integration points
- Define clear boundaries

### 2. During Creation
- Use descriptive names
- Provide detailed descriptions
- Follow template structure
- Document thoroughly

### 3. After Creation
- Complete all templates
- Update agent registry
- Configure relationships
- Test basic operations

## Common Issues and Solutions

### Issue: High Similarity Detected
**Solution**: Review existing agents and consider:
- Enhancing existing agent instead
- Merging similar functionalities
- Refining scope to be more unique

### Issue: Creation Failed
**Solution**: Check:
- Agent doesn't already exist
- Name follows conventions
- All required arguments provided
- Scripts have execution permissions

### Issue: Registry Not Updated
**Solution**: 
- Run registry update manually
- Check for Python installation
- Verify script permissions

## Integration with Streamliner

The Manager agent now integrates with Streamliner's optimized tools:

1. **Automatic Detection**: Manager checks for Streamliner's scripts
2. **Fallback Support**: Uses Manager templates if Streamliner unavailable
3. **Time Savings**: 60% faster creation with Streamliner
4. **Compatibility**: Seamless integration between both systems

## Performance Metrics

### Traditional Process
- Time: ~30 minutes
- Steps: 15-20 manual steps
- Error Rate: 10-15%

### Automated Process
- Time: ~12 minutes (60% improvement)
- Steps: 3-5 automated steps
- Error Rate: <5%

## Advanced Features

### Custom Templates
Store custom templates in:
```
AGENTS/Manager/templates/custom/
```

### Validation Extensions
Add custom validation rules:
```bash
./scripts/validate-agent.sh --custom-rules my-rules.json
```

### Batch Configuration
Advanced batch options:
```json
{
  "agents": [...],
  "options": {
    "skip_validation": false,
    "update_registry": true,
    "generate_report": true
  }
}
```

## Maintenance

### Regular Tasks
1. Update agent index weekly
2. Review orphaned agents monthly
3. Validate template consistency
4. Check for outdated agents

### Index Generation
```bash
./generate-index.sh
```

This creates `AGENTS-FULL.md` for comprehensive analysis.

---

## Quick Reference Card

### Essential Commands
```bash
# Create single agent
./scripts/create-agent.sh Name "Role" "Description"

# Validate agent
./scripts/validate-agent.sh Name "Role" --check-similarity

# Batch create
./scripts/batch-create-agents.sh config.json

# Generate index
./generate-index.sh
```

### File Locations
- Scripts: `AGENTS/Manager/scripts/`
- Templates: `AGENTS/Manager/templates/`
- Reports: `AGENTS/[AgentName]/creation-report.md`
- Index: `AGENTS/Manager/AGENTS-FULL.md`

### Support
- Manager Agent: Overall coordination
- Streamliner Agent: Process optimization
- Athena: Memory architecture guidance
- Fixer: Troubleshooting issues

---

Last Updated: 2025-05-17