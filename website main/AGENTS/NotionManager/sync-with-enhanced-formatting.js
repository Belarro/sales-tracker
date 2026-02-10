/**
 * Sync Demo Page to Notion with Enhanced Formatting
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

console.log('=== Syncing with Enhanced Rich Text Formatting ===');
console.log('');

async function syncDemoPage() {
  const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
  const agentsDbId = process.env.NOTION_CI_AGENTS_DB_ID;

  if (!agentsDbId) {
    throw new Error('NOTION_CI_AGENTS_DB_ID not found in .env');
  }

  console.log('Reading FORMATTING-DEMO.md...');
  const demoPath = join(__dirname, 'FORMATTING-DEMO.md');
  const content = fs.readFileSync(demoPath, 'utf-8');

  console.log('Parsing with enhanced formatter...');
  console.log('  - Bold, italic, underline');
  console.log('  - Code and strikethrough');
  console.log('  - Links and colors');
  console.log('  - 18 color options total');
  console.log('');

  const blocks = markdownToNotionBlocks(content, 200);

  console.log('Creating Notion page with ' + blocks.length + ' blocks...');
  console.log('');

  const newPage = await notion.pages.create({
    parent: { database_id: agentsDbId },
    icon: { type: 'emoji', emoji: '🎨' },
    properties: {
      Name: {
        title: [{
          text: { content: 'Rich Text Formatting Demo - ' + new Date().toLocaleString() }
        }]
      },
      Status: { select: { name: 'Active' } },
      Type: { select: { name: 'Documentation' } },
      'Last Active': { date: { start: new Date().toISOString() } },
      Description: {
        rich_text: [{
          text: {
            content: 'Comprehensive demonstration of all Notion rich text formatting capabilities'
          }
        }],
      },
      Phase: { select: { name: 'Complete' } },
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

  console.log('Demo page created successfully!');
  console.log('');
  console.log('View here: ' + newPage.url);
  console.log('');
  console.log('Enhanced Formatting includes:');
  console.log('  * 5 basic text styles');
  console.log('  * 9 text colors');
  console.log('  * 9 background colors');
  console.log('  * Clickable links');
  console.log('  * Practical examples');
  console.log('');
  console.log('Total: 24 formatting capabilities demonstrated!');
  console.log('');

  return newPage;
}

syncDemoPage().catch(error => {
  console.log('');
  console.error('Sync failed: ' + error.message);
  process.exit(1);
});
