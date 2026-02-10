/**
 * v4.0 Research: Test reading blocks from Notion pages
 *
 * Goal: Understand exact structure Notion returns for each block type
 * Production pages:
 * - MEMORY.md: 29660b6e8d188144a36ff8857827dc73
 * - V3.6-RELEASE-NOTES.md: 29660b6e8d188168a819c1c285d3351e
 * - PROJECT-STATUS.md: 29660b6e8d18812caf35ed4f993cbdbf
 */

import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });

// Production page IDs
const PRODUCTION_PAGES = {
  memory: '29660b6e-8d18-8144-a36f-f8857827dc73',
  releaseNotes: '29660b6e-8d18-8168-a819-c1c285d3351e',
  projectStatus: '29660b6e-8d18-812c-af35-ed4f993cbdbf',
};

/**
 * Test 1: Retrieve page metadata
 */
async function testPageMetadata(pageId, pageName) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST 1: Page Metadata - ${pageName}`);
  console.log('='.repeat(80));

  try {
    const page = await notion.pages.retrieve({ page_id: pageId });

    console.log('\n📄 Page Properties:');
    console.log(`- ID: ${page.id}`);
    console.log(`- Created: ${page.created_time}`);
    console.log(`- Last Edited: ${page.last_edited_time}`);
    console.log(`- Last Edited By: ${page.last_edited_by.id}`);
    console.log(`- Archived: ${page.archived}`);
    console.log(`- URL: ${page.url}`);

    console.log('\n🏷️ Properties Structure:');
    console.log(JSON.stringify(page.properties, null, 2));

    return page;
  } catch (error) {
    console.error(`❌ Error retrieving page metadata: ${error.message}`);
    return null;
  }
}

/**
 * Test 2: Retrieve all blocks from page
 */
async function testRetrieveBlocks(pageId, pageName) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST 2: Block Retrieval - ${pageName}`);
  console.log('='.repeat(80));

  try {
    const blocks = [];
    let cursor = undefined;

    do {
      const response = await notion.blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
        page_size: 100,
      });

      blocks.push(...response.results);
      cursor = response.next_cursor;

      console.log(`\n📦 Retrieved ${response.results.length} blocks (Total: ${blocks.length})`);
      if (cursor) {
        console.log(`   More blocks available, continuing...`);
      }
    } while (cursor);

    console.log(`\n✅ Total blocks retrieved: ${blocks.length}`);

    return blocks;
  } catch (error) {
    console.error(`❌ Error retrieving blocks: ${error.message}`);
    return [];
  }
}

/**
 * Test 3: Analyze block types and structure
 */
async function analyzeBlockTypes(blocks) {
  console.log(`\n${'='.repeat(80)}`);
  console.log('TEST 3: Block Type Analysis');
  console.log('='.repeat(80));

  const typeCounts = {};
  const samples = {};

  for (const block of blocks) {
    const type = block.type;
    typeCounts[type] = (typeCounts[type] || 0) + 1;

    // Store first sample of each type
    if (!samples[type]) {
      samples[type] = block;
    }
  }

  console.log('\n📊 Block Type Distribution:');
  Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

  console.log('\n🔍 Block Type Samples:');
  for (const [type, sample] of Object.entries(samples)) {
    console.log(`\n--- ${type.toUpperCase()} ---`);
    console.log(JSON.stringify(sample, null, 2));
  }

  return { typeCounts, samples };
}

/**
 * Test 4: Rich text annotation analysis
 */
