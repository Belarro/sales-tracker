/**
 * NotionManager v4.0.0 - Change Detection System
 *
 * Detects when Notion pages have been modified and need to be synced back to Git.
 * Uses polling-based approach with configurable intervals.
 *
 * @module change-detection-system
 */

import { Client } from '@notionhq/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sync state entry for a tracked page
 * @typedef {Object} SyncMapping
 * @property {string} pageId - Notion page ID
 * @property {string} filePath - Local file path (relative to repo root)
 * @property {string} title - Page title
 * @property {string|null} lastSyncGitToNotion - Last time we synced Git → Notion (ISO 8601)
 * @property {string|null} lastSyncNotionToGit - Last time we synced Notion → Git (ISO 8601)
 * @property {string|null} lastGitCommit - Git commit hash of last sync
 * @property {string|null} lastNotionEdit - Last edit time from Notion (ISO 8601)
 * @property {string} conflictStrategy - How to resolve conflicts (interactive|notion-wins|git-wins|last-write-wins)
 */

/**
 * Change detection result
 * @typedef {Object} ChangeDetectionResult
 * @property {boolean} changed - Whether the page has changed since last sync
 * @property {string|null} lastEditedTime - When the page was last edited
 * @property {string|null} lastEditedBy - User ID who last edited the page
 * @property {string|null} lastSyncTime - When we last synced this page
 * @property {number} timeSinceEdit - Milliseconds since last edit
 * @property {boolean} needsSync - Whether this page should be synced now
 */

/**
 * ChangeDetectionSystem
 *
 * Polls Notion pages for changes and manages sync state.
 */
export class ChangeDetectionSystem {
  /**
   * @param {Object} options
   * @param {string} options.notionToken - Notion API token
   * @param {string} [options.syncMapPath] - Path to sync map file
   * @param {number} [options.pollInterval=60000] - Polling interval in ms (default: 60s)
   * @param {number} [options.rateLimitDelay=600] - Delay between API calls in ms
   * @param {number} [options.batchSize=10] - Number of pages to check per batch
   * @param {boolean} [options.verbose=false] - Enable verbose logging
   */
  constructor(options = {}) {
    this.notion = new Client({ auth: options.notionToken || process.env.NOTION_TOKEN });
    this.syncMapPath = options.syncMapPath || path.join(__dirname, '.notion-sync-map.json');
    this.pollInterval = options.pollInterval || 60000; // 60 seconds
    this.rateLimitDelay = options.rateLimitDelay || 600; // 600ms between calls
    this.batchSize = options.batchSize || 10; // 10 pages per batch
    this.verbose = options.verbose || false;

    this.syncMap = null; // Loaded from file
    this.pollTimer = null; // Polling timer
    this.isPolling = false;
  }

