/**
 * NotionManager v4.0.0 - Bidirectional Sync Orchestrator
 *
 * Main coordinator for bidirectional sync between Git and Notion.
 * Combines all v4.0 components into a unified sync workflow.
 *
 * @module bidirectional-sync-orchestrator
 */

import { Client } from '@notionhq/client';
import fs from 'fs/promises';
import path from 'path';
import { NotionToMarkdownConverter } from './notion-to-markdown.js';
import { ChangeDetectionSystem } from './change-detection-system.js';
import { GitCommitOrchestrator } from './git-commit-orchestrator.js';
import { ConflictResolutionEngine } from './conflict-resolution-engine.js';
import { FileUploadManager } from './file-upload-manager.js';
import { markdownToNotionBlocks } from './markdown-parser-optimized.js';

/**
 * Sync result
 * @typedef {Object} SyncResult
 * @property {boolean} success - Whether sync succeeded
 * @property {string} direction - Sync direction (git-to-notion|notion-to-git)
 * @property {string} pageId - Notion page ID
 * @property {string} filePath - Git file path
 * @property {string} [commitHash] - Git commit hash (if committed)
 * @property {string} [notionUrl] - Notion page URL
 * @property {Object} [conflict] - Conflict info (if conflict occurred)
 * @property {string} [error] - Error message (if failed)
 */

/**
 * Bidirectional Sync Orchestrator
 *
 * Main class for v4.0.0 bidirectional sync functionality.
 */
export class BidirectionalSyncOrchestrator {
  /**
   * @param {Object} options
   * @param {string} [options.notionToken] - Notion API token
   * @param {string} [options.syncMapPath] - Path to sync map file
   * @param {string} [options.repoPath] - Path to Git repository
   * @param {number} [options.pollInterval=60000] - Polling interval (ms)
   * @param {string} [options.defaultConflictStrategy='interactive'] - Default conflict strategy
   * @param {Object} [options.fileHosting] - File hosting configuration
   * @param {boolean} [options.enableFileUploads=false] - Enable file upload feature
   * @param {boolean} [options.downloadNotionImages=false] - Download expiring Notion images
   * @param {boolean} [options.verbose=false] - Enable verbose logging
   */
  constructor(options = {}) {
    this.notion = new Client({ auth: options.notionToken || process.env.NOTION_TOKEN });
    this.verbose = options.verbose || false;
    this.enableFileUploads = options.enableFileUploads || false;
    this.downloadNotionImages = options.downloadNotionImages || false;

    // Initialize components
    this.converter = new NotionToMarkdownConverter();
    this.changeDetection = new ChangeDetectionSystem({
      notionToken: options.notionToken,
      syncMapPath: options.syncMapPath,
      pollInterval: options.pollInterval,
      verbose: this.verbose,
    });
    this.gitCommit = new GitCommitOrchestrator({
      notionToken: options.notionToken,
      repoPath: options.repoPath,
      verbose: this.verbose,
    });
    this.conflictResolution = new ConflictResolutionEngine({
      defaultStrategy: options.defaultConflictStrategy || 'interactive',
      repoPath: options.repoPath,
      verbose: this.verbose,
    });

    // Initialize file upload manager (v4.1)
    if (this.enableFileUploads || this.downloadNotionImages) {
      this.fileUpload = new FileUploadManager({
        adapter: options.fileHosting || { backend: 'github' },
        verbose: this.verbose,
      });
      this.log('File upload manager initialized');
    }
  }

  /**
   * Initialize the orchestrator (load sync map)
   * @returns {Promise<void>}
   */
  async initialize() {
    await this.changeDetection.loadSyncMap();
    this.log('Orchestrator initialized');
  }

  /**
   * Register a page for bidirectional sync
   * @param {string} pageId - Notion page ID
   * @param {string} filePath - Git file path (relative to repo root)
   * @param {string} title - Page title
   * @param {Object} [options] - Additional options
   * @returns {Promise<void>}
   */
  async registerPage(pageId, filePath, title, options = {}) {
    await this.changeDetection.registerMapping(pageId, filePath, title, options);
    this.log(`Registered: ${title} (${pageId}) ↔ ${filePath}`);
  }

