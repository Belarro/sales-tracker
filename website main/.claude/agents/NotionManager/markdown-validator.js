#!/usr/bin/env node

/**
 * Markdown Validator for NotionManager v3.6
 *
 * Validates markdown before parsing to catch errors early:
 * - Malformed tables
 * - Unclosed code blocks
 * - Invalid image URLs
 * - Long captions (>2000 chars)
 * - Nested formatting (unsupported)
 * - Special characters in page names
 */

export class MarkdownValidator {
  constructor(options = {}) {
    this.strict = options.strict || false;
    this.maxCaptionLength = options.maxCaptionLength || 2000;
    this.maxLineLength = options.maxLineLength || 2000;
  }

  /**
   * Validate markdown and return issues
   * @param {string} markdown - Markdown content to validate
   * @returns {Object} { valid: boolean, issues: [], warnings: [] }
   */
  validate(markdown) {
    const issues = [];
    const warnings = [];

    if (!markdown || typeof markdown !== 'string') {
      issues.push({
        type: 'error',
        message: 'Markdown content is empty or not a string',
        line: 0,
      });
      return { valid: false, issues, warnings };
    }

    const lines = markdown.split('\n');

    // Check for unclosed code blocks
    this.validateCodeBlocks(lines, issues);

    // Check for malformed tables
    this.validateTables(lines, issues, warnings);

    // Check for invalid image URLs
    this.validateImages(lines, issues, warnings);

    // Check for long captions
    this.validateCaptions(lines, warnings);

    // Check for long lines
    this.validateLineLengths(lines, warnings);

    // Check for nested formatting
    this.validateNestedFormatting(lines, warnings);

    // Check for unclosed equations
    this.validateEquations(lines, issues, warnings);

    // Check for invalid page references
    this.validatePageReferences(lines, warnings);

    return {
      valid: issues.length === 0,
      issues,
      warnings,
    };
  }

