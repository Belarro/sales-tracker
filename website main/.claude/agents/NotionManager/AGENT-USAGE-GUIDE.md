# NotionManager Usage Guide for CI Agents

## Quick Start for Other Agents

NotionManager provides a simple service API that any CI agent can use to interact with Notion. No need to understand the Notion API directly - just import and use.

---

## Basic Usage Pattern

```javascript
import { NotionService } from '../NotionManager/notion-service.js';

// That's it! You're ready to use Notion.
```

---

## Common Use Cases

### 1. Log Your Completed Session

**When**: After completing any significant task
**Why**: Track work history, costs, and progress

```javascript
await NotionService.logSession({
  title: 'Implemented Feature X',
  agent: 'Developer',              // Your agent name
  status: 'Completed',              // or 'In Progress', 'Blocked'
  cost: 0.05,                       // Claude API cost in USD
  filesRead: 10,                    // How many files you read
  filesModified: 3,                 // How many files you changed
  findings: 'Successfully added authentication to API',
  tags: ['development', 'feature', 'api'],
  details: 'Full technical description here...',
  icon: '🚀',                       // Optional emoji
});
```

**Result**: Creates entry in CI Sessions database with all metrics

---

### 2. Update Your Agent Status

**When**: Status changes (Active → Idle, starting new phase)
**Why**: Keep agent registry current

```javascript
await NotionService.updateAgentStatus('Developer', {
  status: 'Active',                 // or 'Idle', 'Paused', 'Archived'
  phase: 'Implementation',          // Current work phase
  totalSessions: 15,                // Cumulative count
  totalCost: 0.50,                  // Cumulative cost
});
```

**Result**: Updates your entry in CI Agents database

---

### 3. Add File to Catalog

**When**: Creating important new files
**Why**: Track codebase structure and dependencies

```javascript
await NotionService.addFile({
  path: 'src/auth/index.ts',
  category: 'Implementation',       // or 'Documentation', 'Config', 'Test'
  lineCount: 250,
  sizeKB: 8.5,
  status: 'Current',                // or 'Historical', 'Outdated'
  purpose: 'Main authentication entry point',
  dependencies: ['@notionhq/client', 'dotenv'],
});
```

**Result**: Creates entry in CI Files database

---

### 4. Search for Information

**When**: Looking for existing work, pages, or databases
**Why**: Avoid duplication, find relevant context

```javascript
const results = await NotionService.search('Authentication', {
  filter: 'page',                   // or 'database', or omit for both
  pageSize: 10,
});

// Results contain page/database objects
results.forEach(result => {
  console.log(`Found: ${result.id}`);
});
```

---

### 5. Query Database

**When**: Need specific filtered data from a database
**Why**: Analysis, reporting, decision-making

```javascript
// Get all Developer sessions
const sessions = await NotionService.queryDatabase('sessions', {
  property: 'Agent',
  select: { equals: 'Developer' },
});

// Get active agents
const agents = await NotionService.queryDatabase('agents', {
  property: 'Status',
  select: { equals: 'Active' },
});

// Get recent files (no filter = all)
const files = await NotionService.queryDatabase('files');
```

**Database names**: `'agents'`, `'sessions'`, `'files'`, or use database ID directly

---

## Integration Examples

### Example 1: Developer Agent Workflow

```javascript
import { NotionService } from '../NotionManager/notion-service.js';

async function implementFeature() {
  // 1. Update status: starting work
  await NotionService.updateAgentStatus('Developer', {
    status: 'Active',
    phase: 'Feature Implementation',
  });

  // 2. Do the work...
  const filesModified = await writeCode();
  const filesRead = await analyzeCode();

  // 3. Catalog new files
  for (const file of filesModified) {
    await NotionService.addFile({
      path: file.path,
      category: 'Implementation',
      lineCount: file.lines,
      sizeKB: file.size,
      status: 'Current',
      purpose: file.description,
    });
  }

  // 4. Log session
  await NotionService.logSession({
    title: 'Implemented Authentication Feature',
    agent: 'Developer',
    status: 'Completed',
    cost: calculateCost(),
    filesRead,
    filesModified: filesModified.length,
    findings: 'Added JWT-based authentication with refresh tokens',
    tags: ['development', 'authentication', 'security'],
  });

  // 5. Update final status
  await NotionService.updateAgentStatus('Developer', {
    status: 'Idle',
    totalSessions: existingCount + 1,
    totalCost: existingCost + calculateCost(),
  });
}
```

