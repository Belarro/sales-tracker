# Researcher Agent Session - 2025-10-08

## Mission: Agent Memory Management Pattern Research

**Objective**: Research agent memory management patterns in Claude Agent SDK examples and documentation.

## Research Scope

**Target**: 14 files in ~/.claude/examples/sdk/ (2,823 lines total)

**Research Questions**:
1. What are best practices for agent memory management in Claude Agent SDK?
2. How do agents store and retrieve context?
3. What are session management and persistence patterns?
4. What are memory limits and size constraints?
5. What are context injection patterns?
6. How is state managed between turns?
7. How is cache utilization optimized for memory?

## Files Analyzed (Complete Read - 100%)

### Core Files (14 total)
1. **README.md** (108 lines) - Overview and file organization
2. **01-core-patterns.ts** (807 lines) - Basic query, streaming, errors, models, tools
3. **02-custom-tools.ts** (631 lines) - tool(), createSdkMcpServer(), Zod schemas
4. **03-file-operations.ts** (62 lines) - Read/Write tools, working directory
5. **04-subagent-essentials.ts** (399 lines) - Handoff, parallel, context, tracking
6. **05-subagent-production.ts** (60 lines) - Error propagation, tool restrictions
7. **06-hooks-complete.ts** (210 lines) - PreToolUse, PostToolUse, SubagentStop
8. **07-cost-tracking.ts** (198 lines) - Budget management, model degradation
9. **08-sessions.ts** (86 lines) - Create, resume, fork, context
10. **09-permissions.ts** (47 lines) - Permission modes and rules
11. **10-streaming-modes.ts** (48 lines) - AsyncIterable vs string modes
12. **11-slash-commands.ts** (44 lines) - Custom commands with arguments
13. **12-todos.ts** (37 lines) - TodoWrite lifecycle
14. **13-complete-application.ts** (86 lines) - Full production example

**Total Lines Read**: 2,823 lines
**Verification Date**: 2025-10-08
**Read Status**: ALL files read COMPLETELY (no limit parameter used)

## Key Findings

### 1. Memory Management Architecture

The Claude Agent SDK uses **conversation-based memory** rather than explicit memory stores:

#### Session-Based Memory (08-sessions.ts)
- **Sessions persist conversation history** across multiple query() calls
- Session ID format: unique identifier per conversation
- Memory persistence: automatic, tied to working directory
- Resumption: sessions remember previous context automatically

```typescript
// Lines 9-22 (08-sessions.ts)
async function createSession() {
  const sessionId = 'my-session-001';

  const result = await query({
    prompt: 'Remember that my favorite color is blue',
    options: {
      session_id: sessionId,
      maxTurns: 3
    }
  });
}

// Lines 25-37 (08-sessions.ts)
async function resumeSession() {
  const sessionId = 'my-session-001';

  const result = await query({
    prompt: 'What is my favorite color?',  // Should remember "blue"
    options: {
      session_id: sessionId,
      maxTurns: 3
    }
  });
}
```

#### Context Passing Through Prompts (01-core-patterns.ts, 04-subagent-essentials.ts)
- **Primary memory mechanism**: Context embedded in system prompts and user messages
- **No explicit memory API**: Memory is conversational context
- **Agent definitions carry memory**: Specialized prompts hold domain knowledge

### 2. Context Injection Patterns

#### Pattern 1: System Prompt Injection (01-core-patterns.ts, lines 421-439)

**Best Practice**: Use systemPrompt to inject persistent context

```typescript
await query({
  prompt: 'Write a Python script',
  options: {
    systemPrompt: {
      type: 'custom',
      prompt: `You are an expert Python developer. Always:
- Follow PEP 8 style guidelines
- Include type hints
- Add docstrings
- Handle errors gracefully
- Write production-ready code`
    },
    maxTurns: 10
  }
});
```

**Use Cases**:
- Agent personality/role definition
- Coding standards and constraints
- Domain knowledge injection
- Behavioral rules

#### Pattern 2: Context Through Agent Definitions (04-subagent-essentials.ts, lines 236-281)

**Best Practice**: Pass context explicitly when delegating to subagents

```typescript
// Lines 252-262 (04-subagent-essentials.ts)
const context = `
Project: E-commerce platform
Stack: React, Node.js, PostgreSQL
Team size: 5 developers
Timeline: 3 months
`;

const task = `${context}

