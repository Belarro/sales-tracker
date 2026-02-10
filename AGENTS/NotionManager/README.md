# NotionManager Agent

Notion workspace management agent for the CollaborativeIntelligence project.

**Phase 1**: Official Notion MCP Server Integration
**Status**: Active Development
**Version**: 1.0.0

## Overview

NotionManager provides seamless Notion integration for CI agents, enabling:
- ✅ Create, read, and update Notion pages with rich formatting
- ✅ Query and manage databases
- ✅ Full-text workspace search
- ✅ Sync agent memory (MEMORY.md) to Notion
- ✅ Export session notes to Notion databases
- ✅ Maintain real-time CI dashboards

## Quick Start

### 1. Prerequisites

- Node.js 18+
- Notion workspace with integration access
- Notion API token

### 2. Get Your Notion API Token

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **"New integration"**
3. Give it a name (e.g., "CollaborativeIntelligence")
4. Select your workspace
5. Copy the **Internal Integration Token** (starts with `secret_`)

### 3. Install Dependencies

```bash
cd AGENTS/NotionManager
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your token:
# NOTION_API_TOKEN=secret_xxxxxxxxxxxxx
```

### 5. Run Basic Example

```bash
npm run example:basic
```

This will:
- Create a test page in your Notion workspace
- Read it back
- Update its properties
- Search for it
- Display the page URL

## Usage

### Programmatic Usage

```typescript
import { notionAgent, getNotionClient } from '@ci/notion-manager';
import { query } from '@anthropic-ai/claude-agent-sdk';

// Validate connection
await getNotionClient();

// Use the agent
for await (const message of query({
  prompt: 'Create a new project page titled "Q4 Planning"',
  options: {
    systemPrompt: notionAgent.systemPrompt,
    model: notionAgent.model,
    tools: notionAgent.tools,
  }
})) {
  if (message.type === 'text') {
    console.log(message.text);
  }
}
```

### Direct API Usage

```typescript
import { getNotionClient } from '@ci/notion-manager';

const client = await getNotionClient();

// Create a page
const page = await client.pages.create({
  parent: { type: 'workspace', workspace: true },
  properties: {
    title: {
      title: [{ text: { content: 'My Page' } }]
    }
  }
});

console.log(page.url);
```

### Helper Functions

```typescript
import {
  createParagraph,
  createHeading,
  createCodeBlock,
  createBulletedListItem,
} from '@ci/notion-manager';

const blocks = [
  createHeading(1, 'My Document'),
  createParagraph('This is a paragraph.'),
  createCodeBlock('console.log("Hello!");', 'javascript'),
  createBulletedListItem('First item'),
  createBulletedListItem('Second item'),
];
```

## Available Scripts

```bash
# Build TypeScript
npm run build

# Development mode (watch)
npm run dev

# Run tests
npm test
npm run test:unit
npm run test:integration
npm run test:coverage

# Run examples
npm run example:basic          # Basic CRUD operations
npm run example:create         # Create project page
npm run example:query          # Query databases
npm run example:session        # Multi-turn session

# Code quality
npm run lint
npm run format
```

## Core Capabilities

### 1. Page Management

**Create pages** with rich content:
```typescript
const page = await client.pages.create({
  parent: { type: 'workspace', workspace: true },
  properties: {
    title: { title: [{ text: { content: 'My Page' } }] }
  },
  icon: { type: 'emoji', emoji: '🚀' },
  children: [
    createHeading(1, 'Welcome'),
    createParagraph('Hello, Notion!')
  ]
});
```

**Read pages** with nested blocks:
```typescript
import { fetchBlocksRecursively, blocksToText } from '@ci/notion-manager';

const page = await client.pages.retrieve({ page_id: 'xxx' });
const blocks = await fetchBlocksRecursively(client, page.id);
const text = blocksToText(blocks);
console.log(text);
```

**Update pages**:
```typescript
await client.pages.update({
  page_id: 'xxx',
  icon: { type: 'emoji', emoji: '✨' },
  archived: false
});
```

### 2. Database Operations

**Query databases**:
```typescript
const results = await client.databases.query({
  database_id: 'xxx',
  filter: {
    property: 'Status',
    select: { equals: 'In Progress' }
  },
  sorts: [
    { property: 'Priority', direction: 'descending' }
  ]
});
```

**Get database schema**:
```typescript
const db = await client.databases.retrieve({
  database_id: 'xxx'
});
console.log(db.properties);
```

### 3. Search

**Full-text search**:
```typescript
const results = await client.search({
  query: 'project planning',
  filter: { property: 'object', value: 'page' },
  sort: { direction: 'descending', timestamp: 'last_edited_time' }
});
```

## Rate Limiting

- **Notion API**: 3 requests/second (2,700 per 15 minutes)
- **Our implementation**: 600ms between requests (TokenHunter pattern)
- **Automatic retry** with exponential backoff on rate limit errors

