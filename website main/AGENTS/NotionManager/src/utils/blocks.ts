/**
 * Utility functions for working with Notion blocks
 */
import type { Client } from '@notionhq/client';
import type {
  BlockObjectResponse,
  PartialBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints.js';

export type Block = BlockObjectResponse | PartialBlockObjectResponse;

/**
 * Recursively fetch all blocks from a page or block
 *
 * @param client - Notion client instance
 * @param blockId - ID of the parent block or page
 * @param maxDepth - Maximum recursion depth (default: 2)
 * @param currentDepth - Current recursion depth (internal use)
 * @returns Array of blocks with nested children
 */
export async function fetchBlocksRecursively(
  client: Client,
  blockId: string,
  maxDepth: number = 2,
  currentDepth: number = 0
): Promise<Block[]> {
  if (currentDepth >= maxDepth) {
    return [];
  }

  const blocks: Block[] = [];
  let cursor: string | undefined;

  try {
    do {
      const response = await client.blocks.children.list({
        block_id: blockId,
        start_cursor: cursor,
        page_size: 100, // Max allowed by Notion
      });

      for (const block of response.results as Block[]) {
        blocks.push(block);

        // Recursively fetch children if block has them
        if ('has_children' in block && block.has_children) {
          const children = await fetchBlocksRecursively(
            client,
            block.id,
            maxDepth,
            currentDepth + 1
          );

          // Add children to block object
          (block as any).children = children;
        }
      }

      cursor = response.next_cursor || undefined;
    } while (cursor);

    return blocks;
  } catch (error) {
    console.error(`[Blocks] Error fetching blocks for ${blockId}:`, error);
    throw error;
  }
}

/**
 * Convert blocks to a simplified text representation
 *
 * @param blocks - Array of Notion blocks
 * @param indent - Current indentation level
 * @returns Formatted text string
 */
export function blocksToText(blocks: Block[], indent: number = 0): string {
  const indentStr = '  '.repeat(indent);
  let text = '';

  for (const block of blocks) {
    if (!('type' in block)) continue;

    const blockType = block.type;

    // Extract text content based on block type
    let content = '';
    const blockData = (block as any)[blockType];

    if (blockData?.rich_text) {
      content = blockData.rich_text
        .map((rt: any) => rt.plain_text || rt.text?.content || '')
        .join('');
    }

    // Format based on block type
    switch (blockType) {
      case 'heading_1':
        text += `${indentStr}# ${content}\n`;
        break;
      case 'heading_2':
        text += `${indentStr}## ${content}\n`;
        break;
      case 'heading_3':
        text += `${indentStr}### ${content}\n`;
        break;
      case 'paragraph':
        text += `${indentStr}${content}\n`;
        break;
      case 'bulleted_list_item':
        text += `${indentStr}- ${content}\n`;
        break;
      case 'numbered_list_item':
        text += `${indentStr}1. ${content}\n`;
        break;
      case 'to_do':
        const checked = blockData?.checked ? '[x]' : '[ ]';
        text += `${indentStr}${checked} ${content}\n`;
        break;
      case 'code':
        const language = blockData?.language || 'text';
        text += `${indentStr}\`\`\`${language}\n${content}\n\`\`\`\n`;
        break;
      case 'quote':
        text += `${indentStr}> ${content}\n`;
        break;
      case 'divider':
        text += `${indentStr}---\n`;
        break;
      default:
        if (content) {
          text += `${indentStr}${content}\n`;
        }
    }

    // Process children if present
    if ((block as any).children) {
      text += blocksToText((block as any).children, indent + 1);
    }
  }

  return text;
}

/**
 * Create a simple rich text object
 *
 * @param content - Text content
 * @param annotations - Optional text annotations
 * @returns Rich text object
 */
export function createRichText(
  content: string,
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: string;
  }
): any {
  return {
    type: 'text',
    text: {
      content,
    },
    annotations: annotations || {},
  };
}

/**
 * Create a paragraph block
 */
export function createParagraph(content: string): any {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [createRichText(content)],
    },
  };
}

/**
 * Create a heading block
 */
export function createHeading(
  level: 1 | 2 | 3,
  content: string
): any {
  const type = `heading_${level}`;
  return {
    object: 'block',
    type,
    [type]: {
      rich_text: [createRichText(content)],
    },
  };
}

/**
 * Create a code block
 */
export function createCodeBlock(content: string, language: string = 'javascript'): any {
  return {
    object: 'block',
    type: 'code',
    code: {
      rich_text: [createRichText(content)],
      language,
    },
  };
}

/**
 * Create a bulleted list item
 */
export function createBulletedListItem(content: string): any {
  return {
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [createRichText(content)],
    },
  };
}

/**
 * Create a to-do item
 */
export function createTodoItem(content: string, checked: boolean = false): any {
  return {
    object: 'block',
    type: 'to_do',
    to_do: {
      rich_text: [createRichText(content)],
      checked,
    },
  };
}