Task: Delegate to specialist to review the authentication system for security issues.`;
```

**Key Insight**: "When delegating, pass ALL relevant context to the specialist" (line 272)

#### Pattern 3: Multi-Turn Context Streaming (01-core-patterns.ts, lines 84-118)

**Best Practice**: Use AsyncIterable<SDKUserMessage> for dynamic context

```typescript
// Lines 86-99 (01-core-patterns.ts)
async function* userMessages(): AsyncIterable<SDKUserMessage> {
  // Initial user message
  yield {
    type: 'user',
    message: {
      role: 'user',
      content: 'What is the capital of France?'
    }
  };

  // You could yield more messages here for multi-turn
  // Or yield tool results, session data, etc.
}
```

### 3. State Management Between Turns

#### Tracking Mechanisms

**parent_tool_use_id Tracking** (04-subagent-essentials.ts, lines 112-132):
- `parent_tool_use_id: null` = main agent message
- `parent_tool_use_id: "id"` = subagent responding to parent
- `isSynthetic: true` = system-generated message

```typescript
// Lines 147-164 (04-subagent-essentials.ts)
for await (const message of query({
  prompt: 'Research quantum computing',
  options: { agents, maxTurns: 10 }
})) {
  if (message.type === 'user') {
    if (message.parent_tool_use_id) {
      console.log(`🔄 HANDOFF to subagent (parent: ${message.parent_tool_use_id})`);
    }
  }

  if (message.type === 'assistant') {
    if (message.parent_tool_use_id) {
      console.log(`🤖 SUBAGENT response (parent: ${message.parent_tool_use_id})`);
    }
  }
}
```

#### Turn-by-Turn State Accumulation

**Pattern**: State accumulates through conversation history, not explicit memory

```typescript
// Lines 520-542 (01-core-patterns.ts)
let turnCount = 0;

for await (const message of query({
  prompt: 'Complete task',
  options: { allowedTools: ['bash'], maxTurns: 20 }
})) {
  if (message.type === 'assistant' || message.type === 'user') {
    turnCount++;
    console.log(`Turn ${turnCount}`);
  }

  if (message.type === 'result') {
    console.log(`Completed in ${turnCount} turns`);
    console.log(`Total turns: ${message.num_turns}`);
  }
}
```

### 4. Memory Limits and Size Constraints

#### Turn Limits (01-core-patterns.ts, lines 486-513)

**Best Practice**: Set maxTurns based on task complexity

```typescript
// Simple task: 1 turn
await query({
  prompt: 'What is 2+2?',
  options: { maxTurns: 1 }
});

// Tool-using task: 5-10 turns
await query({
  prompt: 'Read and analyze file',
  options: {
    allowedTools: ['read', 'bash'],
    maxTurns: 10
  }
});

// Complex multi-step: 20-30 turns
await query({
  prompt: 'Complete code review and refactor',
  options: {
    allowedTools: ['read', 'write', 'bash'],
    maxTurns: 30
  }
});
```

**Turn Guidelines**:
- 1 turn: Simple questions, no tools
- 5-10 turns: Single tool operations
- 20-30 turns: Complex multi-step tasks
- Always set maxTurns to prevent infinite loops

#### Cost-Based Limits (07-cost-tracking.ts, lines 13-75)

**Pattern**: Track memory/context costs through budget management

```typescript
// Lines 20-47 (07-cost-tracking.ts)
class CostTracker {
  private totalCost: number = 0;
  private costByModel: Map<string, number> = new Map();

  constructor(private budget: BudgetConfig) {}

  recordCost(model: string, costUSD: number): void {
    this.totalCost += costUSD;
    const current = this.costByModel.get(model) || 0;
    this.costByModel.set(model, current + costUSD);
  }

  getStatus() {
    const percentUsed = this.totalCost / this.budget.maxCostUSD;
    let status: 'ok' | 'warning' | 'critical' | 'exceeded' = 'ok';

    if (percentUsed >= 1.0) status = 'exceeded';
    else if (percentUsed >= this.budget.criticalThreshold) status = 'critical';
    else if (percentUsed >= this.budget.warningThreshold) status = 'warning';

    return {
      totalCost: this.totalCost,
      budgetRemaining: Math.max(0, this.budget.maxCostUSD - this.totalCost),
      percentUsed,
      status,
      canContinue: !this.budget.hardStop || percentUsed < 1.0
    };
  }
}
```

