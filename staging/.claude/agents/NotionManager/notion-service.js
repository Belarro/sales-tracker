/**
 * NotionManager Service API
 * Reusable functions for other CI agents to interact with Notion
 */

import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// Initialize Notion client
let notionClient = null;

function getClient() {
  if (!notionClient) {
    const token = process.env.NOTION_API_TOKEN;
    if (!token) {
      throw new Error('NOTION_API_TOKEN not configured');
    }
    notionClient = new Client({ auth: token });
  }
  return notionClient;
}

// Get database IDs from environment
const DB_IDS = {
  dashboard: process.env.NOTION_CI_DASHBOARD_ID,
  agents: process.env.NOTION_CI_AGENTS_DB_ID,
  sessions: process.env.NOTION_CI_SESSIONS_DB_ID,
  files: process.env.NOTION_CI_FILES_DB_ID,
};

/**
 * Service API for other agents
 */
export const NotionService = {
  /**
   * Log a session to Notion
   *
   * @param {Object} session - Session details
   * @param {string} session.title - Session title
   * @param {string} session.agent - Agent name
   * @param {string} session.status - Status (Completed, In Progress, Blocked)
   * @param {number} session.cost - Cost in USD
   * @param {number} session.filesRead - Files read count
   * @param {number} session.filesModified - Files modified count
   * @param {string} session.findings - Key findings
   * @param {string[]} session.tags - Tags for categorization
   * @param {string} session.details - Detailed description
   * @returns {Promise<Object>} Created page object
   */
  async logSession(session) {
    const notion = getClient();

    const page = await notion.pages.create({
      parent: { database_id: DB_IDS.sessions },
      icon: { type: 'emoji', emoji: session.icon || '📝' },
      properties: {
        Title: { title: [{ text: { content: session.title } }] },
        Agent: { select: { name: session.agent } },
        Date: { date: { start: session.date || new Date().toISOString() } },
        Status: { select: { name: session.status || 'Completed' } },
        'Cost ($)': { number: session.cost || 0 },
        'Files Read': { number: session.filesRead || 0 },
        'Files Modified': { number: session.filesModified || 0 },
        Findings: { rich_text: [{ text: { content: session.findings || '' } }] },
        Tags: { multi_select: (session.tags || []).map(tag => ({ name: tag })) },
      },
      children: session.details ? [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: { rich_text: [{ text: { content: session.details } }] },
        },
      ] : [],
    });

    return page;
  },

  /**
   * Update agent status in Notion
   *
   * @param {string} agentName - Name of the agent
   * @param {Object} updates - Properties to update
   * @param {string} updates.status - New status
   * @param {string} updates.phase - Current phase
   * @param {number} updates.totalSessions - Total sessions count
   * @param {number} updates.totalCost - Total cost
   * @returns {Promise<Object>} Updated page object
   */
  async updateAgentStatus(agentName, updates) {
    const notion = getClient();

    // Find agent page
    const existing = await notion.databases.query({
      database_id: DB_IDS.agents,
      filter: {
        property: 'Name',
        title: { contains: agentName },
      },
      page_size: 1,
    });

    if (existing.results.length === 0) {
      throw new Error(`Agent ${agentName} not found in Notion`);
    }

    const pageId = existing.results[0].id;
    const properties = {
      'Last Active': { date: { start: new Date().toISOString() } },
    };

    if (updates.status) {
      properties.Status = { select: { name: updates.status } };
    }
    if (updates.phase) {
      properties.Phase = { select: { name: updates.phase } };
    }
    if (updates.totalSessions !== undefined) {
      properties['Total Sessions'] = { number: updates.totalSessions };
    }
    if (updates.totalCost !== undefined) {
      properties['Total Cost'] = { number: updates.totalCost };
    }

    const page = await notion.pages.update({
      page_id: pageId,
      properties,
    });

    return page;
  },

  /**
   * Add file to catalog
   *
   * @param {Object} file - File details
   * @param {string} file.path - File path
   * @param {string} file.category - Category (Documentation, Implementation, etc.)
   * @param {number} file.lineCount - Number of lines
   * @param {number} file.sizeKB - Size in KB
   * @param {string} file.status - Status (Current, Historical, Outdated)
   * @param {string} file.purpose - Purpose description
   * @param {string[]} file.dependencies - Dependencies list
   * @returns {Promise<Object>} Created page object
   */
  async addFile(file) {
    const notion = getClient();

    const page = await notion.pages.create({
      parent: { database_id: DB_IDS.files },
      icon: { type: 'emoji', emoji: '📄' },
      properties: {
        'File Path': { title: [{ text: { content: file.path } }] },
        Category: { select: { name: file.category } },
        'Line Count': { number: file.lineCount || 0 },
        'Size (KB)': { number: file.sizeKB || 0 },
        'Last Modified': { date: { start: file.lastModified || new Date().toISOString() } },
        Status: { select: { name: file.status || 'Current' } },
        Purpose: { rich_text: [{ text: { content: file.purpose || '' } }] },
        Dependencies: {
          multi_select: (file.dependencies || []).map(dep => ({ name: dep })),
        },
      },
    });

    return page;
  },

  /**
   * Create a page with rich content
   *
   * @param {string} parentId - Parent page or database ID
   * @param {string} title - Page title
   * @param {Array} blocks - Array of Notion blocks
   * @param {Object} properties - Additional properties
   * @returns {Promise<Object>} Created page object
   */
  async createPage(parentId, title, blocks = [], properties = {}) {
    const notion = getClient();

    const page = await notion.pages.create({
      parent: { page_id: parentId },
      properties: {
        title: { title: [{ text: { content: title } }] },
        ...properties,
      },
      children: blocks,
    });

    return page;
  },

  /**
   * Search workspace
   *
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @param {string} options.filter - Filter by 'page' or 'database'
   * @param {number} options.pageSize - Number of results
   * @returns {Promise<Array>} Search results
   */
  async search(query, options = {}) {
    const notion = getClient();

    const searchParams = {
      query,
      page_size: options.pageSize || 20,
    };

    if (options.filter) {
      searchParams.filter = {
        property: 'object',
        value: options.filter,
      };
    }

    const response = await notion.search(searchParams);
    return response.results;
  },

  /**
   * Get database entries
   *
   * @param {string} databaseName - Database name (agents, sessions, files, or ID)
   * @param {Object} filter - Notion filter object
   * @param {number} pageSize - Number of results
   * @returns {Promise<Array>} Database entries
   */
  async queryDatabase(databaseName, filter = null, pageSize = 50) {
    const notion = getClient();

    // Map friendly names to IDs
    const dbId = DB_IDS[databaseName] || databaseName;

    if (!dbId) {
      throw new Error(`Unknown database: ${databaseName}`);
    }

    const params = {
      database_id: dbId,
      page_size: pageSize,
    };

    if (filter) {
      params.filter = filter;
    }

    const response = await notion.databases.query(params);
    return response.results;
  },

  /**
   * Get dashboard URL
   *
   * @returns {string} Dashboard URL
   */
  getDashboardURL() {
    const id = DB_IDS.dashboard;
    if (!id) return null;
    return `https://www.notion.so/${id.replace(/-/g, '')}`;
  },

  /**
   * Get database URLs
   *
   * @returns {Object} Database URLs
   */
  getDatabaseURLs() {
    return {
      agents: `https://www.notion.so/${DB_IDS.agents?.replace(/-/g, '')}`,
      sessions: `https://www.notion.so/${DB_IDS.sessions?.replace(/-/g, '')}`,
      files: `https://www.notion.so/${DB_IDS.files?.replace(/-/g, '')}`,
    };
  },
};

