/**
 * Simple Notion API Connection Test
 * Tests if the API token works and can connect to Notion
 */

import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

console.log('=== Notion API Connection Test ===\n');

async function testConnection() {
  try {
    // 1. Check for API token
    console.log('1. Checking for API token...');
    const token = process.env.NOTION_API_TOKEN;

    if (!token) {
      throw new Error('NOTION_API_TOKEN not found in .env file');
    }

    console.log(`✓ Token found: ${token.substring(0, 10)}...`);
    console.log();

    // 2. Initialize Notion client
    console.log('2. Initializing Notion client...');
    const notion = new Client({ auth: token });
    console.log('✓ Client initialized');
    console.log();

    // 3. Test connection by getting current user
    console.log('3. Testing API connection...');
    const response = await notion.users.me({});
    console.log('✓ Connected successfully!');
    console.log();

    // 4. Display user info
    console.log('4. Connection Details:');
    console.log(`   User Type: ${response.type}`);
    console.log(`   User ID: ${response.id}`);
    if (response.bot) {
      console.log(`   Bot Name: ${response.bot.owner.type}`);
    }
    console.log();

    // 5. Search for pages (to test workspace access)
    console.log('5. Testing workspace access...');
    const searchResults = await notion.search({
      page_size: 5,
    });
    console.log(`✓ Workspace access confirmed`);
    console.log(`   Found ${searchResults.results.length} recent items`);
    console.log();

    // Success summary
    console.log('=== Test Completed Successfully! ===\n');
    console.log('✅ Notion API token is valid');
    console.log('✅ Connection established');
    console.log('✅ Workspace access confirmed');
    console.log();
    console.log('Next steps:');
    console.log('- Run: npm run example:basic');
    console.log('- Or create your own pages with the Notion API');
    console.log();

  } catch (error) {
    console.error('\n❌ Test Failed!\n');

    if (error.code === 'unauthorized') {
      console.error('Error: Invalid API token');
      console.error('Solution: Check your NOTION_API_TOKEN in .env file');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('Error: Network connection failed');
      console.error('Solution: Check your internet connection');
    } else {
      console.error(`Error: ${error.message}`);
      if (error.code) {
        console.error(`Code: ${error.code}`);
      }
    }

    console.error();
    process.exit(1);
  }
}

testConnection();
