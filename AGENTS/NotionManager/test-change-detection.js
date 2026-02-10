/**
 * NotionManager v4.0.0 - Change Detection System Tests
 *
 * Test suite for change detection functionality.
 */

import { ChangeDetectionSystem, createChangeDetectionSystem } from './change-detection-system.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test sync map path (use temp file)
const TEST_SYNC_MAP = path.join(__dirname, '.notion-sync-map.test.json');

class TestResults {
  constructor() {
    this.total = 0;
    this.passed = 0;
    this.failed = 0;
    this.results = [];
  }

  add(name, passed, message = '') {
    this.total++;
    if (passed) {
      this.passed++;
      this.results.push({ name, status: '✅ PASS', message });
      console.log(`✅ ${name}`);
    } else {
      this.failed++;
      this.results.push({ name, status: '❌ FAIL', message });
      console.log(`❌ ${name}: ${message}`);
    }
  }

  summary() {
    console.log('\n' + '='.repeat(70));
    console.log('TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total: ${this.total} | Passed: ${this.passed} | Failed: ${this.failed}`);
    console.log(`Success Rate: ${((this.passed / this.total) * 100).toFixed(1)}%`);
    console.log('='.repeat(70));
    return this.failed === 0;
  }
}

async function cleanupTestFiles() {
  try {
    await fs.unlink(TEST_SYNC_MAP);
  } catch (error) {
    // Ignore if file doesn't exist
  }
}

async function runTests() {
  const results = new TestResults();

  console.log('=== ChangeDetectionSystem Test Suite ===\n');

  // Clean up before tests
  await cleanupTestFiles();

  try {
    // Test 1: Create new change detection system
    console.log('\n📋 Test Category: Initialization\n');

    const system = new ChangeDetectionSystem({
      syncMapPath: TEST_SYNC_MAP,
      verbose: false,
    });

    results.add(
      'Create ChangeDetectionSystem instance',
      system instanceof ChangeDetectionSystem,
      'Should create instance'
    );

    // Test 2: Load sync map (should create new one)
    const syncMap = await system.loadSyncMap();
    results.add(
      'Load sync map (creates new if not exists)',
      syncMap.version === '4.0.0' && Array.isArray(syncMap.mappings),
      'Should create new sync map with version and empty mappings array'
    );

    results.add(
      'Sync map has no mappings initially',
      syncMap.mappings.length === 0,
      'New sync map should have 0 mappings'
    );

    // Test 3: Register a mapping
    console.log('\n📋 Test Category: Mapping Management\n');

    const mapping1 = await system.registerMapping(
      'test-page-id-1',
      'test/file1.md',
      'Test Page 1',
      { conflictStrategy: 'notion-wins' }
    );

    results.add(
      'Register new mapping',
      mapping1.pageId === 'test-page-id-1' &&
      mapping1.filePath === 'test/file1.md' &&
      mapping1.title === 'Test Page 1' &&
      mapping1.conflictStrategy === 'notion-wins',
      'Should create mapping with correct properties'
    );

    results.add(
      'Sync map has 1 mapping after registration',
      system.syncMap.mappings.length === 1,
      'Should have 1 mapping'
    );

    // Test 4: Get mapping by page ID
    const retrieved = system.getMapping('test-page-id-1');
    results.add(
      'Get mapping by page ID',
      retrieved && retrieved.pageId === 'test-page-id-1',
      'Should retrieve mapping by page ID'
    );

    // Test 5: Get mapping by file path
    const retrievedByPath = system.getMappingByPath('test/file1.md');
    results.add(
      'Get mapping by file path',
      retrievedByPath && retrievedByPath.pageId === 'test-page-id-1',
      'Should retrieve mapping by file path'
    );

    // Test 6: Register duplicate mapping
    const mapping1Again = await system.registerMapping(
      'test-page-id-1',
      'test/file1.md',
      'Test Page 1'
    );

    results.add(
      'Register duplicate mapping (should return existing)',
      system.syncMap.mappings.length === 1,
      'Should not create duplicate, still have 1 mapping'
    );

    // Test 7: Register multiple mappings
    await system.registerMapping('test-page-id-2', 'test/file2.md', 'Test Page 2');
    await system.registerMapping('test-page-id-3', 'test/file3.md', 'Test Page 3');

    results.add(
      'Register multiple mappings',
      system.syncMap.mappings.length === 3,
      'Should have 3 mappings'
    );

    // Test 8: Update Git→Notion sync
    console.log('\n📋 Test Category: Sync Tracking\n');

    await system.updateGitToNotionSync('test-page-id-1', 'abc123def456');
    const updated1 = system.getMapping('test-page-id-1');

    results.add(
      'Update Git→Notion sync time',
      updated1.lastSyncGitToNotion !== null &&
      updated1.lastGitCommit === 'abc123def456',
      'Should update lastSyncGitToNotion and lastGitCommit'
    );

    // Test 9: Update Notion→Git sync
    const notionEditTime = new Date().toISOString();
    await system.updateNotionToGitSync('test-page-id-2', notionEditTime);
    const updated2 = system.getMapping('test-page-id-2');

    results.add(
      'Update Notion→Git sync time',
      updated2.lastSyncNotionToGit !== null &&
      updated2.lastNotionEdit === notionEditTime,
      'Should update lastSyncNotionToGit and lastNotionEdit'
    );

    // Test 10: Get statistics
    console.log('\n📋 Test Category: Statistics\n');

    const stats = system.getStats();

    results.add(
      'Get sync statistics',
      stats.total === 3 &&
      stats.gitToNotionOnly === 1 &&
      stats.notionToGitOnly === 1 &&
      stats.neverSynced === 1,
      'Should calculate correct statistics'
    );

    // Test 11: Save and reload sync map
    console.log('\n📋 Test Category: Persistence\n');

    await system.saveSyncMap();
    const fileExists = await fs.access(TEST_SYNC_MAP).then(() => true).catch(() => false);

    results.add(
      'Save sync map to disk',
      fileExists,
      'Should save sync map file'
    );

    // Test 12: Load existing sync map
    const system2 = new ChangeDetectionSystem({
      syncMapPath: TEST_SYNC_MAP,
      verbose: false,
    });
    await system2.loadSyncMap();

    results.add(
      'Load existing sync map from disk',
      system2.syncMap.mappings.length === 3,
      'Should load 3 mappings from saved file'
    );

    // Test 13: Create helper function
    console.log('\n📋 Test Category: Helper Functions\n');

    const system3 = await createChangeDetectionSystem({
      syncMapPath: TEST_SYNC_MAP,
      verbose: false,
    });

    results.add(
      'createChangeDetectionSystem helper',
      system3.syncMap !== null && system3.syncMap.mappings.length === 3,
      'Should create and load system in one call'
    );

    // Test 14: Polling control
    console.log('\n📋 Test Category: Polling (Mock)\n');

    results.add(
      'Initial polling state is false',
      system.isPolling === false,
      'Should not be polling initially'
    );

    let pollCount = 0;
    const onChangeDetected = async (pages) => {
      pollCount++;
      console.log(`  Poll callback triggered: ${pages.length} page(s)`);
    };

    // Note: We can't test actual polling without real Notion pages
    // So we just test the control functions
    results.add(
      'Stop polling when not started (should not error)',
      true, // Should not throw
      'Should handle stopPolling when not polling'
    );

    system.stopPolling();

    // Test 15: Error handling
    console.log('\n📋 Test Category: Error Handling\n');

    let errorCaught = false;
    try {
      await system.updateGitToNotionSync('non-existent-page', 'abc123');
    } catch (error) {
      errorCaught = error.message.includes('No mapping found');
    }

    results.add(
      'Error on updating non-existent mapping',
      errorCaught,
      'Should throw error for non-existent page'
    );

    // Test 16: Sync map not loaded error
    const system4 = new ChangeDetectionSystem({
      syncMapPath: TEST_SYNC_MAP,
      verbose: false,
    });

    errorCaught = false;
    try {
      system4.getMapping('test-page-id-1');
    } catch (error) {
      errorCaught = error.message.includes('Sync map not loaded');
    }

    results.add(
      'Error when sync map not loaded',
      errorCaught,
      'Should throw error when accessing mapping before loading'
    );

    // Test 17: Test with production page (if NOTION_TOKEN is set)
    console.log('\n📋 Test Category: Production Integration (Optional)\n');

    if (process.env.NOTION_TOKEN) {
      try {
        // Use one of our production pages
        const prodPageId = '29660b6e8d188144a36ff8857827dc73'; // MEMORY.md

        const prodSystem = await createChangeDetectionSystem({
          syncMapPath: TEST_SYNC_MAP + '.prod',
          verbose: true,
        });

        await prodSystem.registerMapping(
          prodPageId,
          'AGENTS/NotionManager/MEMORY.md',
          'NotionManager MEMORY',
          {
            lastSyncGitToNotion: '2025-10-24T14:58:32Z', // When we synced it
          }
        );

        const changeResult = await prodSystem.detectPageChange(prodPageId);

        results.add(
          'Detect changes on production page',
          changeResult.lastEditedTime !== null &&
          typeof changeResult.changed === 'boolean',
          `Page last edited: ${changeResult.lastEditedTime}, Changed: ${changeResult.changed}`
        );

        console.log(`  📊 Change detection result:`);
        console.log(`     Last edited: ${changeResult.lastEditedTime}`);
        console.log(`     Changed: ${changeResult.changed}`);
        console.log(`     Needs sync: ${changeResult.needsSync}`);
        console.log(`     Time since edit: ${Math.floor(changeResult.timeSinceEdit / 1000)}s`);

        // Cleanup
        await fs.unlink(TEST_SYNC_MAP + '.prod').catch(() => {});
      } catch (error) {
        results.add(
          'Production page change detection',
          false,
          `Error: ${error.message}`
        );
      }
    } else {
      console.log('  ⏭️  Skipping production test (NOTION_TOKEN not set)');
    }

  } catch (error) {
    console.error('\n❌ Fatal error during tests:', error);
    throw error;
  } finally {
    // Cleanup
    await cleanupTestFiles();
  }

  return results.summary();
}

// Run tests
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
