/**
 * v4.0 Research: Test complex features (tables, equations, images, page links)
 *
 * Goal: Understand how Notion API returns complex block types for reverse conversion
 */

import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });

// Test pages with complex features
const TEST_PAGES = {
  tables: '29560b6e-8d18-8102-a83e-c57b750cc8bd',
  equations: '29660b6e-8d18-81f8-b7fa-ed60e6044ccd',
  images: '29660b6e-8d18-81d0-b656-e91b9082a89d',
  pageLinks: '29660b6e-8d18-8139-b1cd-fab993e4d3ea',
};

/**
 * Test 1: Table structure analysis
 */
async function testTableStructure() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('TEST 1: Table Structure Analysis');
  console.log('='.repeat(80));

  const pageId = TEST_PAGES.tables;
  const blocks = await retrieveAllBlocks(pageId);

  const tables = blocks.filter(block => block.type === 'table');

  console.log(`\n📊 Tables found: ${tables.length}`);

  for (const table of tables) {
    console.log(`\n--- Table ${table.id} ---`);
    console.log(`Block Structure:`);
    console.log(JSON.stringify(table, null, 2));

    // Retrieve table rows
    const rows = await notion.blocks.children.list({
      block_id: table.id,
    });

    console.log(`\n📋 Table has ${rows.results.length} rows`);

    // Analyze each row
    for (let i = 0; i < rows.results.length; i++) {
      const row = rows.results[i];
      console.log(`\nRow ${i + 1} Structure:`);
      console.log(JSON.stringify(row, null, 2));

      if (row.type === 'table_row') {
        console.log(`\nRow ${i + 1} Content:`);
        row.table_row.cells.forEach((cell, j) => {
          const cellText = cell.map(rt => rt.plain_text).join('');
          console.log(`   Cell ${j + 1}: "${cellText}"`);

          // Check for rich text in cells
          if (cell.length > 0 && cell[0].annotations) {
            const hasFormatting = Object.entries(cell[0].annotations).some(
              ([key, value]) => value === true && key !== 'color'
            );
            if (hasFormatting) {
              console.log(`      Annotations: ${JSON.stringify(cell[0].annotations)}`);
            }
          }
        });
      }
    }
  }

  return tables;
}

/**
 * Test 2: Equation analysis
 */
async function testEquations() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('TEST 2: Equation Analysis');
  console.log('='.repeat(80));

  const pageId = TEST_PAGES.equations;
  const blocks = await retrieveAllBlocks(pageId);

  const equations = blocks.filter(block => block.type === 'equation');

  console.log(`\n🔢 Equations found: ${equations.length}`);

  for (const eq of equations) {
    console.log(`\n--- Equation ${eq.id} ---`);
    console.log(`Expression: ${eq.equation.expression}`);
    console.log(`Full Structure:`);
    console.log(JSON.stringify(eq, null, 2));
  }

  return equations;
}

/**
 * Test 3: Image analysis
 */
async function testImages() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('TEST 3: Image Analysis');
  console.log('='.repeat(80));

  const pageId = TEST_PAGES.images;
  const blocks = await retrieveAllBlocks(pageId);

  const images = blocks.filter(block => block.type === 'image');

  console.log(`\n🖼️ Images found: ${images.length}`);

  for (const img of images) {
    console.log(`\n--- Image ${img.id} ---`);

    if (img.image.type === 'external') {
      console.log(`Type: External`);
      console.log(`URL: ${img.image.external.url}`);
    } else if (img.image.type === 'file') {
      console.log(`Type: Uploaded File`);
      console.log(`URL: ${img.image.file.url}`);
      console.log(`Expiry Time: ${img.image.file.expiry_time}`);
    }

    // Caption analysis
    if (img.image.caption && img.image.caption.length > 0) {
      const captionText = img.image.caption.map(rt => rt.plain_text).join('');
      console.log(`Caption: "${captionText}"`);
    } else {
      console.log(`Caption: (none)`);
    }

    console.log(`\nFull Structure:`);
    console.log(JSON.stringify(img, null, 2));
  }

  return images;
}

/**
 * Test 4: Page link analysis
 */
async function testPageLinks() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('TEST 4: Page Link Analysis');
  console.log('='.repeat(80));

  const pageId = TEST_PAGES.pageLinks;
  const blocks = await retrieveAllBlocks(pageId);

  console.log(`\n🔗 Analyzing all blocks for page links...`);

  const pageLinks = [];

  for (const block of blocks) {
    const type = block.type;
    const blockData = block[type];

    if (!blockData || !blockData.rich_text) continue;

    for (const richText of blockData.rich_text) {
      if (richText.type === 'mention' && richText.mention.type === 'page') {
        pageLinks.push({
          blockId: block.id,
          blockType: type,
          pageId: richText.mention.page.id,
          text: richText.plain_text,
          fullRichText: richText,
        });
      }
    }
  }

  console.log(`\n📎 Page links found: ${pageLinks.length}`);

  for (const link of pageLinks) {
    console.log(`\n--- Page Link ---`);
    console.log(`Text: "${link.text}"`);
    console.log(`Links to Page ID: ${link.pageId}`);

    // Try to retrieve the linked page to get its title
    try {
      const linkedPage = await notion.pages.retrieve({ page_id: link.pageId });
      const title = linkedPage.properties.title?.title?.[0]?.plain_text || 'Untitled';
      console.log(`Page Title: "${title}"`);
    } catch (error) {
      console.log(`Page Title: (unable to retrieve)`);
    }

    console.log(`Full Structure:`);
    console.log(JSON.stringify(link.fullRichText, null, 2));
  }

  return pageLinks;
}

