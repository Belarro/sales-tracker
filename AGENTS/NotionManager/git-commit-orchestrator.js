/**
 * NotionManager v4.0.0 - Git Commit Orchestrator
 *
 * Handles automatic Git commits for Notion → Git syncs with proper attribution.
 * Follows conventional commit format and preserves Notion editor attribution.
 *
 * @module git-commit-orchestrator
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { Client } from '@notionhq/client';

const execAsync = promisify(exec);

/**
 * Git commit options
 * @typedef {Object} CommitOptions
 * @property {string} [message] - Custom commit message
 * @property {string} [author] - Author string (e.g., "Name <email>")
 * @property {string} [coAuthor] - Co-author for trailer
 * @property {boolean} [addFiles=true] - Whether to git add files first
 * @property {boolean} [push=false] - Whether to push after commit
 * @property {string} [branch] - Branch to commit to (default: current)
 */

/**
 * Notion user info
 * @typedef {Object} NotionUser
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email (if available)
 */

/**
 * Git Commit Result
 * @typedef {Object} CommitResult
 * @property {boolean} success - Whether commit succeeded
 * @property {string} [hash] - Commit hash (short)
 * @property {string} [message] - Commit message
 * @property {string} [error] - Error message if failed
 * @property {number} filesChanged - Number of files changed
 * @property {number} insertions - Number of insertions
 * @property {number} deletions - Number of deletions
 */

/**
 * GitCommitOrchestrator
 *
 * Manages Git commits for bidirectional sync with Notion attribution.
 */
export class GitCommitOrchestrator {
  /**
   * @param {Object} options
   * @param {string} [options.notionToken] - Notion API token
   * @param {string} [options.repoPath] - Path to Git repository (default: current directory)
   * @param {boolean} [options.verbose=false] - Enable verbose logging
   */
  constructor(options = {}) {
    this.notion = new Client({ auth: options.notionToken || process.env.NOTION_TOKEN });
    this.repoPath = options.repoPath || process.cwd();
    this.verbose = options.verbose || false;
    this.userCache = new Map(); // Cache Notion user lookups
  }

