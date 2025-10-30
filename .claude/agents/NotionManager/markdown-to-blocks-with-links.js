#!/usr/bin/env node

/**
 * Markdown to Notion Blocks with Page Links
 * v3.5 - Async converter that resolves page links
 *
 * This is a wrapper around markdown-parser-enhanced.js that:
 * 1. Extracts page references from markdown
 * 2. Resolves them to Notion page IDs
 * 3. Converts markdown to blocks with page mentions
 */

import { markdownToNotionBlocks, parseRichTextWithPageLinks } from './markdown-parser-enhanced.js';
import { PageLinkResolver } from './page-link-resolver.js';
import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Convert markdown to Notion blocks with page link resolution
 *
 * @param {string} markdown - Markdown content with page links
 * @param {Object} options - Configuration options
 * @param {Client} options.notionClient - Notion client instance
 * @param {boolean} options.resolveLinks - Whether to resolve page links (default: true)
 * @param {number} options.maxBlocks - Maximum blocks to create (default: 100)
 * @returns {Promise<Array>} Array of Notion block objects
 */
export async function markdownToNotionBlocksWithLinks(markdown, options = {}) {
  const {
    notionClient = new Client({ auth: process.env.NOTION_API_TOKEN }),
    resolveLinks = true,
    maxBlocks = 100,
  } = options;

  // If not resolving links, use regular parser
  if (!resolveLinks) {
    return markdownToNotionBlocks(markdown, maxBlocks);
  }

  // Step 1: Extract all page references
  const resolver = new PageLinkResolver(notionClient);
  const pageReferences = resolver.extractPageReferences(markdown);

  console.log(`  Found ${pageReferences.length} page references:`, pageReferences);

  // Step 2: Resolve page references to IDs
  let pageMap = new Map();
  if (pageReferences.length > 0) {
    console.log(`  Resolving ${pageReferences.length} page references...`);
    pageMap = await resolver.resolveBatch(pageReferences);
    console.log(`  Resolved ${pageMap.size} of ${pageReferences.length} pages`);

    // Log which pages were found/not found
    pageReferences.forEach(ref => {
      if (pageMap.has(ref)) {
        const page = pageMap.get(ref);
        console.log(`    ✅ ${ref} → ${page.title}`);
      } else {
        console.log(`    ❌ ${ref} → Not found`);
      }
    });
  }

  // Step 3: Convert markdown to blocks with resolved page map
  // We need to modify markdownToNotionBlocks to accept pageMap
  // For now, let's create a custom version

  const lines = markdown.split('\n');
  const blocks = [];
  let i = 0;
  let blockCount = 0;

  while (i < lines.length && blockCount < maxBlocks) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // For now, handle paragraphs with page links
    // TODO: Extend to handle all block types
    if (line.trim().length > 0) {
      const richText = parseRichTextWithPageLinks(line, pageMap);

      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: richText,
        },
      });
      blockCount++;
    }

    i++;
  }

  return blocks;
}

/**
 * Test the converter
 */
async function testConverter() {
  console.log('=== Markdown to Blocks with Links Test ===\n');

  const testMarkdown = `
# Page Links Test

This document references @NotionManager and [[Athena]] agents.

For more information, see @Developer and [[Claude Code]].

You can also check out the [[Image Test]] page.
`;

  console.log('Test markdown:');
  console.log(testMarkdown);
  console.log();

  const blocks = await markdownToNotionBlocksWithLinks(testMarkdown);

  console.log('\nConverted blocks:');
  console.log(JSON.stringify(blocks, null, 2));

  console.log(`\n✅ Created ${blocks.length} blocks`);
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testConverter().catch(console.error);
}
