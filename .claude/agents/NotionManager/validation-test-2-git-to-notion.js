/**
 * Production Validation Test 2: Git → Notion Sync
 *
 * Tests syncing markdown changes from Git to Notion.
 */

import { createBidirectionalSyncOrchestrator } from './bidirectional-sync-orchestrator.js';
import fs from 'fs/promises';

async function runTest() {
  console.log('='.repeat(70));
  console.log('TEST 2: Git → Notion Sync');
  console.log('='.repeat(70));
  console.log();

  // Check environment
  if (!process.env.NOTION_TOKEN) {
    throw new Error('NOTION_TOKEN not set. Run: source .env.test');
  }
  if (!process.env.NOTION_PAGE_SIMPLE) {
    throw new Error('NOTION_PAGE_SIMPLE not set');
  }

  const pageId = process.env.NOTION_PAGE_SIMPLE;
  const inputFile = './test-output/git-to-notion-test.md';

  console.log('📋 Test Configuration:');
  console.log(`   Page ID: ${pageId}`);
  console.log(`   Input File: ${inputFile}`);
  console.log();

  // Create test markdown
  console.log('1️⃣  Creating test markdown file...');
  const testMarkdown = `# Git to Notion Test

This content was created in Git and will be synced to Notion.

## Test Features

- **Bold text** works
- *Italic text* works
- \`Inline code\` works

### Nested Content

1. First item
2. Second item
3. Third item

> This is a quote block that should appear in Notion.

\`\`\`javascript
// Code block test
function hello() {
  console.log("Hello from Git!");
}
\`\`\`

---

**Test completed**: ${new Date().toISOString()}
`;

  await fs.mkdir('./test-output', { recursive: true });
  await fs.writeFile(inputFile, testMarkdown, 'utf8');
  console.log('   ✅ Test markdown created');
  console.log(`   ℹ️  ${testMarkdown.split('\n').length} lines\n`);

  // Create orchestrator
  console.log('2️⃣  Creating orchestrator...');
  const orchestrator = await createBidirectionalSyncOrchestrator({
    notionToken: process.env.NOTION_TOKEN,
    syncMapPath: './test-output/.notion-sync-map.json',
    repoPath: '.',
    verbose: true,
  });
  console.log('   ✅ Orchestrator created\n');

  // Register page
  console.log('3️⃣  Registering page...');
  await orchestrator.registerPage(
    pageId,
    inputFile,
    'NotionManager Test - Git to Notion',
    { conflictStrategy: 'git-wins' }
  );
  console.log('   ✅ Page registered\n');

  // Sync Git → Notion
  console.log('4️⃣  Syncing Git → Notion...');
  console.log('   ⚠️  This will OVERWRITE the Notion page content!');
  console.log('   ℹ️  Make sure you have a backup or are using a test page.');
  console.log();

  const startTime = Date.now();
  const result = await orchestrator.syncGitToNotion(pageId, {
    force: true,
  });
  const duration = Date.now() - startTime;
  console.log(`   ✅ Sync completed in ${duration}ms\n`);

  // Check result
  console.log('5️⃣  Validating result...');

  if (!result.success) {
    throw new Error(`Sync failed: ${result.error}`);
  }
  console.log('   ✅ Sync reported success');
  console.log(`   ℹ️  Notion URL: ${result.notionUrl}`);
  console.log();

  // Summary
  console.log('='.repeat(70));
  console.log('✅ TEST 2 PASSED');
  console.log('='.repeat(70));
  console.log();
  console.log('Results:');
  console.log(`  ✅ Markdown file created (${testMarkdown.split('\n').length} lines)`);
  console.log(`  ✅ Converted to Notion blocks`);
  console.log(`  ✅ Notion page updated`);
  console.log(`  ⏱  Duration: ${duration}ms`);
  console.log();
  console.log('Manual Verification Required:');
  console.log(`  1. Open Notion page: ${result.notionUrl}`);
  console.log('  2. Verify all content appeared correctly:');
  console.log('     - Headings (H1, H2, H3)');
  console.log('     - Bold and italic text');
  console.log('     - Inline code');
  console.log('     - Numbered list');
  console.log('     - Quote block');
  console.log('     - Code block (JavaScript)');
  console.log('     - Divider');
  console.log('  3. Check that timestamp matches this test run');
  console.log();
  console.log('Next Steps:');
  console.log('  After verifying in Notion, run Test 3 (Round-Trip)');
  console.log();

  return {
    success: true,
    duration,
    notionUrl: result.notionUrl,
  };
}

// Run test
runTest()
  .then(result => {
    console.log('✅ Test completed successfully\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ TEST FAILED\n');
    console.error('Error:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    console.error('\nTroubleshooting:');
    console.error('  1. Check NOTION_TOKEN is valid');
    console.error('  2. Check NOTION_PAGE_SIMPLE is correct');
    console.error('  3. Verify page is shared with integration');
    console.error('  4. Check integration has "Update content" permission');
    console.error();
    process.exit(1);
  });
