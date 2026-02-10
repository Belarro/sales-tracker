#!/usr/bin/env node

/**
 * Page Link Resolver for NotionManager v3.5
 *
 * Resolves page names to Notion page IDs for internal links.
 * Supports @mentions and [[wiki-style]] links.
 *
 * Caches results to minimize API calls.
 */

import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';

dotenv.config();

export class PageLinkResolver {
  constructor(notionClient) {
    this.notion = notionClient || new Client({ auth: process.env.NOTION_API_TOKEN });
    this.pageCache = new Map(); // title -> { id, title, url, lastUpdated }
    this.searchCache = new Map(); // query -> search results
    this.cacheTimestamp = Date.now();
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Clear caches (useful for testing or after bulk updates)
   */
  clearCache() {
    this.pageCache.clear();
    this.searchCache.clear();
    this.cacheTimestamp = Date.now();
  }

  /**
   * Check if cache is still valid
   */
  isCacheValid() {
    return (Date.now() - this.cacheTimestamp) < this.cacheDuration;
  }

  /**
   * Search for a page by title
   * @param {string} title - Page title to search for
   * @param {boolean} exactMatch - If true, only return exact matches
   * @returns {Promise<Object|null>} Page object { id, title, url } or null
   */
  async searchPage(title, exactMatch = false) {
    if (!title || typeof title !== 'string') {
      return null;
    }

    const normalizedTitle = title.trim();

    // Check cache first
    if (this.isCacheValid()) {
      const cached = this.pageCache.get(normalizedTitle.toLowerCase());
      if (cached) {
        return cached;
      }
    }

    try {
      // Search Notion workspace
      const response = await this.notion.search({
        query: normalizedTitle,
        filter: {
          property: 'object',
          value: 'page',
        },
        page_size: 10, // Get top 10 results
      });

      if (!response.results || response.results.length === 0) {
        return null;
      }

      // Extract page titles and find best match
      const candidates = response.results.map(page => {
        let pageTitle = 'Untitled';

        // Try to get title from properties
        if (page.properties && page.properties.title) {
          const titleProp = page.properties.title;
          if (titleProp.title && titleProp.title.length > 0) {
            pageTitle = titleProp.title.map(t => t.plain_text).join('');
          }
        } else if (page.properties && page.properties.Name) {
          // Database entries use "Name" property
          const nameProp = page.properties.Name;
          if (nameProp.title && nameProp.title.length > 0) {
            pageTitle = nameProp.title.map(t => t.plain_text).join('');
          }
        }

        return {
          id: page.id,
          title: pageTitle,
          url: page.url,
          lastUpdated: page.last_edited_time,
        };
      });

      // Find exact match first
      let bestMatch = candidates.find(c =>
        c.title.toLowerCase() === normalizedTitle.toLowerCase()
      );

      // If no exact match and exactMatch not required, use first result
      if (!bestMatch && !exactMatch && candidates.length > 0) {
        bestMatch = candidates[0];
      }

      if (bestMatch) {
        // Cache the result
        this.pageCache.set(normalizedTitle.toLowerCase(), bestMatch);
        return bestMatch;
      }

      return null;

    } catch (error) {
      console.error(`Error searching for page "${title}":`, error.message);
      return null;
    }
  }

  /**
   * Resolve multiple page titles to IDs in batch
   * @param {string[]} titles - Array of page titles
   * @returns {Promise<Map>} Map of title -> page object
   */
  async resolveBatch(titles) {
    const results = new Map();

    // Process titles sequentially to respect rate limits
    for (const title of titles) {
      const page = await this.searchPage(title);
      if (page) {
        results.set(title, page);
      }

      // Rate limit: 600ms between searches
      if (titles.indexOf(title) < titles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }

    return results;
  }

  /**
   * Create a Notion page mention object
   * @param {string} pageId - Notion page UUID
   * @param {string} displayText - Optional display text (defaults to page title)
   * @returns {Object} Notion rich text mention object
   */
  createPageMention(pageId, displayText = null) {
    return {
      type: 'mention',
      mention: {
        type: 'page',
        page: {
          id: pageId,
        },
      },
      annotations: {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: 'default',
      },
      plain_text: displayText || pageId, // Notion will auto-populate with actual title
      href: null, // Notion will auto-populate with page URL
    };
  }

  /**
   * Extract all page references from markdown text
   * Supports: @PageName and [[Page Name]]
   * @param {string} text - Markdown text with page references
   * @returns {string[]} Array of unique page names
   */
  extractPageReferences(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const references = new Set();

    // Pattern 1: @PageName (single word or CamelCase)
    const atMentions = text.matchAll(/@(\w+)/g);
    for (const match of atMentions) {
      references.add(match[1]);
    }

    // Pattern 2: [[Page Name]] (multi-word with brackets)
    const wikiLinks = text.matchAll(/\[\[([^\]]+)\]\]/g);
    for (const match of wikiLinks) {
      references.add(match[1].trim());
    }

    return Array.from(references);
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      pagesCached: this.pageCache.size,
      searchesCached: this.searchCache.size,
      cacheAge: Math.floor((Date.now() - this.cacheTimestamp) / 1000),
      cacheValid: this.isCacheValid(),
    };
  }
}

/**
 * Test the resolver
 */
async function testResolver() {
  console.log('=== Page Link Resolver Test ===\n');

  const resolver = new PageLinkResolver();

  // Test 1: Search for known pages
  console.log('Test 1: Searching for pages...');
  const testQueries = ['NotionManager', 'Athena', 'Developer'];

  for (const query of testQueries) {
    console.log(`\nSearching for: "${query}"`);
    const result = await resolver.searchPage(query);

    if (result) {
      console.log(`  ✅ Found: ${result.title}`);
      console.log(`     ID: ${result.id}`);
      console.log(`     URL: ${result.url}`);
    } else {
      console.log(`  ❌ Not found`);
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  // Test 2: Extract references from markdown
  console.log('\n\nTest 2: Extracting references from markdown...');
  const markdown = `
    This document references @NotionManager and [[Athena]] agents.
    See also: @Developer and [[Claude Code]] for more info.
  `;

  const refs = resolver.extractPageReferences(markdown);
  console.log('  Found references:', refs);

  // Test 3: Cache stats
  console.log('\n\nTest 3: Cache statistics...');
  const stats = resolver.getCacheStats();
  console.log('  Cache stats:', stats);

  console.log('\n✅ Test complete!');
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testResolver().catch(console.error);
}
