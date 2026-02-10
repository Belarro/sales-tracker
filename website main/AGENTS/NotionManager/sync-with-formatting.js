/**
 * Sync Agents to Notion with Enhanced Rich Text Formatting
 * Uses enhanced markdown parser with 36 formatting capabilities
 */

import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import path from 'path';
import { markdownToNotionBlocks } from './markdown-parser-enhanced.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

console.log('=== Syncing with Rich Text Formatting ===\n');

const agentsToSync = process.argv.slice(2);

if (agentsToSync.length === 0) {
  console.log('Usage: node sync-with-formatting.js <AgentName1> [AgentName2] ...');
  console.log('\nExample: node sync-with-formatting.js Optimizer Developer Athena');
  console.log('\nThis will create properly formatted pages with:');
  console.log('  ✓ Bold text (**text**)');
  console.log('  ✓ Italic text (*text*)');
  console.log('  ✓ Code text (`code`)');
  console.log('  ✓ Proper headings (###)');
  console.log('  ✓ Lists and checkboxes');
  process.exit(1);
}

function extractAgentInfo(content) {
  const nameMatch = content.match(/##?\s*Agent Identity.*?Name[:\s]+([^\n]+)/is);
  const roleMatch = content.match(/Role[:\s]+([^\n]+)/i);
  const phaseMatch = content.match(/Phase[:\s]+([^\n]+)/i);

  // Truncate and clean phase to avoid validation errors
  let phase = phaseMatch ? phaseMatch[1].trim() : 'Active';
  // Remove commas and truncate to 100 chars (Notion select limit)
  phase = phase.replace(/,/g, ' -').substring(0, 100);

  return {
    name: nameMatch ? nameMatch[1].trim().replace(/[*_]/g, '') : 'Unknown',
    role: roleMatch ? roleMatch[1].trim().substring(0, 2000) : 'Agent',
    phase,
  };
}

async function syncAgent(notion, agentsDbId, agentName) {
  try {
    const memoryPath = path.join(__dirname, '..', '..', 'AGENTS', agentName, 'MEMORY.md');

    if (!fs.existsSync(memoryPath)) {
      console.log(`  ⚠️  No MEMORY.md found for ${agentName}`);
      return null;
    }

    console.log(`[${agentName}]`);
    console.log('  Reading MEMORY.md...');
    const content = fs.readFileSync(memoryPath, 'utf-8');
    const info = extractAgentInfo(content);

    console.log(`  Parsing markdown with rich text formatting...`);
    const blocks = markdownToNotionBlocks(content, 100); // More blocks since we have proper formatting

    console.log(`  Creating Notion page (${blocks.length} blocks)...`);

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
      children: blocks.slice(0, 100), // First 100 blocks
    });

    // Add remaining blocks if needed
    if (blocks.length > 100) {
      console.log(`  Adding remaining ${blocks.length - 100} blocks...`);
      for (let i = 100; i < blocks.length; i += 50) {
        const batch = blocks.slice(i, i + 50);
        await notion.blocks.children.append({
          block_id: newPage.id,
          children: batch,
        });
        await new Promise(r => setTimeout(r, 600)); // Rate limiting
      }
    }

    console.log(`  ✅ ${info.name} synced successfully`);
    console.log(`  📄 ${newPage.url}\n`);

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
    const result = await syncAgent(notion, agentsDbId, agentName);
    if (result) {
      successCount++;
    }
    // Delay between agents
    if (agentsToSync.indexOf(agentName) < agentsToSync.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log('=== Sync Complete ===');
  console.log(`✓ ${successCount}/${agentsToSync.length} agents synced with rich formatting`);
  console.log('\nFormatting applied:');
  console.log('  ✓ **Bold text** → Bold');
  console.log('  ✓ *Italic text* → Italic');
  console.log('  ✓ `Code text` → Code');
  console.log('  ✓ ### Headings → Proper headings');
  console.log('  ✓ Lists and checkboxes → Formatted');
  console.log();
  console.log('View in Notion:');
  console.log(`https://www.notion.so/${agentsDbId.replace(/-/g, '')}`);
}

main().catch(error => {
  console.error('\nSync failed:', error.message);
  process.exit(1);
});
