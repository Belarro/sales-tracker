#!/usr/bin/env node

/**
 * Demo: Bidirectional Sync - Notion ↔ Markdown
 *
 * Demonstrates:
 * 1. Fetching a Notion page via API
 * 2. Converting blocks to markdown
 * 3. Comparing with original markdown (if available)
 * 4. Round-trip conversion accuracy
 *
 * @author NotionManager v4.0
 * @date 2025-10-24
 */

import { Client } from '@notionhq/client';
import { NotionToMarkdownConverter } from './notion-to-markdown.js';
import { markdownToNotionBlocks } from './markdown-parser-optimized.js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

/**
 * Fetch all blocks from a Notion page
 */
async function fetchPageBlocks(notion, pageId) {
  const blocks = [];
  let cursor = undefined;

  while (true) {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });

    blocks.push(...response.results);

    if (!response.has_more) {
      break;
    }

    cursor = response.next_cursor;
  }

  return blocks;
}

/**
 * Compare two markdown strings and report differences
 */
function compareMarkdown(original, converted) {
  const originalLines = original.split('\n').filter(line => line.trim());
  const convertedLines = converted.split('\n').filter(line => line.trim());

  const stats = {
    originalLines: originalLines.length,
    convertedLines: convertedLines.length,
    matchingLines: 0,
    differences: [],
  };

  const maxLines = Math.max(originalLines.length, convertedLines.length);

  for (let i = 0; i < maxLines; i++) {
    const origLine = originalLines[i] || '';
    const convLine = convertedLines[i] || '';

    if (origLine === convLine) {
      stats.matchingLines++;
    } else {
      stats.differences.push({
        line: i + 1,
        original: origLine,
        converted: convLine,
      });
    }
  }

  stats.accuracy = (stats.matchingLines / maxLines) * 100;

  return stats;
}

/**
 * Format comparison report
 */
function formatComparisonReport(stats) {
  const lines = [];

  lines.push('\n' + '='.repeat(70));
  lines.push('CONVERSION COMPARISON');
  lines.push('='.repeat(70));
  lines.push(`Original lines:  ${stats.originalLines}`);
  lines.push(`Converted lines: ${stats.convertedLines}`);
  lines.push(`Matching lines:  ${stats.matchingLines}`);
  lines.push(`Accuracy:        ${stats.accuracy.toFixed(1)}%`);
  lines.push('='.repeat(70));

  if (stats.differences.length > 0) {
    lines.push(`\nDifferences (${stats.differences.length}):\n`);

    for (const diff of stats.differences.slice(0, 10)) {
      lines.push(`Line ${diff.line}:`);
      lines.push(`  Original:  ${diff.original}`);
      lines.push(`  Converted: ${diff.converted}\n`);
    }

    if (stats.differences.length > 10) {
      lines.push(`... and ${stats.differences.length - 10} more differences`);
    }
  } else {
    lines.push('\n✅ Perfect match! 100% accuracy\n');
  }

  return lines.join('\n');
}

/**
 * Main demo function
 */
