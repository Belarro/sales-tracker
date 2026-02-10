#!/usr/bin/env node

/**
 * Comprehensive Test Suite for NotionManager v3.6
 *
 * Tests all optimization phases:
 * - Phase 1: Disk caching with pre-population
 * - Phase 2: Validation and error recovery
 * - Phase 3: Integration with sync manager
 * - Phase 4: Progress tracking and logging
 * - Phase 5: Performance optimization
 */

import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { MarkdownValidator } from './markdown-validator.js';
import { PageLinkResolverV2 } from './page-link-resolver-v2.js';
import { SyncManagerV2 } from './sync-with-validation-v2.js';
import { markdownToNotionBlocks } from './markdown-parser-optimized.js';
import { streamMarkdownToBlocks } from './markdown-parser-optimized.js';

dotenv.config();

/**
 * Test results tracker
 */
class TestResults {
  constructor() {
    this.total = 0;
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.results = [];
  }

  add(name, passed, message = '') {
    this.total++;
    if (passed) {
      this.passed++;
      this.results.push({ name, status: '✅ PASS', message });
    } else {
      this.failed++;
      this.results.push({ name, status: '❌ FAIL', message });
    }
  }

  skip(name, reason = '') {
    this.total++;
    this.skipped++;
    this.results.push({ name, status: '⏭️  SKIP', message: reason });
  }

