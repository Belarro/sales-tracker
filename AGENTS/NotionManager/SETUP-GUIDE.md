# NotionManager Setup Guide

Step-by-step guide to get NotionManager agent running.

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Notion workspace (free or paid)
- ✅ Basic familiarity with terminal/command line

## Step 1: Create Notion Integration

1. **Go to Notion Integrations**
   - Visit: [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
   - Click **"+ New integration"**

2. **Configure Integration**
   - **Name**: "CollaborativeIntelligence" (or any name)
   - **Associated workspace**: Select your workspace
   - **Type**: Internal integration
   - Click **"Submit"**

3. **Copy Integration Token**
   - You'll see: `Internal Integration Token`
   - It starts with: `secret_`
   - Click **"Show"** and **"Copy"**
   - ⚠️ **Keep this secret!** Don't commit to git.

4. **Set Capabilities** (optional, defaults are fine)
   - ✅ Read content
   - ✅ Update content
   - ✅ Insert content
   - ❌ Read comments (not needed)
   - ❌ Insert comments (not needed)

## Step 2: Grant Integration Access

Your integration needs access to pages/databases it will work with.

### Option A: Workspace-Level Access
1. Go to **Settings & Members** in Notion
2. Click **"Connections"**
3. Find your integration
4. Grant workspace access

### Option B: Page-Level Access (More Secure)
1. Open a page in Notion
2. Click **"..."** (top right)
3. Scroll to **"Add connections"**
4. Select your integration
5. Repeat for each page/database you want to access

**Note**: If you don't grant access, you'll get `object_not_found` errors.

## Step 3: Install NotionManager

```bash
# Navigate to NotionManager directory
cd /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS/NotionManager

# Install dependencies
npm install
```

This will install:
- `@anthropic-ai/claude-agent-sdk` - Agent framework
- `@notionhq/client` - Official Notion API client
- `zod` - Schema validation
- `p-limit` - Rate limiting
- And development tools

## Step 4: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

Add your token:
```bash
NOTION_API_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Optional settings:
```bash
# Rate limiting (default: 600ms)
NOTION_RATE_LIMIT_MS=600

# Cost tracking (default: $10/day)
NOTION_DAILY_BUDGET_USD=10.00
NOTION_ALERT_THRESHOLD_USD=8.00

# Logging (default: info)
LOG_LEVEL=info  # debug | info | warn | error
```

## Step 5: Validate Setup

Build and test the connection:

```bash
# Build TypeScript
npm run build

# Run basic example
npm run example:basic
```

Expected output:
```
=== NotionManager Basic Usage Example ===

1. Validating Notion API connection...
✓ Connected to Notion API

2. Creating a new page...
✓ Page created: https://notion.so/NotionManager-Test-Page-xxx
  Page ID: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

3. Reading page content...
✓ Page retrieved successfully
  Created: 2025-10-23T...
  Last edited: 2025-10-23T...

4. Updating page properties...
✓ Page updated successfully
  New icon: ✨

5. Searching for the page...
✓ Found 1 matching page(s)

=== Example completed successfully! ===

View your new page: https://notion.so/...
```

## Step 6: Verify in Notion

1. Click the page URL from the output
2. You should see:
   - Title: "NotionManager Test Page"
   - Icon: ✨
   - Heading: "Welcome to NotionManager"
   - Content with features list
   - JavaScript code block

If you see this, **setup is complete!** 🎉

## Troubleshooting

### "NOTION_API_TOKEN not configured"

**Problem**: Environment variable not set

**Solutions**:
1. Verify `.env` file exists in `AGENTS/NotionManager/`
2. Check token is on a line: `NOTION_API_TOKEN=secret_xxx`
3. No spaces around `=`
4. Token starts with `secret_`
5. Run from correct directory

### "Failed to connect to Notion API"

**Problem**: Invalid token or network issue

**Solutions**:
1. **Regenerate token**:
   - Go to https://www.notion.so/my-integrations
   - Click your integration
   - Click "Regenerate token"
   - Update `.env` with new token

2. **Check network**:
   ```bash
   curl -H "Authorization: Bearer secret_xxx" \
        https://api.notion.com/v1/users/me
   ```

3. **Firewall/VPN**: Try disabling temporarily

### "object_not_found" when running example

**Problem**: Integration doesn't have workspace access

**Solutions**:
1. The example creates pages in workspace root
2. You need workspace-level access (see Step 2, Option A)
3. Or modify example to use a specific parent page you've granted access to

### Build errors

**Problem**: TypeScript compilation issues

**Solutions**:
1. **Clean and reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Check Node version**:
   ```bash
   node --version  # Should be 18+
   ```

3. **Update TypeScript**:
   ```bash
   npm install -D typescript@latest
   ```

### Rate limit errors

**Problem**: Too many requests too quickly

**Solutions**:
1. **Wait 15 minutes** for quota to reset
2. **Increase delay** in `.env`:
   ```bash
   NOTION_RATE_LIMIT_MS=1000
   ```
3. **Reduce concurrent operations**

## Next Steps

### 1. Test Other Examples

```bash
# Create a project page
npm run example:create

# Query a database (need database ID)
npm run example:query

# Multi-turn session
npm run example:session
```

### 2. Use with Claude Agent SDK

See `README.md` for programmatic usage examples.

### 3. Integrate with CI Workflows

Set up:
- Agent memory sync to Notion
- Session export to databases
- CI dashboard

(Phase 2 features - coming soon)

### 4. Create Your Own Scripts

Copy and modify examples:
```bash
cp examples/basic-usage.ts examples/my-script.ts
# Edit my-script.ts
tsx examples/my-script.ts
```

## Getting Help

### Check Documentation
- **README.md** - Usage and API reference
- **MEMORY.md** - Agent learning and status
- **Implementation Plan** - `/NOTION-AGENT-IMPLEMENTATION-PLAN.md`

### Enable Debug Logging
```bash
# In .env
LOG_LEVEL=debug
```

### Test Connection Manually
```typescript
import { getNotionClient } from './src/index.js';

const client = await getNotionClient();
const me = await client.users.me({});
console.log('Connected as:', me);
```

### Common Issues
1. **Token expired**: Regenerate in Notion settings
2. **No access**: Grant integration access to pages
3. **Rate limited**: Wait 15 minutes
4. **Network error**: Check internet connection

## Security Best Practices

1. ✅ **Never commit `.env`** - It's in `.gitignore`
2. ✅ **Rotate tokens periodically** (every 90 days)
3. ✅ **Use minimal permissions** (only what you need)
4. ✅ **Grant page-level access** when possible (not workspace)
5. ✅ **Monitor API usage** in Notion settings

## Configuration Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NOTION_API_TOKEN` | ✅ Yes | - | Integration token |
| `NOTION_RATE_LIMIT_MS` | No | 600 | Delay between requests (ms) |
| `NOTION_DAILY_BUDGET_USD` | No | 10.00 | Daily cost budget |
| `NOTION_ALERT_THRESHOLD_USD` | No | 8.00 | Cost alert threshold |
| `LOG_LEVEL` | No | info | Logging level |
| `NOTION_WORKSPACE_ID` | No | - | Default workspace |
| `NOTION_CI_AGENTS_DB_ID` | No | - | CI Agents database |
| `NOTION_CI_SESSIONS_DB_ID` | No | - | CI Sessions database |

### Rate Limiting

- **Notion API limit**: 3 requests/second
- **Our default**: 600ms between requests (5 req/3 sec)
- **Why conservative**: Prevents rate limit errors
- **Adjust if needed**: Increase `NOTION_RATE_LIMIT_MS`

### Cost Estimates

With Sonnet model:
- Page creation: ~$0.002
- Page read: ~$0.001
- Database query: ~$0.005
- Daily sync (100 ops): ~$0.50

Budget conservatively, monitor actual costs.

## Support

For issues specific to:
- **NotionManager**: Check `AGENTS/NotionManager/MEMORY.md`
- **Notion API**: https://developers.notion.com/reference
- **Claude SDK**: https://github.com/anthropics/claude-agent-sdk
- **CollaborativeIntelligence**: Main project docs

---

**Setup complete!** You're ready to use NotionManager. 🚀