Configure in `.env`:
```bash
NOTION_RATE_LIMIT_MS=600  # Delay between requests
```

## Error Handling

All operations return standardized error responses:

```typescript
import { handleNotionError, isErrorResponse } from '@ci/notion-manager';

try {
  const result = await someNotionOperation();
} catch (error) {
  const errorResponse = handleNotionError(error, 'operation_name');

  if (isErrorResponse(errorResponse)) {
    console.error(errorResponse.error);
    console.error(errorResponse.error_code);
  }
}
```

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `object_not_found` | Page/database doesn't exist | Check ID and permissions |
| `unauthorized` | Invalid token | Verify NOTION_API_TOKEN |
| `restricted_resource` | No access | Grant integration access |
| `rate_limited` | Too many requests | Wait, automatic retry |
| `validation_error` | Invalid parameters | Check input values |

## Cost Tracking

Expected costs with Sonnet model:

| Operation | Cost Range |
|-----------|------------|
| Simple create/read | $0.001 - $0.003 |
| Complex query | $0.005 - $0.010 |
| Batch operations | $0.020 - $0.050 |
| Daily CI sync | $0.50 - $1.00 |

Set budget alerts in `.env`:
```bash
NOTION_DAILY_BUDGET_USD=10.00
NOTION_ALERT_THRESHOLD_USD=8.00
```

## CollaborativeIntelligence Integration

### Sync Agent Memory

```bash
# Coming in Phase 2
npm run sync:memory
```

### Export Session Notes

```bash
# Coming in Phase 2
npm run sync:sessions
```

### CI Dashboard

Create Notion databases:
- **CI Agents** - Agent profiles, status, metrics
- **CI Sessions** - Session logs, findings, costs
- **CI Files** - File inventory for ClaudeCodeIntegrator

## Project Structure

```
AGENTS/NotionManager/
├── src/
│   ├── agent/
│   │   └── definition.ts       # Agent definition
│   ├── utils/
│   │   ├── schemas.ts          # Zod validation
│   │   ├── client.ts           # Notion client singleton
│   │   ├── errors.ts           # Error handling
│   │   ├── rate-limit.ts       # Rate limiting
│   │   └── blocks.ts           # Block utilities
│   └── index.ts                # Main exports
├── examples/
│   ├── basic-usage.ts          # Quick start
│   ├── create-project.ts       # Project creation
│   ├── database-query.ts       # Database queries
│   └── session-example.ts      # Multi-turn session
├── tests/
│   ├── unit/                   # Unit tests
│   └── integration/            # Integration tests
├── package.json
├── tsconfig.json
├── .env.example
├── MEMORY.md                   # Agent memory
├── metadata.json               # Agent metadata
└── README.md                   # This file
```

## Roadmap

### Phase 1: Official MCP Integration (Current)
- [x] Project structure
- [x] Core utilities (client, errors, rate-limit)
- [x] Agent definition
- [x] Helper functions
- [ ] Basic examples
- [ ] Unit tests
- [ ] Integration tests
- [ ] Documentation

### Phase 2: Custom MCP Server (Week 3-4)
- [ ] TokenHunter markdown parsing patterns
- [ ] Batch block processing
- [ ] CI-specific tools (memory sync, session export)
- [ ] Advanced error recovery

### Phase 3: Advanced Features (Week 4+)
- [ ] Bidirectional sync (Notion → Git)
- [ ] Advanced search and filtering
- [ ] Relationship management
- [ ] Health monitoring and alerts
- [ ] Performance optimization

## Troubleshooting

### "NOTION_API_TOKEN not configured"

1. Ensure `.env` file exists
2. Verify token starts with `secret_`
3. Check token hasn't expired
4. Verify integration is installed in workspace

### "object_not_found"

1. Check page/database ID is correct (32 hex characters)
2. Verify integration has access to the page
3. Share the page with your integration

### "Rate limit exceeded"

1. Wait 15 minutes for quota to reset
2. Increase `NOTION_RATE_LIMIT_MS` in `.env`
3. Reduce concurrent operations

### Connection errors

1. Check internet connection
2. Verify firewall isn't blocking Notion API
3. Test: `curl https://api.notion.com/v1/users/me`

## Contributing

This agent is part of the CollaborativeIntelligence project. See main project documentation for contribution guidelines.

## References

- **Implementation Plan**: `/NOTION-AGENT-IMPLEMENTATION-PLAN.md`
- **Athena's Analysis**: `/working/sprint-006.5/TOKENHUNTER-NOTION-AGENT-ANALYSIS.md`
- **Analyst's Research**: `/BRAIN/Intake/Submissions/2025-10-23/NOTION-MCP-AGENT-RESEARCH.md`
- **Notion API Docs**: https://developers.notion.com/reference
- **Claude Agent SDK**: https://github.com/anthropics/claude-agent-sdk

## License

MIT

---

**Status**: Active Development (Phase 1)
**Last Updated**: 2025-10-23
**Maintainer**: CollaborativeIntelligence Team
