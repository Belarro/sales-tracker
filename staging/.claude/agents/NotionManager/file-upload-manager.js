/**
 * NotionManager v4.1.0 - File Upload Manager
 *
 * Manages file uploads to hosting backends and markdown URL processing.
 * Handles local file detection, upload, and URL replacement.
 *
 * @module file-upload-manager
 */

import fs from 'fs/promises';
import path from 'path';
import mime from 'mime-types';
import { createFileHostingAdapter } from './file-hosting-adapters.js';

/**
 * File Upload Manager
 *
 * Coordinates file uploads and markdown processing.
 */
export class FileUploadManager {
  /**
   * @param {Object} options
   * @param {Object|FileHostingAdapter} options.adapter - Hosting adapter or config
   * @param {boolean} [options.verbose=false] - Enable logging
   * @param {boolean} [options.cacheEnabled=true] - Enable URL caching
   */
  constructor(options = {}) {
    // Create adapter from config or use provided adapter
    if (options.adapter && typeof options.adapter.upload === 'function') {
      this.adapter = options.adapter;
    } else {
      this.adapter = createFileHostingAdapter(options.adapter || { backend: 'github' });
    }

    this.verbose = options.verbose || false;
    this.cacheEnabled = options.cacheEnabled !== false;

    // Cache: filepath → hosted URL
    this.urlCache = new Map();

    // Upload queue to avoid duplicate uploads
    this.uploadQueue = new Map();
  }

  /**
   * Upload a local file
   * @param {string} localPath - Path to local file
   * @returns {Promise<string>} Hosted URL
   */
  async uploadFile(localPath) {
    // Check cache first
    if (this.cacheEnabled && this.urlCache.has(localPath)) {
      this.log(`Cache hit: ${localPath}`);
      return this.urlCache.get(localPath);
    }

    // Check if upload is already in progress
    if (this.uploadQueue.has(localPath)) {
      this.log(`Upload in progress: ${localPath}`);
      return this.uploadQueue.get(localPath);
    }

    // Start upload
    const uploadPromise = this._uploadFile(localPath);
    this.uploadQueue.set(localPath, uploadPromise);

    try {
      const url = await uploadPromise;

      // Cache result
      if (this.cacheEnabled) {
        this.urlCache.set(localPath, url);
      }

      return url;
    } finally {
      this.uploadQueue.delete(localPath);
    }
  }

  /**
   * Internal upload implementation
   * @param {string} localPath - Path to local file
   * @returns {Promise<string>} Hosted URL
   * @private
   */
  async _uploadFile(localPath) {
    this.log(`Uploading: ${localPath}`);

    try {
      // Read file
      const fileBuffer = await fs.readFile(localPath);
      const filename = path.basename(localPath);
      const mimeType = mime.lookup(localPath) || 'application/octet-stream';

      // Check file size (warn if >10MB, error if >100MB for GitHub)
      const sizeMB = fileBuffer.length / (1024 * 1024);
      if (sizeMB > 100) {
        throw new Error(`File too large: ${sizeMB.toFixed(2)}MB (max 100MB for GitHub)`);
      } else if (sizeMB > 10) {
        console.warn(`Large file: ${sizeMB.toFixed(2)}MB - upload may be slow`);
      }

      // Upload
      const url = await this.adapter.upload(fileBuffer, filename, mimeType);

      this.log(`Uploaded: ${localPath} → ${url}`);
      return url;
    } catch (error) {
      this.log(`Upload failed: ${localPath} - ${error.message}`);
      throw new Error(`Failed to upload ${localPath}: ${error.message}`);
    }
  }