### 5. Cache Utilization for Memory

**Key Finding**: No explicit cache API in SDK examples

**Implicit Caching Patterns**:
1. **Session persistence** (08-sessions.ts) - Conversation history cached per session_id
2. **Model selection** (07-cost-tracking.ts, lines 115-158) - Cost-aware model degradation
3. **Stateful tools** (02-custom-tools.ts, lines 161-224) - In-memory stores

```typescript
// Lines 161-224 (02-custom-tools.ts)
const kvStore = new Map<string, any>();

const kvStoreTool = tool(
  'kv_store',
  'Key-value store: get, set, delete, list operations',
  {
    operation: z.enum(['get', 'set', 'delete', 'list']).describe('Operation'),
    key: z.string().optional().describe('Key (required for get, set, delete)'),
    value: z.any().optional().describe('Value (required for set)')
  },
  async (args) => {
    switch (args.operation) {
      case 'get':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              key: args.key,
              value: kvStore.get(args.key) ?? null,
              exists: kvStore.has(args.key)
            }, null, 2)
          }]
        };
      case 'set':
        kvStore.set(args.key, args.value);
        // ...
    }
  }
);
```

### 6. Performance Considerations

#### Model Selection for Memory Efficiency (01-core-patterns.ts, lines 282-330, 07-cost-tracking.ts)

**Best Practice**: Choose model based on task complexity and memory needs

```typescript
// Complex reasoning - More context capacity
const complexTask = await query({
  prompt: 'Design a distributed system architecture for...',
  options: {
    model: 'opus',
    maxTurns: 10
  }
});

// Balanced tasks - Standard context
const balancedTask = await query({
  prompt: 'Write a Python function to parse JSON',
  options: {
    model: 'sonnet',
    maxTurns: 5
  }
});

// Simple/fast tasks - Minimal context
const simpleTask = await query({
  prompt: 'What is 2+2?',
  options: {
    model: 'haiku',
    maxTurns: 1
  }
});
```

#### Graceful Degradation (01-core-patterns.ts, lines 252-276)

```typescript
// Try with advanced model first
try {
  return await query({
    prompt: 'Complex analysis task',
    options: {
      model: 'opus',
      maxTurns: 10
    }
  });
} catch (error) {
  console.warn('Opus failed, falling back to Sonnet');

  // Fallback to cheaper/faster model
  return await query({
    prompt: 'Complex analysis task (simplified)',
    options: {
      model: 'sonnet',
      maxTurns: 5
    }
  });
}
```

### 7. Common Pitfalls and Anti-Patterns

#### Anti-Pattern 1: String Prompt for Multi-Turn (01-core-patterns.ts, lines 549-567)

**Problem**: Limited functionality, can't maintain context across turns

```typescript
// ❌ BAD: Can't do multi-turn, tool results, sessions
await query({
  prompt: 'Complex task requiring multiple steps'
});

// ✅ GOOD: Use AsyncIterable
async function* messages(): AsyncIterable<SDKUserMessage> {
  yield {
    type: 'user',
    message: { role: 'user', content: 'Complex task' }
  };
}
await query({ prompt: messages() });
```

#### Anti-Pattern 2: No maxTurns Limit (01-core-patterns.ts, lines 591-607)

**Problem**: Can run forever, unbounded memory/cost growth

```typescript
// ❌ BAD: No limit
await query({
  prompt: 'Do something'
  // Missing maxTurns!
});

// ✅ GOOD: Always set maxTurns
await query({
  prompt: 'Do something',
  options: { maxTurns: 10 }
});
```

#### Anti-Pattern 3: Ignoring Cost Tracking (01-core-patterns.ts, lines 610-631)

**Problem**: No visibility into memory/context costs

```typescript
// ❌ BAD: Ignore cost
for await (const message of query({ prompt: 'Task' })) {
  if (message.type === 'result') {
    console.log(message.result);
    // Missing: cost tracking!
  }
}

// ✅ GOOD: Track costs
for await (const message of query({ prompt: 'Task' })) {
  if (message.type === 'result') {
    console.log('Result:', message.result);
    console.log('Cost:', message.total_cost_usd);
    console.log('By model:', message.modelUsage);
  }
}
```