  /**
   * Sync a single page from Notion → Git
   * @param {string} pageId - Notion page ID
   * @param {Object} [options] - Sync options
   * @param {boolean} [options.force=false] - Force sync even if no changes detected
   * @param {boolean} [options.commit=true] - Create Git commit
   * @param {string} [options.conflictStrategy] - Override conflict strategy
   * @returns {Promise<SyncResult>} Sync result
   */
  async syncNotionToGit(pageId, options = {}) {
    const { force = false, commit = true, conflictStrategy } = options;

    try {
      // 1. Get mapping
      const mapping = this.changeDetection.getMapping(pageId);
      if (!mapping) {
        throw new Error(`No mapping found for page ${pageId}`);
      }

      this.log(`Syncing Notion → Git: ${mapping.title}`);

      // 2. Detect changes (unless forced)
      if (!force) {
        const changeResult = await this.changeDetection.detectPageChange(pageId);

        if (!changeResult.needsSync) {
          this.log('No sync needed (no changes or within grace period)');
          return {
            success: true,
            direction: 'notion-to-git',
            pageId,
            filePath: mapping.filePath,
            skipped: true,
            reason: 'No changes detected',
          };
        }
      }

      // 3. Check for conflicts
      const page = await this.notion.pages.retrieve({ page_id: pageId });
      const conflict = await this.conflictResolution.detectConflict({
        notionLastEdited: page.last_edited_time,
        lastSyncTime: mapping.lastSyncNotionToGit || mapping.lastSyncGitToNotion,
        filePath: mapping.filePath,
      });

      // 4. Resolve conflict if exists
      if (conflict.isConflict) {
        this.log('Conflict detected');

        const resolution = await this.conflictResolution.resolveConflict(
          conflict,
          conflictStrategy || mapping.conflictStrategy
        );

        if (resolution.action === 'skip') {
          return {
            success: false,
            direction: 'notion-to-git',
            pageId,
            filePath: mapping.filePath,
            conflict: {
              detected: true,
              resolution: resolution.resolution,
              action: 'skipped',
            },
            error: 'Conflict requires manual resolution',
          };
        }

        if (resolution.action === 'sync-git-to-notion') {
          // Git wins, do reverse sync instead
          this.log('Conflict resolved: Git wins (sync Git → Notion)');
          return await this.syncGitToNotion(pageId, { force: true });
        }

        // Notion wins, continue with Notion → Git
        this.log('Conflict resolved: Notion wins (sync Notion → Git)');
      }

      // 5. Fetch Notion blocks
      const blocks = await this.fetchAllBlocks(pageId);
      this.log(`Fetched ${blocks.length} blocks from Notion`);

      // 6. Convert to markdown
      let markdown = this.converter.blocksToMarkdown(blocks);
      this.log(`Converted to ${markdown.split('\n').length} lines of markdown`);

      // 6.5. Download expiring Notion images if enabled (v4.1)
      if (this.downloadNotionImages && this.fileUpload) {
        const result = await this.fileUpload.downloadNotionImages(markdown);
        markdown = result.markdown;
        if (result.downloadedImages.length > 0) {
          this.log(`Downloaded and re-hosted ${result.downloadedImages.length} Notion image(s)`);
        }
      }

      // 7. Write to file
      await fs.writeFile(mapping.filePath, markdown, 'utf8');
      this.log(`Wrote to ${mapping.filePath}`);

      // 8. Create Git commit (if requested)
      let commitHash = null;
      if (commit) {
        const commitResult = await this.gitCommit.commitNotionSync(
          [mapping.filePath],
          {
            title: mapping.title,
            notionUserId: page.last_edited_by?.id,
            pageUrl: this.getPageUrl(pageId),
            type: 'docs',
          }
        );

        if (commitResult.success) {
          commitHash = commitResult.hash;
          this.log(`Created commit: ${commitHash}`);
        } else {
          this.log(`Commit failed: ${commitResult.error}`);
        }
      }

      // 9. Update sync map
      await this.changeDetection.updateNotionToGitSync(pageId, page.last_edited_time);

      return {
        success: true,
        direction: 'notion-to-git',
        pageId,
        filePath: mapping.filePath,
        commitHash,
        notionUrl: this.getPageUrl(pageId),
        conflict: conflict.isConflict ? { detected: true, resolved: true } : null,
      };
    } catch (error) {
      this.log(`Error syncing Notion → Git: ${error.message}`);

      return {
        success: false,
        direction: 'notion-to-git',
        pageId,
        filePath: mapping?.filePath,
        error: error.message,
      };
    }
  }