/**
 * Test 5: Nested list analysis (from any page)
 */
async function testNestedLists() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('TEST 5: Nested List Analysis');
  console.log('='.repeat(80));

  // Use the release notes page which has complex lists
  const pageId = '29660b6e-8d18-8168-a819-c1c285d3351e';
  const blocks = await retrieveAllBlocks(pageId);

  const listBlocks = blocks.filter(block =>
    block.type === 'bulleted_list_item' ||
    block.type === 'numbered_list_item'
  );

  const nestedLists = listBlocks.filter(block => block.has_children);

  console.log(`\n📋 Total list items: ${listBlocks.length}`);
  console.log(`📂 Nested list items: ${nestedLists.length}`);

  if (nestedLists.length > 0) {
    console.log(`\n--- Analyzing first nested list ---`);
    const nested = nestedLists[0];
    const text = nested[nested.type].rich_text.map(rt => rt.plain_text).join('');

    console.log(`Parent Item: "${text}"`);

    // Retrieve children
    const children = await notion.blocks.children.list({
      block_id: nested.id,
    });

    console.log(`Children: ${children.results.length}`);

    children.results.forEach((child, i) => {
      if (child.type === 'bulleted_list_item' || child.type === 'numbered_list_item') {
        const childText = child[child.type].rich_text.map(rt => rt.plain_text).join('');
        console.log(`   ${i + 1}. "${childText}"`);
      }
    });

    console.log(`\nFull Structure:`);
    console.log(JSON.stringify(nested, null, 2));
  }

  return nestedLists;
}

/**
 * Test 6: All rich text annotation types
 */
async function testRichTextAnnotations() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('TEST 6: Rich Text Annotation Types');
  console.log('='.repeat(80));

  // Use complete formatting test page
  const pageId = '29560b6e-8d18-81ce-a053-ce38cfc34cb7';
  const blocks = await retrieveAllBlocks(pageId);

  const annotationTypes = {
    bold: [],
    italic: [],
    strikethrough: [],
    underline: [],
    code: [],
    color: [],
    link: [],
  };

  for (const block of blocks) {
    const type = block.type;
    const blockData = block[type];

    if (!blockData || !blockData.rich_text) continue;

    for (const richText of blockData.rich_text) {
      if (richText.annotations.bold) {
        annotationTypes.bold.push(richText);
      }
      if (richText.annotations.italic) {
        annotationTypes.italic.push(richText);
      }
      if (richText.annotations.strikethrough) {
        annotationTypes.strikethrough.push(richText);
      }
      if (richText.annotations.underline) {
        annotationTypes.underline.push(richText);
      }
      if (richText.annotations.code) {
        annotationTypes.code.push(richText);
      }
      if (richText.annotations.color !== 'default') {
        annotationTypes.color.push(richText);
      }
      if (richText.href) {
        annotationTypes.link.push(richText);
      }
    }
  }

  console.log(`\n📝 Annotation Type Distribution:`);
  Object.entries(annotationTypes).forEach(([type, samples]) => {
    console.log(`   ${type}: ${samples.length} samples`);

    if (samples.length > 0 && samples.length <= 3) {
      samples.forEach((sample, i) => {
        console.log(`      Example ${i + 1}: "${sample.plain_text}"`);
        console.log(`      Structure: ${JSON.stringify(sample, null, 2)}`);
      });
    }
  });

  return annotationTypes;
}

/**
 * Helper: Retrieve all blocks from a page
 */
async function retrieveAllBlocks(pageId) {
  const blocks = [];
  let cursor = undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });

    blocks.push(...response.results);
    cursor = response.next_cursor;
  } while (cursor);

  return blocks;
}

/**
 * Main test runner
 */
async function runComplexFeatureTests() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║  NotionManager v4.0 - Complex Feature Analysis                            ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');

  const results = {};

  try {
    results.tables = await testTableStructure();
    results.equations = await testEquations();
    results.images = await testImages();
    results.pageLinks = await testPageLinks();
    results.nestedLists = await testNestedLists();
    results.annotations = await testRichTextAnnotations();

    // Save results
    const outputPath = join(__dirname, 'test-complex-features-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

    console.log(`\n${'='.repeat(80)}`);
    console.log('✅ COMPLEX FEATURE TESTS COMPLETE');
    console.log('='.repeat(80));
    console.log(`\n📁 Full results saved to: ${outputPath}`);

  } catch (error) {
    console.error('\n❌ Fatal error during testing:');
    console.error(error);
  }
}

// Run tests
runComplexFeatureTests().catch(console.error);
