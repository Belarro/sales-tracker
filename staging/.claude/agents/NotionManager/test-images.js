#!/usr/bin/env node

/**
 * Test Image Support - v3.0
 *
 * This script tests the new image block functionality by:
 * 1. Reading IMAGE-TEST.md
 * 2. Parsing with enhanced formatter (including images)
 * 3. Creating a test page in Notion
 * 4. Verifying image blocks are created correctly
 */

import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import { markdownToNotionBlocks } from './markdown-parser-enhanced.js';

// Load environment variables
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const WORKSPACE_ID = process.env.NOTION_CI_DASHBOARD_ID;

async function testImageSupport() {
  console.log('=== Image Support Test - v3.0 ===\n');

  // 1. Read test markdown file
  console.log('1. Reading IMAGE-TEST.md...');
  const markdown = fs.readFileSync('./IMAGE-TEST.md', 'utf-8');
  console.log(`   ✅ Read ${markdown.length} characters\n`);

  // 2. Parse with enhanced formatter
  console.log('2. Parsing with enhanced formatter (v3.0)...');
  const blocks = markdownToNotionBlocks(markdown);

  // Count block types
  const blockTypes = {};
  blocks.forEach(block => {
    blockTypes[block.type] = (blockTypes[block.type] || 0) + 1;
  });

  console.log(`   ✅ Parsed ${blocks.length} total blocks:`);
  Object.entries(blockTypes).forEach(([type, count]) => {
    console.log(`      - ${type}: ${count}`);
  });
  console.log();

  // 3. Analyze image blocks
  const imageBlocks = blocks.filter(b => b.type === 'image');
  console.log(`3. Image blocks analysis:`);
  console.log(`   ✅ Found ${imageBlocks.length} image blocks`);

  let withCaption = 0;
  let withoutCaption = 0;

  imageBlocks.forEach((block, index) => {
    const url = block.image.external.url;
    const caption = block.image.caption;

    if (caption && caption.length > 0) {
      withCaption++;
      console.log(`   ${index + 1}. Image with caption: ${url.substring(0, 50)}...`);
      console.log(`      Caption: ${caption[0].text.content.substring(0, 50)}...`);
    } else {
      withoutCaption++;
      console.log(`   ${index + 1}. Image without caption: ${url.substring(0, 50)}...`);
    }
  });

  console.log(`\n   Summary: ${withCaption} with captions, ${withoutCaption} without\n`);

  // 4. Create test page in Notion
  console.log('4. Creating test page in Notion...');

  try {
    // Create page with batched blocks (100 at a time)
    const batchSize = 100;
    let page;

    for (let i = 0; i < blocks.length; i += batchSize) {
      const batch = blocks.slice(i, i + batchSize);

      if (i === 0) {
        // Create page with first batch
        page = await notion.pages.create({
          parent: { page_id: WORKSPACE_ID },
          properties: {
            title: [
              {
                text: {
                  content: `Image Test - v3.0 (${new Date().toLocaleString()})`,
                },
              },
            ],
          },
          children: batch,
        });
        console.log(`   ✅ Created page with ${batch.length} blocks`);
      } else {
        // Append remaining batches
        await notion.blocks.children.append({
          block_id: page.id,
          children: batch,
        });
        console.log(`   ✅ Appended ${batch.length} blocks (${i + batch.length}/${blocks.length} total)`);
      }

      // Rate limit: wait 600ms between batches
      if (i + batchSize < blocks.length) {
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }

    // 5. Success!
    console.log('\n✅ IMAGE SUPPORT TEST COMPLETE!\n');
    console.log('📊 Results:');
    console.log(`   - Total blocks: ${blocks.length}`);
    console.log(`   - Image blocks: ${imageBlocks.length}`);
    console.log(`   - With captions: ${withCaption}`);
    console.log(`   - Without captions: ${withoutCaption}`);
    console.log(`   - Other blocks: ${blocks.length - imageBlocks.length}`);
    console.log();
    console.log(`🔗 View page: https://www.notion.so/${page.id.replace(/-/g, '')}`);
    console.log();
    console.log('Next: Check Notion to verify images render correctly!');

  } catch (error) {
    console.error('❌ Error creating page:', error.message);
    if (error.body) {
      console.error('Error details:', JSON.stringify(error.body, null, 2));
    }
    process.exit(1);
  }
}

// Run test
testImageSupport();
