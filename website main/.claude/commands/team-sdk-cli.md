---
description: Team SDK Standalone CLI (for automation/scripting)
argument-hint: <task> --agents <agents> [options]
allowed-tools: Bash
---

# Team SDK CLI Mode

Execute the Team SDK in standalone CLI mode with advanced features.

## When to Use This

- **Automation scripts** that need programmatic output
- **CI/CD pipelines** where UX doesn't matter
- **Advanced features**: Intent parsing, approval gates, checkpointing
- **Custom orchestration** with specific agent selection

## Usage

```bash
/team-sdk-cli <task> [options]
```

## Options

- `--agents <list>` - Comma-separated agent names (e.g., Developer,Tester)
- `--auto` - Auto-select agents based on intent analysis
- `--max-cost <usd>` - Maximum cost limit
- `--timeout <ms>` - Execution timeout
- `--verbose` - Show individual agent outputs

## Examples

```bash
# With specific agents
/team-sdk-cli "implement auth" --agents Developer,Architect

# Auto-select agents
/team-sdk-cli "debug issue" --auto

# With cost limit
/team-sdk-cli "analyze code" --agents Developer --max-cost 5.0 --verbose
```

## Output

Returns JSON-formatted results with:
- Synthesis of agent work
- Cost tracking per agent
- Token usage statistics
- Duration metrics

## Technical Details

This uses the TypeScript orchestrator with:
- Intent parser for auto agent selection
- Memory loader for CI agent context
- Programmatic SDK for parallel execution
- Result capture for synthesis

---

!node /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/integrations/team-sdk/dist/cli.js "$ARGUMENTS"
