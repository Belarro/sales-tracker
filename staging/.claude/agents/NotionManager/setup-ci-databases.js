/**
 * Set up CollaborativeIntelligence Notion Workspace
 * Creates databases and dashboard for CI project
 */

import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

console.log('=== Setting Up CI Notion Workspace ===\n');

async function setupCIWorkspace() {
  const notion = new Client({ auth: process.env.NOTION_API_TOKEN });

  try {
    // Find parent page
    console.log('1. Finding workspace parent page...');
    const searchResults = await notion.search({ page_size: 5 });
    const parentPage = searchResults.results.find((r) => r.object === 'page');

    if (!parentPage) {
      throw new Error('No parent page found. Create and share a page first.');
    }
    console.log(`   ✓ Using: ${parentPage.id}\n`);

    // Create main CI container page
    console.log('2. Creating CI Dashboard page...');
    const dashboardPage = await notion.pages.create({
      parent: { page_id: parentPage.id },
      icon: { type: 'emoji', emoji: '🤖' },
      properties: {
        title: {
          title: [{ text: { content: 'CollaborativeIntelligence Dashboard' } }],
        },
      },
      children: [
        {
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [
              { text: { content: 'CollaborativeIntelligence Project' } },
            ],
          },
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                text: {
                  content:
                    'Real-time dashboard for the CollaborativeIntelligence agent ecosystem.',
                },
              },
            ],
          },
        },
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: 'Project Status' } }],
          },
        },
        {
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [{ text: { content: 'NotionManager agent deployed' } }],
            checked: true,
          },
        },
        {
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [
              { text: { content: 'Agent memory sync operational' } },
            ],
            checked: false,
          },
        },
        {
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [{ text: { content: 'Session tracking active' } }],
            checked: false,
          },
        },
      ],
    });

    console.log(`   ✓ Dashboard created: ${dashboardPage.url}\n`);

    // Create CI Agents Database
    console.log('3. Creating CI Agents database...');
    const agentsDb = await notion.databases.create({
      parent: { page_id: dashboardPage.id },
      icon: { type: 'emoji', emoji: '🤖' },
      title: [{ text: { content: 'CI Agents' } }],
      properties: {
        Name: { title: {} },
        Status: {
          select: {
            options: [
              { name: 'Active', color: 'green' },
              { name: 'Idle', color: 'gray' },
              { name: 'In Progress', color: 'blue' },
              { name: 'Error', color: 'red' },
            ],
          },
        },
        Type: {
          select: {
            options: [
              { name: 'Core', color: 'blue' },
              { name: 'Specialist', color: 'purple' },
              { name: 'Temporary', color: 'gray' },
            ],
          },
        },
        'Last Active': { date: {} },
        'Total Sessions': { number: {} },
        'Total Cost': { number: { format: 'dollar' } },
        Description: { rich_text: {} },
        Phase: { select: {} },
      },
    });

    console.log(`   ✓ Agents DB created: ${agentsDb.url}\n`);

    // Create CI Sessions Database
    console.log('4. Creating CI Sessions database...');
    const sessionsDb = await notion.databases.create({
      parent: { page_id: dashboardPage.id },
      icon: { type: 'emoji', emoji: '📝' },
      title: [{ text: { content: 'CI Sessions' } }],
      properties: {
        Title: { title: {} },
        Agent: {
          select: {
            options: [
              { name: 'ClaudeCodeIntegrator', color: 'blue' },
              { name: 'NotionManager', color: 'green' },
              { name: 'Athena', color: 'purple' },
              { name: 'Developer', color: 'orange' },
              { name: 'Other', color: 'gray' },
            ],
          },
        },
        Date: { date: {} },
        Status: {
          select: {
            options: [
              { name: 'Completed', color: 'green' },
              { name: 'In Progress', color: 'blue' },
              { name: 'Blocked', color: 'red' },
            ],
          },
        },
        'Cost ($)': { number: { format: 'dollar' } },
        'Files Read': { number: {} },
        'Files Modified': { number: {} },
        Findings: { rich_text: {} },
        Tags: { multi_select: {} },
      },
    });

    console.log(`   ✓ Sessions DB created: ${sessionsDb.url}\n`);

    // Create CI Files Database
    console.log('5. Creating CI Files database...');
    const filesDb = await notion.databases.create({
      parent: { page_id: dashboardPage.id },
      icon: { type: 'emoji', emoji: '📁' },
      title: [{ text: { content: 'CI Files Catalog' } }],
      properties: {
        'File Path': { title: {} },
        Category: {
          select: {
            options: [
              { name: 'Documentation', color: 'blue' },
              { name: 'Implementation', color: 'green' },
              { name: 'Configuration', color: 'purple' },
              { name: 'Example', color: 'orange' },
            ],
          },
        },
        'Line Count': { number: {} },
        'Size (KB)': { number: {} },
        'Last Modified': { date: {} },
        Status: {
          select: {
            options: [
              { name: 'Current', color: 'green' },
              { name: 'Historical', color: 'yellow' },
              { name: 'Outdated', color: 'red' },
            ],
          },
        },
        Purpose: { rich_text: {} },
        Dependencies: { multi_select: {} },
      },
    });

    console.log(`   ✓ Files DB created: ${filesDb.url}\n`);

    // Add sample agent entry
    console.log('6. Adding sample data...');
    await notion.pages.create({
      parent: { database_id: agentsDb.id },
      icon: { type: 'emoji', emoji: '📄' },
      properties: {
        Name: { title: [{ text: { content: 'NotionManager' } }] },
        Status: { select: { name: 'Active' } },
        Type: { select: { name: 'Specialist' } },
        'Last Active': { date: { start: new Date().toISOString() } },
        'Total Sessions': { number: 1 },
        'Total Cost': { number: 0.05 },
        Description: {
          rich_text: [
            {
              text: {
                content:
                  'Notion workspace management - creates, reads, and edits pages and databases',
              },
            },
          ],
        },
        Phase: { select: { name: 'Phase 1 - Deployed' } },
      },
    });

    console.log('   ✓ Sample agent added\n');

    // Save IDs to .env
    console.log('7. Saving database IDs...');
    const envAdditions = `
# CI Notion Workspace IDs
NOTION_CI_DASHBOARD_ID=${dashboardPage.id}
NOTION_CI_AGENTS_DB_ID=${agentsDb.id}
NOTION_CI_SESSIONS_DB_ID=${sessionsDb.id}
NOTION_CI_FILES_DB_ID=${filesDb.id}
`;

    const fs = await import('fs');
    fs.appendFileSync('.env', envAdditions);
    console.log('   ✓ IDs saved to .env\n');

    // Summary
    console.log('=== Setup Complete! ===\n');
    console.log('✅ Dashboard Page:', dashboardPage.url);
    console.log('✅ CI Agents DB:', agentsDb.url);
    console.log('✅ CI Sessions DB:', sessionsDb.url);
    console.log('✅ CI Files DB:', filesDb.url);
    console.log();
    console.log('Database IDs saved to .env file');
    console.log();
    console.log('Next Steps:');
    console.log('1. Open dashboard in Notion');
    console.log('2. Run: node sync-agent-memory.js');
    console.log('3. Start tracking CI workflows!');
    console.log();

    return {
      dashboardPage,
      agentsDb,
      sessionsDb,
      filesDb,
    };
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    if (error.code) {
      console.error(`Code: ${error.code}`);
    }
    process.exit(1);
  }
}

setupCIWorkspace();
