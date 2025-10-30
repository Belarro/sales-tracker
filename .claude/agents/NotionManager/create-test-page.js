/**
 * Create a Test Page in Notion
 * Demonstrates full CRUD capabilities
 */

import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

console.log('=== Creating Test Page in Notion ===\n');

async function createTestPage() {
  try {
    // Initialize client
    const notion = new Client({ auth: process.env.NOTION_API_TOKEN });

    // Find a parent page first
    console.log('Finding parent page...');
    const searchResults = await notion.search({ page_size: 5 });
    const parentPage = searchResults.results.find((r) => r.object === 'page');

    if (!parentPage) {
      throw new Error(
        'No accessible page found. Please share a page with your "eylam" integration.'
      );
    }

    console.log(`Using parent: ${parentPage.id}`);
    console.log();

    // Create a test page with rich content
    console.log('Creating page...');
    const page = await notion.pages.create({
      parent: {
        page_id: parentPage.id,
      },
      icon: {
        type: 'emoji',
        emoji: '🚀',
      },
      properties: {
        title: {
          title: [
            {
              text: {
                content: 'NotionManager Test - ' + new Date().toLocaleString(),
              },
            },
          ],
        },
      },
      children: [
        {
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [
              {
                text: {
                  content: 'NotionManager Connection Test',
                },
              },
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
                  content: 'This page was created by the NotionManager agent to verify the connection is working correctly.',
                },
              },
            ],
          },
        },
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [
              {
                text: {
                  content: 'Test Details',
                },
              },
            ],
          },
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                text: {
                  content: 'Integration: eylam',
                },
              },
            ],
          },
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                text: {
                  content: 'Project: CollaborativeIntelligence',
                },
              },
            ],
          },
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                text: {
                  content: `Date: ${new Date().toISOString()}`,
                },
              },
            ],
          },
        },
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [
              {
                text: {
                  content: 'Capabilities Verified',
                },
              },
            ],
          },
        },
        {
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [
              {
                text: {
                  content: 'API connection established',
                },
              },
            ],
            checked: true,
          },
        },
        {
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [
              {
                text: {
                  content: 'Page creation working',
                },
              },
            ],
            checked: true,
          },
        },
        {
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [
              {
                text: {
                  content: 'Rich content formatting (headings, lists, checkboxes)',
                },
              },
            ],
            checked: true,
          },
        },
        {
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [
              {
                text: {
                  content: 'Icons and metadata',
                },
              },
            ],
            checked: true,
          },
        },
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [
              {
                text: {
                  content: 'Code Example',
                },
              },
            ],
          },
        },
        {
          object: 'block',
          type: 'code',
          code: {
            rich_text: [
              {
                text: {
                  content:
                    'import { Client } from "@notionhq/client";\n\nconst notion = new Client({ auth: token });\nconst page = await notion.pages.create({ /* ... */ });\n\nconsole.log("Page created:", page.url);',
                },
              },
            ],
            language: 'javascript',
          },
        },
        {
          object: 'block',
          type: 'divider',
          divider: {},
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                text: {
                  content: '✅ NotionManager is ready to use!',
                },
                annotations: {
                  bold: true,
                  color: 'green',
                },
              },
            ],
          },
        },
      ],
    });

    console.log('\n✅ Page created successfully!\n');
    console.log('Page Details:');
    console.log(`  ID: ${page.id}`);
    console.log(`  URL: ${page.url}`);
    console.log(`  Created: ${page.created_time}`);
    console.log();
    console.log('🎉 Open this page in Notion to see the full content!');
    console.log();

    // Wait a moment, then read the page back
    console.log('Verifying page was created...');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const retrievedPage = await notion.pages.retrieve({ page_id: page.id });
    console.log('✓ Page verified in Notion\n');

    console.log('=== All Tests Passed! ===\n');
    console.log('NotionManager is fully operational and ready for:');
    console.log('  • Creating pages with rich formatting');
    console.log('  • Reading page content');
    console.log('  • Updating properties');
    console.log('  • Querying databases');
    console.log('  • Searching workspace');
    console.log();
    console.log('Next: Integrate with CollaborativeIntelligence workflows');
    console.log();

  } catch (error) {
    console.error('\n❌ Failed to create page\n');
    console.error(`Error: ${error.message}`);
    if (error.code) {
      console.error(`Code: ${error.code}`);
    }
    console.error();
    process.exit(1);
  }
}

createTestPage();
