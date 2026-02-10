/**
 * Find a parent page or database to create test pages in
 */

import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

console.log('=== Finding Parent Page/Database ===\n');

async function findParent() {
  try {
    const notion = new Client({ auth: process.env.NOTION_API_TOKEN });

    // Search for all accessible pages and databases
    console.log('Searching workspace...');
    const searchResults = await notion.search({
      page_size: 20,
    });

    console.log(`Found ${searchResults.results.length} items\n`);

    // Organize by type
    const pages = searchResults.results.filter((r) => r.object === 'page');
    const databases = searchResults.results.filter(
      (r) => r.object === 'database'
    );

    console.log('=== PAGES ===');
    if (pages.length === 0) {
      console.log('  (no pages found)');
    }
    pages.forEach((page, i) => {
      const title =
        page.properties?.title?.title?.[0]?.plain_text ||
        page.properties?.Name?.title?.[0]?.plain_text ||
        '(Untitled)';
      console.log(`  ${i + 1}. ${title}`);
      console.log(`     ID: ${page.id}`);
      console.log(`     URL: ${page.url}`);
      console.log();
    });

    console.log('=== DATABASES ===');
    if (databases.length === 0) {
      console.log('  (no databases found)');
    }
    databases.forEach((db, i) => {
      const title =
        db.title?.[0]?.plain_text || '(Untitled Database)';
      console.log(`  ${i + 1}. ${title}`);
      console.log(`     ID: ${db.id}`);
      console.log(`     URL: ${db.url}`);
      console.log();
    });

    // Provide recommendations
    console.log('=== RECOMMENDATIONS ===\n');

    if (databases.length > 0) {
      console.log(`✓ Found ${databases.length} database(s)`);
      console.log('  You can create pages in any database');
      console.log();
      console.log('  Example code:');
      console.log('  ```javascript');
      console.log(`  const page = await notion.pages.create({`);
      console.log(`    parent: { database_id: "${databases[0].id}" },`);
      console.log(`    properties: { /* database-specific properties */ }`);
      console.log(`  });`);
      console.log('  ```');
      console.log();
    } else if (pages.length > 0) {
      console.log(`✓ Found ${pages.length} page(s)`);
      console.log('  You can create child pages under any page');
      console.log();
      console.log('  Example code:');
      console.log('  ```javascript');
      console.log(`  const page = await notion.pages.create({`);
      console.log(`    parent: { page_id: "${pages[0].id}" },`);
      console.log(`    properties: {`);
      console.log(`      title: { title: [{ text: { content: "My Page" } }] }`);
      console.log(`    }`);
      console.log(`  });`);
      console.log('  ```');
      console.log();
    } else {
      console.log('⚠️  No pages or databases found');
      console.log();
      console.log('  To fix this:');
      console.log('  1. Create a page in Notion');
      console.log('  2. Share it with your "eylam" integration');
      console.log('     (Click "..." → Add connections → eylam)');
      console.log('  3. Run this script again');
      console.log();
    }

    return { pages, databases };
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error(`Code: ${error.code}`);
    }
    process.exit(1);
  }
}

findParent();
