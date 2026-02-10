/**
 * NotionManager Agent - Main Entry Point
 *
 * Phase 1: Official Notion MCP Server Integration
 */

export { notionAgent } from './agent/definition.js';
export { getNotionClient, resetNotionClient } from './utils/client.js';
export type { NotionClientConfig } from './utils/client.js';
export {
  handleNotionError,
  createSuccessResponse,
  isErrorResponse,
  isSuccessResponse,
} from './utils/errors.js';
export type {
  NotionErrorResponse,
  NotionSuccessResponse,
  NotionResponse,
} from './utils/errors.js';
export {
  fetchBlocksRecursively,
  blocksToText,
  createRichText,
  createParagraph,
  createHeading,
  createCodeBlock,
  createBulletedListItem,
  createTodoItem,
} from './utils/blocks.js';
export { getRateLimitConfig } from './utils/rate-limit.js';

// Re-export commonly used Notion types
export type {
  Client,
  BlockObjectResponse,
  PageObjectResponse,
  DatabaseObjectResponse,
} from '@notionhq/client/build/src/api-endpoints.js';

/**
 * Quick start example:
 *
 * ```typescript
 * import { notionAgent, getNotionClient } from '@ci/notion-manager';
 * import { query } from '@anthropic-ai/claude-agent-sdk';
 *
 * // Ensure NOTION_API_TOKEN is set
 * process.env.NOTION_API_TOKEN = 'secret_xxxxx';
 *
 * // Validate connection
 * await getNotionClient();
 *
 * // Run agent
 * for await (const message of query({
 *   prompt: 'Create a new page titled "My Project"',
 *   options: {
 *     systemPrompt: notionAgent.systemPrompt,
 *     model: notionAgent.model,
 *     tools: notionAgent.tools,
 *   }
 * })) {
 *   if (message.type === 'text') {
 *     console.log(message.text);
 *   }
 * }
 * ```
 */
