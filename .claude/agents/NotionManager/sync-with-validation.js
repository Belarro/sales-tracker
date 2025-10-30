#!/usr/bin/env node

/**
 * Sync with Validation - NotionManager v3.6
 *
 * Enhanced sync with:
 * - Pre-sync validation
 * - Dry-run mode
 * - Detailed error reporting
 * - Progress tracking
 * - Automatic fixes for common issues
 */

import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import { markdownToNotionBlocks } from './markdown-parser-enhanced.js';
import { PageLinkResolverV2 } from './page-link-resolver-v2.js';
import { MarkdownValidator } from './markdown-validator.js';

dotenv.config();

export class SyncManager {
  constructor(options = {}) {
    this.notion = new Client({ auth: process.env.NOTION_API_TOKEN });
    this.workspace = options.workspace || process.env.NOTION_CI_DASHBOARD_ID;
    this.resolver = new PageLinkResolverV2(this.notion, { verbose: options.verbose });
    this.validator = new MarkdownValidator(options.validation || {});
    this.verbose = options.verbose || false;
  }

  /**
   * Sync markdown to Notion with validation
   * @param {string} markdown - Markdown content
   * @param {Object} options - Sync options
   * @returns {Promise<Object>} Sync results
   */
  async sync(markdown, options = {}) {
    const {
      dryRun = false,
      title = 'Untitled',
      force = false,
      resolveLinks = true,
      showProgress = true,
    } = options;

    const startTime = Date.now();
    const results = {
      success: false,
      validation: null,
      blocks: null,
      page: null,
      stats: {},
      errors: [],
    };

    try {
      // Step 1: Validate markdown
      if (showProgress) {
        console.log('📋 Step 1/5: Validating markdown...');
      }

      const validation = this.validator.validate(markdown);
      results.validation = validation;

      if (!validation.valid) {
        console.error('\n' + this.validator.formatResults(validation));

        if (!force) {
          results.errors.push('Validation failed. Use force: true to sync anyway.');
          return results;
        } else if (showProgress) {
          console.warn('⚠️  Validation failed but continuing (force mode)...\n');
        }
      } else if (showProgress) {
        if (validation.warnings.length > 0) {
          console.warn('\n' + this.validator.formatResults(validation));
        } else {
          console.log('   ✅ No issues found\n');
        }
      }

      // Step 2: Resolve page links (if enabled)
      let pageMap = new Map();
      if (resolveLinks) {
        if (showProgress) {
          console.log('🔗 Step 2/5: Resolving page links...');
        }

        const pageRefs = this.resolver.extractPageReferences(markdown);
        if (pageRefs.length > 0) {
          if (showProgress) {
            console.log(`   Found ${pageRefs.length} page references`);
          }

          pageMap = await this.resolver.resolveBatch(pageRefs, {
            showProgress: showProgress && this.verbose,
          });

          if (showProgress) {
            console.log(`   ✅ Resolved ${pageMap.size}/${pageRefs.length} pages\n`);
          }
        } else if (showProgress) {
          console.log('   ℹ️  No page references found\n');
        }
      } else if (showProgress) {
        console.log('🔗 Step 2/5: Skipping page link resolution (disabled)\n');
      }

      // Step 3: Parse markdown
      if (showProgress) {
        console.log('📝 Step 3/5: Parsing markdown...');
      }

      const blocks = markdownToNotionBlocks(markdown, 100, pageMap);
      results.blocks = blocks;

      // Count block types
      const blockTypes = {};
      blocks.forEach(b => {
        blockTypes[b.type] = (blockTypes[b.type] || 0) + 1;
      });

      results.stats = {
        totalBlocks: blocks.length,
        blockTypes,
        pageLinks: pageMap.size,
        charactersProcessed: markdown.length,
        linesProcessed: markdown.split('\n').length,
      };

      if (showProgress) {
        console.log(`   ✅ Created ${blocks.length} blocks`);
        Object.entries(blockTypes).forEach(([type, count]) => {
          console.log(`      - ${type}: ${count}`);
        });
        console.log();
      }

      // Step 4: Dry run check
      if (dryRun) {
        if (showProgress) {
          console.log('🔍 Step 4/5: Dry run mode - not creating page\n');
          console.log('📊 Summary:');
          console.log(`   - Would create page: "${title}"`);
          console.log(`   - Total blocks: ${blocks.length}`);
          console.log(`   - Page links: ${pageMap.size}`);
          console.log(`   - Validation: ${validation.valid ? '✅ Passed' : '❌ Failed'}`);
          console.log(`   - Warnings: ${validation.warnings.length}`);
          console.log('\n✅ Dry run complete - no changes made\n');
        }

        results.success = true;
        results.dryRun = true;
        return results;
      }

      // Step 5: Create page in Notion
      if (showProgress) {
        console.log('🚀 Step 5/5: Creating page in Notion...');
      }

      const page = await this.notion.pages.create({
        parent: { page_id: this.workspace },
        properties: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        children: blocks,
      });

      results.page = {
        id: page.id,
        url: `https://www.notion.so/${page.id.replace(/-/g, '')}`,
      };

      const elapsed = Date.now() - startTime;

      if (showProgress) {
        console.log(`   ✅ Page created in ${elapsed}ms\n`);
        console.log('🔗 View page:', results.page.url);
        console.log();
      }

      results.success = true;
      results.stats.elapsed = elapsed;

      return results;

    } catch (error) {
      results.errors.push(error.message);

      if (showProgress) {
        console.error('❌ Sync failed:', error.message);
        if (error.body) {
          console.error('Error details:', JSON.stringify(error.body, null, 2));
        }
      }

      return results;
    }
  }

