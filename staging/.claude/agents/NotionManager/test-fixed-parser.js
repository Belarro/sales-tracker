/**
 * Test the fixed parser for checklists, dividers, tables, and mermaid
 */

import { markdownToNotionBlocks } from './markdown-parser-enhanced.js';

console.log('=== Testing Fixed Parser ===\n');

// Test 1: Checklists
console.log('Test 1: Checklists');
const checklistMd = `
- [x] Completed task
- [ ] Pending task
- [X] Uppercase X
`;
const checklistBlocks = markdownToNotionBlocks(checklistMd);
console.log('Blocks created:', checklistBlocks.length);
checklistBlocks.forEach((block, i) => {
  if (block.type === 'to_do') {
    console.log(`  Block ${i}: to_do, checked=${block.to_do.checked}`);
  } else {
    console.log(`  Block ${i}: ${block.type} (WRONG - should be to_do)`);
  }
});
console.log('Expected: 3 to_do blocks (2 checked, 1 unchecked)\n');

// Test 2: Dividers
console.log('Test 2: Dividers');
const dividerMd = `
---
Some text
***
More text
`;
const dividerBlocks = markdownToNotionBlocks(dividerMd);
console.log('Blocks created:', dividerBlocks.length);
dividerBlocks.forEach((block, i) => {
  console.log(`  Block ${i}: ${block.type}`);
});
console.log('Expected: divider, paragraph, divider, paragraph\n');

// Test 3: Tables
console.log('Test 3: Tables');
const tableMd = `
| Name | Status |
|------|--------|
| Task1 | Done |
| Task2 | Pending |
`;
const tableBlocks = markdownToNotionBlocks(tableMd);
console.log('Blocks created:', tableBlocks.length);
tableBlocks.forEach((block, i) => {
  console.log(`  Block ${i}: ${block.type}`);
  if (block.type === 'code') {
    console.log('    Language:', block.code.language);
    console.log('    Contains table:', block.code.rich_text[0].text.content.includes('|'));
  }
});
console.log('Expected: 1 code block containing table\n');

// Test 4: Mermaid
console.log('Test 4: Mermaid');
const mermaidMd = `
\`\`\`mermaid
graph TD
    A --> B
\`\`\`
`;
const mermaidBlocks = markdownToNotionBlocks(mermaidMd);
console.log('Blocks created:', mermaidBlocks.length);
mermaidBlocks.forEach((block, i) => {
  if (block.type === 'code') {
    console.log(`  Block ${i}: code, language=${block.code.language}`);
  } else {
    console.log(`  Block ${i}: ${block.type}`);
  }
});
console.log('Expected: 1 code block with language=mermaid\n');

// Test 5: Mixed - checklist should come before bullets
console.log('Test 5: Checkbox vs Bullet Ordering');
const mixedMd = `
- Regular bullet
- [x] Checkbox item
- Another bullet
`;
const mixedBlocks = markdownToNotionBlocks(mixedMd);
console.log('Blocks created:', mixedBlocks.length);
mixedBlocks.forEach((block, i) => {
  console.log(`  Block ${i}: ${block.type}`);
});
console.log('Expected: bulleted_list_item, to_do, bulleted_list_item\n');

console.log('=== All Tests Complete ===');