---

### Example 2: Researcher Agent Workflow

```javascript
async function conductResearch(topic) {
  // 1. Check if already researched
  const existing = await NotionService.search(topic, {
    filter: 'page',
    pageSize: 5,
  });

  if (existing.length > 0) {
    console.log('Topic already researched!');
    return existing;
  }

  // 2. Do research...
  const findings = await researchTopic(topic);

  // 3. Log session
  await NotionService.logSession({
    title: `Research: ${topic}`,
    agent: 'Researcher',
    status: 'Completed',
    cost: 0.03,
    filesRead: findings.sourcesCount,
    filesModified: 0,
    findings: findings.summary,
    tags: ['research', topic.toLowerCase()],
    details: findings.fullReport,
    icon: '🔬',
  });

  return findings;
}
```

---

### Example 3: Architect Agent Workflow

```javascript
async function designSystem(systemName) {
  // 1. Get current architecture files
  const files = await NotionService.queryDatabase('files', {
    property: 'Category',
    select: { equals: 'Architecture' },
  });

  // 2. Analyze and design...
  const design = await createArchitecture(files);

  // 3. Update status
  await NotionService.updateAgentStatus('Architect', {
    status: 'Active',
    phase: `Designing ${systemName}`,
  });

  // 4. Log session with detailed findings
  await NotionService.logSession({
    title: `Architecture: ${systemName}`,
    agent: 'Architect',
    status: 'Completed',
    cost: 0.08,
    filesRead: files.length,
    filesModified: design.diagramsCreated,
    findings: `Designed ${design.components.length} components with ${design.interfaces.length} interfaces`,
    tags: ['architecture', 'design', systemName.toLowerCase()],
    details: design.specification,
    icon: '🏗️',
  });
}
```

---

## Advanced Features

### Get Dashboard and Database URLs

```javascript
// Get main dashboard URL
const dashboardURL = NotionService.getDashboardURL();
console.log(`View dashboard: ${dashboardURL}`);

// Get all database URLs
const urls = NotionService.getDatabaseURLs();
console.log(`Agents: ${urls.agents}`);
console.log(`Sessions: ${urls.sessions}`);
console.log(`Files: ${urls.files}`);
```

---

## Error Handling

All NotionService methods can throw errors. Best practice:

```javascript
try {
  await NotionService.logSession(sessionData);
  console.log('✅ Session logged successfully');
} catch (error) {
  console.error('❌ Failed to log session:', error.message);
  // Continue with your work - Notion logging is not critical
}
```

**Principle**: Notion integration should NEVER block your primary work. Log asynchronously and handle failures gracefully.

---

## Best Practices

### 1. **Always Log Sessions**
- Track every significant task completion
- Include accurate cost and file counts
- Use descriptive titles and findings

### 2. **Update Status Appropriately**
- Active: Currently working
- Idle: Waiting for tasks
- Paused: Temporarily stopped
- Archived: No longer in use

### 3. **Use Consistent Tags**
- Lowercase tags
- Common tags: 'development', 'research', 'architecture', 'testing', 'documentation'
- Add domain-specific tags as needed

### 4. **Include Costs**
- Estimate Claude API costs per session
- Update cumulative totals when updating status
- Track for budget monitoring

### 5. **Don't Overuse**
- Log sessions: YES (after significant work)
- Log every small change: NO
- Update status: Only on real changes
- Query frequently: NO (cache results when possible)

---

## Rate Limiting

NotionService includes automatic rate limiting (600ms delays). You don't need to add your own delays.

**However**: If doing bulk operations (50+ calls), consider batching:

```javascript
// Instead of this:
for (const file of 100files) {
  await NotionService.addFile(file); // 100 sequential calls
}

// Do this:
const batches = chunk(files, 10);
for (const batch of batches) {
  await Promise.all(batch.map(f => NotionService.addFile(f)));
  await new Promise(r => setTimeout(r, 2000)); // Batch delay
}
```

---

## Database Schemas

### CI Sessions Database Properties:
- **Title**: Session description
- **Agent**: Your agent name (select)
- **Date**: Session date (date)
- **Status**: Completed/In Progress/Blocked (select)
- **Cost ($)**: Claude API cost (number)
- **Files Read**: Count (number)
- **Files Modified**: Count (number)
- **Findings**: Key results (rich_text)
- **Tags**: Categories (multi_select)

### CI Agents Database Properties:
- **Name**: Agent name (title)
- **Status**: Active/Idle/Paused (select)
- **Type**: Specialist/Core/Utility (select)
- **Last Active**: Last activity date (date)
- **Total Sessions**: Count (number)
- **Total Cost**: Cumulative USD (number)
- **Description**: Agent role (rich_text)
- **Phase**: Current work phase (select)

### CI Files Database Properties:
- **File Path**: Full path (title)
- **Category**: Implementation/Documentation/etc (select)
- **Line Count**: Number of lines (number)
- **Size (KB)**: File size (number)
- **Last Modified**: Modification date (date)
- **Status**: Current/Historical/Outdated (select)
- **Purpose**: Description (rich_text)
- **Dependencies**: Package list (multi_select)

---

## Quick Reference Commands

```javascript
// Log session
await NotionService.logSession({ title, agent, status, cost, findings, tags });

// Update status
await NotionService.updateAgentStatus(agentName, { status, phase, totalSessions, totalCost });

// Add file
await NotionService.addFile({ path, category, lineCount, sizeKB, status, purpose });

// Search
const results = await NotionService.search(query, { filter, pageSize });

// Query database
const entries = await NotionService.queryDatabase(databaseName, filter, pageSize);

// Get URLs
const dashboardURL = NotionService.getDashboardURL();
const dbURLs = NotionService.getDatabaseURLs();
```

---

## Getting Help

**NotionManager Files**:
- `notion-service.js` - Service implementation
- `TROUBLESHOOTING.md` - Common issues and fixes
- `README-FINAL.md` - Setup and configuration guide

**Notion Documentation**:
- https://developers.notion.com/reference/intro

**Contact**:
- NotionManager agent for integration issues
- Athena for learning/memory integration questions

---

## What NOT to Do

❌ **Don't bypass the service** - Don't import `@notionhq/client` directly
❌ **Don't hardcode IDs** - Use database names ('agents', 'sessions', 'files')
❌ **Don't skip error handling** - Always try/catch Notion calls
❌ **Don't make blocking calls** - Notion is secondary to your primary work
❌ **Don't log trivial actions** - Only significant completed work

---

## Testing Your Integration

```javascript
import { NotionService } from '../NotionManager/notion-service.js';

async function testIntegration() {
  console.log('Testing Notion integration...');

  // Test 1: Log a test session
  try {
    await NotionService.logSession({
      title: 'Integration Test',
      agent: 'YourAgentName',
      status: 'Completed',
      cost: 0.01,
      filesRead: 1,
      filesModified: 0,
      findings: 'Notion integration working!',
      tags: ['test'],
    });
    console.log('✅ Session logging works');
  } catch (error) {
    console.error('❌ Session logging failed:', error.message);
  }

  // Test 2: Search
  try {
    const results = await NotionService.search('Test', { pageSize: 1 });
    console.log(`✅ Search works (found ${results.length} results)`);
  } catch (error) {
    console.error('❌ Search failed:', error.message);
  }

  // Test 3: Get URLs
  const dashboardURL = NotionService.getDashboardURL();
  console.log(`✅ Dashboard: ${dashboardURL}`);
}

testIntegration();
```

---

**Last Updated**: 2025-10-23
**NotionManager Version**: 1.0.0
**Maintained by**: NotionManager Agent

**Ready to integrate!** 🚀
