/**
 * NotionManager v4.0.0 - Conflict Resolution Engine
 *
 * Detects and resolves conflicts when both Git and Notion have been modified.
 * Supports multiple resolution strategies: interactive, notion-wins, git-wins, last-write-wins.
 *
 * @module conflict-resolution-engine
 */

import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Conflict detection result
 * @typedef {Object} ConflictDetection
 * @property {boolean} isConflict - Whether a conflict exists
 * @property {boolean} gitModified - Whether Git file was modified
 * @property {boolean} notionModified - Whether Notion page was modified
 * @property {Date|null} gitModifiedTime - When Git file was last modified
 * @property {Date|null} notionModifiedTime - When Notion page was last edited
 * @property {Date|null} lastSyncTime - Last sync time
 * @property {string} recommendation - Recommended action
 */

/**
 * Conflict resolution result
 * @typedef {Object} ResolutionResult
 * @property {string} resolution - Resolution strategy used
 * @property {string} winner - Which side won (git|notion|manual)
 * @property {string} action - Action taken (sync-git-to-notion|sync-notion-to-git|manual-merge|skip)
 * @property {string} [reason] - Reason for resolution
 */

/**
 * ConflictResolutionEngine
 *
 * Detects conflicts and resolves them according to configured strategy.
 */
export class ConflictResolutionEngine {
  /**
   * @param {Object} options
   * @property {string} [defaultStrategy='interactive'] - Default resolution strategy
   * @property {string} [repoPath] - Path to Git repository
   * @property {boolean} [verbose=false] - Enable verbose logging
   */
  constructor(options = {}) {
    this.defaultStrategy = options.defaultStrategy || 'interactive';
    this.repoPath = options.repoPath || process.cwd();
    this.verbose = options.verbose || false;

    // Valid strategies
    this.strategies = ['interactive', 'notion-wins', 'git-wins', 'last-write-wins'];
  }

  /**
   * Detect if a conflict exists
   * @param {Object} params
   * @param {Date|string} params.notionLastEdited - Notion last_edited_time
   * @param {Date|string} params.lastSyncTime - Last sync time (Git→Notion or Notion→Git)
   * @param {string} params.filePath - Git file path
   * @returns {Promise<ConflictDetection>} Conflict detection result
   */
  async detectConflict(params) {
    const { notionLastEdited, lastSyncTime, filePath } = params;

    // Convert to Date objects
    const notionTime = new Date(notionLastEdited);
    const syncTime = lastSyncTime ? new Date(lastSyncTime) : null;

    // Get Git file modification time
    const gitTime = await this.getFileModificationTime(filePath);

    // Determine if modified since last sync
    const notionModified = syncTime ? notionTime > syncTime : true;
    const gitModified = gitTime && syncTime ? gitTime > syncTime : false;

    // Conflict exists if BOTH modified since last sync
    const isConflict = notionModified && gitModified;

    // Recommendation
    let recommendation;
    if (!isConflict) {
      if (notionModified) {
        recommendation = 'sync-notion-to-git';
      } else if (gitModified) {
        recommendation = 'sync-git-to-notion';
      } else {
        recommendation = 'no-action';
      }
    } else {
      recommendation = 'resolve-conflict';
    }

    this.log(`Conflict detection: ${filePath}`);
    this.log(`  Notion modified: ${notionModified} (${notionTime.toISOString()})`);
    this.log(`  Git modified: ${gitModified} (${gitTime?.toISOString() || 'N/A'})`);
    this.log(`  Is conflict: ${isConflict}`);

    return {
      isConflict,
      gitModified,
      notionModified,
      gitModifiedTime: gitTime,
      notionModifiedTime: notionTime,
      lastSyncTime: syncTime,
      recommendation,
    };
  }

  /**
   * Resolve a conflict using specified strategy
   * @param {ConflictDetection} conflict - Conflict detection result
   * @param {string} [strategy] - Strategy to use (overrides default)
   * @returns {Promise<ResolutionResult>} Resolution result
   */
  async resolveConflict(conflict, strategy) {
    const strategyToUse = strategy || this.defaultStrategy;

    if (!this.strategies.includes(strategyToUse)) {
      throw new Error(`Invalid strategy: ${strategyToUse}. Must be one of: ${this.strategies.join(', ')}`);
    }

    this.log(`Resolving conflict with strategy: ${strategyToUse}`);

    switch (strategyToUse) {
      case 'notion-wins':
        return this.resolveNotionWins(conflict);

      case 'git-wins':
        return this.resolveGitWins(conflict);

      case 'last-write-wins':
        return this.resolveLastWriteWins(conflict);

      case 'interactive':
        return this.resolveInteractive(conflict);

      default:
        throw new Error(`Unknown strategy: ${strategyToUse}`);
    }
  }

  /**
   * Resolve: Notion always wins
   * @param {ConflictDetection} conflict - Conflict
   * @returns {ResolutionResult}
   * @private
   */
  resolveNotionWins(conflict) {
    this.log('Resolution: Notion wins (sync Notion → Git)');

    return {
      resolution: 'notion-wins',
      winner: 'notion',
      action: 'sync-notion-to-git',
      reason: 'Notion-wins strategy: always prefer Notion content',
    };
  }

