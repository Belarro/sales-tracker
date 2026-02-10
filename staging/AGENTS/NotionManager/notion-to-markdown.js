#!/usr/bin/env node

/**
 * NotionToMarkdownConverter for v4.0.0
 *
 * Converts Notion blocks to Markdown (inverse of markdown-parser-optimized.js)
 *
 * Supports:
 * - 14 block types (headings, paragraphs, lists, code, tables, images, etc.)
 * - 24 rich text formats (bold, italic, code, strikethrough, links, colors)
 * - Nested formatting
 * - Tables with proper formatting
 * - Equations (inline and block)
 *
 * @author NotionManager v4.0
 * @date 2025-10-24
 */

/**
 * Color to markdown mapping
 * For colors without native markdown support, we use HTML-style tags
 */
const COLOR_TO_MARKDOWN = {
  red: 'red',
  orange: 'orange',
  yellow: 'yellow',
  green: 'green',
  blue: 'blue',
  purple: 'purple',
  pink: 'pink',
  brown: 'brown',
  gray: 'gray',
  red_background: 'red_background',
  orange_background: 'orange_background',
  yellow_background: 'yellow_background',
  green_background: 'green_background',
  blue_background: 'blue_background',
  purple_background: 'purple_background',
  pink_background: 'pink_background',
  brown_background: 'brown_background',
  gray_background: 'gray_background',
};

/**
 * NotionToMarkdownConverter
 *
 * Converts Notion API blocks to markdown format
 */
export class NotionToMarkdownConverter {
  constructor(options = {}) {
    this.options = {
      preserveColors: true,
      preservePageLinks: true,
      verbose: false,
      ...options,
    };
  }

  /**
   * Convert array of Notion blocks to markdown
   *
   * @param {Array} blocks - Array of Notion block objects
   * @returns {string} Markdown string
   */
  blocksToMarkdown(blocks) {
    if (!blocks || !Array.isArray(blocks)) {
      return '';
    }

    const markdown = blocks
      .map(block => this.blockToMarkdown(block))
      .filter(md => md !== null && md !== undefined)
      .join('\n\n');

    return markdown;
  }

  /**
   * Convert single Notion block to markdown
   *
   * @param {Object} block - Notion block object
   * @returns {string|null} Markdown string or null if unsupported
   */
  blockToMarkdown(block) {
    if (!block || !block.type) {
      return null;
    }

    const { type } = block;
    const blockData = block[type];

    if (!blockData) {
      return null;
    }

    switch (type) {
      // Headings
      case 'heading_1':
        return `# ${this.richTextToMarkdown(blockData.rich_text)}`;

      case 'heading_2':
        return `## ${this.richTextToMarkdown(blockData.rich_text)}`;

      case 'heading_3':
        return `### ${this.richTextToMarkdown(blockData.rich_text)}`;

      // Paragraph
      case 'paragraph':
        return this.richTextToMarkdown(blockData.rich_text);

      // Lists
      case 'bulleted_list_item':
        return `- ${this.richTextToMarkdown(blockData.rich_text)}`;

      case 'numbered_list_item':
        return `1. ${this.richTextToMarkdown(blockData.rich_text)}`;

      // To-do
      case 'to_do':
        const checkbox = blockData.checked ? '[x]' : '[ ]';
        return `- ${checkbox} ${this.richTextToMarkdown(blockData.rich_text)}`;

      // Code block
      case 'code':
        const language = blockData.language || 'plain text';
        const code = this.richTextToPlainText(blockData.rich_text);
        return `\`\`\`${language}\n${code}\n\`\`\``;

      // Quote
      case 'quote':
        return `> ${this.richTextToMarkdown(blockData.rich_text)}`;

      // Callout
      case 'callout':
        const icon = blockData.icon?.emoji || '💡';
        return `> ${icon} ${this.richTextToMarkdown(blockData.rich_text)}`;

      // Divider
      case 'divider':
        return '---';

      // Image
      case 'image':
        return this.imageToMarkdown(blockData);

      // Equation
      case 'equation':
        return `$\n${blockData.expression}\n$`;

      // Table
      case 'table':
        return this.tableToMarkdown(block);

      // Toggle
      case 'toggle':
        return `<details>\n<summary>${this.richTextToMarkdown(blockData.rich_text)}</summary>\n</details>`;

      // Link to page (mention)
      case 'link_to_page':
        if (blockData.page_id) {
          return `[[${blockData.page_id}]]`;
        }
        return null;

      // Unsupported but logged
      case 'bookmark':
      case 'embed':
      case 'video':
      case 'file':
      case 'pdf':
        if (this.options.verbose) {
          console.warn(`Unsupported block type: ${type}`);
        }
        return `<!-- Unsupported block type: ${type} -->`;

      default:
        if (this.options.verbose) {
          console.warn(`Unknown block type: ${type}`);
        }
        return null;
    }
  }

  /**
   * Convert Notion rich text array to markdown
   *
   * @param {Array} richTextArray - Array of Notion rich text objects
   * @returns {string} Markdown string
   */
  richTextToMarkdown(richTextArray) {
    if (!richTextArray || !Array.isArray(richTextArray)) {
      return '';
    }

    return richTextArray
      .map(rt => this.richTextItemToMarkdown(rt))
      .join('');
  }

  /**
   * Convert Notion rich text array to plain text (no formatting)
   *
   * @param {Array} richTextArray - Array of Notion rich text objects
   * @returns {string} Plain text string
   */
  richTextToPlainText(richTextArray) {
    if (!richTextArray || !Array.isArray(richTextArray)) {
      return '';
    }

    return richTextArray
      .map(rt => rt.plain_text || rt.text?.content || '')
      .join('');
  }