## Best Practices Summary

### Memory Management Best Practices

1. **Use Sessions for Persistent Memory** (08-sessions.ts)
   - Create unique session IDs per conversation
   - Resume sessions to maintain context
   - Sessions are per working directory

2. **Inject Context via System Prompts** (01-core-patterns.ts)
   - Use custom system prompts for agent knowledge
   - Use preset prompts with append for extensions
   - Keep prompts focused and clear

3. **Pass Context Explicitly to Subagents** (04-subagent-essentials.ts)
   - Don't assume subagents have parent context
   - Include all relevant project/task information
   - Use clear, structured context strings

4. **Use AsyncIterable for Dynamic Context** (01-core-patterns.ts, 10-streaming-modes.ts)
   - Enables multi-turn conversations
   - Allows dynamic context injection
   - Supports tool results and session data

5. **Set Appropriate Turn Limits** (01-core-patterns.ts)
   - 1 turn: Simple questions
   - 5-10 turns: Tool operations
   - 20-30 turns: Complex tasks
   - Always set maxTurns

6. **Track Costs and Memory Usage** (07-cost-tracking.ts)
   - Monitor total_cost_usd
   - Track modelUsage per model
   - Implement budget limits
   - Use model degradation when needed

7. **Use Stateful Tools for Persistence** (02-custom-tools.ts)
   - Create custom tools with internal state
   - Use Map/object stores for data
   - Implement get/set/delete operations

8. **Handle Errors and Cleanup** (01-core-patterns.ts, 06-hooks-complete.ts)
   - Always use try-catch
   - Implement retry with exponential backoff
   - Use SubagentStop hook for cleanup

### Memory Injection Techniques

1. **System Prompt Injection**: Persistent agent knowledge (lines 421-439, 01-core-patterns.ts)
2. **Context String Embedding**: Inline context in prompts (lines 252-262, 04-subagent-essentials.ts)
3. **Agent Definition Prompts**: Specialized subagent memory (lines 81-109, 04-subagent-essentials.ts)
4. **Session-Based Persistence**: Automatic conversation history (lines 9-60, 08-sessions.ts)
5. **Stateful Custom Tools**: In-memory data stores (lines 161-224, 02-custom-tools.ts)
6. **Multi-Turn Streaming**: Dynamic context via AsyncIterable (lines 84-118, 01-core-patterns.ts)

### Size Management Strategies

1. **Turn-Based Limits**: maxTurns prevents unbounded growth
2. **Cost-Based Limits**: Budget tracking via CostTracker
3. **Model Selection**: Right-size model for task (haiku < sonnet < opus)
4. **Tool Restrictions**: Limit agent capabilities to reduce context
5. **Graceful Degradation**: Fall back to smaller models when needed

## Pattern Catalog

### Pattern: Session-Based Memory
- **File**: 08-sessions.ts
- **Lines**: 9-60
- **Use Case**: Persist conversation across multiple query() calls
- **Implementation**: session_id option in query()

### Pattern: System Prompt Context Injection
- **File**: 01-core-patterns.ts
- **Lines**: 421-476
- **Use Case**: Inject agent knowledge, rules, constraints
- **Implementation**: systemPrompt option (custom or preset)

### Pattern: Multi-Turn Context Streaming
- **File**: 01-core-patterns.ts
- **Lines**: 84-168
- **Use Case**: Dynamic, progressive context addition
- **Implementation**: AsyncIterable<SDKUserMessage> generator

### Pattern: Subagent Context Passing
- **File**: 04-subagent-essentials.ts
- **Lines**: 236-281
- **Use Case**: Delegate with complete context
- **Implementation**: Embed context in delegation prompt

### Pattern: Stateful Tool Memory
- **File**: 02-custom-tools.ts
- **Lines**: 161-224
- **Use Case**: Custom in-memory data persistence
- **Implementation**: tool() with external state (Map, object)

### Pattern: Cost-Aware Memory Management
- **File**: 07-cost-tracking.ts
- **Lines**: 20-158
- **Use Case**: Budget-constrained context usage
- **Implementation**: CostTracker class with model degradation