async function analyzeRichText(blocks) {
  console.log(`\n${'='.repeat(80)}`);
  console.log('TEST 4: Rich Text Annotation Analysis');
  console.log('='.repeat(80));

  const annotationSamples = [];

  for (const block of blocks) {
    const type = block.type;
    const blockData = block[type];

    if (!blockData || !blockData.rich_text) continue;

    for (const richText of blockData.rich_text) {
      if (!richText.annotations) continue;

      const hasAnnotations = Object.entries(richText.annotations).some(
        ([key, value]) => value === true && key !== 'color'
      );

      if (hasAnnotations || richText.annotations.color !== 'default') {
        annotationSamples.push({
          blockType: type,
          text: richText.plain_text,
          annotations: richText.annotations,
          href: richText.href,
        });
      }
    }
  }

  console.log(`\n✨ Found ${annotationSamples.length} annotated text segments`);

  if (annotationSamples.length > 0) {
    console.log('\n📝 Annotation Samples:');
    annotationSamples.slice(0, 10).forEach((sample, i) => {
      console.log(`\n${i + 1}. "${sample.text}"`);
      console.log(`   Block Type: ${sample.blockType}`);
      console.log(`   Annotations: ${JSON.stringify(sample.annotations)}`);
      if (sample.href) {
        console.log(`   Link: ${sample.href}`);
      }
    });
  }

  return annotationSamples;
}

/**
 * Test 5: Nested block analysis
 */
async function analyzeNestedBlocks(blocks) {
  console.log(`\n${'='.repeat(80)}`);
  console.log('TEST 5: Nested Block Analysis');
  console.log('='.repeat(80));

  const blocksWithChildren = blocks.filter(block => block.has_children);

  console.log(`\n🌳 Blocks with children: ${blocksWithChildren.length}`);

  if (blocksWithChildren.length > 0) {
    console.log('\n📂 Retrieving nested blocks...');

    for (const parentBlock of blocksWithChildren.slice(0, 3)) {
      console.log(`\n   Parent: ${parentBlock.type} (${parentBlock.id})`);

      try {
        const children = await notion.blocks.children.list({
          block_id: parentBlock.id,
        });

        console.log(`   Children: ${children.results.length}`);
        children.results.forEach((child, i) => {
          console.log(`      ${i + 1}. ${child.type}`);
        });
      } catch (error) {
        console.error(`   ❌ Error retrieving children: ${error.message}`);
      }
    }
  }

  return blocksWithChildren;
}

/**
 * Test 6: Table analysis (if present)
 */
async function analyzeTablesDetailed(blocks) {
  console.log(`\n${'='.repeat(80)}`);
  console.log('TEST 6: Table Analysis');
  console.log('='.repeat(80));

  const tables = blocks.filter(block => block.type === 'table');

  console.log(`\n📊 Tables found: ${tables.length}`);

  if (tables.length > 0) {
    for (const table of tables) {
      console.log(`\n--- Table ${table.id} ---`);
      console.log(`Dimensions: ${table.table.table_width} columns x ? rows`);
      console.log(`Has column header: ${table.table.has_column_header}`);
      console.log(`Has row header: ${table.table.has_row_header}`);

      // Retrieve table rows
      const rows = await notion.blocks.children.list({
        block_id: table.id,
      });

      console.log(`\n📋 Table Rows: ${rows.results.length}`);

      rows.results.forEach((row, i) => {
        if (row.type === 'table_row') {
          const cells = row.table_row.cells;
          console.log(`\nRow ${i + 1}:`);
          cells.forEach((cell, j) => {
            const text = cell.map(rt => rt.plain_text).join('');
            console.log(`   Cell ${j + 1}: "${text}"`);
          });
        }
      });
    }
  }

  return tables;
}

/**
 * Test 7: Change detection simulation
 */