  /**
   * Validate code blocks are properly closed
   */
  validateCodeBlocks(lines, issues) {
    let inCodeBlock = false;
    let codeBlockStartLine = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockStartLine = i + 1;
        } else {
          inCodeBlock = false;
        }
      }
    }

    if (inCodeBlock) {
      issues.push({
        type: 'error',
        message: `Unclosed code block starting at line ${codeBlockStartLine}`,
        line: codeBlockStartLine,
        fix: 'Add closing ``` delimiter',
      });
    }
  }

  /**
   * Validate tables have consistent column counts
   */
  validateTables(lines, issues, warnings) {
    let inTable = false;
    let tableStartLine = -1;
    let expectedColumns = -1;
    const tableLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableStartLine = i + 1;
          tableLines.length = 0;
        }

        tableLines.push({ line: i + 1, content: line });

        const columns = line.split('|').filter(c => c.trim().length > 0).length;

        if (expectedColumns === -1) {
          expectedColumns = columns;
        } else if (columns !== expectedColumns) {
          issues.push({
            type: 'error',
            message: `Table row has ${columns} columns, expected ${expectedColumns}`,
            line: i + 1,
            fix: `Add/remove cells to match ${expectedColumns} columns`,
          });
        }
      } else if (inTable) {
        // End of table
        if (tableLines.length < 2) {
          warnings.push({
            type: 'warning',
            message: `Table at line ${tableStartLine} has only 1 row (no data)`,
            line: tableStartLine,
          });
        }

        inTable = false;
        expectedColumns = -1;
      }
    }
  }

  /**
   * Validate image URLs are well-formed
   */
  validateImages(lines, issues, warnings) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);

      if (match) {
        const url = match[2];

        // Check if URL is valid
        try {
          new URL(url);
        } catch (e) {
          issues.push({
            type: 'error',
            message: `Invalid image URL: ${url}`,
            line: i + 1,
            fix: 'Use a valid URL with protocol (https://...)',
          });
        }

        // Check if URL is a local file path
        if (url.startsWith('./') || url.startsWith('../') || url.startsWith('/')) {
          warnings.push({
            type: 'warning',
            message: `Local file path detected: ${url}`,
            line: i + 1,
            fix: 'Use external URL instead (local files not supported)',
          });
        }

        // Warn about very long URLs
        if (url.length > 500) {
          warnings.push({
            type: 'warning',
            message: `Very long image URL (${url.length} chars)`,
            line: i + 1,
          });
        }
      }
    }
  }

  /**
   * Validate caption lengths
   */
  validateCaptions(lines, warnings) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if this is a caption (starts with _ or follows an image)
      const isCaption = line.trim().startsWith('_');
      const prevLineIsImage = i > 0 && lines[i - 1].match(/^!\[([^\]]*)\]\(([^)]+)\)/);

      if ((isCaption || prevLineIsImage) && line.trim().length > this.maxCaptionLength) {
        warnings.push({
          type: 'warning',
          message: `Caption too long (${line.trim().length} chars, max ${this.maxCaptionLength})`,
          line: i + 1,
          fix: `Will be truncated to ${this.maxCaptionLength} characters`,
        });
      }
    }
  }

  /**
   * Validate line lengths
   */
  validateLineLengths(lines, warnings) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length > this.maxLineLength) {
        warnings.push({
          type: 'warning',
          message: `Line too long (${lines[i].length} chars, max ${this.maxLineLength})`,
          line: i + 1,
          fix: `Will be truncated to ${this.maxLineLength} characters`,
        });
      }
    }
  }

  /**
   * Detect nested formatting (not supported)
   */
  validateNestedFormatting(lines, warnings) {
    const nestedPatterns = [
      { pattern: /\*\*[^*]*\*[^*]*\*[^*]*\*\*/, name: 'bold with italic inside' },
      { pattern: /\*[^*]*\*\*[^*]*\*\*[^*]*\*/, name: 'italic with bold inside' },
      { pattern: /<\w+>[^<]*<\w+>/, name: 'nested color tags' },
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const { pattern, name } of nestedPatterns) {
        if (pattern.test(line)) {
          warnings.push({
            type: 'warning',
            message: `Nested formatting detected (${name})`,
            line: i + 1,
            fix: 'Use side-by-side formatting instead (not nested)',
          });
        }
      }
    }
  }

  /**
   * Validate equations are properly closed
   */
  validateEquations(lines, issues, warnings) {
    let inBlockEquation = false;
    let equationStartLine = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Block equations use single $ on its own line (not $$)
      if (line === '$') {
        if (!inBlockEquation) {
          inBlockEquation = true;
          equationStartLine = i + 1;
        } else {
          inBlockEquation = false;
        }
      }
    }

    if (inBlockEquation) {
      issues.push({
        type: 'error',
        message: `Unclosed block equation starting at line ${equationStartLine}`,
        line: equationStartLine,
        fix: 'Add closing $ delimiter',
      });
    }

    // Check for unbalanced inline equations
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const matches = line.match(/\$\$/g);

      if (matches && matches.length % 2 !== 0) {
        warnings.push({
          type: 'warning',
          message: `Unbalanced inline equation delimiters (odd number of $$)`,
          line: i + 1,
          fix: 'Ensure inline equations have matching $$ pairs',
        });
      }
    }
  }

  /**
   * Validate page references
   */
  validatePageReferences(lines, warnings) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for empty wiki links
      if (line.includes('[[]]')) {
        warnings.push({
          type: 'warning',
          message: 'Empty wiki-style link [[]]',
          line: i + 1,
          fix: 'Add page name inside brackets',
        });
      }

      // Check for special characters in @mentions
      const atMentions = line.matchAll(/@(\w+)/g);
      for (const match of atMentions) {
        const pageName = match[1];
        if (pageName.includes('@') || pageName.includes('[') || pageName.includes(']')) {
          warnings.push({
            type: 'warning',
            message: `@mention contains special characters: @${pageName}`,
            line: i + 1,
            fix: 'Remove special characters from page name',
          });
        }
      }
    }
  }

  /**
   * Format validation results for display
   */
  formatResults(results) {
    const { valid, issues, warnings } = results;

    let output = '';

    if (valid && warnings.length === 0) {
      output += '✅ Validation passed - no issues found\n';
      return output;
    }

    if (issues.length > 0) {
      output += `❌ Validation failed with ${issues.length} error(s):\n\n`;

      for (const issue of issues) {
        output += `  Line ${issue.line}: ${issue.message}\n`;
        if (issue.fix) {
          output += `    → Fix: ${issue.fix}\n`;
        }
        output += '\n';
      }
    }

    if (warnings.length > 0) {
      output += `⚠️  ${warnings.length} warning(s):\n\n`;

      for (const warning of warnings) {
        output += `  Line ${warning.line}: ${warning.message}\n`;
        if (warning.fix) {
          output += `    → ${warning.fix}\n`;
        }
        output += '\n';
      }
    }

    return output;
  }
}

/**
 * Test the validator
 */
async function testValidator() {
  console.log('=== Markdown Validator Test ===\n');

  const validator = new MarkdownValidator();

  // Test 1: Valid markdown
  console.log('Test 1: Valid markdown...');
  const validMd = `
# Heading

This is **bold** and *italic*.

![Image](https://example.com/image.png)
_Caption text_
`;

  let results = validator.validate(validMd);
  console.log(validator.formatResults(results));

  // Test 2: Unclosed code block
  console.log('Test 2: Unclosed code block...');
  const unclosedCode = `
# Code Example

\`\`\`javascript
function test() {
  return true;
}
`;

  results = validator.validate(unclosedCode);
  console.log(validator.formatResults(results));

  // Test 3: Malformed table
  console.log('Test 3: Malformed table...');
  const malformedTable = `
| Col1 | Col2 | Col3 |
|------|------|------|
| A | B | C |
| D | E |
`;

  results = validator.validate(malformedTable);
  console.log(validator.formatResults(results));

  // Test 4: Invalid image URL
  console.log('Test 4: Invalid image URL...');
  const invalidImage = `
![Diagram](./local/file.png)
![Another](not-a-url)
`;

  results = validator.validate(invalidImage);
  console.log(validator.formatResults(results));

  // Test 5: Long caption
  console.log('Test 5: Long caption...');
  const longCaption = `
![Image](https://example.com/img.png)
_${'This is a very long caption. '.repeat(200)}_
`;

  results = validator.validate(longCaption);
  console.log(validator.formatResults(results));

  console.log('✅ All tests complete!');
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testValidator().catch(console.error);
}
