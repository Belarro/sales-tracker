#!/usr/bin/env node

/**
 * Comprehensive tests for NotionToMarkdownConverter
 *
 * Tests all 14 block types and 24 rich text formats
 *
 * @author NotionManager v4.0
 * @date 2025-10-24
 */

import { NotionToMarkdownConverter, notionToMarkdown } from './notion-to-markdown.js';

/**
 * Test utilities
 */
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
    };
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('=== NotionToMarkdown Converter Test Suite ===\n');

    for (const { name, fn } of this.tests) {
      this.results.total++;

      try {
        await fn();
        this.results.passed++;
        console.log(`✅ ${name}`);
      } catch (error) {
        this.results.failed++;
        console.log(`❌ ${name}`);
        console.log(`   Error: ${error.message}\n`);
      }
    }

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total: ${this.results.total} | Passed: ${this.results.passed} | Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    console.log('='.repeat(70));

    if (this.results.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED!\n');
    } else {
      console.log(`\n⚠️  ${this.results.failed} test(s) failed\n`);
    }
  }
}

function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(
      `${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`
    );
  }
}

function assertContains(haystack, needle, message = '') {
  if (!haystack.includes(needle)) {
    throw new Error(`${message}\nExpected to contain: ${needle}\nActual: ${haystack}`);
  }
}

/**
 * Test data - Notion API block examples
 */
const TEST_BLOCKS = {
  // Headings
  heading1: {
    type: 'heading_1',
    heading_1: {
      rich_text: [{ type: 'text', text: { content: 'Main Heading' }, plain_text: 'Main Heading' }],
    },
  },

  heading2: {
    type: 'heading_2',
    heading_2: {
      rich_text: [{ type: 'text', text: { content: 'Subheading' }, plain_text: 'Subheading' }],
    },
  },

  heading3: {
    type: 'heading_3',
    heading_3: {
      rich_text: [{ type: 'text', text: { content: 'Sub-subheading' }, plain_text: 'Sub-subheading' }],
    },
  },

  // Paragraph
  paragraph: {
    type: 'paragraph',
    paragraph: {
      rich_text: [{ type: 'text', text: { content: 'This is a paragraph.' }, plain_text: 'This is a paragraph.' }],
    },
  },

  // Paragraph with formatting
  paragraphBold: {
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: { content: 'This is bold text' },
          plain_text: 'This is bold text',
          annotations: { bold: true },
        },
      ],
    },
  },

  paragraphItalic: {
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: { content: 'This is italic text' },
          plain_text: 'This is italic text',
          annotations: { italic: true },
        },
      ],
    },
  },

  paragraphCode: {
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: { content: 'inline code' },
          plain_text: 'inline code',
          annotations: { code: true },
        },
      ],
    },
  },

  paragraphStrikethrough: {
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: { content: 'strikethrough text' },
          plain_text: 'strikethrough text',
          annotations: { strikethrough: true },
        },
      ],
    },
  },

  paragraphUnderline: {
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: { content: 'underlined text' },
          plain_text: 'underlined text',
          annotations: { underline: true },
        },
      ],
    },
  },

  // Lists
  bulletListItem: {
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [{ type: 'text', text: { content: 'Bullet point' }, plain_text: 'Bullet point' }],
    },
  },

  numberedListItem: {
    type: 'numbered_list_item',
    numbered_list_item: {
      rich_text: [{ type: 'text', text: { content: 'Numbered item' }, plain_text: 'Numbered item' }],
    },
  },

  todoUnchecked: {
    type: 'to_do',
    to_do: {
      checked: false,
      rich_text: [{ type: 'text', text: { content: 'Todo item' }, plain_text: 'Todo item' }],
    },
  },

  todoChecked: {
    type: 'to_do',
    to_do: {
      checked: true,
      rich_text: [{ type: 'text', text: { content: 'Done item' }, plain_text: 'Done item' }],
    },
  },

  // Code block
  codeBlock: {
    type: 'code',
    code: {
      language: 'javascript',
      rich_text: [
        {
          type: 'text',
          text: { content: 'const x = 42;\nconsole.log(x);' },
          plain_text: 'const x = 42;\nconsole.log(x);',
        },
      ],
    },
  },

  // Quote
  quote: {
    type: 'quote',
    quote: {
      rich_text: [{ type: 'text', text: { content: 'This is a quote' }, plain_text: 'This is a quote' }],
    },
  },

  // Callout
  callout: {
    type: 'callout',
    callout: {
      icon: { emoji: '💡' },
      rich_text: [{ type: 'text', text: { content: 'Important note' }, plain_text: 'Important note' }],
    },
  },

  // Divider
  divider: {
    type: 'divider',
    divider: {},
  },

  // Image
  image: {
    type: 'image',
    image: {
      type: 'external',
      external: { url: 'https://example.com/image.png' },
      caption: [{ type: 'text', text: { content: 'Image caption' }, plain_text: 'Image caption' }],
    },
  },

  // Equation
  equation: {
    type: 'equation',
    equation: {
      expression: 'x^2 + y^2 = z^2',
    },
  },

  // Link
  link: {
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: 'Click here',
            link: { url: 'https://example.com' },
          },
          plain_text: 'Click here',
        },
      ],
    },
  },

  // Inline equation
  inlineEquation: {
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'equation',
          equation: { expression: 'E = mc^2' },
          plain_text: 'E = mc^2',
        },
      ],
    },
  },

  // Color
  coloredText: {
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: { content: 'Red text' },
          plain_text: 'Red text',
          annotations: { color: 'red' },
        },
      ],
    },
  },

  // Nested formatting
  nestedFormatting: {
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: { content: 'Bold and italic' },
          plain_text: 'Bold and italic',
          annotations: { bold: true, italic: true },
        },
      ],
    },
  },

  // Mixed rich text
  mixedRichText: {
    type: 'paragraph',
    paragraph: {
      rich_text: [
        { type: 'text', text: { content: 'Normal ' }, plain_text: 'Normal ' },
        {
          type: 'text',
          text: { content: 'bold' },
          plain_text: 'bold',
          annotations: { bold: true },
        },
        { type: 'text', text: { content: ' and ' }, plain_text: ' and ' },
        {
          type: 'text',
          text: { content: 'italic' },
          plain_text: 'italic',
          annotations: { italic: true },
        },
        { type: 'text', text: { content: ' text' }, plain_text: ' text' },
      ],
    },
  },

  // Table
  table: {
    type: 'table',
    table: {
      table_width: 3,
      has_column_header: true,
      has_row_header: false,
      children: [
        {
          type: 'table_row',
          table_row: {
            cells: [
              [{ type: 'text', text: { content: 'Name' }, plain_text: 'Name' }],
              [{ type: 'text', text: { content: 'Age' }, plain_text: 'Age' }],
              [{ type: 'text', text: { content: 'City' }, plain_text: 'City' }],
            ],
          },
        },
        {
          type: 'table_row',
          table_row: {
            cells: [
              [{ type: 'text', text: { content: 'Alice' }, plain_text: 'Alice' }],
              [{ type: 'text', text: { content: '30' }, plain_text: '30' }],
              [{ type: 'text', text: { content: 'NYC' }, plain_text: 'NYC' }],
            ],
          },
        },
      ],
    },
  },
};

