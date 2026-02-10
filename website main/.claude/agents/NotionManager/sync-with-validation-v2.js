#!/usr/bin/env node

/**
 * Sync with Validation v2 - NotionManager v3.6
 *
 * Enhanced with:
 * - Pre-sync validation
 * - Dry-run mode
 * - Detailed error reporting
 * - Advanced progress tracking with ETAs
 * - Structured logging
 * - Performance timing
 * - Automatic fixes for common issues
 */

import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import { markdownToNotionBlocks } from './markdown-parser-enhanced.js';
import { PageLinkResolverV2 } from './page-link-resolver-v2.js';
import { MarkdownValidator } from './markdown-validator.js';
import { ProgressTracker, Logger, OperationTimer } from './progress-tracker.js';

dotenv.config();

export class SyncManagerV2 {
  constructor(options = {}) {
    this.notion = new Client({ auth: process.env.NOTION_API_TOKEN });
    this.workspace = options.workspace || process.env.NOTION_CI_DASHBOARD_ID;
    this.resolver = new PageLinkResolverV2(this.notion, { verbose: options.verbose });
    this.validator = new MarkdownValidator(options.validation || {});
    this.verbose = options.verbose || false;

    // Setup logger
    this.logger = new Logger({
      level: options.verbose ? Logger.LEVELS.DEBUG : Logger.LEVELS.INFO,
      prefix: '[NotionManager] ',
      timestamps: options.timestamps || false,
    });
  }

