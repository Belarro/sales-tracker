/**
 * Sync Complete Formatting Test to Notion
 * Tests all fixed features: checklists, dividers, tables, mermaid
 */

import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { markdownToNotionBlocks } from './markdown-parser-enhanced.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

console.log('=== Syncing Complete Formatting Test (v2.1) ===');
console.log('');

async function syncCompleteTest() {
  const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
  const agentsDbId = process.env.NOTION_CI_AGENTS_DB_ID;

  if (!agentsDbId) {
    throw new Error('NOTION_CI_AGENTS_DB_ID not found in .env');
  }

  console.log('Reading COMPLETE-FORMATTING-TEST.md...');
  const testPath = join(__dirname, 'COMPLETE-FORMATTING-TEST.md');
  const content = fs.readFileSync(testPath, 'utf-8');

  console.log('Parsing with FIXED enhanced formatter...');
  console.log('  - Checklists: - [ ] and - [x] -> to_do blocks');
  console.log('  - Dividers: --- and *** -> divider blocks');
  console.log('  - Tables: | ... | -> NATIVE Notion table blocks with rich text');
  console.log('  - Mermaid: ```mermaid -> mermaid code blocks');
  console.log('');

  const blocks = markdownToNotionBlocks(content, 250);

  console.log('Creating Notion page with ' + blocks.length + ' blocks...');
  console.log('');

  // Count block types
  const blockTypes = {};
  blocks.forEach(b => {
    blockTypes[b.type] = (blockTypes[b.type] || 0) + 1;
  });

  console.log('Block type summary:');
  Object.entries(blockTypes).forEach(([type, count]) => {
    console.log('  ' + type + ': ' + count);
  });
  console.log('');

  const newPage = await notion.pages.create({
    parent: { database_id: agentsDbId },
    icon: { type: 'emoji', emoji: '🧪' },
    properties: {
      Name: {
        title: [{
          text: { content: 'Complete Formatting Test v2.1 - ' + new Date().toLocaleString() }
        }]
      },
      Status: { select: { name: 'Active' } },
      Type: { select: { name: 'Testing' } },
      'Last Active': { date: { start: new Date().toISOString() } },
      Description: {
        rich_text: [{
          text: {
            content: 'Tests checklists, dividers, tables, and mermaid diagrams - all fixed in v2.1'
          }
        }],
      },
      Phase: { select: { name: 'Testing' } },
    },
    children: blocks.slice(0, 100),
  });

  if (blocks.length > 100) {
    console.log('Adding remaining ' + (blocks.length - 100) + ' blocks...');
    console.log('');
    for (let i = 100; i < blocks.length; i += 50) {
      const batch = blocks.slice(i, i + 50);
      await notion.blocks.children.append({
        block_id: newPage.id,
        children: batch,
      });
      await new Promise(r => setTimeout(r, 600));
    }
  }

  console.log('Test page created successfully!');
  console.log('');
  console.log('View here: ' + newPage.url);
  console.log('');
  console.log('Verify in Notion:');
  console.log('  1. Checklists should be actual to-do blocks (not bullets)');
  console.log('  2. Dividers (--- and ***) should be horizontal lines');
  console.log('  3. Tables should be NATIVE Notion tables with colors rendering');
  console.log('  4. Mermaid diagrams should render visually');
  console.log('');
  console.log('Version 2.2 - Native Table Support');
  console.log('');

  return newPage;
}

syncCompleteTest().catch(error => {
  console.log('');
  console.error('Sync failed: ' + error.message);
  if (error.body) {
    console.error('Details:', JSON.stringify(error.body, null, 2));
  }
  process.exit(1);
});