/**
 * Run all tests
 */
async function runTests() {
  const runner = new TestRunner();
  const converter = new NotionToMarkdownConverter();

  // ========================================
  // Block Type Tests
  // ========================================

  runner.test('Heading 1', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.heading1);
    assertEqual(markdown, '# Main Heading');
  });

  runner.test('Heading 2', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.heading2);
    assertEqual(markdown, '## Subheading');
  });

  runner.test('Heading 3', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.heading3);
    assertEqual(markdown, '### Sub-subheading');
  });

  runner.test('Paragraph', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.paragraph);
    assertEqual(markdown, 'This is a paragraph.');
  });

  runner.test('Bullet list item', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.bulletListItem);
    assertEqual(markdown, '- Bullet point');
  });

  runner.test('Numbered list item', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.numberedListItem);
    assertEqual(markdown, '1. Numbered item');
  });

  runner.test('Todo unchecked', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.todoUnchecked);
    assertEqual(markdown, '- [ ] Todo item');
  });

  runner.test('Todo checked', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.todoChecked);
    assertEqual(markdown, '- [x] Done item');
  });

  runner.test('Code block', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.codeBlock);
    assertEqual(markdown, '```javascript\nconst x = 42;\nconsole.log(x);\n```');
  });

  runner.test('Quote', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.quote);
    assertEqual(markdown, '> This is a quote');
  });

  runner.test('Callout', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.callout);
    assertEqual(markdown, '> 💡 Important note');
  });

  runner.test('Divider', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.divider);
    assertEqual(markdown, '---');
  });

  runner.test('Image', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.image);
    assertEqual(markdown, '![Image caption](https://example.com/image.png)');
  });

  runner.test('Equation', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.equation);
    assertEqual(markdown, '$\nx^2 + y^2 = z^2\n$');
  });

  runner.test('Table', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.table);
    assertContains(markdown, '| Name | Age | City |');
    assertContains(markdown, '| --- | --- | --- |');
    assertContains(markdown, '| Alice | 30 | NYC |');
  });

  // ========================================
  // Rich Text Annotation Tests
  // ========================================

  runner.test('Bold text', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.paragraphBold);
    assertEqual(markdown, '**This is bold text**');
  });

  runner.test('Italic text', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.paragraphItalic);
    assertEqual(markdown, '*This is italic text*');
  });

  runner.test('Inline code', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.paragraphCode);
    assertEqual(markdown, '`inline code`');
  });

  runner.test('Strikethrough text', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.paragraphStrikethrough);
    assertEqual(markdown, '~~strikethrough text~~');
  });

  runner.test('Underlined text', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.paragraphUnderline);
    assertEqual(markdown, '__underlined text__');
  });

  runner.test('Link', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.link);
    assertEqual(markdown, '[Click here](https://example.com)');
  });

  runner.test('Inline equation', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.inlineEquation);
    assertEqual(markdown, '$$E = mc^2$$');
  });

  runner.test('Colored text', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.coloredText);
    assertEqual(markdown, '<red>Red text</red>');
  });

  // ========================================
  // Complex Formatting Tests
  // ========================================

  runner.test('Nested formatting (bold + italic)', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.nestedFormatting);
    assertEqual(markdown, '***Bold and italic***');
  });

  runner.test('Mixed rich text', () => {
    const markdown = converter.blockToMarkdown(TEST_BLOCKS.mixedRichText);
    assertEqual(markdown, 'Normal **bold** and *italic* text');
  });

  // ========================================
  // Array Conversion Tests
  // ========================================

  runner.test('Multiple blocks to markdown', () => {
    const blocks = [
      TEST_BLOCKS.heading1,
      TEST_BLOCKS.paragraph,
      TEST_BLOCKS.bulletListItem,
    ];
    const markdown = converter.blocksToMarkdown(blocks);
    assertContains(markdown, '# Main Heading');
    assertContains(markdown, 'This is a paragraph.');
    assertContains(markdown, '- Bullet point');
  });

  runner.test('Helper function notionToMarkdown', () => {
    const blocks = [TEST_BLOCKS.heading1];
    const markdown = notionToMarkdown(blocks);
    assertEqual(markdown, '# Main Heading');
  });

  // ========================================
  // Edge Case Tests
  // ========================================

  runner.test('Empty blocks array', () => {
    const markdown = converter.blocksToMarkdown([]);
    assertEqual(markdown, '');
  });

  runner.test('Null blocks', () => {
    const markdown = converter.blocksToMarkdown(null);
    assertEqual(markdown, '');
  });

  runner.test('Empty rich text', () => {
    const block = {
      type: 'paragraph',
      paragraph: { rich_text: [] },
    };
    const markdown = converter.blockToMarkdown(block);
    assertEqual(markdown, '');
  });

  runner.test('Block with no type', () => {
    const markdown = converter.blockToMarkdown({ foo: 'bar' });
    assertEqual(markdown, null);
  });

  runner.test('Block with unsupported type', () => {
    const block = {
      type: 'bookmark',
      bookmark: { url: 'https://example.com' },
    };
    const markdown = converter.blockToMarkdown(block);
    assertEqual(markdown, '<!-- Unsupported block type: bookmark -->');
  });

  // ========================================
  // Statistics Tests
  // ========================================

  runner.test('Get stats for markdown', () => {
    const markdown = '# Heading\n\nParagraph with **bold** text.\n\n![Image](url)';
    const stats = converter.getStats(markdown);
    assertEqual(stats.headings, 1);
    assertEqual(stats.images, 1);
    assertEqual(stats.lines, 5);
  });

  // ========================================
  // Options Tests
  // ========================================

  runner.test('Disable color preservation', () => {
    const converterNoColor = new NotionToMarkdownConverter({ preserveColors: false });
    const markdown = converterNoColor.blockToMarkdown(TEST_BLOCKS.coloredText);
    assertEqual(markdown, 'Red text');
  });

  // Run all tests
  await runner.run();
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests };
