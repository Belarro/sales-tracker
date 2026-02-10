/**
 * Notion client singleton with rate limiting
 */
import { Client } from '@notionhq/client';
import { rateLimitedFetch } from './rate-limit.js';

let notionClientInstance: Client | null = null;

export interface NotionClientConfig {
  auth?: string;
  rateLimitMs?: number;
}

export async function getNotionClient(
  config?: NotionClientConfig
): Promise<Client> {
  if (!notionClientInstance) {
    const token = config?.auth || process.env.NOTION_API_TOKEN;

    if (!token) {
      throw new Error(
        'NOTION_API_TOKEN environment variable is required. ' +
          'Get your token from: https://www.notion.so/my-integrations'
      );
    }

    // Create client with rate-limited fetch
    notionClientInstance = new Client({
      auth: token,
      fetch: rateLimitedFetch as any,
    });

    // Validate connection
    try {
      await notionClientInstance.users.me({});
      console.log('[Notion Client] Connection validated');
    } catch (error: any) {
      notionClientInstance = null;
      throw new Error(
        `Failed to connect to Notion API: ${error.message}. ` +
          'Please check your NOTION_API_TOKEN.'
      );
    }
  }

  return notionClientInstance;
}

/**
 * Reset the client instance (useful for testing or token changes)
 */
export function resetNotionClient(): void {
  notionClientInstance = null;
}