  /**
   * Get Notion user information
   * @param {string} userId - Notion user ID
   * @returns {Promise<NotionUser>} User information
   */
  async getNotionUser(userId) {
    // Check cache
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId);
    }

    try {
      const user = await this.notion.users.retrieve({ user_id: userId });

      const userInfo = {
        id: user.id,
        name: user.name || 'Unknown User',
        email: user.person?.email || null,
      };

      this.userCache.set(userId, userInfo);
      return userInfo;
    } catch (error) {
      this.log(`Error fetching user ${userId}: ${error.message}`);

      // Return fallback
      const fallback = {
        id: userId,
        name: 'Notion User',
        email: null,
      };
      this.userCache.set(userId, fallback);
      return fallback;
    }
  }

  /**
   * Execute Git command
   * @param {string} command - Git command to execute
   * @returns {Promise<string>} Command output
   * @private
   */
  async execGit(command) {
    const fullCommand = `cd "${this.repoPath}" && ${command}`;
    this.log(`Executing: ${command}`);

    try {
      const { stdout, stderr } = await execAsync(fullCommand);
      return stdout.trim();
    } catch (error) {
      throw new Error(`Git command failed: ${error.message}`);
    }
  }

  /**
   * Get current Git branch
   * @returns {Promise<string>} Current branch name
   */
  async getCurrentBranch() {
    const branch = await this.execGit('git rev-parse --abbrev-ref HEAD');
    return branch.trim();
  }

  /**
   * Get last commit hash
   * @param {boolean} [short=true] - Return short hash
   * @returns {Promise<string>} Commit hash
   */
  async getLastCommitHash(short = true) {
    const format = short ? '--short' : '';
    const hash = await this.execGit(`git rev-parse ${format} HEAD`);
    return hash.trim();
  }

  /**
   * Check if file has unstaged changes
   * @param {string} filePath - File path relative to repo root
   * @returns {Promise<boolean>} True if file has changes
   */
  async hasChanges(filePath) {
    try {
      const status = await this.execGit(`git status --porcelain "${filePath}"`);
      return status.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Add files to Git staging area
   * @param {string|string[]} files - File path(s) to add
   * @returns {Promise<void>}
   */
  async addFiles(files) {
    const fileList = Array.isArray(files) ? files : [files];

    for (const file of fileList) {
      await this.execGit(`git add "${file}"`);
      this.log(`Added: ${file}`);
    }
  }

  /**
   * Create a commit with Notion attribution
   * @param {string|string[]} files - File path(s) to commit
   * @param {Object} options
   * @param {string} options.title - Page title (for commit message)
   * @param {string} [options.notionUserId] - Notion user who edited the page
   * @param {string} [options.pageUrl] - Notion page URL
   * @param {string} [options.type='docs'] - Commit type (docs, feat, fix, etc.)
   * @param {boolean} [options.addFiles=true] - Whether to add files first
   * @param {boolean} [options.push=false] - Whether to push after commit
   * @returns {Promise<CommitResult>} Commit result
   */
  async commitNotionSync(files, options = {}) {
    const {
      title,
      notionUserId,
      pageUrl,
      type = 'docs',
      addFiles = true,
      push = false,
    } = options;

    try {
      // 1. Add files if requested
      if (addFiles) {
        await this.addFiles(files);
      }

      // 2. Get Notion user info (if user ID provided)
      let authorName = 'Notion User';
      let authorEmail = 'noreply@notion.so';

      if (notionUserId) {
        const user = await this.getNotionUser(notionUserId);
        authorName = user.name;
        authorEmail = user.email || 'noreply@notion.so';
      }

      // 3. Build commit message
      const fileList = Array.isArray(files) ? files : [files];
      const fileNames = fileList.map(f => f.split('/').pop()).join(', ');

      let message = `${type}: Update ${title} from Notion\n\n`;
      message += `Synced from Notion workspace.\n`;

      if (fileList.length === 1) {
        message += `File: ${fileNames}\n`;
      } else {
        message += `Files: ${fileNames}\n`;
      }

      if (pageUrl) {
        message += `Source: ${pageUrl}\n`;
      }

      message += `\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\n`;
      message += `Co-Authored-By: ${authorName} <${authorEmail}> (via Notion)\n`;
      message += `Co-Authored-By: NotionManager <noreply@notionmanager.io>`;

      // 4. Create commit
      const escapedMessage = message.replace(/"/g, '\\"').replace(/\n/g, '\\n');
      await this.execGit(`git commit -m "${escapedMessage}"`);

      // 5. Get commit hash
      const hash = await this.getLastCommitHash(true);

      // 6. Get stats
      const stats = await this.getCommitStats(hash);

      // 7. Push if requested
      if (push) {
        const branch = await this.getCurrentBranch();
        await this.execGit(`git push origin ${branch}`);
        this.log(`Pushed to origin/${branch}`);
      }

      this.log(`Created commit: ${hash}`);

      return {
        success: true,
        hash,
        message,
        filesChanged: stats.filesChanged,
        insertions: stats.insertions,
        deletions: stats.deletions,
      };
    } catch (error) {
      this.log(`Commit failed: ${error.message}`);

      return {
        success: false,
        error: error.message,
        filesChanged: 0,
        insertions: 0,
        deletions: 0,
      };
    }
  }

  /**
   * Get commit statistics
   * @param {string} hash - Commit hash
   * @returns {Promise<{filesChanged: number, insertions: number, deletions: number}>}
   */
  async getCommitStats(hash) {
    try {
      const stats = await this.execGit(`git show --stat --format="" ${hash}`);

      // Parse output like: " 3 files changed, 45 insertions(+), 12 deletions(-)"
      const match = stats.match(/(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(-\))?/);

      if (match) {
        return {
          filesChanged: parseInt(match[1]) || 0,
          insertions: parseInt(match[2]) || 0,
          deletions: parseInt(match[3]) || 0,
        };
      }

      return { filesChanged: 0, insertions: 0, deletions: 0 };
    } catch (error) {
      return { filesChanged: 0, insertions: 0, deletions: 0 };
    }
  }

  /**
   * Create a generic commit with custom message
   * @param {string|string[]} files - File path(s) to commit
   * @param {CommitOptions} options - Commit options
   * @returns {Promise<CommitResult>} Commit result
   */
  async commit(files, options = {}) {
    const {
      message,
      author,
      coAuthor,
      addFiles = true,
      push = false,
      branch,
    } = options;

    try {
      // 1. Checkout branch if specified
      if (branch) {
        const currentBranch = await this.getCurrentBranch();
        if (currentBranch !== branch) {
          await this.execGit(`git checkout ${branch}`);
        }
      }

      // 2. Add files
      if (addFiles) {
        await this.addFiles(files);
      }

      // 3. Build commit command
      let commitCmd = 'git commit';

      if (author) {
        commitCmd += ` --author="${author}"`;
      }

      // 4. Build message with co-author trailer
      let fullMessage = message || 'Update files';

      if (coAuthor) {
        fullMessage += `\n\nCo-Authored-By: ${coAuthor}`;
      }

      const escapedMessage = fullMessage.replace(/"/g, '\\"').replace(/\n/g, '\\n');
      commitCmd += ` -m "${escapedMessage}"`;

      // 5. Execute commit
      await this.execGit(commitCmd);

      // 6. Get commit hash
      const hash = await this.getLastCommitHash(true);

      // 7. Get stats
      const stats = await this.getCommitStats(hash);

      // 8. Push if requested
      if (push) {
        const currentBranch = await this.getCurrentBranch();
        await this.execGit(`git push origin ${currentBranch}`);
        this.log(`Pushed to origin/${currentBranch}`);
      }

      this.log(`Created commit: ${hash}`);

      return {
        success: true,
        hash,
        message: fullMessage,
        filesChanged: stats.filesChanged,
        insertions: stats.insertions,
        deletions: stats.deletions,
      };
    } catch (error) {
      this.log(`Commit failed: ${error.message}`);

      return {
        success: false,
        error: error.message,
        filesChanged: 0,
        insertions: 0,
        deletions: 0,
      };
    }
  }

  /**
   * Check if working directory is clean
   * @returns {Promise<boolean>} True if clean (no uncommitted changes)
   */
  async isWorkingDirectoryClean() {
    try {
      const status = await this.execGit('git status --porcelain');
      return status.length === 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get list of uncommitted changes
   * @returns {Promise<string[]>} List of changed file paths
   */
  async getUncommittedChanges() {
    try {
      const status = await this.execGit('git status --porcelain');

      return status
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => {
          // Format: "XY filename"
          const parts = line.trim().split(/\s+/);
          return parts[1] || '';
        })
        .filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  /**
   * Log message if verbose mode is enabled
   * @param {string} message - Message to log
   * @private
   */
  log(message) {
    if (this.verbose) {
      console.log(`[GitCommit] ${message}`);
    }
  }
}

/**
 * Helper function to create Git commit orchestrator
 * @param {Object} options - Options (same as GitCommitOrchestrator constructor)
 * @returns {GitCommitOrchestrator} Orchestrator instance
 */
export function createGitCommitOrchestrator(options = {}) {
  return new GitCommitOrchestrator(options);
}

export default GitCommitOrchestrator;