/**
 * Example usage:
 *
 * import { NotionService } from './notion-service.js';
 *
 * // Log a session
 * await NotionService.logSession({
 *   title: 'My Task',
 *   agent: 'Developer',
 *   status: 'Completed',
 *   cost: 0.05,
 *   filesRead: 10,
 *   filesModified: 3,
 *   findings: 'Successfully implemented feature X',
 *   tags: ['development', 'feature'],
 * });
 *
 * // Update agent status
 * await NotionService.updateAgentStatus('Developer', {
 *   status: 'Active',
 *   totalSessions: 15,
 *   totalCost: 0.50,
 * });
 *
 * // Add file to catalog
 * await NotionService.addFile({
 *   path: 'src/index.ts',
 *   category: 'Implementation',
 *   lineCount: 250,
 *   sizeKB: 8.5,
 *   status: 'Current',
 *   purpose: 'Main entry point',
 *   dependencies: ['@notionhq/client', 'dotenv'],
 * });
 *
 * // Search
 * const results = await NotionService.search('NotionManager', {
 *   filter: 'page',
 *   pageSize: 10,
 * });
 *
 * // Query database
 * const sessions = await NotionService.queryDatabase('sessions', {
 *   property: 'Agent',
 *   select: { equals: 'Developer' },
 * });
 */

export default NotionService;
