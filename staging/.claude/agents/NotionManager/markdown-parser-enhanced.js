/**
 * Enhanced Markdown to Notion Rich Text Parser (v3.5)
 * Supports all Notion annotation types + media blocks + equations
 *
 * Converts markdown formatting to Notion annotations:
 * - **bold** → { bold: true }
 * - *italic* → { italic: true }
 * - __underline__ → { underline: true }
 * - `code` → { code: true }
 * - ~~strikethrough~~ → { strikethrough: true }
 * - [text](url) → link
 * - <color>text</color> → { color: 'color' }
 * - <color_background>text</color_background> → { color: 'color_background' }
 * - ![alt text](url) → image block with external URL
 * - @PageName or [[Page Name]] → page mention (with pageMap)
 * - $$expression$$ → inline equation (KaTeX/LaTeX)
 * - $$\nexpression\n$$ → block equation (display mode)
 *
 * Supported colors:
 * - blue, brown, gray, green, orange, pink, purple, red, yellow
 * - blue_background, brown_background, etc.
 * - default
 *
 * Image captions:
 * - Line immediately after image starting with _ is treated as caption
 * - Or short plain text (< 100 chars) without markdown syntax
 *
 * Math equations (KaTeX):
 * - Inline: $$x^2$$ renders as equation inline
 * - Block: $$ on own line starts display equation, $$ on own line ends
 * - Supports LaTeX: fractions, superscripts, subscripts, Greek letters, etc.
 *
 * Note: Nested formatting (e.g., **bold with *italic* inside**) is not supported.
 * Use side-by-side formatting instead: **bold** and *italic*
 *
 * Examples:
 * - ✅ "**Bold** and *italic*" - Works great
 * - ✅ "<red>Red</red> and **bold**" - Works great
 * - ✅ "![diagram](https://example.com/img.png)" - Image
 * - ✅ "![diagram](url)\n_Caption text_" - Image with caption
 * - ✅ "$$x^2 + y^2 = z^2$$" - Inline equation
 * - ✅ "@PageName" or "[[Page]]" - Page link
 * - ❌ "**Bold with *italic* inside**" - Won't work as expected
 */

// All supported Notion colors
const NOTION_COLORS = new Set([
  'default',
  'gray', 'gray_background',
  'brown', 'brown_background',
  'orange', 'orange_background',
  'yellow', 'yellow_background',
  'green', 'green_background',
  'blue', 'blue_background',
  'purple', 'purple_background',
  'pink', 'pink_background',
  'red', 'red_background',
]);

/**
 * Enhanced parser with support for all Notion annotations
 * Uses sequential processing (left-to-right) without deep nesting
 *
 * @param {string} text - Text with markdown/HTML-style formatting
 * @returns {Array} Array of Notion rich text objects
 */
export function parseRichText(text) {
  if (!text || typeof text !== 'string') {
    return [{ type: 'text', text: { content: '' } }];
  }

  const richText = [];
  let remaining = text;

  // Enhanced pattern to match all formatting types
  // Order matters: process longer patterns first to avoid conflicts
  // Added: \$\$([^\$]+)\$\$ for inline equations
  const pattern = /(\$\$([^\$]+)\$\$|\[([^\]]+)\]\(([^)]+)\)|<([\w_]+)>([^<]+)<\/\5>|\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|~~([^~]+)~~|\*([^*]+)\*)/;

  while (remaining.length > 0) {
    const match = remaining.match(pattern);

    if (!match) {
      // No more formatting, add rest as plain text
      if (remaining.length > 0) {
        richText.push({
          type: 'text',
          text: { content: remaining },
        });
      }
      break;
    }

    // Add text before match as plain text
    const beforeMatch = remaining.substring(0, match.index);
    if (beforeMatch) {
      richText.push({
        type: 'text',
        text: { content: beforeMatch },
      });
    }

    // Process the matched formatting
    const matched = match[0];
    const annotations = {};
    let content = '';
    let linkUrl = null;

    // Determine match type and extract content
    if (match[2]) {
      // Inline equation: $$expression$$
      const expression = match[2];
      richText.push({
        type: 'equation',
        equation: { expression },
      });
      // Move past the match and continue
      remaining = remaining.substring(match.index + matched.length);
      continue;
    } else if (match[3] && match[4]) {
      // Link: [text](url)
      content = match[3];
      linkUrl = match[4];
    } else if (match[5] && match[6]) {
      // Color: <color>text</color>
      const colorName = match[5];
      content = match[6];
      if (NOTION_COLORS.has(colorName)) {
        annotations.color = colorName;
      } else {
        // Invalid color, treat as plain text
        content = matched;
      }
    } else if (match[7]) {
      // Bold: **text**
      content = match[7];
      annotations.bold = true;
    } else if (match[8]) {
      // Underline: __text__
      content = match[8];
      annotations.underline = true;
    } else if (match[9]) {
      // Code: `text`
      content = match[9];
      annotations.code = true;
    } else if (match[10]) {
      // Strikethrough: ~~text~~
      content = match[10];
      annotations.strikethrough = true;
    } else if (match[11]) {
      // Italic: *text*
      content = match[11];
      annotations.italic = true;
    }

    // Add the formatted text
    richText.push({
      type: 'text',
      text: {
        content,
        link: linkUrl ? { url: linkUrl } : null,
      },
      annotations: Object.keys(annotations).length > 0 ? annotations : undefined,
    });

    // Move past the match
    remaining = remaining.substring(match.index + matched.length);
  }

  // Return empty text object if nothing was parsed
  if (richText.length === 0) {
    return [{ type: 'text', text: { content: '' } }];
  }

  return richText;
}

