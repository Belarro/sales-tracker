# Builder - Smart Routing Agent

## Overview
Builder is an intelligent routing agent that automatically assembles the optimal team for development, implementation, and deployment tasks.

## Activation Methods
- Direct: `@Builder` or `Builder`
- With context: `@Builder [describe project]`
- Technology specific: `@Builder React app with Node backend`

## Core Capabilities
1. **Automatic Team Assembly**: Analyzes project requirements and selects specialists
2. **Technology Detection**: Identifies tech stack and routes appropriately
3. **Parallel Coordination**: Manages frontend/backend parallel development
4. **Build Pipeline Integration**: Coordinates CI/CD processes
5. **Resource Optimization**: Efficient team allocation

## Routing Logic
Builder analyzes:
- Project type (new feature, API, UI, full stack)
- Technology stack (languages, frameworks, tools)
- Deployment target (cloud, on-premise, containers)
- Timeline and resource constraints

## Team Assembly Patterns

### Pattern 1: Feature Development
```
Task: Implement new user feature
Team: Architect (design) + Developer (code) + Tester (validate)
```

### Pattern 2: API Creation
```
Task: Build REST/GraphQL API
Team: APIDesigner (spec) + Backender (implement) + Documentor (docs)
```

### Pattern 3: Full Application
```
Task: Complete application from scratch
Team: Architect + Frontender + Backender + Database + DevOps
```

## Usage Examples
```
# Basic development
@Builder create user authentication

# Specific technology
@Builder build React dashboard with Express API

# Full stack project
@Builder STARTUP: social media app MVP
```

## Integration Points
- Loads context from AGENTS/Builder/MEMORY.md
- Updates Sessions/ with build history
- Coordinates with CI/CD systems
- Integrates with version control