  /**
   * Sync a single page from Git → Notion
   * @param {string} pageId - Notion page ID
   * @param {Object} [options] - Sync options
   * @param {boolean} [options.force=false] - Force sync even if no changes
   * @returns {Promise<SyncResult>} Sync result
   */
  async syncGitToNotion(pageId, options = {}) {
    const { force = false } = options;

    try {
      // Get mapping
      const mapping = this.changeDetection.getMapping(pageId);
      if (!mapping) {
        throw new Error(`No mapping found for page ${pageId}`);
      }

      this.log(`Syncing Git → Notion: ${mapping.title}`);

      // Read markdown file
      let markdown = await fs.readFile(mapping.filePath, 'utf8');

      // Process local images if file uploads enabled (v4.1)
      if (this.enableFileUploads && this.fileUpload) {
        const baseDir = path.dirname(mapping.filePath);
        const result = await this.fileUpload.processMarkdownImages(markdown, baseDir);
        markdown = result.markdown;
        if (result.uploadedFiles.length > 0) {
          this.log(`Uploaded ${result.uploadedFiles.length} local file(s) to hosting`);
        }
      }

      // Convert to Notion blocks
      const blocks = markdownToNotionBlocks(markdown, 100, new Map());

      // Update Notion page
      // Note: This requires deleting existing blocks and adding new ones
      // For now, we'll just append (full implementation would be more complex)
      await this.notion.blocks.children.append({
        block_id: pageId,
        children: blocks,
      });

      // Get current commit hash
      const commitHash = await this.gitCommit.getLastCommitHash(true);

      // Update sync map
      await this.changeDetection.updateGitToNotionSync(pageId, commitHash);

      this.log(`Synced Git → Notion successfully`);

      return {
        success: true,
        direction: 'git-to-notion',
        pageId,
        filePath: mapping.filePath,
        commitHash,
        notionUrl: this.getPageUrl(pageId),
      };
    } catch (error) {
      this.log(`Error syncing Git → Notion: ${error.message}`);

      return {
        success: false,
        direction: 'git-to-notion',
        pageId,
        filePath: mapping?.filePath,
        error: error.message,
      };
    }
  }

  /**
   * Sync all tracked pages from Notion → Git
   * @param {Object} [options] - Sync options
   * @returns {Promise<SyncResult[]>} Array of sync results
   */
  async syncAllNotionToGit(options = {}) {
    this.log('Syncing all pages: Notion → Git');

    // Get pages that need syncing
    const pagesToSync = await this.changeDetection.getPagesThatNeedSync();

    if (pagesToSync.length === 0) {
      this.log('No pages need syncing');
      return [];
    }

    this.log(`Found ${pagesToSync.length} page(s) to sync`);

    const results = [];

    for (const page of pagesToSync) {
      const result = await this.syncNotionToGit(page.pageId, options);
      results.push(result);

      // Rate limit delay
      await this.sleep(600);
    }

    const successCount = results.filter(r => r.success).length;
    this.log(`Synced ${successCount}/${results.length} pages successfully`);

    return results;
  }

  /**
   * Start continuous polling for changes
   * @param {Object} [options] - Polling options
   * @param {boolean} [options.autoSync=true] - Automatically sync detected changes
   * @returns {Promise<void>}
   */
  async startContinuousSync(options = {}) {
    const { autoSync = true } = options;

    this.log('Starting continuous sync (polling mode)');

    await this.changeDetection.startPolling(async (pagesToSync) => {
      if (autoSync) {
        this.log(`Auto-syncing ${pagesToSync.length} page(s)...`);

        for (const page of pagesToSync) {
          await this.syncNotionToGit(page.pageId);
          await this.sleep(600); // Rate limit
        }
      } else {
        this.log(`Detected ${pagesToSync.length} page(s) with changes (auto-sync disabled)`);
      }
    });
  }

  /**
   * Stop continuous polling
   */
  stopContinuousSync() {
    this.changeDetection.stopPolling();
    this.log('Stopped continuous sync');
  }

  /**
   * Fetch all blocks from a Notion page (handles pagination)
   * @param {string} pageId - Notion page ID
   * @returns {Promise<Array>} All blocks
   * @private
   */
  async fetchAllBlocks(pageId) {
    const blocks = [];
    let cursor = undefined;

    while (true) {
      const response = await this.notion.blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
        page_size: 100,
      });

      blocks.push(...response.results);

      if (!response.has_more) {
        break;
      }

      cursor = response.next_cursor;
    }

    return blocks;
  }

  /**
   * Get Notion page URL
   * @param {string} pageId - Page ID
   * @returns {string} Page URL
   * @private
   */
  getPageUrl(pageId) {
    // Remove hyphens from page ID for URL
    const cleanId = pageId.replace(/-/g, '');
    return `https://www.notion.so/${cleanId}`;
  }

  /**
   * Get sync statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return this.changeDetection.getStats();
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds
   * @returns {Promise<void>}
   * @private
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log message if verbose enabled
   * @param {string} message - Message
   * @private
   */
  log(message) {
    if (this.verbose) {
      console.log(`[BidirectionalSync] ${message}`);
    }
  }
}

/**
 * Helper function to create and initialize orchestrator
 * @param {Object} options - Options
 * @returns {Promise<BidirectionalSyncOrchestrator>} Initialized orchestrator
 */
export async function createBidirectionalSyncOrchestrator(options = {}) {
  const orchestrator = new BidirectionalSyncOrchestrator(options);
  await orchestrator.initialize();
  return orchestrator;
}

export default BidirectionalSyncOrchestrator;