  /**
   * Sync markdown to Notion with validation and progress tracking
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

    // Start overall timer
    const timer = showProgress ? new OperationTimer(`Sync "${title}"`) : null;

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
        this.logger.step(1, 5, 'Validating markdown...');
      }

      const validation = this.validator.validate(markdown);
      results.validation = validation;

      if (timer) timer.checkpoint('Validation');

      if (!validation.valid) {
        console.error('\n' + this.validator.formatResults(validation));

        if (!force) {
          results.errors.push('Validation failed. Use force: true to sync anyway.');
          this.logger.error('Sync aborted due to validation failure');
          return results;
        } else {
          this.logger.warn('Validation failed but continuing (force mode)...');
        }
      } else if (showProgress) {
        if (validation.warnings.length > 0) {
          console.warn('\n' + this.validator.formatResults(validation));
        } else {
          this.logger.success('No validation issues found');
        }
      }

      // Step 2: Resolve page links (if enabled)
      let pageMap = new Map();
      if (resolveLinks) {
        if (showProgress) {
          this.logger.step(2, 5, 'Resolving page links...');
        }

        const pageRefs = this.resolver.extractPageReferences(markdown);
        if (pageRefs.length > 0) {
          if (showProgress) {
            console.log(`   Found ${pageRefs.length} page reference(s)`);
          }

          // Use ProgressTracker for batch resolution
          const progress = showProgress
            ? new ProgressTracker(pageRefs.length, 'Resolving pages', {
                updateInterval: Math.max(1, Math.floor(pageRefs.length / 10)),
                verbose: this.verbose,
              })
            : null;

          // Resolve with progress callback
          pageMap = await this.resolvePagesWithProgress(pageRefs, progress);

          if (progress) {
            const stats = progress.complete();
            if (showProgress) {
              console.log(`   ✅ Resolved ${pageMap.size}/${pageRefs.length} pages`);
              if (stats.errors > 0) {
                this.logger.warn(
                  `${stats.errors} page(s) not found (will use plain text)`
                );
              }
            }
          }
        } else if (showProgress) {
          this.logger.info('No page references found');
        }

        if (timer) timer.checkpoint('Page resolution');
      } else if (showProgress) {
        this.logger.step(2, 5, 'Skipping page link resolution (disabled)');
      }

      // Step 3: Parse markdown
      if (showProgress) {
        this.logger.step(3, 5, 'Parsing markdown...');
      }

      const blocks = markdownToNotionBlocks(markdown, 100, pageMap);
      results.blocks = blocks;

      if (timer) timer.checkpoint('Parsing');

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
        console.log(`   ✅ Created ${blocks.length} block(s)`);
        if (this.verbose) {
          Object.entries(blockTypes).forEach(([type, count]) => {
            console.log(`      - ${type}: ${count}`);
          });
        }
      }

      // Step 4: Dry run check
      if (dryRun) {
        if (showProgress) {
          this.logger.step(4, 5, 'Dry run mode - not creating page');
          console.log('\n📊 Summary:');
          console.log(`   - Would create page: "${title}"`);
          console.log(`   - Total blocks: ${blocks.length}`);
          console.log(`   - Page links: ${pageMap.size}`);
          console.log(`   - Validation: ${validation.valid ? '✅ Passed' : '❌ Failed'}`);
          console.log(`   - Warnings: ${validation.warnings.length}`);
          console.log('\n✅ Dry run complete - no changes made\n');
        }

        results.success = true;
        results.dryRun = true;

        if (timer) {
          timer.checkpoint('Dry run complete');
          timer.complete();
        }

        return results;
      }

      // Step 5: Create page in Notion
      if (showProgress) {
        this.logger.step(5, 5, 'Creating page in Notion...');
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

      if (timer) timer.checkpoint('Page creation');

      results.page = {
        id: page.id,
        url: `https://www.notion.so/${page.id.replace(/-/g, '')}`,
      };

      if (showProgress) {
        this.logger.success('Page created successfully');
        console.log('\n🔗 View page:', results.page.url);
      }

      results.success = true;

      // Complete timer and show performance breakdown
      if (timer) {
        const timing = timer.complete();
        results.stats.elapsed = timing.total;
      }

      return results;

    } catch (error) {
      results.errors.push(error.message);

      this.logger.error('Sync failed: ' + error.message);
      if (error.body && this.verbose) {
        console.error('Error details:', JSON.stringify(error.body, null, 2));
      }

      return results;
    }
  }

  /**
   * Resolve pages with progress tracking
   * @param {string[]} pageRefs - Page references
   * @param {ProgressTracker} progress - Progress tracker
   * @returns {Promise<Map>} Page map
   */
  async resolvePagesWithProgress(pageRefs, progress) {
    const pageMap = new Map();

    for (const ref of pageRefs) {
      try {
        const page = await this.resolver.searchPage(ref);

        if (page) {
          pageMap.set(ref, page);
          if (progress) progress.update(1, { success: true });
        } else {
          if (progress) progress.update(1, { error: true });
        }
      } catch (error) {
        this.logger.debug(`Failed to resolve "${ref}": ${error.message}`);
        if (progress) progress.update(1, { error: true });
      }

      // Rate limit: 600ms between searches (unless cached)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return pageMap;
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

    this.logger.info(`Syncing file: ${filePath}`);

    return await this.sync(markdown, { ...options, title });
  }

  /**
   * Batch sync multiple files with overall progress
   * @param {string[]} filePaths - Array of file paths
   * @param {Object} options - Sync options
   * @returns {Promise<Array>} Array of results
   */
  async syncFiles(filePaths, options = {}) {
    const { showProgress = true } = options;

    console.log(`\n🚀 Batch Sync - ${filePaths.length} file(s)\n`);

    const progress = showProgress
      ? new ProgressTracker(filePaths.length, 'Syncing files', {
          updateInterval: 1,
          verbose: true,
        })
      : null;

    const results = [];

    for (const filePath of filePaths) {
      try {
        const result = await this.syncFile(filePath, {
          ...options,
          showProgress: false, // Disable per-file progress
        });

        results.push({ filePath, result });

        if (progress) {
          progress.update(1, {
            success: result.success,
            error: !result.success,
          });
        }
      } catch (error) {
        results.push({
          filePath,
          result: { success: false, errors: [error.message] },
        });

        if (progress) {
          progress.update(1, { error: true });
        }
      }

      // Rate limit between files
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (progress) {
      const stats = progress.complete();
      console.log('\n📊 Batch Summary:');
      console.log(`   ✅ Success: ${stats.successes}`);
      console.log(`   ❌ Failed: ${stats.errors}`);
      console.log(`   ⏱️  Total time: ${progress.formatTime(stats.elapsed)}`);
    }

    return results;
  }
}

/**
 * Test sync with enhanced progress tracking
 */
async function testSyncWithProgressTracking() {
  console.log('=== Sync with Progress Tracking Test ===\n');

  const manager = new SyncManagerV2({ verbose: true, timestamps: true });

  // Test 1: Dry run with valid markdown
  console.log('Test 1: Dry run with valid markdown and page links...\n');
  const validMd = `
# Sync Test with Progress

This is a **test** with several page references:
- @NotionManager
- @Athena
- @Developer
- @Researcher
- [[ClaudeCodeIntegrator]]
- [[Debugger]]

Inline equation: $$E = mc^2$$

Block equation:
$
\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$

![Diagram](https://images.unsplash.com/photo-1518770660439-4636190af475?w=800)
_Architecture diagram_

| Feature | Status |
|---------|--------|
| Images | ✅ Done |
| Links | ✅ Done |
| Equations | ✅ Done |
`;

  let results = await manager.sync(validMd, {
    dryRun: true,
    title: 'Sync Test - Progress Demo',
    showProgress: true,
  });

  console.log('\n📊 Results:', JSON.stringify(results.stats, null, 2));
  console.log();

  // Test 2: Validation failure with force mode
  console.log('Test 2: Validation failure with force mode...\n');
  const invalidMd = `
# Invalid Test

\`\`\`javascript
function test() {
  // Missing closing delimiter

![Bad Image](not-a-url)
`;

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
  testSyncWithProgressTracking().catch(console.error);
}
