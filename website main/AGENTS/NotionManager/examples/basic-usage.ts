/**
 * Basic Usage Example
 *
 * Demonstrates simple CRUD operations with the NotionManager agent
 */
import { getNotionClient } from '../src/index.js';

async function main() {
  console.log('=== NotionManager Basic Usage Example ===\n');

  try {
    // 1. Validate Notion API connection
    console.log('1. Validating Notion API connection...');
    const client = await getNotionClient();
    console.log('✓ Connected to Notion API\n');

    // 2. Create a new page
    console.log('2. Creating a new page...');
    const newPage = await client.pages.create({
      parent: {
        type: 'workspace',
        workspace: true,
      },
      properties: {
        title: {
          title: [
            {
              text: {
                content: 'NotionManager Test Page',
              },
            },
          ],
        },
      },
      icon: {
        type: 'emoji',
        emoji: '🚀',
      },
      children: [
        {
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [
              {
                text: {
                  content: 'Welcome to NotionManager',
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
                  content: 'This page was created by the NotionManager agent.',
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
                  content: 'Features',
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
                  content: 'Create pages with rich content',
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
                  content: 'Read and update existing pages',
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
                  content: 'Query databases with filters',
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
                  content: 'console.log("Hello from NotionManager!");',
                },
              },
            ],
            language: 'javascript',
          },
        },
      ],
    });

    console.log(`✓ Page created: ${newPage.url}`);
    console.log(`  Page ID: ${newPage.id}\n`);

    // 3. Read the page back
    console.log('3. Reading page content...');
    const retrievedPage = await client.pages.retrieve({
      page_id: newPage.id,
    });

    console.log('✓ Page retrieved successfully');
    console.log(`  Created: ${retrievedPage.created_time}`);
    console.log(`  Last edited: ${retrievedPage.last_edited_time}\n`);

    // 4. Update page properties
    console.log('4. Updating page properties...');
    const updatedPage = await client.pages.update({
      page_id: newPage.id,
      icon: {
        type: 'emoji',
        emoji: '✨',
      },
    });

    console.log('✓ Page updated successfully');
    console.log(`  New icon: ✨\n`);

    // 5. Search for the page
    console.log('5. Searching for the page...');
    const searchResults = await client.search({
      query: 'NotionManager Test',
      filter: {
        property: 'object',
        value: 'page',
      },
    });

    console.log(
      `✓ Found ${searchResults.results.length} matching page(s)\n`
    );

    console.log('=== Example completed successfully! ===');
    console.log(`\nView your new page: ${newPage.url}`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    process.exit(1);
  }
}

main();