  /**
   * Convert single rich text item to markdown with formatting
   *
   * @param {Object} richText - Notion rich text object
   * @returns {string} Formatted markdown string
   */
  richTextItemToMarkdown(richText) {
    if (!richText) {
      return '';
    }

    // Handle different rich text types
    let text = '';

    switch (richText.type) {
      case 'text':
        text = richText.text?.content || richText.plain_text || '';

        // Apply link if present
        if (richText.text?.link?.url) {
          text = `[${text}](${richText.text.link.url})`;
        }
        break;

      case 'mention':
        text = this.mentionToMarkdown(richText.mention);
        break;

      case 'equation':
        text = `$$${richText.equation.expression}$$`;
        break;

      default:
        text = richText.plain_text || '';
    }

    // Apply annotations (formatting)
    if (richText.annotations) {
      text = this.applyAnnotations(text, richText.annotations);
    }

    return text;
  }

  /**
   * Apply formatting annotations to text
   *
   * @param {string} text - Text to format
   * @param {Object} annotations - Notion annotations object
   * @returns {string} Formatted text
   */
  applyAnnotations(text, annotations) {
    let formatted = text;

    // Order matters! Apply from most specific to least specific
    // to avoid conflicts with markdown syntax

    // Code (inline) - must be first to protect from other formatting
    if (annotations.code) {
      formatted = `\`${formatted}\``;
    }

    // Bold
    if (annotations.bold) {
      formatted = `**${formatted}**`;
    }

    // Italic
    if (annotations.italic) {
      formatted = `*${formatted}*`;
    }

    // Strikethrough
    if (annotations.strikethrough) {
      formatted = `~~${formatted}~~`;
    }

    // Underline (no native markdown, use HTML or double underscore)
    if (annotations.underline) {
      formatted = `__${formatted}__`;
    }

    // Color (if preserveColors is enabled)
    if (this.options.preserveColors && annotations.color && annotations.color !== 'default') {
      const colorName = COLOR_TO_MARKDOWN[annotations.color] || annotations.color;
      formatted = `<${colorName}>${formatted}</${colorName}>`;
    }

    return formatted;
  }

  /**
   * Convert Notion mention to markdown
   *
   * @param {Object} mention - Notion mention object
   * @returns {string} Markdown representation
   */
  mentionToMarkdown(mention) {
    if (!mention) {
      return '';
    }

    switch (mention.type) {
      case 'page':
        if (this.options.preservePageLinks && mention.page?.id) {
          return `[[${mention.page.id}]]`;
        }
        return '@page';

      case 'user':
        if (mention.user?.name) {
          return `@${mention.user.name}`;
        }
        return '@user';

      case 'date':
        if (mention.date?.start) {
          return mention.date.start;
        }
        return '';

      default:
        return '@mention';
    }
  }

  /**
   * Convert Notion image block to markdown
   *
   * @param {Object} imageData - Notion image block data
   * @returns {string} Markdown image syntax
   */
  imageToMarkdown(imageData) {
    let imageUrl = '';

    // Get image URL (external or file)
    if (imageData.type === 'external') {
      imageUrl = imageData.external?.url || '';
    } else if (imageData.type === 'file') {
      imageUrl = imageData.file?.url || '';
    }

    // Get caption
    const caption = this.richTextToMarkdown(imageData.caption || []);

    // Return markdown image
    if (imageUrl) {
      return `![${caption}](${imageUrl})`;
    }

    return '';
  }

  /**
   * Convert Notion table block to markdown table
   *
   * @param {Object} tableBlock - Notion table block
   * @returns {string} Markdown table
   */
  tableToMarkdown(tableBlock) {
    const tableData = tableBlock.table;

    if (!tableData || !tableData.children || tableData.children.length === 0) {
      return '';
    }

    const rows = tableData.children;
    const hasColumnHeader = tableData.has_column_header;
    const tableWidth = tableData.table_width;

    const markdownRows = [];

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (row.type !== 'table_row') {
        continue;
      }

      const cells = row.table_row.cells || [];
      const cellTexts = cells.map(cell => this.richTextToMarkdown(cell));

      // Ensure we have the right number of cells
      while (cellTexts.length < tableWidth) {
        cellTexts.push('');
      }

      markdownRows.push(`| ${cellTexts.join(' | ')} |`);

      // Add separator after header row
      if (i === 0 && hasColumnHeader) {
        const separator = '| ' + Array(tableWidth).fill('---').join(' | ') + ' |';
        markdownRows.push(separator);
      }
    }

    return markdownRows.join('\n');
  }

  /**
   * Convert markdown string to statistics
   *
   * @param {string} markdown - Markdown content
   * @returns {Object} Statistics
   */
  getStats(markdown) {
    if (!markdown) {
      return {
        characters: 0,
        lines: 0,
        words: 0,
        headings: 0,
        images: 0,
        codeBlocks: 0,
        tables: 0,
      };
    }

    const lines = markdown.split('\n');

    return {
      characters: markdown.length,
      lines: lines.length,
      words: markdown.split(/\s+/).filter(w => w.length > 0).length,
      headings: (markdown.match(/^#{1,6}\s/gm) || []).length,
      images: (markdown.match(/!\[.*?\]\(.*?\)/g) || []).length,
      codeBlocks: (markdown.match(/```/g) || []).length / 2,
      tables: (markdown.match(/^\|.*\|$/gm) || []).length,
    };
  }
}

/**
 * Helper function for quick conversion
 *
 * @param {Array} blocks - Array of Notion blocks
 * @param {Object} options - Conversion options
 * @returns {string} Markdown string
 */
export function notionToMarkdown(blocks, options = {}) {
  const converter = new NotionToMarkdownConverter(options);
  return converter.blocksToMarkdown(blocks);
}

export default NotionToMarkdownConverter;