  /**
   * Resolve: Git always wins
   * @param {ConflictDetection} conflict - Conflict
   * @returns {ResolutionResult}
   * @private
   */
  resolveGitWins(conflict) {
    this.log('Resolution: Git wins (sync Git → Notion)');

    return {
      resolution: 'git-wins',
      winner: 'git',
      action: 'sync-git-to-notion',
      reason: 'Git-wins strategy: always prefer Git content',
    };
  }

  /**
   * Resolve: Most recent edit wins
   * @param {ConflictDetection} conflict - Conflict
   * @returns {ResolutionResult}
   * @private
   */
  resolveLastWriteWins(conflict) {
    const notionNewer = conflict.notionModifiedTime > conflict.gitModifiedTime;

    if (notionNewer) {
      this.log('Resolution: Last-write-wins → Notion (newer)');
      return {
        resolution: 'last-write-wins',
        winner: 'notion',
        action: 'sync-notion-to-git',
        reason: `Notion edited more recently (${conflict.notionModifiedTime.toISOString()})`,
      };
    } else {
      this.log('Resolution: Last-write-wins → Git (newer)');
      return {
        resolution: 'last-write-wins',
        winner: 'git',
        action: 'sync-git-to-notion',
        reason: `Git modified more recently (${conflict.gitModifiedTime.toISOString()})`,
      };
    }
  }

  /**
   * Resolve: Prompt user for decision
   * @param {ConflictDetection} conflict - Conflict
   * @returns {Promise<ResolutionResult>}
   * @private
   */
  async resolveInteractive(conflict) {
    console.log('\n' + '='.repeat(70));
    console.log('⚠️  CONFLICT DETECTED');
    console.log('='.repeat(70));
    console.log('\nBoth Git and Notion have been modified since last sync:\n');
    console.log(`Git modified:    ${conflict.gitModifiedTime?.toISOString() || 'N/A'}`);
    console.log(`Notion modified: ${conflict.notionModifiedTime.toISOString()}`);
    console.log(`Last sync:       ${conflict.lastSyncTime?.toISOString() || 'Never'}`);
    console.log('\nResolution options:');
    console.log('  1. Use Notion version (sync Notion → Git)');
    console.log('  2. Use Git version (sync Git → Notion)');
    console.log('  3. Skip this file (manual resolution required)');
    console.log('  4. Show diff (view differences)');

    // In non-interactive environment, fallback to notion-wins
    // TODO: Implement actual interactive prompt (readline, inquirer, etc.)
    console.log('\n⚠️  Interactive mode not fully implemented yet.');
    console.log('Falling back to notion-wins strategy.\n');

    return {
      resolution: 'interactive-fallback',
      winner: 'notion',
      action: 'sync-notion-to-git',
      reason: 'Interactive mode fallback: choosing Notion version',
    };
  }

  /**
   * Get file modification time from Git
   * @param {string} filePath - File path relative to repo root
   * @returns {Promise<Date|null>} Modification time or null if error
   * @private
   */
  async getFileModificationTime(filePath) {
    try {
      // Get last commit time for file
      const command = `cd "${this.repoPath}" && git log -1 --format="%aI" -- "${filePath}"`;
      const { stdout } = await execAsync(command);

      if (stdout.trim()) {
        return new Date(stdout.trim());
      }

      // If no Git history, check filesystem
      const stats = await fs.stat(filePath);
      return stats.mtime;
    } catch (error) {
      this.log(`Error getting file time for ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Show diff between Git and Notion versions
   * @param {string} gitContent - Git file content
   * @param {string} notionContent - Notion markdown content
   * @returns {string} Formatted diff
   */
  showDiff(gitContent, notionContent) {
    const gitLines = gitContent.split('\n');
    const notionLines = notionContent.split('\n');

    let diff = '\n--- Git Version ---\n';
    diff += `Lines: ${gitLines.length}\n`;
    diff += gitContent.substring(0, 500);
    diff += gitContent.length > 500 ? '\n...(truncated)...\n' : '\n';

    diff += '\n--- Notion Version ---\n';
    diff += `Lines: ${notionLines.length}\n`;
    diff += notionContent.substring(0, 500);
    diff += notionContent.length > 500 ? '\n...(truncated)...\n' : '\n';

    return diff;
  }

  /**
   * Log message if verbose mode is enabled
   * @param {string} message - Message to log
   * @private
   */
  log(message) {
    if (this.verbose) {
      console.log(`[ConflictResolution] ${message}`);
    }
  }
}

/**
 * Helper function to create conflict resolution engine
 * @param {Object} options - Options (same as ConflictResolutionEngine constructor)
 * @returns {ConflictResolutionEngine} Engine instance
 */
export function createConflictResolutionEngine(options = {}) {
  return new ConflictResolutionEngine(options);
}

export default ConflictResolutionEngine;
