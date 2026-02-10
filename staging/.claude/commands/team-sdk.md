---
description: Coordinate specialized CollaborativeIntelligence agents on a task
argument-hint: <task description>
---

# Team Collaboration

Coordinate specialized CollaborativeIntelligence agents to work on: **$ARGUMENTS**

## Available Agents

Your CollaborativeIntelligence system has 132+ specialized agents:

**Core Development**:
- **Developer**: Code implementation, refactoring, debugging
- **Architect**: System design, architecture decisions, patterns
- **Tester**: Test creation, quality assurance, verification
- **Debugger**: Issue investigation, root cause analysis

**Analysis & Organization**:
- **Analyst**: Data analysis, system analysis, insights
- **Topologist**: Dependency mapping, system relationships
- **Cartographer**: Code structure mapping, navigation

**Specialized**:
- **Documenter**: Documentation creation and maintenance
- **Researcher**: Research tasks, information gathering
- **Verifier**: Validation, verification, quality checks
- **Optimizer**: Performance optimization, efficiency

*...and 120+ more specialized agents in AGENTS/ directory*

## Your Task

Analyze the following task and determine which agents should be involved:

**Task**: $ARGUMENTS

## Execution Strategy

1. **Analyze the task** to identify:
   - What type of work is needed (implementation, analysis, debugging, etc.)
   - Which domains are involved (code, data, architecture, etc.)
   - Complexity level (single agent vs team collaboration)

2. **Select appropriate agents**:
   - For implementation: Developer, Architect, Tester
   - For analysis: Analyst, Topologist, Cartographer
   - For debugging: Debugger, Developer, Verifier
   - For documentation: Documenter, Developer
   - Adapt based on specific task requirements

3. **Use the Task tool** to delegate to each selected agent:
   - Pass full context about the task
   - Load agent memories from AGENTS/*/MEMORY.md or CONTEXT_INJECTION.md
   - Coordinate their work with proper sequencing if needed

4. **Synthesize results**:
   - Combine insights from all agents
   - Resolve any conflicts or overlaps
   - Provide comprehensive response

## CollaborativeIntelligence Features

Your agents have access to:
- **Persistent Memory**: Each agent has MEMORY.md with context
- **Optimized Context**: Some agents use CONTEXT_INJECTION.md (preferred)
- **Coordination State**: .state/coordination-state.json tracks active work
- **File-based Workflows**: Approval gates, checkpointing, session tracking

## Example Delegation Pattern

```
For "implement user authentication":
  1. Use Task tool → @agent-architect "Design auth architecture"
  2. Use Task tool → @agent-developer "Implement OAuth2 flow"
  3. Use Task tool → @agent-tester "Create authentication tests"
  4. Synthesize their work into complete solution
```

## Notes

- **Parallel execution**: You can invoke multiple agents simultaneously for faster results
- **Sequential when needed**: Some tasks require coordination (architect → developer → tester)
- **Agent memory**: Agents have context from previous sessions in their MEMORY.md files
- **Cost tracking**: Claude Code automatically tracks tokens and costs per agent

---

**Execute this task by coordinating the appropriate team of CollaborativeIntelligence agents.**
