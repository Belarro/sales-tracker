# NotionManager Troubleshooting Guide

## Common Issues & Solutions

### API Error: "validation_error"

**Error Message**:
```
Provide a `parent.page_id` or `parent.database_id` parameter to create a page
```

**Cause**:
- Trying to create workspace-level pages (not supported with internal integrations)
- Missing or invalid database ID

**Solution**:
1. **Check database IDs in `.env`**:
   ```bash
   cat .env | grep NOTION_CI
   ```
   Should show 4 database IDs.

2. **Verify database access**:
   - Open database in Notion
   - Check integration has access
   - Database must be shared with "eylam" integration

3. **Use database as parent** (not workspace):
   ```javascript
   // ✅ Correct
   parent: { database_id: 'xxx' }

   // ❌ Wrong - won't work with internal integration
   parent: { type: 'workspace', workspace: true }
   ```

---

### Rate Limiting Errors

**Error**: Too many requests

**Cause**: Exceeding 3 requests/second

**Solution**:
1. Scripts already include 600ms-1000ms delays
2. If still hitting limits, increase delay:
   ```javascript
   // In auto-sync.js, line ~20
   const RATE_LIMIT_DELAY = 2000; // Increase to 2s
   ```

---

### Authentication Errors

**Error**: `unauthorized` or `invalid token`

**Cause**: Invalid or expired API token

**Solution**:
1. **Regenerate token**:
   - Go to https://www.notion.so/my-integrations
   - Click "eylam" integration
   - Click "Regenerate token"
   - Update `.env` with new token

2. **Test connection**:
   ```bash
   node test-connection.js
   ```

---

### Auto-Sync Failures

**Issue**: Some agents fail during auto-sync

**What happened**:
- Out of 49 agents, 48 synced successfully
- 1 agent (Manager) failed with validation error
- This is expected - some agents may have issues

**Solution**:
1. **Check which agents failed**:
   - Review console output
   - Failed agents listed with ❌

2. **Skip problematic agents**:
   Edit `auto-sync.js` to exclude them:
   ```javascript
   const skipAgents = ['Manager']; // Add to skip list

   const agents = getActiveAgents().filter(
     name => !skipAgents.includes(name)
   );
   ```

3. **Manual sync for specific agent**:
   ```bash
   node sync-agent-memory.js AgentName
   ```

---

### Timeout Errors

**Issue**: Script times out during sync

**Cause**:
- Too many blocks to delete (when updating existing pages)
- Large MEMORY.md files

**Solution**:
1. **Use `sync-multiple-agents.js` instead of `sync-agent-memory.js`**:
   - Creates new pages instead of updating
   - Much faster (no deletion)
   - Recommended for bulk operations

2. **Limit blocks**:
   - Scripts already limit to 50 blocks
   - Reduce if needed: `MAX_BLOCKS = 30`

3. **Delete old sync pages manually**:
   - Open Notion database
   - Delete outdated sync pages
   - Keeps database clean

---

### "No MEMORY.md found"

**Issue**: Agent skipped during sync

**Cause**: Agent doesn't have MEMORY.md file

**Solution**:
- This is expected for some agents
- Only agents with MEMORY.md are synced
- Not an error - just informational

---

### Cost Tracking Errors

**Issue**: Cost calculations seem wrong

**Solution**:
1. **Notion API is FREE** - All costs are $0
2. Cost tracking in sessions refers to Claude AI costs (not Notion)
3. Update session costs manually based on actual Claude usage

---

### Database Not Found

**Issue**: Can't find CI databases

**Solution**:
1. **Re-run setup**:
   ```bash
   node setup-ci-databases.js
   ```

2. **Check if IDs saved to `.env`**:
   ```bash
   tail -5 .env
   ```

3. **Manually add IDs**:
   - Open databases in Notion
   - Copy ID from URL (32 hex characters)
   - Add to `.env`:
     ```
     NOTION_CI_AGENTS_DB_ID=xxx
     ```

---

### Integration Not Found

**Issue**: Integration doesn't appear in Notion

**Solution**:
1. **Share page with integration**:
   - Open page in Notion
   - Click "..." (top right)
   - Add connections → Select "eylam"

2. **Create new integration**:
   - Go to https://www.notion.so/my-integrations
   - Click "+ New integration"
   - Copy token to `.env`

---

## Error Codes Reference

| Code | Meaning | Solution |
|------|---------|----------|
| `validation_error` | Invalid request parameters | Check parent IDs, ensure database exists |
| `unauthorized` | Invalid token | Regenerate token, update `.env` |
| `object_not_found` | Page/DB not found | Check ID, verify access granted |
| `restricted_resource` | No access | Share page with integration |
| `rate_limited` | Too many requests | Wait 15 min, increase delays |
| `conflict_error` | Concurrent modification | Retry operation |
| `service_unavailable` | Notion API down | Wait and retry |

---

## Best Practices

### 1. Always Test Connection First
```bash
node test-connection.js
```

### 2. Use Correct Script for Task
- **Single agent, full content**: `node sync-agent-memory.js AgentName`
- **Multiple agents, fast**: `node sync-multiple-agents.js`
- **All agents, automated**: `node auto-sync.js`
- **Session tracking**: `node track-session.js`

### 3. Monitor Rate Limits
- Scripts include delays (600ms-1000ms)
- Never remove delays
- Increase if hitting limits

### 4. Keep Database Clean
- Delete old sync pages periodically
- Use timestamps in page names
- Filter by date in Notion

### 5. Backup Environment File
```bash
cp .env .env.backup
```

---

## Quick Fixes

### Reset Everything
```bash
# 1. Delete old pages in Notion (manual)
# 2. Re-run setup
node setup-ci-databases.js
# 3. Test connection
node test-connection.js
# 4. Sync fresh
node sync-multiple-agents.js
```

### Emergency Stop
```bash
# Kill running sync
pkill -f auto-sync

# Or force quit
ps aux | grep node | grep auto-sync | awk '{print $2}' | xargs kill -9
```

### Validate Setup
```bash
# Check token
echo $NOTION_API_TOKEN

# Check database IDs
cat .env | grep NOTION_CI

# Test connection
node test-connection.js

# Test single operation
node create-test-page.js
```

---

## Getting Help

### Debug Mode
Add to scripts for more logging:
```javascript
console.log('Debug:', {
  agentsDbId,
  pageData,
  blocks: blocks.length
});
```

### Check Notion Status
- https://status.notion.so/

### Review Logs
All operations log to console - review output for clues

---

## Known Issues

### Issue: Manager Agent Failed
**Status**: Known issue during auto-sync
**Impact**: 1 out of 49 agents failed
**Workaround**: Skip Manager in auto-sync or sync manually
**Fix**: Add to skip list in `auto-sync.js`

### Issue: Slow Deletion
**Status**: Known - deleting blocks one-by-one is slow
**Impact**: Updates take 60+ seconds
**Workaround**: Use `sync-multiple-agents.js` (creates new pages)
**Fix**: Implemented in fast sync scripts

---

**Last Updated**: 2025-10-23
**Status**: Active troubleshooting guide
