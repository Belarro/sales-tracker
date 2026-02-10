#!/usr/bin/env node

/**
 * Optimized Markdown Parser for NotionManager v3.6
 *
 * Performance improvements:
 * - Pre-compiled regex patterns (no recompilation overhead)
 * - Streaming mode for large documents (>5000 lines)
 * - Chunked processing to avoid blocking
 * - Smart pattern matching (early exit on match)
 * - Reduced string allocations
 */

/**
 * Pre-compiled regex patterns for performance
 * These are compiled once and reused throughout parsing
 */
const PATTERNS = {
  // Block patterns (line-level)
  heading: /^(#{1,6})\s+(.+)$/,
  blockEquation: /^\$$/,
  image: /^!\[([^\]]*)\]\(([^)]+)\)$/,
  codeBlock: /^```(\w*)$/,
  bulletList: /^[-*]\s+(.+)$/,
  numberList: /^(\d+)\.\s+(.+)$/,
  todoUnchecked: /^-\s*\[\s*\]\s+(.+)$/,
  todoChecked: /^-\s*\[x\]\s+(.+)$/i,
  blockquote: /^>\s*(.*)$/,
  divider: /^(---|\*\*\*|___)$/,
  tableRow: /^\|(.+)\|$/,

  // Inline patterns (text-level)
  inlineEquation: /\$\$([^\$]+)\$\$/,
  wikiLink: /\[\[([^\]]+)\]\]/,
  mention: /@(\w+)/,
  link: /\[([^\]]+)\]\(([^)]+)\)/,
  color: /<([\w_]+)>([^<]+)<\/\1>/,
  bold: /\*\*([^*]+)\*\*/,
  underline: /__([^_]+)__/,
  code: /`([^`]+)`/,
  strikethrough: /~~([^~]+)~~/,
  italic: /\*([^*]+)\*/,

  // Combined inline pattern (order matters!)
  inline: /(\$\$([^\$]+)\$\$|\[\[([^\]]+)\]\]|@(\w+)|\[([^\]]+)\]\(([^)]+)\)|<([\w_]+)>([^<]+)<\/\7>|\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|~~([^~]+)~~|\*([^*]+)\*)/,
};

/**
 * Color mapping (precomputed)
 */
const COLOR_MAP = {
  red: 'red',
  orange: 'orange',
  yellow: 'yellow',
  green: 'green',
  blue: 'blue',
  purple: 'purple',
  pink: 'pink',
  brown: 'brown',
  gray: 'gray',
  grey: 'gray',
  red_background: 'red_background',
  orange_background: 'orange_background',
  yellow_background: 'yellow_background',
  green_background: 'green_background',
  blue_background: 'blue_background',
  purple_background: 'purple_background',
  pink_background: 'pink_background',
  brown_background: 'brown_background',
  gray_background: 'gray_background',
  grey_background: 'gray_background',
};

/**
 * Parse inline text with formatting and page links
 * @param {string} text - Text to parse
 * @param {Map} pageMap - Optional page ID map
 * @returns {Array} Array of rich text objects
 */
