#!/usr/bin/env node

/**
 * Page Link Resolver for NotionManager v3.6
 *
 * Optimized version with:
 * - Disk persistence (.notion-cache.json)
 * - Smart cache invalidation (per-page timestamps)
 * - Pre-population support
 * - Configurable TTL
 * - Better error handling
 * - Progress tracking
 */

import { Client } from '@notionhq/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export class PageLinkResolverV2 {
  constructor(notionClient, options = {}) {
    this.notion = notionClient || new Client({ auth: process.env.NOTION_API_TOKEN });

    // Options
    this.cacheFile = options.cacheFile || '.notion-cache.json';
    this.defaultTTL = options.defaultTTL || 24 * 60 * 60 * 1000; // 24 hours
    this.verbose = options.verbose || false;

    // Cache structure: Map<title_lowercase, {id, title, url, timestamp, ttl}>
    this.pageCache = new Map();

    // Load cache from disk
    this.loadCache();
  }

  /**
   * Load cache from disk
   */
  loadCache() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = fs.readFileSync(this.cacheFile, 'utf-8');
        const cacheData = JSON.parse(data);

        let loaded = 0;
        let expired = 0;

        for (const [key, value] of Object.entries(cacheData)) {
          const age = Date.now() - value.timestamp;
          const ttl = value.ttl || this.defaultTTL;

          if (age < ttl) {
            this.pageCache.set(key, value);
            loaded++;
          } else {
            expired++;
          }
        }

        if (this.verbose) {
          console.log(`📦 Cache loaded: ${loaded} entries, ${expired} expired`);
        }
      }
    } catch (error) {
      if (this.verbose) {
        console.warn(`⚠️  Failed to load cache: ${error.message}`);
      }
    }
  }

  /**
   * Save cache to disk
   */
  saveCache() {
    try {
      const cacheData = {};
      for (const [key, value] of this.pageCache.entries()) {
        cacheData[key] = value;
      }

      fs.writeFileSync(this.cacheFile, JSON.stringify(cacheData, null, 2));

      if (this.verbose) {
        console.log(`💾 Cache saved: ${this.pageCache.size} entries`);
      }
    } catch (error) {
      if (this.verbose) {
        console.warn(`⚠️  Failed to save cache: ${error.message}`);
      }
    }
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.pageCache.clear();
    try {
      if (fs.existsSync(this.cacheFile)) {
        fs.unlinkSync(this.cacheFile);
      }
    } catch (error) {
      // Ignore
    }

    if (this.verbose) {
      console.log('🗑️  Cache cleared');
    }
  }

  /**
   * Pre-populate cache with all workspace pages
   * @param {Object} options - Options for pre-population
   * @returns {Promise<number>} Number of pages cached
   */
  async prePopulateCache(options = {}) {
    const { ttl = 7 * 24 * 60 * 60 * 1000 } = options; // 7 days for workspace pages

    if (this.verbose) {
      console.log('🔄 Pre-populating cache from workspace...');
    }

    try {
      let hasMore = true;
      let startCursor = undefined;
      let totalPages = 0;

      while (hasMore) {
        const response = await this.notion.search({
          filter: {
            property: 'object',
            value: 'page',
          },
          page_size: 100,
          start_cursor: startCursor,
        });

        for (const page of response.results) {
          const pageInfo = this.extractPageInfo(page);
          if (pageInfo) {
            const key = pageInfo.title.toLowerCase();
            this.pageCache.set(key, {
              ...pageInfo,
              timestamp: Date.now(),
              ttl,
            });
            totalPages++;
          }
        }

        hasMore = response.has_more;
        startCursor = response.next_cursor;

        if (this.verbose && hasMore) {
          console.log(`  📄 Loaded ${totalPages} pages...`);
        }

        // Rate limit: 600ms between requests
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      }

      // Save to disk
      this.saveCache();

      if (this.verbose) {
        console.log(`✅ Pre-populated cache with ${totalPages} pages`);
      }

      return totalPages;
    } catch (error) {
      if (this.verbose) {
        console.error(`❌ Failed to pre-populate cache: ${error.message}`);
      }
      return 0;
    }
  }

  /**
   * Extract page info from Notion API response
   */
  extractPageInfo(page) {
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
  }

  /**
   * Search for a page by title
   * @param {string} title - Page title to search for
   * @param {boolean} exactMatch - If true, only return exact matches
   * @param {Object} options - Search options
   * @returns {Promise<Object|null>} Page object { id, title, url } or null
   */
  async searchPage(title, exactMatch = false, options = {}) {
    if (!title || typeof title !== 'string') {
      return null;
    }

    const normalizedTitle = title.trim();
    const key = normalizedTitle.toLowerCase();

    // Check cache first
    const cached = this.pageCache.get(key);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      const ttl = cached.ttl || this.defaultTTL;

      if (age < ttl) {
        if (this.verbose) {
          console.log(`📦 Cache hit: ${title}`);
        }
        return {
          id: cached.id,
          title: cached.title,
          url: cached.url,
        };
      } else {
        // Expired, remove from cache
        this.pageCache.delete(key);
      }
    }

    // Not in cache or expired, search Notion
    if (this.verbose) {
      console.log(`🔍 Searching: ${title}`);
    }

    try {
      const response = await this.notion.search({
        query: normalizedTitle,
        filter: {
          property: 'object',
          value: 'page',
        },
        page_size: 10,
      });

      if (!response.results || response.results.length === 0) {
        if (this.verbose) {
          console.log(`❌ Not found: ${title}`);
        }
        return null;
      }

      // Extract page titles and find best match
      const candidates = response.results.map(page => this.extractPageInfo(page));

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
        this.pageCache.set(key, {
          ...bestMatch,
          timestamp: Date.now(),
          ttl: this.defaultTTL,
        });

        // Auto-save cache periodically (every 10 entries)
        if (this.pageCache.size % 10 === 0) {
          this.saveCache();
        }

        if (this.verbose) {
          console.log(`✅ Found: ${title} → ${bestMatch.title}`);
        }

        return {
          id: bestMatch.id,
          title: bestMatch.title,
          url: bestMatch.url,
        };
      }

      if (this.verbose) {
        console.log(`❌ No match: ${title}`);
      }
      return null;

    } catch (error) {
      if (this.verbose) {
        console.error(`❌ Search error for "${title}": ${error.message}`);
      }
      return null;
    }
  }

  /**
   * Resolve multiple page titles to IDs in batch (with parallelism)
   * @param {string[]} titles - Array of page titles
   * @param {Object} options - Options for resolution
   * @returns {Promise<Map>} Map of title -> page object
   */
  async resolveBatch(titles, options = {}) {
    const { concurrency = 3, showProgress = false } = options;
    const results = new Map();
    const queue = [...titles];
    let completed = 0;

    async function worker(self) {
      while (queue.length > 0) {
        const title = queue.shift();
        const page = await self.searchPage(title);

        if (page) {
          results.set(title, page);
        }

        completed++;
        if (showProgress) {
          const percent = Math.floor((completed / titles.length) * 100);
          console.log(`  📊 Progress: ${completed}/${titles.length} (${percent}%)`);
        }

        // Rate limit: 600ms between searches (only if not cached)
        if (queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      }
    }

    // Run workers in parallel
    await Promise.all(
      Array(concurrency).fill(0).map(() => worker(this))
    );

    // Save cache after batch resolution
    this.saveCache();

    return results;
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
    let validEntries = 0;
    let expiredEntries = 0;
    let totalAge = 0;

    for (const [, value] of this.pageCache.entries()) {
      const age = Date.now() - value.timestamp;
      const ttl = value.ttl || this.defaultTTL;

      if (age < ttl) {
        validEntries++;
        totalAge += age;
      } else {
        expiredEntries++;
      }
    }

    const avgAge = validEntries > 0 ? totalAge / validEntries : 0;

    return {
      totalEntries: this.pageCache.size,
      validEntries,
      expiredEntries,
      averageAge: Math.floor(avgAge / 1000), // seconds
      cacheFile: this.cacheFile,
      cacheFileExists: fs.existsSync(this.cacheFile),
    };
  }
}

/**
 * Test the optimized resolver
 */
async function testResolverV2() {
  console.log('=== Page Link Resolver V2 Test ===\n');

  const resolver = new PageLinkResolverV2(null, { verbose: true });

  // Test 1: Pre-populate cache
  console.log('Test 1: Pre-populating cache...\n');
  const cached = await resolver.prePopulateCache();
  console.log(`\n✅ Cached ${cached} pages\n`);

  // Test 2: Search (should be instant from cache)
  console.log('Test 2: Searching (from cache)...\n');
  const testQueries = ['NotionManager', 'Athena', 'Developer'];

  for (const query of testQueries) {
    const start = Date.now();
    const result = await resolver.searchPage(query);
    const elapsed = Date.now() - start;

    if (result) {
      console.log(`  ${query}: ${elapsed}ms (${result.title})`);
    } else {
      console.log(`  ${query}: ${elapsed}ms (not found)`);
    }
  }

  // Test 3: Cache stats
  console.log('\nTest 3: Cache statistics...\n');
  const stats = resolver.getCacheStats();
  console.log('  Stats:', JSON.stringify(stats, null, 2));

  console.log('\n✅ Test complete!');
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testResolverV2().catch(console.error);
}
