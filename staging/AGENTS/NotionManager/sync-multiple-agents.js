/**
 * Sync Multiple Agents to Notion (Fast Version)
 * Creates new pages instead of updating to avoid slow deletion
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

console.log('=== Syncing Multiple Agents to Notion ===\n');

const agentsToSync = [
  'Athena',
  'Developer',
  'Researcher',
  'Analyst',
  'Architect',
  'NotionManager'
];

// Simplified markdown converter (first 50 blocks only for speed)
function markdownToBlocks(markdown, maxBlocks = 50) {
  const lines = markdown.split('\n');
  const blocks = [];
  let i = 0;
  let blockCount = 0;

  while (i < lines.length && blockCount < maxBlocks) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    if (line.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [{ text: { content: line.replace('# ', '').trim().substring(0, 2000) } }],
        },
      });
      blockCount++;
    } else if (line.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: line.replace('## ', '').trim().substring(0, 2000) } }],
        },
      });
      blockCount++;
    } else if (line.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{ text: { content: line.replace('### ', '').trim().substring(0, 2000) } }],
        },
      });
      blockCount++;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ text: { content: line.replace(/^[-*] /, '').trim().substring(0, 2000) } }],
        },
      });
      blockCount++;
    } else if (line.match(/^- \[([ x])\] /)) {
      const checked = line.includes('[x]');
      blocks.push({
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [{ text: { content: line.replace(/^- \[.\] /, '').trim().substring(0, 2000) } }],
          checked,
        },
      });
      blockCount++;
    } else if (line.startsWith('```')) {
      // Skip code blocks for speed
      while (i < lines.length && !lines[i].startsWith('```')) {
        i++;
      }
    } else if (line.trim().length > 0) {
      const content = line.substring(0, 2000);
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content } }],
        },
      });
      blockCount++;
    }

    i++;
  }

  return blocks;
}

function extractAgentInfo(content) {
  const nameMatch = content.match(/##?\s*Agent Identity.*?Name[:\s]+([^\n]+)/is);
  const roleMatch = content.match(/Role[:\s]+([^\n]+)/i);
  const phaseMatch = content.match(/Phase[:\s]+([^\n]+)/i);

  return {
    name: nameMatch ? nameMatch[1].trim().replace(/[*_]/g, '') : 'Unknown',
    role: roleMatch ? roleMatch[1].trim().substring(0, 2000) : 'Agent',
    phase: phaseMatch ? phaseMatch[1].trim() : 'Active',
  };
}

async function syncAgent(notion, agentsDbId, agentName) {
  try {
    const memoryPath = path.join(__dirname, '..', '..', 'AGENTS', agentName, 'MEMORY.md');

    if (!fs.existsSync(memoryPath)) {
      console.log(`  ⚠️  No MEMORY.md found for ${agentName}`);
      return null;
    }

    const content = fs.readFileSync(memoryPath, 'utf-8');
    const info = extractAgentInfo(content);
    const blocks = markdownToBlocks(content, 50); // Limit to 50 blocks for speed

    console.log(`  Creating page for ${info.name}...`);

    // Create new page (don't update existing)
    const newPage = await notion.pages.create({
      parent: { database_id: agentsDbId },
      icon: { type: 'emoji', emoji: '🤖' },
      properties: {
        Name: { title: [{ text: { content: `${info.name} - ${new Date().toLocaleString()}` } }] },
        Status: { select: { name: 'Active' } },
        Type: { select: { name: 'Specialist' } },
        'Last Active': { date: { start: new Date().toISOString() } },
        Description: {
          rich_text: [{ text: { content: info.role } }],
        },
        Phase: { select: { name: info.phase } },
      },
      children: blocks,
    });

    console.log(`  ✓ ${info.name} synced (${blocks.length} blocks)`);
    return newPage;
  } catch (error) {
    console.error(`  ❌ ${agentName} failed:`, error.message);
    return null;
  }
}

async function main() {
  const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
  const agentsDbId = process.env.NOTION_CI_AGENTS_DB_ID;

  if (!agentsDbId) {
    throw new Error('NOTION_CI_AGENTS_DB_ID not found');
  }

  console.log(`Target Database: ${agentsDbId}`);
  console.log(`Agents to sync: ${agentsToSync.length}\n`);

  let successCount = 0;

  for (const agentName of agentsToSync) {
    console.log(`[${successCount + 1}/${agentsToSync.length}] ${agentName}`);
    const result = await syncAgent(notion, agentsDbId, agentName);
    if (result) {
      successCount++;
    }
    // Small delay between agents
    await new Promise(r => setTimeout(r, 1000));
    console.log();
  }

  console.log('=== Sync Complete ===');
  console.log(`✓ ${successCount}/${agentsToSync.length} agents synced successfully`);
  console.log();
  console.log('View in Notion:');
  console.log(`https://www.notion.so/${agentsDbId.replace(/-/g, '')}`);
}

main().catch(error => {
  console.error('Sync failed:', error.message);
  process.exit(1);
});