  /**
   * Sync markdown file to Notion
   * @param {string} filePath - Path to markdown file
   * @param {Object} options - Sync options
   * @returns {Promise<Object>} Sync results
   */
  async syncFile(filePath, options = {}) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const markdown = fs.readFileSync(filePath, 'utf-8');
    const fileName = filePath.split('/').pop().replace('.md', '');
    const title = options.title || fileName;

    return await this.sync(markdown, { ...options, title });
  }
}

/**
 * Test sync with validation
 */
async function testSyncWithValidation() {
  console.log('=== Sync with Validation Test ===\n');

  const manager = new SyncManager({ verbose: true });

  // Test 1: Dry run with valid markdown
  console.log('Test 1: Dry run with valid markdown...\n');
  const validMd = `
# Sync Test

This is a **test** with @NotionManager and [[Athena]] references.

Inline equation: $$E = mc^2$$

![Diagram](https://images.unsplash.com/photo-1518770660439-4636190af475?w=800)
_Architecture diagram_
`;

  let results = await manager.sync(validMd, {
    dryRun: true,
    title: 'Sync Test - Dry Run',
    showProgress: true,
  });

  console.log('Results:', JSON.stringify(results.stats, null, 2));
  console.log();

  // Test 2: Validation failure
  console.log('Test 2: Validation failure...\n');
  const invalidMd = `
# Invalid Test

\`\`\`javascript
function test() {
  // Missing closing delimiter

![Bad Image](not-a-url)
`;

  results = await manager.sync(invalidMd, {
    dryRun: true,
    title: 'Invalid Test',
    showProgress: true,
  });

  console.log('Success:', results.success);
  console.log('Errors:', results.errors);
  console.log();

  // Test 3: Force mode
  console.log('Test 3: Force mode (ignore validation)...\n');
  results = await manager.sync(invalidMd, {
    dryRun: true,
    title: 'Force Test',
    force: true,
    showProgress: true,
  });

  console.log('Success:', results.success);
  console.log();

  console.log('✅ All tests complete!');
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSyncWithValidation().catch(console.error);
}