### Pattern: Turn Tracking
- **File**: 01-core-patterns.ts
- **Lines**: 520-542
- **Use Case**: Monitor conversation length/memory usage
- **Implementation**: Counter in message loop

### Pattern: Graceful Degradation
- **File**: 01-core-patterns.ts
- **Lines**: 252-276
- **Use Case**: Fallback when memory/cost constraints hit
- **Implementation**: Try-catch with model downgrade

## Code Examples Library

### Example 1: Complete Production Pattern with Memory Management

**File**: 01-core-patterns.ts, lines 674-742

```typescript
async function productionReadyExample() {
  async function* userInput(): AsyncIterable<SDKUserMessage> {
    yield {
      type: 'user',
      message: {
        role: 'user',
        content: 'Analyze the codebase and suggest improvements'
      }
    };
  }

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt++;

      for await (const message of query({
        prompt: userInput(),
        options: {
          model: 'sonnet',
          maxTurns: 20,
          allowedTools: ['read', 'bash'],
          permissionMode: 'default',
          systemPrompt: {
            type: 'preset',
            preset: 'claude_code',
            append: 'Focus on code quality, security, and performance.'
          },
          cwd: process.cwd()
        }
      })) {

        if (message.type === 'assistant') {
          console.log('Assistant:', message.message.content);
        }

        if (message.type === 'result') {
          if (message.subtype === 'error') {
            throw new Error(message.error);
          }

          // Success - log cost and result
          console.log('Result:', message.result);
          console.log('Cost: $' + message.total_cost_usd.toFixed(4));
          console.log('Turns:', message.num_turns);
          console.log('Duration:', message.duration_ms + 'ms');

          return message.result;
        }
      }
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt >= maxRetries) {
        throw error;
      }

      // Exponential backoff
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
}
```

### Example 2: Session-Based Memory

**File**: 08-sessions.ts, lines 40-60

```typescript
async function sessionExample() {
  const sessionId = `session-${Date.now()}`;

  // First interaction
  console.log('=== Creating Session ===\n');
  await query({
    prompt: 'My name is Alice and I work on React projects',
    options: { session_id: sessionId, maxTurns: 3 }
  });

  // Second interaction - resume
  console.log('\n=== Resuming Session ===\n');
  for await (const message of query({
    prompt: 'What is my name and what do I work on?',
    options: { session_id: sessionId, maxTurns: 3 }
  })) {
    if (message.type === 'result') {
      console.log('Agent remembered:', message.result);
    }
  }
}
```

### Example 3: Subagent Context Passing

**File**: 04-subagent-essentials.ts, lines 236-281

```typescript
async function contextPassing() {
  const agents: Record<string, AgentDefinition> = {
    specialist: {
      description: 'Specialist who receives context',
      prompt: `You are a specialist. You will receive:
- Project context
- Specific task
- Constraints

Use this context to provide targeted solutions.`,
      model: 'sonnet',
      tools: ['read']
    }
  };

  const context = `
Project: E-commerce platform
Stack: React, Node.js, PostgreSQL
Team size: 5 developers
Timeline: 3 months
`;

  const task = `${context}

Task: Delegate to specialist to review the authentication system for security issues.`;

  for await (const message of query({
    prompt: task,
    options: {
      agents,
      maxTurns: 15,
      systemPrompt: {
        type: 'preset',
        preset: 'claude_code',
        append: 'When delegating, pass ALL relevant context to the specialist.'
      }
    }
  })) {
    if (message.type === 'result') {
      console.log('Specialist received context and completed task');
      console.log('Result:', message.result);
    }
  }
}
```

### Example 4: Cost-Aware Memory Management

**File**: 07-cost-tracking.ts, lines 115-158