  /**
   * Process markdown to upload local images and replace URLs
   * @param {string} markdown - Markdown content
   * @param {string} baseDir - Base directory for resolving relative paths
   * @returns {Promise<{markdown: string, uploadedFiles: Array}>} Processed markdown and upload info
   */
  async processMarkdownImages(markdown, baseDir = process.cwd()) {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const uploadedFiles = [];
    let processedMarkdown = markdown;

    const matches = [...markdown.matchAll(imageRegex)];

    for (const match of matches) {
      const [fullMatch, altText, imagePath] = match;

      // Skip URLs (already hosted)
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        this.log(`Skipping URL: ${imagePath}`);
        continue;
      }

      // Resolve relative path
      const absolutePath = path.isAbsolute(imagePath)
        ? imagePath
        : path.resolve(baseDir, imagePath);

      // Check if file exists
      try {
        await fs.access(absolutePath);
      } catch (error) {
        console.warn(`File not found: ${absolutePath}`);
        continue;
      }

      try {
        // Upload file
        const hostedUrl = await this.uploadFile(absolutePath);

        // Replace in markdown
        processedMarkdown = processedMarkdown.replace(
          fullMatch,
          `![${altText}](${hostedUrl})`
        );

        uploadedFiles.push({
          localPath: absolutePath,
          hostedUrl,
          altText,
        });

        this.log(`Replaced: ${imagePath} → ${hostedUrl}`);
      } catch (error) {
        console.error(`Failed to upload ${imagePath}: ${error.message}`);
      }
    }

    return {
      markdown: processedMarkdown,
      uploadedFiles,
    };
  }

  /**
   * Process markdown to download expiring Notion images
   * @param {string} markdown - Markdown content
   * @returns {Promise<{markdown: string, downloadedImages: Array}>} Processed markdown and download info
   */
  async downloadNotionImages(markdown) {
    // Match Notion image URLs (they contain "notion" in the domain)
    const notionImageRegex = /!\[([^\]]*)\]\((https:\/\/[^)]*notion[^)]*\.(png|jpg|jpeg|gif|webp)[^)]*)\)/gi;
    const downloadedImages = [];
    let processedMarkdown = markdown;

    const matches = [...markdown.matchAll(notionImageRegex)];

    for (const match of matches) {
      const [fullMatch, altText, notionUrl] = match;

      try {
        this.log(`Downloading Notion image: ${notionUrl}`);

        // Download image
        const imageBuffer = await this.adapter.download(notionUrl);

        // Extract filename from URL or generate
        const filename = this.extractFilenameFromUrl(notionUrl) || `notion-${Date.now()}.png`;

        // Get MIME type
        const mimeType = mime.lookup(filename) || 'image/png';

        // Upload to stable hosting
        const hostedUrl = await this.adapter.upload(imageBuffer, filename, mimeType);

        // Replace in markdown
        processedMarkdown = processedMarkdown.replace(
          fullMatch,
          `![${altText}](${hostedUrl})`
        );

        downloadedImages.push({
          notionUrl,
          hostedUrl,
          filename,
        });

        this.log(`Re-hosted: ${notionUrl} → ${hostedUrl}`);
      } catch (error) {
        console.error(`Failed to download Notion image: ${error.message}`);
      }
    }

    return {
      markdown: processedMarkdown,
      downloadedImages,
    };
  }

  /**
   * Extract filename from URL
   * @param {string} url - URL
   * @returns {string|null} Filename or null
   * @private
   */
  extractFilenameFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const parts = pathname.split('/');
      const lastPart = parts[parts.length - 1];

      // Check if it looks like a filename
      if (lastPart && lastPart.includes('.')) {
        return lastPart;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear URL cache
   */
  clearCache() {
    this.urlCache.clear();
    this.log('Cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      size: this.urlCache.size,
      enabled: this.cacheEnabled,
      entries: Array.from(this.urlCache.entries()).map(([path, url]) => ({ path, url })),
    };
  }

  /**
   * Log message if verbose enabled
   * @param {string} message
   * @private
   */
  log(message) {
    if (this.verbose) {
      console.log(`[FileUpload] ${message}`);
    }
  }
}

/**
 * Helper function to create file upload manager
 * @param {Object} options - Options (same as FileUploadManager constructor)
 * @returns {FileUploadManager} Manager instance
 */
export function createFileUploadManager(options = {}) {
  return new FileUploadManager(options);
}

export default FileUploadManager;
