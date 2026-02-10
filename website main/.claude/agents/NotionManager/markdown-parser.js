/**
 * Markdown to Notion Rich Text Parser
 * Based on TokenHunter's proven pattern
 *
 * Converts markdown formatting to Notion annotations:
 * - **bold** → { bold: true }
 * - *italic* → { italic: true }
 * - `code` → { code: true }
 * - ~~strikethrough~~ → { strikethrough: true }
 */

/**
 * Parse text with markdown formatting and convert to Notion rich text array
 *
 * @param {string} text - Text with markdown formatting
 * @returns {Array} Array of Notion rich text objects
 */
export function parseRichText(text) {
  if (!text || typeof text !== 'string') {
    return [{ type: 'text', text: { content: '' } }];
  }

  const richText = [];
  let remaining = text;

  // Pattern to match: **bold**, *italic*, `code`, ~~strikethrough~~
  // Using non-greedy matching to handle multiple formats in one line
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|~~[^~]+~~)/;

  while (remaining.length > 0) {
    const match = remaining.match(pattern);

    if (!match) {
      // No more formatting, add rest as plain text
      if (remaining.trim()) {
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
    let content = matched;
    const annotations = {};

    // Bold: **text**
    if (matched.startsWith('**') && matched.endsWith('**')) {
      content = matched.slice(2, -2);
      annotations.bold = true;
    }
    // Italic: *text*
    else if (matched.startsWith('*') && matched.endsWith('*') && !matched.startsWith('**')) {
      content = matched.slice(1, -1);
      annotations.italic = true;
    }
    // Code: `text`
    else if (matched.startsWith('`') && matched.endsWith('`')) {
      content = matched.slice(1, -1);
      annotations.code = true;
    }
    // Strikethrough: ~~text~~
    else if (matched.startsWith('~~') && matched.endsWith('~~')) {
      content = matched.slice(2, -2);
      annotations.strikethrough = true;
    }

    richText.push({
      type: 'text',
      text: { content },
      annotations,
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
 * Convert markdown to Notion blocks with rich text formatting
 *
 * @param {string} markdown - Markdown content
 * @param {number} maxBlocks - Maximum number of blocks to create
 * @returns {Array} Array of Notion block objects
 */
export function markdownToNotionBlocks(markdown, maxBlocks = 100) {
  const lines = markdown.split('\n');
  const blocks = [];
  let i = 0;
  let blockCount = 0;

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
          rich_text: parseRichText(content),
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
          rich_text: parseRichText(content),
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
          rich_text: parseRichText(content),
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
          rich_text: parseRichText(content),
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
          rich_text: parseRichText(content),
        },
      });
      blockCount++;
    }
    // Checkbox: - [ ] Text or - [x] Text
    else if (line.match(/^- \[([ x])\] /)) {
      const checked = line.includes('[x]');
      const content = line.replace(/^- \[.\] /, '').trim();
      blocks.push({
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: parseRichText(content),
          checked,
        },
      });
      blockCount++;
    }
    // Code block: ```language
    else if (line.startsWith('```')) {
      const language = line.replace('```', '').trim() || 'plain text';
      let code = '';
      i++;

      // Collect code lines
      while (i < lines.length && !lines[i].startsWith('```')) {
        code += lines[i] + '\n';
        i++;
      }

      blocks.push({
        object: 'block',
        type: 'code',
        code: {
          rich_text: [{ type: 'text', text: { content: code.trim() } }],
          language: language === 'bash' || language === 'sh' ? 'shell' : language,
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
          rich_text: parseRichText(content),
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
    // Regular paragraph
    else if (line.trim().length > 0) {
      // Truncate very long lines
      const content = line.substring(0, 2000);
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: parseRichText(content),
        },
      });
      blockCount++;
    }

    i++;
  }

  return blocks;
}

/**
 * Test the parser with examples
 */
export function testParser() {
  const tests = [
    '**Bold text**',
    '*Italic text*',
    '`Code text`',
    '~~Strikethrough~~',
    'Normal **bold** and *italic* mixed',
    '**Bold** with `code` and *italic*',
    'Multiple **bold items** in **one line**',
  ];

  console.log('=== Rich Text Parser Tests ===\n');

  tests.forEach(test => {
    console.log('Input:', test);
    console.log('Output:', JSON.stringify(parseRichText(test), null, 2));
    console.log();
  });
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testParser();
}