```typescript
async function modelDegradation() {
  const budget: BudgetConfig = {
    maxCostUSD: 0.20,
    warningThreshold: 0.5,
    criticalThreshold: 0.75,
    hardStop: false
  };

  const tracker = new CostTracker(budget);

  // Select model based on budget
  function selectModel(percentUsed: number): 'opus' | 'sonnet' | 'haiku' {
    if (percentUsed >= 0.9) return 'haiku';
    if (percentUsed >= 0.7) return 'sonnet';
    return 'opus';
  }

  const tasks = ['Task 1', 'Task 2', 'Task 3'];

  for (const task of tasks) {
    const status = tracker.getStatus();
    if (!status.canContinue) break;

    const model = selectModel(status.percentUsed);
    console.log(`\n${task}: Using ${model.toUpperCase()} (${(status.percentUsed * 100).toFixed(1)}% used)`);

    for await (const message of query({
      prompt: task,
      options: { model, maxTurns: 3 }
    })) {
      if (message.type === 'result') {
        Object.entries(message.modelUsage).forEach(([m, usage]) => {
          tracker.recordCost(m, usage.costUSD);
        });

        console.log(`Cost: $${message.total_cost_usd.toFixed(6)}`);
      }
    }
  }

  tracker.displayAlert();
}
```

## Research Conclusions

### Key Insights

1. **No Explicit Memory API**: The Claude Agent SDK does not provide a dedicated "memory" API. Instead, memory is managed through:
   - Conversation history (sessions)
   - System prompts (context injection)
   - Stateful tools (custom persistence)
   - Multi-turn streaming (dynamic context)

2. **Session-Based Architecture**: Sessions are the primary memory mechanism, automatically persisting conversation history per session_id and working directory.

3. **Context as Code**: Memory is embedded in prompts (system prompts, agent definitions, user messages), not stored separately.

4. **Turn-Based Lifecycle**: Memory accumulates through conversation turns, tracked via maxTurns limits.

5. **Cost-Aware Design**: Memory usage is tied to costs, enabling budget-based memory management and model degradation strategies.

6. **Stateless by Default**: Each query() is stateless unless session_id is provided. This enables clean, predictable memory boundaries.

### Recommendations for Agent Memory Implementation

Based on SDK patterns, implement agent memory using:

1. **Session IDs**: For conversation continuity
   - Format: `agent-{agentName}-{timestamp}`
   - Scope: Per working directory

2. **System Prompts**: For agent knowledge base
   - Include: Domain expertise, rules, constraints
   - Use: Custom prompts with structured content

3. **Context Injection**: For task-specific memory
   - Embed: Project context, user preferences, task history
   - Pass explicitly to subagents

4. **Stateful Tools**: For data persistence
   - Create: Custom tools with Map/object stores
   - Operations: get, set, delete, list

5. **Turn Tracking**: For memory lifecycle
   - Monitor: Turn counts, costs, usage
   - Limit: maxTurns based on task complexity

6. **Cost Management**: For memory budgets
   - Track: Per-model costs, total usage
   - Degrade: Opus → Sonnet → Haiku when needed

### Memory System Design Pattern

```typescript
class AgentMemoryManager {
  // Session-based persistence
  private sessions: Map<string, ConversationHistory> = new Map();

  // Cost tracking
  private costTracker: CostTracker;

  // Agent knowledge base
  private agentPrompts: Map<string, string> = new Map();

  // Stateful data
  private kvStore: Map<string, any> = new Map();

  async executeWithMemory(
    agentName: string,
    task: string,
    context: Record<string, any>
  ) {
    const sessionId = `${agentName}-${Date.now()}`;

    // Build context-aware prompt
    const systemPrompt = this.buildSystemPrompt(agentName, context);

    // Execute with session
    for await (const message of query({
      prompt: task,
      options: {
        session_id: sessionId,
        systemPrompt,
        maxTurns: this.calculateMaxTurns(task),
        model: this.selectModel()
      }
    })) {
      if (message.type === 'result') {
        // Track costs
        this.costTracker.recordCost(message.total_cost_usd);

        // Store in session history
        this.sessions.set(sessionId, message);

        return message.result;
      }
    }
  }

  private buildSystemPrompt(
    agentName: string,
    context: Record<string, any>
  ): string {
    const basePrompt = this.agentPrompts.get(agentName) || '';
    const contextStr = JSON.stringify(context, null, 2);

    return `${basePrompt}

Context:
${contextStr}`;
  }

  private calculateMaxTurns(task: string): number {
    // Simple heuristic: 1 turn per 10 words
    return Math.min(30, Math.max(5, Math.ceil(task.split(' ').length / 10)));
  }

  private selectModel(): 'opus' | 'sonnet' | 'haiku' {
    const { percentUsed } = this.costTracker.getStatus();
    if (percentUsed >= 0.9) return 'haiku';
    if (percentUsed >= 0.7) return 'sonnet';
    return 'opus';
  }
}
```

