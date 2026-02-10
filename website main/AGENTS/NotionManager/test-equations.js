#!/usr/bin/env node

/**
 * Test Math Equations - v3.5
 *
 * Tests inline and block equation support with KaTeX/LaTeX syntax.
 */

import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import { markdownToNotionBlocks } from './markdown-parser-enhanced.js';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const WORKSPACE_ID = process.env.NOTION_CI_DASHBOARD_ID;

async function testEquations() {
  console.log('=== Math Equations Test - v3.5 ===\n');

  // 1. Read test markdown
  console.log('1. Reading MATH-EQUATIONS-TEST.md...');
  const markdown = fs.readFileSync('./MATH-EQUATIONS-TEST.md', 'utf-8');
  console.log(`   ✅ Read ${markdown.length} characters\n`);

  // 2. Parse markdown
  console.log('2. Parsing markdown with equations...');
  const blocks = markdownToNotionBlocks(markdown);

  // Count block types and equations
  const blockTypes = {};
  let inlineEquationCount = 0;
  let blockEquationCount = 0;

  blocks.forEach(block => {
    blockTypes[block.type] = (blockTypes[block.type] || 0) + 1;

    if (block.type === 'equation') {
      blockEquationCount++;
    }

    // Count inline equations in rich_text
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
        if (item.type === 'equation') {
          inlineEquationCount++;
        }
      });
    });
  });

  console.log(`   ✅ Parsed ${blocks.length} blocks:`);
  Object.entries(blockTypes).forEach(([type, count]) => {
    console.log(`      - ${type}: ${count}`);
  });
  console.log(`   ✅ Inline equations: ${inlineEquationCount}`);
  console.log(`   ✅ Block equations: ${blockEquationCount}\n`);

  // 3. Show some example equations
  console.log('3. Sample equations detected:');
  let samplesShown = 0;
  blocks.forEach(block => {
    if (samplesShown >= 5) return;

    if (block.type === 'equation') {
      console.log(`   Block: ${block.equation.expression.substring(0, 50)}...`);
      samplesShown++;
    }

    const richTextArrays = [
      block.paragraph?.rich_text,
      block.bulleted_list_item?.rich_text,
    ].filter(Boolean);

    richTextArrays.forEach(richTextArray => {
      richTextArray.forEach(item => {
        if (item.type === 'equation' && samplesShown < 5) {
          console.log(`   Inline: ${item.equation.expression}`);
          samplesShown++;
        }
      });
    });
  });
  console.log();

  // 4. Create test page in Notion
  console.log('4. Creating test page in Notion...');

  try {
    const page = await notion.pages.create({
      parent: { page_id: WORKSPACE_ID },
      properties: {
        title: [
          {
            text: {
              content: `Math Equations Test - v3.5 (${new Date().toLocaleString()})`,
            },
          },
        ],
      },
      children: blocks,
    });

    console.log(`   ✅ Created page with ${blocks.length} blocks\n`);

    // 5. Success summary
    console.log('✅ MATH EQUATIONS TEST COMPLETE!\n');
    console.log('📊 Results:');
    console.log(`   - Total blocks: ${blocks.length}`);
    console.log(`   - Inline equations: ${inlineEquationCount}`);
    console.log(`   - Block equations: ${blockEquationCount}`);
    console.log(`   - Total equations: ${inlineEquationCount + blockEquationCount}`);
    console.log();
    console.log(`🔗 View page: https://www.notion.so/${page.id.replace(/-/g, '')}`);
    console.log();
    console.log('Next steps:');
    console.log('  1. Open the page in Notion');
    console.log('  2. Verify inline equations render within text');
    console.log('  3. Verify block equations render centered');
    console.log('  4. Check complex equations (matrices, integrals, etc.)');
    console.log('  5. Verify LaTeX/KaTeX syntax is correct');

  } catch (error) {
    console.error('❌ Error creating page:', error.message);
    if (error.body) {
      console.error('Error details:', JSON.stringify(error.body, null, 2));
    }
    process.exit(1);
  }
}

// Run test
testEquations();