function parseInlineText(text, pageMap = new Map()) {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const richText = [];
  let remaining = text;

  while (remaining.length > 0) {
    const match = remaining.match(PATTERNS.inline);

    if (!match) {
      // No more matches, add remaining text
      if (remaining.trim()) {
        richText.push({
          type: 'text',
          text: { content: remaining },
        });
      }
      break;
    }

    // Add text before match
    if (match.index > 0) {
      const before = remaining.substring(0, match.index);
      if (before.trim()) {
        richText.push({
          type: 'text',
          text: { content: before },
        });
      }
    }

    // Process match (order matches pattern groups)
    if (match[2]) {
      // Inline equation: $$..$$
      richText.push({
        type: 'equation',
        equation: { expression: match[2] },
      });
    } else if (match[3]) {
      // Wiki link: [[Page]]
      const pageName = match[3];
      const pageInfo = pageMap.get(pageName);

      if (pageInfo) {
        richText.push({
          type: 'mention',
          mention: {
            type: 'page',
            page: { id: pageInfo.id },
          },
        });
      } else {
        richText.push({
          type: 'text',
          text: { content: `[[${pageName}]]` },
        });
      }
    } else if (match[4]) {
      // @mention
      const pageName = match[4];
      const pageInfo = pageMap.get(pageName);

      if (pageInfo) {
        richText.push({
          type: 'mention',
          mention: {
            type: 'page',
            page: { id: pageInfo.id },
          },
        });
      } else {
        richText.push({
          type: 'text',
          text: { content: `@${pageName}` },
        });
      }
    } else if (match[5] && match[6]) {
      // Markdown link: [text](url)
      richText.push({
        type: 'text',
        text: {
          content: match[5],
          link: { url: match[6] },
        },
      });
    } else if (match[8] && match[7]) {
      // Color: <color>text</color>
      const colorName = match[7].toLowerCase();
      const content = match[8];

      richText.push({
        type: 'text',
        text: { content },
        annotations: {
          color: COLOR_MAP[colorName] || 'default',
        },
      });
    } else if (match[9]) {
      // Bold: **text**
      richText.push({
        type: 'text',
        text: { content: match[9] },
        annotations: { bold: true },
      });
    } else if (match[10]) {
      // Underline: __text__
      richText.push({
        type: 'text',
        text: { content: match[10] },
        annotations: { underline: true },
      });
    } else if (match[11]) {
      // Code: `text`
      richText.push({
        type: 'text',
        text: { content: match[11] },
        annotations: { code: true },
      });
    } else if (match[12]) {
      // Strikethrough: ~~text~~
      richText.push({
        type: 'text',
        text: { content: match[12] },
        annotations: { strikethrough: true },
      });
    } else if (match[13]) {
      // Italic: *text*
      richText.push({
        type: 'text',
        text: { content: match[13] },
        annotations: { italic: true },
      });
    }

    // Move past the match
    remaining = remaining.substring(match.index + match[0].length);
  }

  return richText;
}

/**
 * Parse markdown to Notion blocks (optimized)
 * @param {string} markdown - Markdown content
 * @param {number} maxBlocks - Maximum blocks to create
 * @param {Map} pageMap - Optional page ID map
 * @returns {Array} Array of Notion blocks
 */