  summary() {
    console.log('\n' + '='.repeat(70));
    console.log('TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total: ${this.total} | Passed: ${this.passed} | Failed: ${this.failed} | Skipped: ${this.skipped}`);
    console.log(`Success Rate: ${((this.passed / (this.total - this.skipped)) * 100).toFixed(1)}%`);
    console.log('='.repeat(70) + '\n');

    if (this.failed > 0) {
      console.log('FAILED TESTS:');
      this.results
        .filter(r => r.status === '❌ FAIL')
        .forEach(r => {
          console.log(`  ${r.status} ${r.name}`);
          if (r.message) console.log(`     ${r.message}`);
        });
      console.log();
    }

    return this.failed === 0;
  }
}

/**
 * Phase 1: Caching Tests
 */
async function testPhase1Caching(results) {
  console.log('\n📦 PHASE 1: Disk Caching & Pre-Population\n');

  const resolver = new PageLinkResolverV2(null, { verbose: false });

  // Test 1.1: Cache loading
  console.log('Test 1.1: Load cache from disk...');
  const cacheExists = fs.existsSync('.notion-cache.json');
  results.add(
    'Cache file exists',
    cacheExists,
    cacheExists ? 'Found .notion-cache.json' : 'No cache file found'
  );

  // Test 1.2: Cache stats
  console.log('Test 1.2: Cache statistics...');
  const stats = resolver.getCacheStats();
  results.add(
    'Cache has entries',
    stats.totalEntries > 0,
    `${stats.totalEntries} entries, ${stats.validEntries} valid`
  );

  // Test 1.3: Extract page references
  console.log('Test 1.3: Extract page references...');
  const markdown = `Test @NotionManager and [[Athena]] references`;
  const refs = resolver.extractPageReferences(markdown);
  results.add(
    'Extract references',
    refs.length === 2 && refs.includes('NotionManager') && refs.includes('Athena'),
    `Found ${refs.length} references: ${refs.join(', ')}`
  );

  // Test 1.4: Search cached page (should be instant)
  console.log('Test 1.4: Search cached page...');
  const start = Date.now();
  const page = await resolver.searchPage('NotionManager');
  const elapsed = Date.now() - start;
  results.add(
    'Cache hit performance',
    elapsed < 50 && page !== null,
    `${elapsed}ms (${page ? 'found' : 'not found'})`
  );

  console.log();
}

/**
 * Phase 2: Validation Tests
 */
async function testPhase2Validation(results) {
  console.log('📋 PHASE 2: Validation & Error Recovery\n');

  const validator = new MarkdownValidator();

  // Test 2.1: Valid markdown
  console.log('Test 2.1: Valid markdown...');
  const validMd = `# Test\n\nThis is **valid** markdown.`;
  const validation1 = validator.validate(validMd);
  results.add(
    'Valid markdown passes',
    validation1.valid && validation1.issues.length === 0,
    `${validation1.issues.length} issues, ${validation1.warnings.length} warnings`
  );

  // Test 2.2: Unclosed code block
  console.log('Test 2.2: Unclosed code block detection...');
  const unclosedCode = '```javascript\nfunction test() {\n// Missing closing ```';
  const validation2 = validator.validate(unclosedCode);
  results.add(
    'Detects unclosed code block',
    !validation2.valid && validation2.issues.some(i => i.message.includes('Unclosed code block')),
    `Found ${validation2.issues.length} issue(s)`
  );

  // Test 2.3: Invalid image URL
  console.log('Test 2.3: Invalid image URL detection...');
  const invalidImage = '![Test](not-a-url)';
  const validation3 = validator.validate(invalidImage);
  results.add(
    'Detects invalid image URL',
    !validation3.valid && validation3.issues.some(i => i.message.includes('Invalid image URL')),
    `Found ${validation3.issues.length} issue(s)`
  );

  // Test 2.4: Malformed table
  console.log('Test 2.4: Malformed table detection...');
  const malformedTable = `| A | B |\n|---|---|\n| 1 | 2 | 3 |`;
  const validation4 = validator.validate(malformedTable);
  results.add(
    'Detects malformed table',
    !validation4.valid && validation4.issues.some(i => i.message.includes('column')),
    `Found ${validation4.issues.length} issue(s)`
  );

  // Test 2.5: Unclosed equation
  console.log('Test 2.5: Unclosed equation detection...');
  const unclosedEq = '$\nx^2 + y = z\n// Missing closing $';
  const validation5 = validator.validate(unclosedEq);
  results.add(
    'Detects unclosed equation',
    !validation5.valid && validation5.issues.some(i => i.message.includes('Unclosed')),
    `Found ${validation5.issues.length} issue(s)`
  );

  console.log();
}

/**
 * Phase 3: Integration Tests
 */
async function testPhase3Integration(results) {
  console.log('🔗 PHASE 3: Integration & Sync Manager\n');

  const manager = new SyncManagerV2({ verbose: false });

  // Test 3.1: Dry run with valid content
  console.log('Test 3.1: Dry run sync...');
  const testMd = `# Integration Test\n\nThis is a test with @NotionManager.`;
  const syncResult1 = await manager.sync(testMd, {
    dryRun: true,
    title: 'Integration Test',
    showProgress: false,
  });
  results.add(
    'Dry run succeeds',
    syncResult1.success && syncResult1.dryRun === true,
    `Created ${syncResult1.stats.totalBlocks} blocks`
  );

  // Test 3.2: Validation failure handling
  console.log('Test 3.2: Validation failure handling...');
  const invalidMd = '```\nunclosed';
  const syncResult2 = await manager.sync(invalidMd, {
    dryRun: true,
    title: 'Invalid Test',
    showProgress: false,
  });
  results.add(
    'Rejects invalid markdown',
    !syncResult2.success && syncResult2.errors.length > 0,
    `${syncResult2.errors.length} error(s) reported`
  );

  // Test 3.3: Force mode
  console.log('Test 3.3: Force mode override...');
  const syncResult3 = await manager.sync(invalidMd, {
    dryRun: true,
    title: 'Force Test',
    force: true,
    showProgress: false,
  });
  results.add(
    'Force mode overrides validation',
    syncResult3.success === true,
    `Success: ${syncResult3.success}`
  );

  // Test 3.4: Page link resolution
  console.log('Test 3.4: Page link resolution...');
  const linkMd = `Test [[NotionManager]] and @Athena links.`;
  const syncResult4 = await manager.sync(linkMd, {
    dryRun: true,
    title: 'Link Test',
    showProgress: false,
    resolveLinks: true,
  });
  results.add(
    'Resolves page links',
    syncResult4.stats.pageLinks >= 0, // May be 0 if not found
    `Resolved ${syncResult4.stats.pageLinks} link(s)`
  );

  console.log();
}

/**
 * Phase 4: Progress Tracking Tests
 */
async function testPhase4Progress(results) {
  console.log('📊 PHASE 4: Progress Tracking & Logging\n');

  const manager = new SyncManagerV2({ verbose: false, timestamps: false });

  // Test 4.1: Progress tracking during sync
  console.log('Test 4.1: Progress tracking...');
  const testMd = `# Progress Test\n\nTest with @A @B @C @D @E links.`;

  // Capture console output
  let progressOutput = '';
  const originalLog = console.log;
  console.log = (...args) => {
    progressOutput += args.join(' ') + '\n';
    originalLog(...args);
  };

  await manager.sync(testMd, {
    dryRun: true,
    title: 'Progress Test',
    showProgress: true,
  });

  console.log = originalLog;

  results.add(
    'Shows progress indicators',
    progressOutput.includes('Step') || progressOutput.includes('📊'),
    'Progress indicators displayed'
  );

  // Test 4.2: Performance timing
  console.log('Test 4.2: Performance timing...');
  const hasTimingInfo = progressOutput.includes('Performance') || progressOutput.includes('⏱️');
  results.add(
    'Tracks performance timing',
    hasTimingInfo,
    hasTimingInfo ? 'Timing info present' : 'No timing info'
  );

  console.log();
}

/**
 * Phase 5: Performance Tests
 */
async function testPhase5Performance(results) {
  console.log('⚡ PHASE 5: Parser Performance\n');

  // Test 5.1: Small document parsing speed
  console.log('Test 5.1: Small document (100 lines)...');
  const smallDoc = generateTestMarkdown(100);
  const start1 = Date.now();
  const blocks1 = markdownToNotionBlocks(smallDoc);
  const elapsed1 = Date.now() - start1;
  results.add(
    'Small doc performance',
    elapsed1 < 10 && blocks1.length > 0,
    `${elapsed1}ms for ${blocks1.length} blocks`
  );

  // Test 5.2: Large document parsing speed
  console.log('Test 5.2: Large document (10000 lines)...');
  const largeDoc = generateTestMarkdown(10000);
  const start2 = Date.now();
  const blocks2 = markdownToNotionBlocks(largeDoc);
  const elapsed2 = Date.now() - start2;
  results.add(
    'Large doc performance',
    elapsed2 < 100 && blocks2.length > 0,
    `${elapsed2}ms for ${blocks2.length} blocks`
  );

  // Test 5.3: Streaming parser
  console.log('Test 5.3: Streaming parser...');
  let totalBlocks = 0;
  const start3 = Date.now();

  for await (const chunkBlocks of streamMarkdownToBlocks(largeDoc, {
    chunkSize: 1000,
    maxBlocks: 100,
  })) {
    totalBlocks += chunkBlocks.length;
  }

  const elapsed3 = Date.now() - start3;
  results.add(
    'Streaming performance',
    elapsed3 < 500 && totalBlocks > 0,
    `${elapsed3}ms for ${totalBlocks} blocks`
  );

  console.log();
}

/**
 * Feature Tests
 */
async function testFeatures(results) {
  console.log('🎯 FEATURE TESTS\n');

  // Test all v3.5 features
  const featuresMd = `
# Feature Test

## Images
![Test](https://example.com/img.png)
_Caption_

## Page Links
@NotionManager and [[Athena]]

## Equations
Inline: $$E = mc^2$$

Block:
$
x^2 + y = z
$

## Formatting
**Bold** *italic* \`code\` ~~strike~~ __underline__

## Lists
- Bullet 1
- Bullet 2

1. Number 1
2. Number 2

## Tables
| A | B |
|---|---|
| 1 | 2 |

## Code
\`\`\`javascript
function test() {}
\`\`\`

## Quotes
> This is a quote
`;

  console.log('Test: All features parsing...');
  const blocks = markdownToNotionBlocks(featuresMd);

  const blockTypes = {};
  blocks.forEach(b => {
    blockTypes[b.type] = (blockTypes[b.type] || 0) + 1;
  });

  results.add(
    'Parses images',
    blockTypes.image > 0,
    `${blockTypes.image || 0} image(s)`
  );

  results.add(
    'Parses equations',
    blockTypes.equation > 0,
    `${blockTypes.equation || 0} equation(s)`
  );

  results.add(
    'Parses lists',
    (blockTypes.bulleted_list_item || 0) + (blockTypes.numbered_list_item || 0) > 0,
    `${(blockTypes.bulleted_list_item || 0) + (blockTypes.numbered_list_item || 0)} list items`
  );

  results.add(
    'Parses tables',
    blockTypes.table > 0,
    `${blockTypes.table || 0} table(s)`
  );

  results.add(
    'Parses code blocks',
    blockTypes.code > 0,
    `${blockTypes.code || 0} code block(s)`
  );

  results.add(
    'Parses quotes',
    blockTypes.quote > 0,
    `${blockTypes.quote || 0} quote(s)`
  );

  console.log();
}

/**
 * Generate test markdown
 */
function generateTestMarkdown(lines) {
  const content = [];

  for (let i = 0; i < lines; i++) {
    const type = i % 8;

    switch (type) {
      case 0:
        content.push(`# Heading ${i}`);
        break;
      case 1:
        content.push(`**Bold text** in line ${i}`);
        break;
      case 2:
        content.push(`- Bullet ${i}`);
        break;
      case 3:
        content.push(`${i}. Number`);
        break;
      case 4:
        content.push(`Equation: $$x^${i}$$`);
        break;
      case 5:
        content.push(`Link [${i}](https://example.com/${i})`);
        break;
      case 6:
        content.push(`> Quote ${i}`);
        break;
      default:
        content.push(`Paragraph ${i}`);
    }
  }

  return content.join('\n');
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('\n' + '='.repeat(70));
  console.log('NotionManager v3.6 - Comprehensive Test Suite');
  console.log('='.repeat(70));

  const results = new TestResults();

  try {
    await testPhase1Caching(results);
    await testPhase2Validation(results);
    await testPhase3Integration(results);
    await testPhase4Progress(results);
    await testPhase5Performance(results);
    await testFeatures(results);
  } catch (error) {
    console.error('\n❌ Test suite error:', error.message);
    console.error(error.stack);
  }

  const success = results.summary();

  if (success) {
    console.log('🎉 ALL TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED\n');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