## Files Referenced

All findings verified with specific file and line references from:

- /Users/eladm/.claude/examples/sdk/README.md (108 lines)
- /Users/eladm/.claude/examples/sdk/01-core-patterns.ts (807 lines)
- /Users/eladm/.claude/examples/sdk/02-custom-tools.ts (631 lines)
- /Users/eladm/.claude/examples/sdk/03-file-operations.ts (62 lines)
- /Users/eladm/.claude/examples/sdk/04-subagent-essentials.ts (399 lines)
- /Users/eladm/.claude/examples/sdk/05-subagent-production.ts (60 lines)
- /Users/eladm/.claude/examples/sdk/06-hooks-complete.ts (210 lines)
- /Users/eladm/.claude/examples/sdk/07-cost-tracking.ts (198 lines)
- /Users/eladm/.claude/examples/sdk/08-sessions.ts (86 lines)
- /Users/eladm/.claude/examples/sdk/09-permissions.ts (47 lines)
- /Users/eladm/.claude/examples/sdk/10-streaming-modes.ts (48 lines)
- /Users/eladm/.claude/examples/sdk/11-slash-commands.ts (44 lines)
- /Users/eladm/.claude/examples/sdk/12-todos.ts (37 lines)
- /Users/eladm/.claude/examples/sdk/13-complete-application.ts (86 lines)

**Total Lines Analyzed**: 2,823 lines
**Verification**: 100% complete, all files read fully
**Date**: 2025-10-08

## Next Steps

1. Apply findings to CollaborativeIntelligence agent memory implementation
2. Create agent-specific memory management patterns based on SDK examples
3. Implement session-based persistence for agent conversations
4. Design context injection system for agent knowledge bases
5. Build cost-tracking system for memory budget management
### [2025-10-08 19:12:57] Edit Operation
- **File**: /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/cli/Cargo.toml
- **Context**: ai_development
- **Activity**: Development session in CollaborativeIntelligence
- **Learning**: [package]
name = "ci"
version = "0.1.0"
edition = "2021"
description = "Collaborative Intelligence C...

### [2025-10-08 19:12:58] Edit Operation
- **File**: /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/cli/Cargo.toml
- **Context**: ai_development
- **Activity**: Development session in CollaborativeIntelligence
- **Learning**: [[bin]]
name = "ci"
path = "src/main.rs"...

### [2025-10-08 19:16:29] Edit Operation
- **File**: /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/cli/Cargo.toml
- **Context**: ai_development
- **Activity**: Development session in CollaborativeIntelligence
- **Learning**: [package]
name = "CI"
version = "0.1.0"
edition = "2021"
description = "Collaborative Intelligence C...

### [2025-10-08 19:16:30] Edit Operation
- **File**: /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/cli/Cargo.toml
- **Context**: ai_development
- **Activity**: Development session in CollaborativeIntelligence
- **Learning**: [[bin]]
name = "CI"
path = "src/main.rs"...

### [2025-10-08 20:16:03] Edit Operation
- **File**: /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/cli/Cargo.toml
- **Context**: ai_development
- **Activity**: Development session in CollaborativeIntelligence
- **Learning**: [package]
name = "ci"
version = "0.1.0"
edition = "2021"
description = "Collaborative Intelligence C...

### [2025-10-08 20:16:06] Edit Operation
- **File**: /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/cli/Cargo.toml
- **Context**: ai_development
- **Activity**: Development session in CollaborativeIntelligence
- **Learning**: [[bin]]
name = "ci"
path = "src/main.rs"...

### [2025-10-08 20:17:07] Edit Operation
- **File**: /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/cli/src/main.rs
- **Context**: ai_development
- **Activity**: Development session in CollaborativeIntelligence
- **Learning**: use ci::...

### [2025-10-08 20:17:57] Edit Operation
- **File**: /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/cli/src/main.rs
- **Context**: ai_development
- **Activity**: Development session in CollaborativeIntelligence
- **Learning**: async fn legacy_command(create: bool, remove: bool, list: bool, _config: &ci::Config) -> anyhow::Res...

