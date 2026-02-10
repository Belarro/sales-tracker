/**
 * Production Validation Test 1: Notion → Git Sync
 *
 * Tests basic sync from Notion to Git with simple content.
 */

import { createBidirectionalSyncOrchestrator } from './bidirectional-sync-orchestrator.js';
import fs from 'fs/promises';

async function runTest() {
  console.log('='.repeat(70));
  console.log('TEST 1: Notion → Git Sync (Simple Page)');
  console.log('='.repeat(70));
  console.log();

  // Check environment
  if (!process.env.NOTION_TOKEN) {
    throw new Error('NOTION_TOKEN not set. Run: source .env.test');
  }
  if (!process.env.NOTION_PAGE_SIMPLE) {
    throw new Error('NOTION_PAGE_SIMPLE not set. Set test page ID in .env.test');
  }

  const pageId = process.env.NOTION_PAGE_SIMPLE;
  const outputFile = './test-output/notion-to-git-simple.md';

  console.log('📋 Test Configuration:');
  console.log(`   Page ID: ${pageId}`);
  console.log(`   Output: ${outputFile}`);
  console.log();

  // Create orchestrator
  console.log('1️⃣  Creating orchestrator...');
  const orchestrator = await createBidirectionalSyncOrchestrator({
    notionToken: process.env.NOTION_TOKEN,
    syncMapPath: './test-output/.notion-sync-map.json',
    repoPath: '.',
    verbose: true,
  });
  console.log('   ✅ Orchestrator created\n');

  // Register page
  console.log('2️⃣  Registering test page...');
  await orchestrator.registerPage(
    pageId,
    outputFile,
    'NotionManager Test - Simple',
    { conflictStrategy: 'notion-wins' }
  );
  console.log('   ✅ Page registered\n');

  // Sync Notion → Git
  console.log('3️⃣  Syncing Notion → Git...');
  const startTime = Date.now();
  const result = await orchestrator.syncNotionToGit(pageId, {
    force: true,
    commit: false, // Don't commit during test
  });
  const duration = Date.now() - startTime;
  console.log(`   ✅ Sync completed in ${duration}ms\n`);

  // Check result
  console.log('4️⃣  Validating result...');

  if (!result.success) {
    throw new Error(`Sync failed: ${result.error}`);
  }
  console.log('   ✅ Sync reported success');

  // Check file exists
  try {
    await fs.access(outputFile);
    console.log('   ✅ Output file created');
  } catch (error) {
    throw new Error('Output file not created');
  }

  // Read and display content
  const content = await fs.readFile(outputFile, 'utf8');
  const lineCount = content.split('\n').length;
  const charCount = content.length;

  console.log('   ✅ File readable');
  console.log(`   ℹ️  ${lineCount} lines, ${charCount} characters`);
  console.log();

  // Display first few lines
  console.log('5️⃣  File Preview (first 20 lines):');
  console.log('   ' + '-'.repeat(68));
  const preview = content.split('\n').slice(0, 20).join('\n');
  console.log(preview.split('\n').map(line => '   ' + line).join('\n'));
  if (lineCount > 20) {
    console.log('   ... (' + (lineCount - 20) + ' more lines)');
  }
  console.log('   ' + '-'.repeat(68));
  console.log();

  // Check sync map
  console.log('6️⃣  Validating sync map...');
  const syncMapContent = await fs.readFile('./test-output/.notion-sync-map.json', 'utf8');
  const syncMap = JSON.parse(syncMapContent);

  const mapping = syncMap.mappings.find(m => m.pageId === pageId);
  if (!mapping) {
    throw new Error('Page not found in sync map');
  }
  console.log('   ✅ Sync map updated');
  console.log(`   ℹ️  Last sync: ${mapping.lastSyncNotionToGit || 'Never'}`);
  console.log();

  // Get stats
  const stats = orchestrator.getStats();
  console.log('7️⃣  Statistics:');
  console.log(`   Total pages tracked: ${stats.totalPages}`);
  console.log(`   Pages needing sync: ${stats.pagesNeedingSync}`);
  console.log(`   Last check: ${new Date(stats.lastCheckTime).toISOString()}`);
  console.log();

  // Summary
  console.log('='.repeat(70));
  console.log('✅ TEST 1 PASSED');
  console.log('='.repeat(70));
  console.log();
  console.log('Results:');
  console.log(`  ✅ Notion page fetched successfully`);
  console.log(`  ✅ Converted to markdown (${lineCount} lines)`);
  console.log(`  ✅ File written: ${outputFile}`);
  console.log(`  ✅ Sync map updated`);
  console.log(`  ⏱  Duration: ${duration}ms`);
  console.log();
  console.log('Next Steps:');
  console.log('  1. Open the output file and verify content matches Notion');
  console.log('  2. Check that formatting is preserved (headings, bold, italic)');
  console.log('  3. Run Test 2 (Git → Notion)');
  console.log();

  return {
    success: true,
    duration,
    lineCount,
    charCount,
    outputFile,
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
    console.error('  2. Check NOTION_PAGE_SIMPLE is correct page ID');
    console.error('  3. Verify page is shared with integration');
    console.error('  4. Check network connectivity');
    console.error();
    process.exit(1);
  });