async function runDemo() {
  console.log('=== Bidirectional Sync Demo ===\n');

  // Initialize Notion client
  const token = process.env.NOTION_API_TOKEN;
  if (!token) {
    console.error('❌ NOTION_API_TOKEN not found in .env');
    console.error('   Please create .env with: NOTION_API_TOKEN=secret_...');
    process.exit(1);
  }

  const notion = new Client({ auth: token });
  const converter = new NotionToMarkdownConverter({ verbose: false });

  // Get page ID from command line or use default
  const pageId = process.argv[2] || process.env.NOTION_TEST_PAGE_ID;

  if (!pageId) {
    console.error('❌ No page ID provided');
    console.error('   Usage: node demo-bidirectional-sync.js <page_id>');
    console.error('   Or set NOTION_TEST_PAGE_ID in .env');
    process.exit(1);
  }

  console.log(`📄 Fetching page: ${pageId}\n`);

  try {
    // Fetch page metadata
    const page = await notion.pages.retrieve({ page_id: pageId });
    const title = page.properties?.title?.title?.[0]?.plain_text || 'Untitled';

    console.log(`📌 Page title: ${title}`);
    console.log(`📅 Last edited: ${page.last_edited_time}`);
    console.log(`👤 Last edited by: ${page.last_edited_by.id}\n`);

    // Fetch all blocks
    console.log('⬇️  Fetching blocks from Notion...');
    const startFetch = Date.now();
    const blocks = await fetchPageBlocks(notion, pageId);
    const fetchTime = Date.now() - startFetch;

    console.log(`✅ Fetched ${blocks.length} blocks in ${fetchTime}ms\n`);

    // Convert to markdown
    console.log('🔄 Converting Notion blocks → Markdown...');
    const startConvert = Date.now();
    const markdown = converter.blocksToMarkdown(blocks);
    const convertTime = Date.now() - startConvert;

    console.log(`✅ Converted in ${convertTime}ms\n`);

    // Get stats
    const stats = converter.getStats(markdown);

    console.log('📊 Markdown Statistics:');
    console.log(`   Characters:  ${stats.characters}`);
    console.log(`   Lines:       ${stats.lines}`);
    console.log(`   Words:       ${stats.words}`);
    console.log(`   Headings:    ${stats.headings}`);
    console.log(`   Images:      ${stats.images}`);
    console.log(`   Code blocks: ${stats.codeBlocks}`);
    console.log(`   Tables:      ${stats.tables}\n`);

    // Save converted markdown
    const outputFile = join(__dirname, `demo-output-${Date.now()}.md`);
    fs.writeFileSync(outputFile, markdown, 'utf-8');
    console.log(`💾 Saved markdown to: ${outputFile}\n`);

    // Display preview (first 500 chars)
    console.log('📝 Markdown Preview (first 500 chars):');
    console.log('─'.repeat(70));
    console.log(markdown.substring(0, 500));
    if (markdown.length > 500) {
      console.log('...\n(truncated)');
    }
    console.log('─'.repeat(70));

    // Round-trip test: Convert back to blocks
    console.log('\n🔄 Round-trip test: Markdown → Notion blocks...');
    const startRoundTrip = Date.now();
    const roundTripBlocks = markdownToNotionBlocks(markdown, 100);
    const roundTripTime = Date.now() - startRoundTrip;

    console.log(`✅ Converted back to ${roundTripBlocks.length} blocks in ${roundTripTime}ms`);

    // Compare block counts
    console.log('\n📊 Round-trip Comparison:');
    console.log(`   Original blocks:    ${blocks.length}`);
    console.log(`   Round-trip blocks:  ${roundTripBlocks.length}`);

    const blockAccuracy = (roundTripBlocks.length / blocks.length) * 100;
    console.log(`   Block count match:  ${blockAccuracy.toFixed(1)}%`);

    if (blockAccuracy >= 90) {
      console.log('   ✅ Excellent round-trip accuracy!\n');
    } else if (blockAccuracy >= 70) {
      console.log('   ⚠️  Acceptable round-trip accuracy\n');
    } else {
      console.log('   ❌ Poor round-trip accuracy (data loss detected)\n');
    }

    // Check for original markdown file to compare
    const originalMarkdownPath = join(__dirname, `${title}.md`);
    if (fs.existsSync(originalMarkdownPath)) {
      console.log(`📄 Found original markdown file: ${title}.md`);
      console.log('   Comparing original vs converted...\n');

      const originalMarkdown = fs.readFileSync(originalMarkdownPath, 'utf-8');
      const comparisonStats = compareMarkdown(originalMarkdown, markdown);

      console.log(formatComparisonReport(comparisonStats));
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('DEMO SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully converted ${blocks.length} Notion blocks to markdown`);
    console.log(`✅ Generated ${stats.lines} lines, ${stats.words} words`);
    console.log(`✅ Round-trip accuracy: ${blockAccuracy.toFixed(1)}%`);
    console.log(`⏱️  Total time: ${fetchTime + convertTime + roundTripTime}ms`);
    console.log('='.repeat(70));

    console.log('\n✅ Demo complete!\n');
  } catch (error) {
    console.error('\n❌ Demo failed:');
    console.error(`   ${error.message}\n`);

    if (error.code === 'object_not_found') {
      console.error('   Page not found. Check:');
      console.error('   1. Page ID is correct');
      console.error('   2. Bot has access to the page');
      console.error('   3. Page is not in trash\n');
    } else if (error.code === 'unauthorized') {
      console.error('   Unauthorized. Check:');
      console.error('   1. NOTION_API_TOKEN is valid');
      console.error('   2. Bot is added to the workspace\n');
    }

    process.exit(1);
  }
}

/**
 * Example usage instructions
 */
function printUsage() {
  console.log(`
Usage:
  node demo-bidirectional-sync.js <page_id>

Example:
  node demo-bidirectional-sync.js 29660b6e-8d18-8144-a36f-f8857827dc73

Environment:
  NOTION_API_TOKEN     - Your Notion integration token (required)
  NOTION_TEST_PAGE_ID  - Default page ID to use (optional)

What this demo does:
  1. Fetches a Notion page via API
  2. Converts all blocks to markdown
  3. Tests round-trip conversion (Markdown → Blocks)
  4. Compares with original markdown if available
  5. Reports conversion accuracy

Output:
  - Markdown preview in console
  - Full markdown saved to demo-output-<timestamp>.md
  - Statistics and accuracy report
`);
}

// Run demo if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  runDemo().catch(console.error);
}

export { runDemo, fetchPageBlocks, compareMarkdown };