async function testChangeDetection(pageId, pageName) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST 7: Change Detection - ${pageName}`);
  console.log('='.repeat(80));

  try {
    const page = await notion.pages.retrieve({ page_id: pageId });

    console.log('\n⏱️ Timestamps:');
    console.log(`   Created: ${page.created_time}`);
    console.log(`   Last Edited: ${page.last_edited_time}`);

    const createdDate = new Date(page.created_time);
    const editedDate = new Date(page.last_edited_time);
    const now = new Date();

    console.log('\n📅 Time Deltas:');
    console.log(`   Created → Last Edit: ${Math.floor((editedDate - createdDate) / 1000 / 60)} minutes`);
    console.log(`   Last Edit → Now: ${Math.floor((now - editedDate) / 1000 / 60)} minutes`);

    // Check if edited within last 24 hours
    const isRecentlyEdited = (now - editedDate) < 24 * 60 * 60 * 1000;
    console.log(`\n🔄 Recently edited (24h): ${isRecentlyEdited}`);

    return {
      created: page.created_time,
      lastEdited: page.last_edited_time,
      isRecentlyEdited,
    };
  } catch (error) {
    console.error(`❌ Error in change detection: ${error.message}`);
    return null;
  }
}

/**
 * Test 8: Rate limit testing
 */
async function testRateLimits() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('TEST 8: Rate Limit Testing');
  console.log('='.repeat(80));

  const testPageId = PRODUCTION_PAGES.projectStatus;
  const requestCount = 10;
  const timings = [];

  console.log(`\n⚡ Making ${requestCount} rapid requests...`);

  for (let i = 0; i < requestCount; i++) {
    const start = Date.now();

    try {
      await notion.blocks.children.list({
        block_id: testPageId,
        page_size: 10,
      });

      const duration = Date.now() - start;
      timings.push(duration);

      console.log(`   Request ${i + 1}: ${duration}ms`);
    } catch (error) {
      console.error(`   ❌ Request ${i + 1} failed: ${error.message}`);

      if (error.code === 'rate_limited') {
        console.log(`   ⚠️ RATE LIMITED after ${i + 1} requests`);
        break;
      }
    }
  }

  const avgTiming = timings.reduce((a, b) => a + b, 0) / timings.length;

  console.log(`\n📊 Rate Limit Results:`);
  console.log(`   Successful Requests: ${timings.length}`);
  console.log(`   Average Response Time: ${avgTiming.toFixed(0)}ms`);
  console.log(`   Min: ${Math.min(...timings)}ms`);
  console.log(`   Max: ${Math.max(...timings)}ms`);

  return timings;
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║  NotionManager v4.0 API Research - Block Reading & Analysis               ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');

  const results = {};

  // Test with MEMORY.md page (most comprehensive)
  const testPageId = PRODUCTION_PAGES.memory;
  const testPageName = 'MEMORY.md';

  try {
    // Test 1: Page metadata
    results.metadata = await testPageMetadata(testPageId, testPageName);

    // Test 2: Retrieve blocks
    results.blocks = await testRetrieveBlocks(testPageId, testPageName);

    // Test 3: Block type analysis
    results.blockAnalysis = await analyzeBlockTypes(results.blocks);

    // Test 4: Rich text annotations
    results.annotations = await analyzeRichText(results.blocks);

    // Test 5: Nested blocks
    results.nestedBlocks = await analyzeNestedBlocks(results.blocks);

    // Test 6: Tables (if any)
    results.tables = await analyzeTablesDetailed(results.blocks);

    // Test 7: Change detection
    results.changeDetection = await testChangeDetection(testPageId, testPageName);

    // Test 8: Rate limits
    results.rateLimits = await testRateLimits();

    // Save results to file
    const outputPath = join(__dirname, 'test-read-blocks-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

    console.log(`\n${'='.repeat(80)}`);
    console.log('✅ ALL TESTS COMPLETE');
    console.log('='.repeat(80));
    console.log(`\n📁 Full results saved to: ${outputPath}`);
    console.log(`📊 Total blocks analyzed: ${results.blocks.length}`);
    console.log(`🎯 Block types found: ${Object.keys(results.blockAnalysis.typeCounts).length}`);

  } catch (error) {
    console.error('\n❌ Fatal error during testing:');
    console.error(error);
  }
}

// Run tests
runAllTests().catch(console.error);
