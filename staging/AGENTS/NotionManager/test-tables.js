/**
 * Test native Notion table blocks with rich text formatting
 */

import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { markdownToNotionBlocks } from './markdown-parser-enhanced.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

console.log('=== Testing Native Notion Tables ===');
console.log('');

const tableMarkdown = `
# Table Test with Rich Text

Simple table with colors:

| Name | Status | Priority |
|------|--------|----------|
| Task 1 | <green>Complete</green> | High |
| Task 2 | <yellow>In Progress</yellow> | Medium |
| Task 3 | <red>Blocked</red> | Low |

Table with all formatting:

| Format | Example | Works |
|--------|---------|-------|
| **Bold** | **text** | Yes |
| *Italic* | *text* | Yes |
| \`Code\` | \`code\` | Yes |
| <red>Red</red> | colored | Yes |
| __Underline__ | underlined | Yes |

Done!
`;

async function testTables() {
  const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
  const agentsDbId = process.env.NOTION_CI_AGENTS_DB_ID;

  console.log('Parsing markdown...');
  const blocks = markdownToNotionBlocks(tableMarkdown, 50);

  console.log('Blocks created:', blocks.length);
  blocks.forEach((block, i) => {
    console.log(`  ${i}: ${block.type}`);
    if (block.type === 'table') {
      console.log(`     table_width=${block.table.table_width}, rows=${block.table.children.length}`);
      // Show first row cells
      if (block.table.children.length > 0) {
        const firstRow = block.table.children[0];
        console.log(`     first row cells=${firstRow.table_row.cells.length}`);
      }
    }
  });
  console.log('');

  console.log('Creating test page in Notion...');
  const page = await notion.pages.create({
    parent: { database_id: agentsDbId },
    icon: { type: 'emoji', emoji: '📊' },
    properties: {
      Name: {
        title: [{ text: { content: 'Table Test - Native Tables - ' + new Date().toLocaleTimeString() } }]
      },
      Status: { select: { name: 'Active' } },
      Type: { select: { name: 'Testing' } },
      'Last Active': { date: { start: new Date().toISOString() } },
      Description: {
        rich_text: [{ text: { content: 'Testing native Notion table blocks with rich text formatting' } }],
      },
      Phase: { select: { name: 'Testing' } },
    },
    children: blocks,
  });

  console.log('Success!');
  console.log('');
  console.log('View here:', page.url);
  console.log('');
  console.log('Verify in Notion:');
  console.log('  1. Tables should be native Notion tables (not code blocks)');
  console.log('  2. Colors should render correctly (green, yellow, red)');
  console.log('  3. Bold, italic, code formatting should work in cells');
  console.log('  4. First row should be header style');
  console.log('');
}

testTables().catch(error => {
  console.error('Test failed:', error.message);
  if (error.body) {
    console.error('Details:', JSON.stringify(error.body, null, 2));
  }
  process.exit(1);
});