/**
 * Enhanced parser with page link support
 * Supports @mentions and [[wiki-style]] links
 *
 * @param {string} text - Text with markdown/HTML-style formatting
 * @param {Map} pageMap - Map of page names -> page objects {id, title, url}
 * @returns {Array} Array of Notion rich text objects with mentions
 */
export function parseRichTextWithPageLinks(text, pageMap = new Map()) {
  if (!text || typeof text !== 'string') {
    return [{ type: 'text', text: { content: '' } }];
  }

  const richText = [];
  let remaining = text;

  // Enhanced pattern including page links and equations
  // Page links: @PageName or [[Page Name]]
  // Equations: $$expression$$
  // Order: equations and page links BEFORE regular links to avoid conflicts
  const pattern = /(\$\$([^\$]+)\$\$|\[\[([^\]]+)\]\]|@(\w+)|\[([^\]]+)\]\(([^)]+)\)|<([\w_]+)>([^<]+)<\/\7>|\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|~~([^~]+)~~|\*([^*]+)\*)/;

  while (remaining.length > 0) {
    const match = remaining.match(pattern);

    if (!match) {
      // No more formatting, add rest as plain text
      if (remaining.length > 0) {
        richText.push({
          type: 'text',
          text: { content: remaining },
        });
      }
      break;
    }

    // Add text before match as plain text
    const beforeMatch = remaining.substring(0, match.index);
    if (beforeMatch) {
      richText.push({
        type: 'text',
        text: { content: beforeMatch },
      });
    }

    // Process the matched formatting
    const matched = match[0];
    let richTextItem = null;

    // Check what type of match we have
    if (match[2]) {
      // Inline equation: $$expression$$
      richTextItem = {
        type: 'equation',
        equation: { expression: match[2] },
      };
    } else if (match[3]) {
      // Wiki-style link: [[Page Name]]
      const pageName = match[3].trim();
      const page = pageMap.get(pageName) || pageMap.get(pageName.toLowerCase());

      if (page && page.id) {
        // Create page mention
        richTextItem = {
          type: 'mention',
          mention: {
            type: 'page',
            page: { id: page.id },
          },
        };
      } else {
        // Page not found, treat as plain text
        richTextItem = {
          type: 'text',
          text: { content: matched },
        };
      }
    } else if (match[4]) {
      // @mention: @PageName
      const pageName = match[4];
      const page = pageMap.get(pageName) || pageMap.get(pageName.toLowerCase());

      if (page && page.id) {
        // Create page mention
        richTextItem = {
          type: 'mention',
          mention: {
            type: 'page',
            page: { id: page.id },
          },
        };
      } else {
        // Page not found, treat as plain text
        richTextItem = {
          type: 'text',
          text: { content: matched },
        };
      }
    } else if (match[5] && match[6]) {
      // Regular link: [text](url)
      richTextItem = {
        type: 'text',
        text: {
          content: match[5],
          link: { url: match[6] },
        },
      };
    } else if (match[7] && match[8]) {
      // Color: <color>text</color>
      const colorName = match[7];
      const content = match[8];
      if (NOTION_COLORS.has(colorName)) {
        richTextItem = {
          type: 'text',
          text: { content },
          annotations: { color: colorName },
        };
      } else {
        richTextItem = {
          type: 'text',
          text: { content: matched },
        };
      }
    } else if (match[9]) {
      // Bold: **text**
      richTextItem = {
        type: 'text',
        text: { content: match[9] },
        annotations: { bold: true },
      };
    } else if (match[10]) {
      // Underline: __text__
      richTextItem = {
        type: 'text',
        text: { content: match[10] },
        annotations: { underline: true },
      };
    } else if (match[11]) {
      // Code: `text`
      richTextItem = {
        type: 'text',
        text: { content: match[11] },
        annotations: { code: true },
      };
    } else if (match[12]) {
      // Strikethrough: ~~text~~
      richTextItem = {
        type: 'text',
        text: { content: match[12] },
        annotations: { strikethrough: true },
      };
    } else if (match[13]) {
      // Italic: *text*
      richTextItem = {
        type: 'text',
        text: { content: match[13] },
        annotations: { italic: true },
      };
    }

    if (richTextItem) {
      richText.push(richTextItem);
    }

    // Move past the match
    remaining = remaining.substring(match.index + matched.length);
  }

  // Return empty text object if nothing was parsed
  if (richText.length === 0) {
    return [{ type: 'text', text: { content: '' } }];
  }

  return richText;
}

