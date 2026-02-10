# NotionManager - Quick Start Validation Guide

**Goal**: Get up and running with production validation in 15 minutes

---

## 🚀 Quick Setup (15 minutes)

### Step 1: Create Notion Integration (5 min)

1. Go to https://www.notion.so/my-integrations
2. Click **"+ New integration"**
3. Fill in:
   - **Name**: `NotionManager Test`
   - **Associated workspace**: Select your workspace
   - **Type**: Internal
   - **Capabilities**: ✅ Read content, ✅ Update content, ✅ Insert content
4. Click **"Submit"**
5. **Copy the token** (starts with `secret_`)

### Step 2: Create Test Page (3 min)

1. Create a new page in Notion titled: **"NotionManager Test"**
2. Add some content:
   ```
   # NotionManager Test Page

   This is a test page for validating NotionManager.

   ## Features
   - Bidirectional sync
   - Change detection
   - File uploads

   **Bold text** and *italic text* for testing.
   ```

3. Click **"Share"** → **"Add connections"**
4. Select **"NotionManager Test"** integration
5. Click **"Confirm"**

6. **Get Page ID** from URL:
   - URL format: `https://www.notion.so/Page-Title-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - Copy the `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` part

### Step 3: Configure Environment (2 min)

Create file: `AGENTS/NotionManager/.env.test`

```bash
# Notion
NOTION_TOKEN=secret_PASTE_YOUR_TOKEN_HERE
NOTION_PAGE_SIMPLE=PASTE_PAGE_ID_HERE

# GitHub (for file upload tests)
GITHUB_TOKEN=ghp_PASTE_IF_YOU_HAVE_ONE
GITHUB_OWNER=your-username
GITHUB_REPO=CollaborativeIntelligence

# Test output
TEST_OUTPUT_DIR=./test-output
```

Load environment:
```bash
cd AGENTS/NotionManager
source .env.test
```

### Step 4: Run First Test (5 min)

```bash
# Test Notion → Git sync
node validation-test-1-notion-to-git.js
```

**Expected output**:
```
======================================================================
TEST 1: Notion → Git Sync (Simple Page)
======================================================================

✅ Orchestrator created
✅ Page registered
✅ Sync completed in 1234ms
✅ Output file created
✅ File readable
✅ Sync map updated

======================================================================
✅ TEST 1 PASSED
======================================================================
```

**If it works**: ✅ Your Notion integration is set up correctly!

**If it fails**: See troubleshooting below

---

## 🧪 Run All Basic Tests

### Test 1: Notion → Git
```bash
node validation-test-1-notion-to-git.js
```

Validates: Fetching from Notion, converting to markdown, writing to file

### Test 2: Git → Notion
```bash
node validation-test-2-git-to-notion.js
```

Validates: Reading markdown, converting to Notion blocks, updating page

**Then verify manually**: Open your Notion page and check the content matches

---

## 🎯 Quick Validation Checklist

Minimal validation (30 minutes):

- [ ] Test 1: Notion → Git ✅
- [ ] Test 2: Git → Notion ✅
- [ ] Manual verification: Check Notion page updated correctly
- [ ] Check file: `test-output/notion-to-git-simple.md` has correct content

**If all pass**: NotionManager core features are working! 🎉

---

## 🔧 Troubleshooting

### Error: "API token is invalid"
**Fix**:
1. Check token is correct in `.env.test`
2. Verify token starts with `secret_`
3. Try regenerating token in Notion

### Error: "Could not find page"
**Fix**:
1. Check page ID is correct
2. Verify page is shared with integration:
   - Open page → Share → Connections → Should show "NotionManager Test"
3. If not shared, add the integration

### Error: "Integration does not have required capabilities"
**Fix**:
1. Go to https://www.notion.so/my-integrations
2. Click your integration
3. Ensure "Read content" and "Update content" are enabled

### Test passes but output file is empty
**Fix**:
1. Check your Notion page has content
2. Verify page is shared with integration
3. Try running test again with `verbose: true`

### Network errors
**Fix**:
1. Check internet connectivity
2. Try accessing https://api.notion.com directly
3. Check firewall/proxy settings

---

## 📚 Full Validation (Optional)

For complete validation (2-3 hours), see:
- `PRODUCTION-VALIDATION-PLAN.md` - Complete test plan
- `validation-test-*.js` - All test scripts

---

## ✅ What's Next?

**After quick validation succeeds**:

1. **Option A: Production Use**
   - Start using NotionManager in your workflows
   - Set up continuous sync
   - Integrate with your documentation

2. **Option B: Full Validation**
   - Run all 12 validation tests
   - Test file upload features
   - Test edge cases
   - Generate complete test report

3. **Option C: Build More Features**
   - Proceed to v4.2.0 (Database Operations)
   - Proceed to v4.1.2 (Polish & Enhancements)

---

## 💡 Tips

- **Start simple**: Run Test 1 first, verify it works, then proceed
- **Check manually**: Always open Notion page to verify sync worked correctly
- **Use test pages**: Don't test on important production pages
- **Keep .env.test secret**: Never commit this file to git (it's in .gitignore)

---

## 🆘 Getting Help

If you encounter issues:

1. Check error message carefully
2. Review troubleshooting section above
3. Check `PRODUCTION-VALIDATION-PLAN.md` for detailed guidance
4. Verify all setup steps completed correctly

---

**Ready to start?** Run Test 1 now:

```bash
cd AGENTS/NotionManager
source .env.test
node validation-test-1-notion-to-git.js
```

Good luck! 🚀