  /**
   * Load sync map from disk
   * @returns {Promise<Object>} Sync map object
   */
  async loadSyncMap() {
    try {
      const data = await fs.readFile(this.syncMapPath, 'utf8');
      this.syncMap = JSON.parse(data);
      this.log(`Loaded sync map: ${this.syncMap.mappings.length} page(s)`);
      return this.syncMap;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, create new map
        this.syncMap = {
          version: '4.0.0',
          lastUpdated: new Date().toISOString(),
          mappings: [],
        };
        this.log('Created new sync map');
        return this.syncMap;
      }
      throw error;
    }
  }

  /**
   * Save sync map to disk
   * @returns {Promise<void>}
   */
  async saveSyncMap() {
    if (!this.syncMap) {
      throw new Error('Sync map not loaded');
    }

    this.syncMap.lastUpdated = new Date().toISOString();
    await fs.writeFile(this.syncMapPath, JSON.stringify(this.syncMap, null, 2), 'utf8');
    this.log('Saved sync map');
  }

  /**
   * Get mapping for a page
   * @param {string} pageId - Notion page ID
   * @returns {SyncMapping|null} Mapping or null if not found
   */
  getMapping(pageId) {
    if (!this.syncMap) {
      throw new Error('Sync map not loaded. Call loadSyncMap() first.');
    }

    return this.syncMap.mappings.find(m => m.pageId === pageId) || null;
  }

  /**
   * Get mapping by file path
   * @param {string} filePath - Local file path
   * @returns {SyncMapping|null} Mapping or null if not found
   */
  getMappingByPath(filePath) {
    if (!this.syncMap) {
      throw new Error('Sync map not loaded. Call loadSyncMap() first.');
    }

    return this.syncMap.mappings.find(m => m.filePath === filePath) || null;
  }

  /**
   * Register a new page mapping
   * @param {string} pageId - Notion page ID
   * @param {string} filePath - Local file path
   * @param {string} title - Page title
   * @param {Object} [options] - Additional options
   * @returns {Promise<SyncMapping>} The created mapping
   */
  async registerMapping(pageId, filePath, title, options = {}) {
    if (!this.syncMap) {
      await this.loadSyncMap();
    }

    // Check if already exists
    const existing = this.getMapping(pageId);
    if (existing) {
      this.log(`Mapping already exists for page ${pageId}`);
      return existing;
    }

    const mapping = {
      pageId,
      filePath,
      title,
      lastSyncGitToNotion: options.lastSyncGitToNotion || null,
      lastSyncNotionToGit: options.lastSyncNotionToGit || null,
      lastGitCommit: options.lastGitCommit || null,
      lastNotionEdit: options.lastNotionEdit || null,
      conflictStrategy: options.conflictStrategy || 'interactive',
    };

    this.syncMap.mappings.push(mapping);
    await this.saveSyncMap();

    this.log(`Registered mapping: ${title} (${pageId}) → ${filePath}`);
    return mapping;
  }

  /**
   * Update mapping after Git → Notion sync
   * @param {string} pageId - Notion page ID
   * @param {string} gitCommit - Git commit hash
   * @returns {Promise<void>}
   */
  async updateGitToNotionSync(pageId, gitCommit) {
    const mapping = this.getMapping(pageId);
    if (!mapping) {
      throw new Error(`No mapping found for page ${pageId}`);
    }

    mapping.lastSyncGitToNotion = new Date().toISOString();
    mapping.lastGitCommit = gitCommit;
    await this.saveSyncMap();

    this.log(`Updated Git→Notion sync: ${mapping.title}`);
  }

  /**
   * Update mapping after Notion → Git sync
   * @param {string} pageId - Notion page ID
   * @param {string} notionEditTime - Notion last_edited_time
   * @returns {Promise<void>}
   */
  async updateNotionToGitSync(pageId, notionEditTime) {
    const mapping = this.getMapping(pageId);
    if (!mapping) {
      throw new Error(`No mapping found for page ${pageId}`);
    }

    mapping.lastSyncNotionToGit = new Date().toISOString();
    mapping.lastNotionEdit = notionEditTime;
    await this.saveSyncMap();

    this.log(`Updated Notion→Git sync: ${mapping.title}`);
  }

  /**
   * Detect if a page has changed since last sync
   * @param {string} pageId - Notion page ID
   * @returns {Promise<ChangeDetectionResult>} Change detection result
   */
  async detectPageChange(pageId) {
    // Get mapping
    const mapping = this.getMapping(pageId);
    if (!mapping) {
      throw new Error(`No mapping found for page ${pageId}`);
    }

    // Fetch page from Notion
    const page = await this.notion.pages.retrieve({ page_id: pageId });

    const lastEditedTime = page.last_edited_time;
    const lastEditedBy = page.last_edited_by?.id || null;
    const lastSyncTime = mapping.lastSyncNotionToGit || mapping.lastSyncGitToNotion || null;

    // Determine if changed
    let changed = false;
    let needsSync = false;

    if (!lastSyncTime) {
      // Never synced before
      changed = true;
      needsSync = true;
    } else {
      const lastEditDate = new Date(lastEditedTime);
      const lastSyncDate = new Date(lastSyncTime);

      if (lastEditDate > lastSyncDate) {
        changed = true;
        // Add grace period (30 seconds) to avoid syncing during active editing
        const timeSinceEdit = Date.now() - lastEditDate.getTime();
        needsSync = timeSinceEdit > 30000; // 30 seconds grace period
      }
    }

    const result = {
      changed,
      lastEditedTime,
      lastEditedBy,
      lastSyncTime,
      timeSinceEdit: Date.now() - new Date(lastEditedTime).getTime(),
      needsSync,
    };

    this.log(`Change detection for ${mapping.title}: changed=${changed}, needsSync=${needsSync}`);
    return result;
  }

  /**
   * Detect changes for all tracked pages
   * @returns {Promise<Array<{pageId: string, title: string, result: ChangeDetectionResult}>>}
   */
  async detectAllChanges() {
    if (!this.syncMap) {
      await this.loadSyncMap();
    }

    const results = [];

    // Process in batches to respect rate limits
    for (let i = 0; i < this.syncMap.mappings.length; i += this.batchSize) {
      const batch = this.syncMap.mappings.slice(i, i + this.batchSize);

      for (const mapping of batch) {
        try {
          const result = await this.detectPageChange(mapping.pageId);
          results.push({
            pageId: mapping.pageId,
            title: mapping.title,
            filePath: mapping.filePath,
            result,
          });

          // Rate limit delay
          if (i + batch.indexOf(mapping) < this.syncMap.mappings.length - 1) {
            await this.sleep(this.rateLimitDelay);
          }
        } catch (error) {
          console.error(`Error detecting changes for ${mapping.title}: ${error.message}`);
          results.push({
            pageId: mapping.pageId,
            title: mapping.title,
            filePath: mapping.filePath,
            result: null,
            error: error.message,
          });
        }
      }
    }

    return results;
  }

  /**
   * Get pages that need syncing
   * @returns {Promise<Array<{pageId: string, title: string, filePath: string}>>}
   */
  async getPagesThatNeedSync() {
    const allChanges = await this.detectAllChanges();
    return allChanges
      .filter(item => item.result && item.result.needsSync)
      .map(item => ({
        pageId: item.pageId,
        title: item.title,
        filePath: item.filePath,
        lastEditedTime: item.result.lastEditedTime,
        lastEditedBy: item.result.lastEditedBy,
      }));
  }

  /**
   * Start continuous polling for changes
   * @param {Function} onChangeDetected - Callback when changes are detected
   * @returns {Promise<void>}
   */
  async startPolling(onChangeDetected) {
    if (this.isPolling) {
      this.log('Already polling');
      return;
    }

    if (!this.syncMap) {
      await this.loadSyncMap();
    }

    this.isPolling = true;
    this.log(`Started polling (interval: ${this.pollInterval}ms)`);

    // Initial check
    await this.pollOnce(onChangeDetected);

    // Set up interval
    this.pollTimer = setInterval(async () => {
      await this.pollOnce(onChangeDetected);
    }, this.pollInterval);
  }

  /**
   * Run a single poll cycle
   * @param {Function} onChangeDetected - Callback when changes are detected
   * @private
   */
  async pollOnce(onChangeDetected) {
    try {
      const pagesToSync = await this.getPagesThatNeedSync();

      if (pagesToSync.length > 0) {
        this.log(`Detected ${pagesToSync.length} page(s) that need syncing`);

        if (onChangeDetected) {
          await onChangeDetected(pagesToSync);
        }
      } else {
        this.log('No changes detected');
      }
    } catch (error) {
      console.error(`Error during polling: ${error.message}`);
    }
  }

  /**
   * Stop continuous polling
   */
  stopPolling() {
    if (!this.isPolling) {
      return;
    }

    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    this.isPolling = false;
    this.log('Stopped polling');
  }

  /**
   * Get sync statistics
   * @returns {Object} Statistics about sync state
   */
  getStats() {
    if (!this.syncMap) {
      throw new Error('Sync map not loaded');
    }

    const total = this.syncMap.mappings.length;
    const gitToNotionOnly = this.syncMap.mappings.filter(m => m.lastSyncGitToNotion && !m.lastSyncNotionToGit).length;
    const notionToGitOnly = this.syncMap.mappings.filter(m => m.lastSyncNotionToGit && !m.lastSyncGitToNotion).length;
    const bidirectional = this.syncMap.mappings.filter(m => m.lastSyncGitToNotion && m.lastSyncNotionToGit).length;
    const neverSynced = this.syncMap.mappings.filter(m => !m.lastSyncGitToNotion && !m.lastSyncNotionToGit).length;

    return {
      total,
      gitToNotionOnly,
      notionToGitOnly,
      bidirectional,
      neverSynced,
      lastUpdated: this.syncMap.lastUpdated,
    };
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   * @private
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log message if verbose mode is enabled
   * @param {string} message - Message to log
   * @private
   */
  log(message) {
    if (this.verbose) {
      console.log(`[ChangeDetection] ${message}`);
    }
  }
}

/**
 * Helper function to create and initialize change detection system
 * @param {Object} options - Options (same as ChangeDetectionSystem constructor)
 * @returns {Promise<ChangeDetectionSystem>} Initialized system
 */
export async function createChangeDetectionSystem(options = {}) {
  const system = new ChangeDetectionSystem(options);
  await system.loadSyncMap();
  return system;
}

export default ChangeDetectionSystem;
