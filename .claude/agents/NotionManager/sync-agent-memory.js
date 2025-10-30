/**
 * Sync Agent MEMORY.md to Notion
 * Reads agent memory files and creates/updates Notion pages
 */

import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

console.log('=== Syncing Agent Memory to Notion ===\n');

// Helper: Convert markdown to Notion blocks (simplified)
function markdownToBlocks(markdown) {
  const lines = markdown.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Heading 1
    if (line.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [{ text: { content: line.replace('# ', '').trim() } }],
        },
      });
    }
    // Heading 2
    else if (line.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: line.replace('## ', '').trim() } }],
        },
      });
    }
    // Heading 3
    else if (line.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{ text: { content: line.replace('### ', '').trim() } }],
        },
      });
    }
    // Bullet list
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [
            { text: { content: line.replace(/^[-*] /, '').trim() } },
          ],
        },
      });
    }
    // Checkbox
    else if (line.match(/^- \[([ x])\] /)) {
      const checked = line.includes('[x]');
      blocks.push({
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [
            { text: { content: line.replace(/^- \[.\] /, '').trim() } },
          ],
          checked,
        },
      });
    }
    // Code block
    else if (line.startsWith('```')) {
      const language = line.replace('```', '').trim() || 'plain text';
      let code = '';
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        code += lines[i] + '\n';
        i++;
      }
      blocks.push({
        object: 'block',
        type: 'code',
        code: {
          rich_text: [{ text: { content: code.trim() } }],
          language: language === 'bash' ? 'shell' : language,
        },
      });
    }
    // Paragraph
    else {
      // Truncate long lines
      const content = line.length > 2000 ? line.substring(0, 1997) + '...' : line;
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content } }],
        },
      });
    }

    i++;
  }

  return blocks;
}

// Extract agent name from memory file
function extractAgentInfo(content) {
  const nameMatch = content.match(/##?\s*Agent Identity.*?Name[:\s]+([^\n]+)/is);
  const roleMatch = content.match(/Role[:\s]+([^\n]+)/i);
  const phaseMatch = content.match(/Phase[:\s]+([^\n]+)/i);

  return {
    name: nameMatch ? nameMatch[1].trim().replace(/[*_]/g, '') : 'Unknown',
    role: roleMatch ? roleMatch[1].trim() : 'Agent',
    phase: phaseMatch ? phaseMatch[1].trim() : 'Active',
  };
}

async function syncAgentMemory(agentName) {
  const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
  const agentsDbId = process.env.NOTION_CI_AGENTS_DB_ID;

  if (!agentsDbId) {
    throw new Error('NOTION_CI_AGENTS_DB_ID not found. Run setup-ci-databases.js first.');
  }

  try {
    // Read MEMORY.md file
    const memoryPath = path.join(
      __dirname,
      '..',
      '..',
      'AGENTS',
      agentName,
      'MEMORY.md'
    );

    if (!fs.existsSync(memoryPath)) {
      throw new Error(`MEMORY.md not found for ${agentName}`);
    }

    console.log(`Reading: ${memoryPath}`);
    const content = fs.readFileSync(memoryPath, 'utf-8');
    const info = extractAgentInfo(content);

    console.log(`Agent: ${info.name}`);
    console.log(`Role: ${info.role}`);
    console.log(`Phase: ${info.phase}\n`);

    // Check if page already exists
    console.log('Checking for existing page...');
    const existing = await notion.databases.query({
      database_id: agentsDbId,
      filter: {
        property: 'Name',
        title: {
          equals: info.name,
        },
      },
    });

    let pageId;

    if (existing.results.length > 0) {
      // Update existing page
      pageId = existing.results[0].id;
      console.log('✓ Found existing page, updating...\n');

      await notion.pages.update({
        page_id: pageId,
        properties: {
          Status: { select: { name: 'Active' } },
          'Last Active': { date: { start: new Date().toISOString() } },
        },
      });
    } else {
      // Create new page
      console.log('✗ No existing page, creating new...\n');

      const newPage = await notion.pages.create({
        parent: { database_id: agentsDbId },
        icon: { type: 'emoji', emoji: '🤖' },
        properties: {
          Name: { title: [{ text: { content: info.name } }] },
          Status: { select: { name: 'Active' } },
          Type: { select: { name: 'Specialist' } },
          'Last Active': { date: { start: new Date().toISOString() } },
          Description: {
            rich_text: [{ text: { content: info.role } }],
          },
          Phase: { select: { name: info.phase } },
        },
      });

      pageId = newPage.id;
    }

    // Convert markdown to blocks
    console.log('Converting MEMORY.md to Notion blocks...');
    const blocks = markdownToBlocks(content);

    console.log(`Generated ${blocks.length} blocks\n`);

    // Delete existing children (to replace with fresh content)
    console.log('Clearing old content...');
    const existingBlocks = await notion.blocks.children.list({
      block_id: pageId,
    });

    for (const block of existingBlocks.results) {
      await notion.blocks.delete({ block_id: block.id });
      await new Promise((r) => setTimeout(r, 100)); // Small delay
    }

    // Add new content in batches
    console.log('Adding new content...');
    const batchSize = 100;

    for (let i = 0; i < blocks.length; i += batchSize) {
      const batch = blocks.slice(i, i + batchSize);
      await notion.blocks.children.append({
        block_id: pageId,
        children: batch,
      });
      console.log(`  Added blocks ${i + 1}-${Math.min(i + batch.length, blocks.length)}`);
      await new Promise((r) => setTimeout(r, 600)); // Rate limiting
    }

    console.log('\n✅ Sync complete!\n');

    // Get final page
    const finalPage = await notion.pages.retrieve({ page_id: pageId });
    console.log(`View in Notion: ${finalPage.url}\n`);

    return finalPage;
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    if (error.code) {
      console.error(`Code: ${error.code}`);
    }
    throw error;
  }
}

// Main
const agentName = process.argv[2] || 'ClaudeCodeIntegrator';

console.log(`Target Agent: ${agentName}\n`);

syncAgentMemory(agentName)
  .then(() => {
    console.log('=== Sync Complete ===');
  })
  .catch((error) => {
    console.error('Sync failed:', error.message);
    process.exit(1);
  });