/**
 * Convert markdown to Notion blocks with enhanced rich text formatting
 *
 * @param {string} markdown - Markdown content
 * @param {number} maxBlocks - Maximum number of blocks to create
 * @param {Map} pageMap - Optional map of page names -> page objects for link resolution
 * @returns {Array} Array of Notion block objects
 */
export function markdownToNotionBlocks(markdown, maxBlocks = 100, pageMap = null) {
  const lines = markdown.split('\n');
  const blocks = [];
  let i = 0;
  let blockCount = 0;

  // Helper to choose the right parser
  const parseText = (text) => {
    if (pageMap && pageMap.size > 0) {
      return parseRichTextWithPageLinks(text, pageMap);
    }
    return parseRichText(text);
  };

  while (i < lines.length && blockCount < maxBlocks) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Heading 1: # Text
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      const content = line.replace(/^# /, '').trim();
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: parseText(content),
        },
      });
      blockCount++;
    }
    // Heading 2: ## Text
    else if (line.startsWith('## ') && !line.startsWith('### ')) {
      const content = line.replace(/^## /, '').trim();
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: parseText(content),
        },
      });
      blockCount++;
    }
    // Heading 3: ### Text
    else if (line.startsWith('### ')) {
      const content = line.replace(/^### /, '').trim();
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: parseText(content),
        },
      });
      blockCount++;
    }
    // Checkbox: - [ ] Text or - [x] Text (check BEFORE bulleted list)
    else if (line.match(/^- \[([ xX])\] /)) {
      const checked = line.match(/\[[xX]\]/);
      const content = line.replace(/^- \[[^\]]\] /, '').trim();
      blocks.push({
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: parseText(content),
          checked: !!checked,
        },
      });
      blockCount++;
    }
    // Bulleted list: - Text or * Text
    else if (line.match(/^[-*] /)) {
      const content = line.replace(/^[-*] /, '').trim();
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: parseText(content),
        },
      });
      blockCount++;
    }
    // Numbered list: 1. Text
    else if (line.match(/^\d+\. /)) {
      const content = line.replace(/^\d+\. /, '').trim();
      blocks.push({
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: parseText(content),
        },
      });
      blockCount++;
    }
    // Code block: ```language (including mermaid diagrams)
    else if (line.startsWith('```')) {
      const language = line.replace('```', '').trim() || 'plain text';
      let code = '';
      i++;

      // Collect code lines
      while (i < lines.length && !lines[i].startsWith('```')) {
        code += lines[i] + '\n';
        i++;
      }

      // Map language names to Notion-supported languages
      let notionLanguage = language.toLowerCase();
      if (notionLanguage === 'bash' || notionLanguage === 'sh') {
        notionLanguage = 'shell';
      } else if (notionLanguage === 'js') {
        notionLanguage = 'javascript';
      } else if (notionLanguage === 'ts') {
        notionLanguage = 'typescript';
      } else if (notionLanguage === 'py') {
        notionLanguage = 'python';
      }
      // Note: mermaid is supported by Notion

      blocks.push({
        object: 'block',
        type: 'code',
        code: {
          rich_text: [{ type: 'text', text: { content: code.trim() } }],
          language: notionLanguage,
        },
      });
      blockCount++;
    }
    // Quote: > Text
    else if (line.startsWith('> ')) {
      const content = line.replace(/^> /, '').trim();
      blocks.push({
        object: 'block',
        type: 'quote',
        quote: {
          rich_text: parseText(content),
        },
      });
      blockCount++;
    }
    // Callout: !> Text or ?> Text or *> Text
    else if (line.match(/^[!?*]> /)) {
      const emoji = line[0] === '!' ? '⚠️' : line[0] === '?' ? 'ℹ️' : '⭐';
      const content = line.replace(/^[!?*]> /, '').trim();
      blocks.push({
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: parseText(content),
          icon: { type: 'emoji', emoji },
        },
      });
      blockCount++;
    }
    // Divider: --- or ***
    else if (line.match(/^(---|\*\*\*)$/)) {
      blocks.push({
        object: 'block',
        type: 'divider',
        divider: {},
      });
      blockCount++;
    }
    // Block equation: $$ on own line
    else if (line.trim() === '$$') {
      let expression = '';
      i++; // Move to next line

      // Collect equation lines until closing $$
      while (i < lines.length && lines[i].trim() !== '$$') {
        expression += lines[i] + '\n';
        i++;
      }

      // Remove trailing newline
      expression = expression.trim();

      if (expression) {
        blocks.push({
          object: 'block',
          type: 'equation',
          equation: { expression },
        });
        blockCount++;
      }
      // i is now at closing $$, will increment at end of loop
    }
    // Image: ![alt text](url)
    else if (line.match(/^!\[([^\]]*)\]\(([^)]+)\)/)) {
      const match = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
      const imageUrl = match[2];

      // Check if next line is a caption (starts with _ or is short plain text)
      let caption = [];
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        // Caption detection: starts with _ or is short text (< 100 chars) without markdown syntax
        if (nextLine && (
          nextLine.startsWith('_') ||
          (nextLine.length < 100 && !nextLine.match(/^[#>*\-\d`!?|]/) && !nextLine.startsWith('```'))
        )) {
          const captionText = nextLine.startsWith('_') ? nextLine.substring(1).trim() : nextLine;
          caption = parseText(captionText);
          i++; // Skip caption line
        }
      }

      const imageBlock = {
        object: 'block',
        type: 'image',
        image: {
          type: 'external',
          external: {
            url: imageUrl,
          },
        },
      };

      // Add caption if present
      if (caption.length > 0) {
        imageBlock.image.caption = caption;
      }

      blocks.push(imageBlock);
      blockCount++;
    }
    // Markdown table (convert to Notion table block)
    else if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      // Collect all consecutive table rows
      const tableLines = [];
      while (i < lines.length) {
        const tableLine = lines[i].trim();
        if (tableLine.startsWith('|') && tableLine.endsWith('|')) {
          tableLines.push(tableLine);
          i++;
        } else {
          break;
        }
      }
      i--; // Back up one since we'll increment at the end of the loop

      if (tableLines.length === 0) {
        i++;
        continue;
      }

      // Parse table rows
      const rows = tableLines.map(line => {
        // Split by | and remove empty first/last elements
        return line.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell.length > 0);
      });

      // Filter out separator rows (---|---|---)
      const dataRows = rows.filter(row => {
        return !row.every(cell => /^[-:]+$/.test(cell));
      });

      if (dataRows.length === 0) {
        i++;
        continue;
      }

      // Determine table width from first row
      const tableWidth = dataRows[0].length;

      // Create table block with rows as children
      const tableChildren = dataRows.map(row => {
        // Ensure all rows have the same width
        const cells = [];
        for (let j = 0; j < tableWidth; j++) {
          const cellContent = row[j] || '';
          cells.push(parseText(cellContent));
        }

        return {
          object: 'block',
          type: 'table_row',
          table_row: {
            cells: cells,
          },
        };
      });

      blocks.push({
        object: 'block',
        type: 'table',
        table: {
          table_width: tableWidth,
          has_column_header: dataRows.length > 1, // First row is header if more than 1 row
          has_row_header: false,
          children: tableChildren,
        },
      });
      blockCount++;
    }
    // Regular paragraph
    else if (line.trim().length > 0) {
      // Truncate very long lines
      const content = line.substring(0, 2000);
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: parseText(content),
        },
      });
      blockCount++;
    }

    i++;
  }

  return blocks;
}

