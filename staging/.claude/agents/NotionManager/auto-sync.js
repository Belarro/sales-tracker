#!/usr/bin/env node
/**
 * Automated Sync Workflow
 * Daily sync of all CI agents to Notion
 */

import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import path from 'path';
import { trackSession } from './track-session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

console.log('=== CI Auto-Sync Workflow ===\n');
console.log(`Started: ${new Date().toLocaleString()}\n`);

// Configuration
const AGENTS_DIR = path.join(__dirname, '..', '..');
const MAX_BLOCKS = 50; // Limit for performance
const RATE_LIMIT_DELAY = 1000; // 1s between operations

// Helper: Get all agents with MEMORY.md
function getActiveAgents() {
  const agentsPath = path.join(AGENTS_DIR, 'AGENTS');
  const items = fs.readdirSync(agentsPath);

  return items.filter(item => {
    const agentPath = path.join(agentsPath, item);
    const memoryPath = path.join(agentPath, 'MEMORY.md');
    return (
      fs.statSync(agentPath).isDirectory() &&
      !item.startsWith('_') &&
      !item.startsWith('.') &&
      fs.existsSync(memoryPath)
    );
  });
}

// Simplified markdown converter
function markdownToBlocks(markdown, maxBlocks = 50) {
  const lines = markdown.split('\n');
  const blocks = [];
  let blockCount = 0;

  for (let i = 0; i < lines.length && blockCount < maxBlocks; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const content = line.substring(0, 2000);

    if (line.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: { rich_text: [{ text: { content: content.replace('# ', '') } }] },
      });
      blockCount++;
    } else if (line.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ text: { content: content.replace('## ', '') } }] },
      });
      blockCount++;
    } else if (line.startsWith('- ')) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: [{ text: { content: content.replace('- ', '') } }] },
      });
      blockCount++;
    } else if (content.length > 0) {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ text: { content } }] },
      });
      blockCount++;
    }
  }

  return blocks;
}

async function syncWorkflow() {
  const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
  const agentsDbId = process.env.NOTION_CI_AGENTS_DB_ID;

  if (!agentsDbId) {
    throw new Error('NOTION_CI_AGENTS_DB_ID not found');
  }

  const startTime = Date.now();
  const stats = {
    totalAgents: 0,
    synced: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // 1. Discover agents
    console.log('1. Discovering agents...');
    const agents = getActiveAgents();
    stats.totalAgents = agents.length;
    console.log(`   Found ${agents.length} agents with MEMORY.md\n`);

    // 2. Sync each agent
    console.log('2. Syncing agents to Notion...\n');

    for (const agentName of agents) {
      try {
        const memoryPath = path.join(AGENTS_DIR, 'AGENTS', agentName, 'MEMORY.md');
        const content = fs.readFileSync(memoryPath, 'utf-8');
        const blocks = markdownToBlocks(content, MAX_BLOCKS);

        const timestamp = new Date().toLocaleString();

        console.log(`   [${stats.synced + stats.failed + stats.skipped + 1}/${agents.length}] ${agentName}...`);

        await notion.pages.create({
          parent: { database_id: agentsDbId },
          icon: { type: 'emoji', emoji: '🤖' },
          properties: {
            Name: { title: [{ text: { content: `${agentName} - ${timestamp}` } }] },
            Status: { select: { name: 'Active' } },
            Type: { select: { name: 'Specialist' } },
            'Last Active': { date: { start: new Date().toISOString() } },
          },
          children: blocks,
        });

        stats.synced++;
        console.log(`      ✓ Synced (${blocks.length} blocks)`);

        // Rate limiting
        await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY));

      } catch (error) {
        stats.failed++;
        stats.errors.push({ agent: agentName, error: error.message });
        console.log(`      ❌ Failed: ${error.message}`);
      }
    }

    console.log('\n3. Generating summary...\n');

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // 4. Track this sync as a session
    await trackSession({
      title: `Auto-Sync: ${agents.length} Agents`,
      agent: 'NotionManager',
      icon: '🔄',
      status: stats.failed > 0 ? 'Completed' : 'Completed',
      cost: 0,
      filesRead: stats.synced,
      filesModified: 0,
      findings: `Synced ${stats.synced}/${stats.totalAgents} agents successfully. ${stats.failed} failures.`,
      tags: ['auto-sync', 'scheduled', 'agent-memory'],
      details: `
## Sync Statistics

- Total Agents: ${stats.totalAgents}
- Successfully Synced: ${stats.synced}
- Failed: ${stats.failed}
- Skipped: ${stats.skipped}
- Duration: ${duration}s
- Blocks per Agent: ${MAX_BLOCKS} (limit)
- Rate Limit Delay: ${RATE_LIMIT_DELAY}ms

## Agents Synced

${agents.slice(0, 20).map(name => `- ${name}`).join('\n')}
${agents.length > 20 ? `\n... and ${agents.length - 20} more` : ''}

${stats.errors.length > 0 ? `
## Errors

${stats.errors.map(e => `- ${e.agent}: ${e.error}`).join('\n')}
` : ''}
`,
    });

    // 5. Summary
    console.log('=== Sync Complete ===\n');
    console.log(`✓ Synced: ${stats.synced}/${stats.totalAgents} agents`);
    console.log(`✗ Failed: ${stats.failed}`);
    console.log(`⏱  Duration: ${duration}s`);
    console.log(`💰 Cost: $0 (Notion API is free)`);
    console.log();
    console.log('View agents:');
    console.log(`https://www.notion.so/${agentsDbId.replace(/-/g, '')}`);
    console.log();

    return stats;

  } catch (error) {
    console.error('\n❌ Workflow failed:', error.message);
    throw error;
  }
}

// Run
syncWorkflow()
  .then(stats => {
    console.log('Workflow completed successfully!');
    process.exit(stats.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Workflow failed:', error.message);
    process.exit(1);
  });
