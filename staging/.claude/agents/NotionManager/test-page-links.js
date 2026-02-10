#!/usr/bin/env node

/**
 * Test Page Links - v3.5
 *
 * Tests internal page link resolution and syncing to Notion.
 * Supports @mentions and [[wiki-style]] links.
 */

import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import { markdownToNotionBlocks } from './markdown-parser-enhanced.js';
import { PageLinkResolver } from './page-link-resolver.js';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const WORKSPACE_ID = process.env.NOTION_CI_DASHBOARD_ID;

async function testPageLinks() {
  console.log('=== Page Links Test - v3.5 ===\n');

  // 1. Read test markdown
  console.log('1. Reading PAGE-LINKS-TEST.md...');
  const markdown = fs.readFileSync('./PAGE-LINKS-TEST.md', 'utf-8');
  console.log(`   ✅ Read ${markdown.length} characters\n`);

  // 2. Extract page references
  console.log('2. Extracting page references...');
  const resolver = new PageLinkResolver(notion);
  const pageReferences = resolver.extractPageReferences(markdown);
  console.log(`   ✅ Found ${pageReferences.length} page references:`);
  console.log(`      ${pageReferences.join(', ')}\n`);

  // 3. Resolve page references to IDs
  console.log('3. Resolving page references...');
  const pageMap = await resolver.resolveBatch(pageReferences);
  console.log(`   ✅ Resolved ${pageMap.size} of ${pageReferences.length} pages:`);

  // Show results
  pageReferences.forEach(ref => {
    if (pageMap.has(ref)) {
      const page = pageMap.get(ref);
      console.log(`      ✅ ${ref} → ${page.title}`);
    } else {
      console.log(`      ❌ ${ref} → Not found (will show as plain text)`);
    }
  });
  console.log();

  // 4. Parse markdown with page links
  console.log('4. Parsing markdown with page links...');
  const blocks = markdownToNotionBlocks(markdown, 100, pageMap);

  // Count block types and mentions
  const blockTypes = {};
  let mentionCount = 0;

  blocks.forEach(block => {
    blockTypes[block.type] = (blockTypes[block.type] || 0) + 1;

    // Count mentions in rich_text
    const richTextArrays = [
      block.heading_1?.rich_text,
      block.heading_2?.rich_text,
      block.heading_3?.rich_text,
      block.paragraph?.rich_text,
      block.bulleted_list_item?.rich_text,
      block.numbered_list_item?.rich_text,
      block.quote?.rich_text,
      block.callout?.rich_text,
      block.to_do?.rich_text,
    ].filter(Boolean);

    richTextArrays.forEach(richTextArray => {
      richTextArray.forEach(item => {
        if (item.type === 'mention' && item.mention?.type === 'page') {
          mentionCount++;
        }
      });
    });
  });

  console.log(`   ✅ Parsed ${blocks.length} blocks:`);
  Object.entries(blockTypes).forEach(([type, count]) => {
    console.log(`      - ${type}: ${count}`);
  });
  console.log(`   ✅ Created ${mentionCount} page mentions\n`);

  // 5. Create test page in Notion
  console.log('5. Creating test page in Notion...');

  try {
    const page = await notion.pages.create({
      parent: { page_id: WORKSPACE_ID },
      properties: {
        title: [
          {
            text: {
              content: `Page Links Test - v3.5 (${new Date().toLocaleString()})`,
            },
          },
        ],
      },
      children: blocks,
    });

    console.log(`   ✅ Created page with ${blocks.length} blocks\n`);

    // 6. Success summary
    console.log('✅ PAGE LINKS TEST COMPLETE!\n');
    console.log('📊 Results:');
    console.log(`   - Total blocks: ${blocks.length}`);
    console.log(`   - Page mentions: ${mentionCount}`);
    console.log(`   - Pages resolved: ${pageMap.size}/${pageReferences.length}`);
    console.log();
    console.log(`🔗 View page: https://www.notion.so/${page.id.replace(/-/g, '')}`);
    console.log();
    console.log('Next steps:');
    console.log('  1. Open the page in Notion');
    console.log('  2. Verify page mentions are blue and clickable');
    console.log('  3. Click mentions to navigate to linked pages');
    console.log('  4. Verify missing pages show as plain text');

  } catch (error) {
    console.error('❌ Error creating page:', error.message);
    if (error.body) {
      console.error('Error details:', JSON.stringify(error.body, null, 2));
    }
    process.exit(1);
  }
}

// Run test
testPageLinks();