export function markdownToNotionBlocks(markdown, maxBlocks = 100, pageMap = new Map()) {
  if (!markdown || typeof markdown !== 'string') {
    return [];
  }

  const lines = markdown.split('\n');
  const blocks = [];

  let i = 0;
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeContent = '';
  let inTable = false;
  let tableRows = [];
  let inBlockEquation = false;
  let equationContent = '';

  while (i < lines.length && blocks.length < maxBlocks) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines outside blocks
    if (!trimmed && !inCodeBlock && !inBlockEquation) {
      i++;
      continue;
    }

    // Block equation mode
    if (inBlockEquation) {
      if (trimmed === '$') {
        // End of equation
        if (equationContent.trim()) {
          blocks.push({
            object: 'block',
            type: 'equation',
            equation: { expression: equationContent.trim() },
          });
        }
        inBlockEquation = false;
        equationContent = '';
      } else {
        equationContent += line + '\n';
      }
      i++;
      continue;
    }

    // Code block mode
    if (inCodeBlock) {
      if (trimmed.startsWith('```')) {
        // End of code block
        blocks.push({
          object: 'block',
          type: 'code',
          code: {
            rich_text: [{ type: 'text', text: { content: codeContent } }],
            language: codeLanguage || 'plain text',
          },
        });
        inCodeBlock = false;
        codeContent = '';
        codeLanguage = '';
      } else {
        codeContent += line + '\n';
      }
      i++;
      continue;
    }

    // Table mode
    if (inTable) {
      if (PATTERNS.tableRow.test(trimmed)) {
        tableRows.push(trimmed);
      } else {
        // End of table, process it
        if (tableRows.length >= 2) {
          const table = parseTable(tableRows);
          if (table) blocks.push(table);
        }
        inTable = false;
        tableRows = [];
        continue; // Don't increment i, process this line normally
      }
      i++;
      continue;
    }

    // Start of block equation
    if (trimmed === '$') {
      inBlockEquation = true;
      i++;
      continue;
    }

    // Start of code block
    if (trimmed.startsWith('```')) {
      inCodeBlock = true;
      codeLanguage = trimmed.substring(3).trim();
      i++;
      continue;
    }

    // Start of table
    if (PATTERNS.tableRow.test(trimmed)) {
      inTable = true;
      tableRows.push(trimmed);
      i++;
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(PATTERNS.heading);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];

      blocks.push({
        object: 'block',
        type: `heading_${Math.min(level, 3)}`,
        [`heading_${Math.min(level, 3)}`]: {
          rich_text: parseInlineText(text, pageMap),
        },
      });
      i++;
      continue;
    }

    // Image with caption
    const imageMatch = trimmed.match(PATTERNS.image);
    if (imageMatch) {
      const imageUrl = imageMatch[2];
      let caption = [];

      // Check next line for caption
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine && (
          nextLine.startsWith('_') ||
          (nextLine.length < 100 && !nextLine.match(/^[#>*\-\d`!?|]/))
        )) {
          const captionText = nextLine.startsWith('_') ? nextLine.substring(1).trim() : nextLine;
          caption = parseInlineText(captionText, pageMap);
          i++; // Skip caption line
        }
      }

      blocks.push({
        object: 'block',
        type: 'image',
        image: {
          type: 'external',
          external: { url: imageUrl },
          caption: caption.length > 0 ? caption : undefined,
        },
      });
      i++;
      continue;
    }

    // Divider
    if (PATTERNS.divider.test(trimmed)) {
      blocks.push({
        object: 'block',
        type: 'divider',
        divider: {},
      });
      i++;
      continue;
    }

    // To-do items
    const todoUncheckedMatch = trimmed.match(PATTERNS.todoUnchecked);
    if (todoUncheckedMatch) {
      blocks.push({
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: parseInlineText(todoUncheckedMatch[1], pageMap),
          checked: false,
        },
      });
      i++;
      continue;
    }

    const todoCheckedMatch = trimmed.match(PATTERNS.todoChecked);
    if (todoCheckedMatch) {
      blocks.push({
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: parseInlineText(todoCheckedMatch[1], pageMap),
          checked: true,
        },
      });
      i++;
      continue;
    }

    // Bulleted list
    const bulletMatch = trimmed.match(PATTERNS.bulletList);
    if (bulletMatch) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: parseInlineText(bulletMatch[1], pageMap),
        },
      });
      i++;
      continue;
    }

    // Numbered list
    const numberMatch = trimmed.match(PATTERNS.numberList);
    if (numberMatch) {
      blocks.push({
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: parseInlineText(numberMatch[2], pageMap),
        },
      });
      i++;
      continue;
    }

    // Blockquote
    const quoteMatch = trimmed.match(PATTERNS.blockquote);
    if (quoteMatch) {
      blocks.push({
        object: 'block',
        type: 'quote',
        quote: {
          rich_text: parseInlineText(quoteMatch[1], pageMap),
        },
      });
      i++;
      continue;
    }

    // Default: paragraph
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: parseInlineText(trimmed, pageMap),
      },
    });
    i++;
  }

  // Handle unclosed blocks
  if (inTable && tableRows.length >= 2) {
    const table = parseTable(tableRows);
    if (table) blocks.push(table);
  }

  return blocks;
}

/**
 * Parse table rows into Notion table block
 */
function parseTable(rows) {
  if (rows.length < 2) return null;

  const headerCells = rows[0]
    .split('|')
    .map(c => c.trim())
    .filter(c => c.length > 0);

  const tableWidth = headerCells.length;
  const tableChildren = [];

  // Header row
  tableChildren.push({
    object: 'block',
    type: 'table_row',
    table_row: {
      cells: headerCells.map(cell => [
        {
          type: 'text',
          text: { content: cell },
          annotations: { bold: true },
        },
      ]),
    },
  });

  // Data rows (skip separator row at index 1)
  for (let i = 2; i < rows.length; i++) {
    const cells = rows[i]
      .split('|')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (cells.length === tableWidth) {
      tableChildren.push({
        object: 'block',
        type: 'table_row',
        table_row: {
          cells: cells.map(cell => [
            {
              type: 'text',
              text: { content: cell },
            },
          ]),
        },
      });
    }
  }

  return {
    object: 'block',
    type: 'table',
    table: {
      table_width: tableWidth,
      has_column_header: true,
      has_row_header: false,
      children: tableChildren,
    },
  };
}

