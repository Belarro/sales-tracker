/**
 * NotionManager - Validation Setup Checker
 *
 * Checks if environment is configured correctly for validation tests.
 */

import { Client } from '@notionhq/client';

async function checkSetup() {
  console.log('='.repeat(70));
  console.log('NotionManager - Validation Setup Checker');
  console.log('='.repeat(70));
  console.log();

  let allGood = true;
  const issues = [];
  const warnings = [];

  // Check Notion Token
  console.log('1️⃣  Checking Notion Configuration...\n');

  if (!process.env.NOTION_TOKEN) {
    console.log('   ❌ NOTION_TOKEN not set');
    issues.push('Set NOTION_TOKEN in .env.test');
    allGood = false;
  } else if (!process.env.NOTION_TOKEN.startsWith('secret_')) {
    console.log('   ⚠️  NOTION_TOKEN does not start with "secret_"');
    console.log(`   ℹ️  Current value: ${process.env.NOTION_TOKEN.substring(0, 10)}...`);
    warnings.push('NOTION_TOKEN format may be incorrect');
  } else {
    console.log('   ✅ NOTION_TOKEN is set');
    console.log(`   ℹ️  Token: ${process.env.NOTION_TOKEN.substring(0, 15)}...`);

    // Try to connect
    try {
      const notion = new Client({ auth: process.env.NOTION_TOKEN });
      // Simple test: try to list users (all integrations can do this)
      await notion.users.list({ page_size: 1 });
      console.log('   ✅ NOTION_TOKEN is valid (API connection successful)');
    } catch (error) {
      console.log('   ❌ NOTION_TOKEN is invalid');
      console.log(`   ℹ️  Error: ${error.message}`);
      issues.push('NOTION_TOKEN does not work with Notion API');
      allGood = false;
    }
  }
  console.log();

  // Check Page IDs
  console.log('2️⃣  Checking Test Pages...\n');

  const pageChecks = [
    { env: 'NOTION_PAGE_SIMPLE', name: 'Simple test page', required: true },
    { env: 'NOTION_PAGE_RICH', name: 'Rich content test page', required: false },
    { env: 'NOTION_PAGE_IMAGES', name: 'Image test page', required: false },
  ];

  for (const check of pageChecks) {
    const pageId = process.env[check.env];

    if (!pageId) {
      if (check.required) {
        console.log(`   ❌ ${check.env} not set (REQUIRED)`);
        issues.push(`Set ${check.env} in .env.test`);
        allGood = false;
      } else {
        console.log(`   ⚠️  ${check.env} not set (optional)`);
        warnings.push(`${check.env} needed for advanced tests`);
      }
    } else {
      console.log(`   ℹ️  ${check.env}: ${pageId}`);

      // Validate format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const cleanId = pageId.replace(/-/g, '');

      if (!uuidRegex.test(pageId) && cleanId.length !== 32) {
        console.log(`   ⚠️  ${check.env} format may be incorrect`);
        console.log('   ℹ️  Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
        warnings.push(`Check ${check.env} format`);
      }

      // Try to fetch page
      if (process.env.NOTION_TOKEN && process.env.NOTION_TOKEN.startsWith('secret_')) {
        try {
          const notion = new Client({ auth: process.env.NOTION_TOKEN });
          const page = await notion.pages.retrieve({ page_id: pageId });
          console.log(`   ✅ ${check.env} is accessible`);

          // Check if we can read properties
          if (page.properties) {
            console.log('   ✅ Page has readable properties');
          }
        } catch (error) {
          console.log(`   ❌ ${check.env} is NOT accessible`);
          console.log(`   ℹ️  Error: ${error.message}`);

          if (error.code === 'object_not_found') {
            issues.push(`Page ${check.env} not found or not shared with integration`);
          } else if (error.code === 'unauthorized') {
            issues.push(`Integration does not have access to ${check.env}`);
          } else {
            issues.push(`Cannot access ${check.env}: ${error.message}`);
          }

          if (check.required) {
            allGood = false;
          }
        }
      }
    }
    console.log();
  }

  // Check GitHub Configuration
  console.log('3️⃣  Checking GitHub Configuration (for file upload tests)...\n');

  if (!process.env.GITHUB_TOKEN) {
    console.log('   ⚠️  GITHUB_TOKEN not set (optional)');
    warnings.push('GITHUB_TOKEN needed for file upload tests');
  } else if (!process.env.GITHUB_TOKEN.startsWith('ghp_')) {
    console.log('   ⚠️  GITHUB_TOKEN format may be incorrect');
    console.log(`   ℹ️  Expected to start with "ghp_", got: ${process.env.GITHUB_TOKEN.substring(0, 5)}...`);
    warnings.push('GITHUB_TOKEN format looks incorrect');
  } else {
    console.log('   ✅ GITHUB_TOKEN is set');
  }

  if (!process.env.GITHUB_OWNER) {
    console.log('   ⚠️  GITHUB_OWNER not set (optional)');
  } else {
    console.log(`   ✅ GITHUB_OWNER: ${process.env.GITHUB_OWNER}`);
  }

  if (!process.env.GITHUB_REPO) {
    console.log('   ⚠️  GITHUB_REPO not set (optional)');
  } else {
    console.log(`   ✅ GITHUB_REPO: ${process.env.GITHUB_REPO}`);
  }
  console.log();

  // Summary
  console.log('='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log();

  if (allGood && issues.length === 0) {
    console.log('✅ Setup is READY for validation testing!\n');

    console.log('Basic Tests Available:');
    console.log('  ✅ Test 1: Notion → Git sync');
    console.log('  ✅ Test 2: Git → Notion sync');

    if (process.env.NOTION_PAGE_RICH) {
      console.log('  ✅ Test 3: Round-trip accuracy (rich content)');
    } else {
      console.log('  ⚠️  Test 3: Needs NOTION_PAGE_RICH');
    }

    if (process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO) {
      console.log('  ✅ File upload tests (GitHub configured)');
    } else {
      console.log('  ⚠️  File upload tests: Need GitHub credentials');
    }

    console.log();
    console.log('Next Steps:');
    console.log('  1. Run: node validation-test-1-notion-to-git.js');
    console.log('  2. Run: node validation-test-2-git-to-notion.js');
    console.log('  3. Open Notion pages to verify content');
    console.log();

    if (warnings.length > 0) {
      console.log('Optional Improvements:');
      warnings.forEach(w => console.log(`  ⚠️  ${w}`));
      console.log();
    }

  } else {
    console.log('❌ Setup has ISSUES that must be fixed:\n');

    issues.forEach(issue => console.log(`  ❌ ${issue}`));
    console.log();

    console.log('How to Fix:');
    console.log('  1. Copy template: cp .env.test.template .env.test');
    console.log('  2. Edit .env.test and fill in values');
    console.log('  3. Load environment: source .env.test');
    console.log('  4. Run this script again: node check-validation-setup.js');
    console.log();

    console.log('For detailed setup instructions, see:');
    console.log('  QUICK-START-VALIDATION.md');
    console.log();
  }

  console.log('='.repeat(70));

  process.exit(allGood ? 0 : 1);
}

// Run checks
checkSetup().catch(error => {
  console.error('\n❌ Setup check failed with error:\n');
  console.error(error);
  process.exit(1);
});