/**
 * Test the enhanced parser with all formatting options
 */
export function testEnhancedParser() {
  const tests = [
    // Basic formatting
    '**Bold text**',
    '*Italic text*',
    '__Underlined text__',
    '`Code text`',
    '~~Strikethrough~~',

    // Links
    '[Click here](https://example.com)',
    '[Notion API](https://developers.notion.com)',

    // Colors
    '<red>Red text</red>',
    '<blue>Blue text</blue>',
    '<green_background>Green background</green_background>',
    '<yellow_background>Highlighted text</yellow_background>',

    // Multiple formats in one line (side-by-side, not nested)
    'Normal **bold** and <red>red</red> and [link](https://example.com)',
    '`code` with **bold** and *italic* and __underline__ mixed',
    '<yellow_background>Highlighted</yellow_background> with **bold** and [link](url)',

    // Edge cases
    'Multiple **bold items** in **one line**',
    'Text with <invalid>color</invalid> should be plain',
    '[Nested **bold** in](https://example.com) link',
  ];

  console.log('=== Enhanced Rich Text Parser Tests ===\n');

  tests.forEach((test, index) => {
    console.log(`Test ${index + 1}:`);
    console.log('Input:', test);
    const result = parseRichText(test);
    console.log('Output:', JSON.stringify(result, null, 2));
    console.log();
  });
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testEnhancedParser();
}