/**
 * Streaming parser for very large documents
 * Processes in chunks to avoid blocking
 * @param {string} markdown - Markdown content
 * @param {Object} options - Options
 * @returns {AsyncGenerator} Block generator
 */
export async function* streamMarkdownToBlocks(markdown, options = {}) {
  const {
    chunkSize = 1000, // lines per chunk
    maxBlocks = 100,
    pageMap = new Map(),
    yieldDelay = 0, // ms to yield between chunks
  } = options;

  const lines = markdown.split('\n');
  let processedLines = 0;

  while (processedLines < lines.length) {
    const chunk = lines.slice(processedLines, processedLines + chunkSize);
    const chunkMarkdown = chunk.join('\n');

    const blocks = markdownToNotionBlocks(chunkMarkdown, maxBlocks, pageMap);

    yield blocks;

    processedLines += chunkSize;

    // Yield to event loop if specified
    if (yieldDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, yieldDelay));
    }
  }
}

/**
 * Test optimized parser performance
 */
async function testOptimizedParser() {
  console.log('=== Optimized Parser Performance Test ===\n');

  // Test 1: Small document
  console.log('Test 1: Small document (100 lines)...');
  const smallDoc = generateTestMarkdown(100);

  console.time('Parse 100 lines');
  const blocks1 = markdownToNotionBlocks(smallDoc);
  console.timeEnd('Parse 100 lines');

  console.log(`Blocks created: ${blocks1.length}\n`);

  // Test 2: Medium document
  console.log('Test 2: Medium document (1000 lines)...');
  const mediumDoc = generateTestMarkdown(1000);

  console.time('Parse 1000 lines');
  const blocks2 = markdownToNotionBlocks(mediumDoc);
  console.timeEnd('Parse 1000 lines');

  console.log(`Blocks created: ${blocks2.length}\n`);

  // Test 3: Large document
  console.log('Test 3: Large document (10000 lines)...');
  const largeDoc = generateTestMarkdown(10000);

  console.time('Parse 10000 lines');
  const blocks3 = markdownToNotionBlocks(largeDoc);
  console.timeEnd('Parse 10000 lines');

  console.log(`Blocks created: ${blocks3.length}\n`);

  // Test 4: Streaming large document
  console.log('Test 4: Streaming 10000 lines...');
  let totalBlocks = 0;

  console.time('Stream 10000 lines');
  for await (const chunkBlocks of streamMarkdownToBlocks(largeDoc, {
    chunkSize: 1000,
    yieldDelay: 0,
  })) {
    totalBlocks += chunkBlocks.length;
  }
  console.timeEnd('Stream 10000 lines');

  console.log(`Total blocks: ${totalBlocks}\n`);

  console.log('✅ All tests complete!');
}

/**
 * Generate test markdown
 */
function generateTestMarkdown(lines) {
  const content = [];

  for (let i = 0; i < lines; i++) {
    const type = i % 10;

    switch (type) {
      case 0:
        content.push(`# Heading ${i}`);
        break;
      case 1:
        content.push(`This is **bold** text in line ${i}`);
        break;
      case 2:
        content.push(`This is *italic* and \`code\` in line ${i}`);
        break;
      case 3:
        content.push(`- Bullet point ${i}`);
        break;
      case 4:
        content.push(`${i}. Numbered item`);
        break;
      case 5:
        content.push(`[Link ${i}](https://example.com/${i})`);
        break;
      case 6:
        content.push(`Inline equation: $$x^${i} + y = z$$`);
        break;
      case 7:
        content.push(`<red>Colored text ${i}</red>`);
        break;
      case 8:
        content.push(`> Quote ${i}`);
        break;
      default:
        content.push(`Regular paragraph ${i} with some text.`);
    }
  }

  return content.join('\n');
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testOptimizedParser().catch(console.error);
}
