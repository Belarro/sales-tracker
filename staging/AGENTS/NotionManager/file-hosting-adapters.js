/**
 * NotionManager v4.1.0 - File Hosting Adapters
 *
 * Provides abstraction for uploading files to various hosting backends.
 * Supports GitHub (default), S3, and Imgur.
 *
 * @module file-hosting-adapters
 */

import { Octokit } from '@octokit/rest';
import fetch from 'node-fetch';
import crypto from 'crypto';

// Optional: S3 support (only load if available)
let S3Client, PutObjectCommand;
try {
  const s3Module = await import('@aws-sdk/client-s3');
  S3Client = s3Module.S3Client;
  PutObjectCommand = s3Module.PutObjectCommand;
} catch (error) {
  // S3 not installed, will error if user tries to use S3 backend
}

/**
 * Abstract base class for file hosting adapters
 */
export class FileHostingAdapter {
  /**
   * Upload a file to hosting backend
   * @param {Buffer} fileBuffer - File content
   * @param {string} filename - Original filename
   * @param {string} mimeType - MIME type
   * @returns {Promise<string>} Public URL of uploaded file
   * @abstract
   */
  async upload(fileBuffer, filename, mimeType) {
    throw new Error('upload() must be implemented by subclass');
  }

  /**
   * Download a file from URL
   * @param {string} url - File URL
   * @returns {Promise<Buffer>} File content
   */
  async download(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download ${url}: ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  /**
   * Generate unique filename
   * @param {string} originalFilename - Original filename
   * @param {Buffer} fileBuffer - File content (for hash)
   * @returns {string} Unique filename
   */
  generateUniqueFilename(originalFilename, fileBuffer) {
    const ext = originalFilename.split('.').pop();
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex').substring(0, 8);
    const basename = originalFilename.replace(/\.[^/.]+$/, '').substring(0, 50); // Max 50 chars
    return `${basename}-${hash}.${ext}`;
  }
}

/**
 * GitHub hosting adapter (default, free)
 *
 * Uploads files to GitHub repository as assets.
 */
export class GitHubHostingAdapter extends FileHostingAdapter {
  /**
   * @param {Object} config
   * @param {string} config.token - GitHub personal access token
   * @param {string} config.owner - Repository owner
   * @param {string} config.repo - Repository name
   * @param {string} [config.branch='main'] - Branch to commit to
   * @param {string} [config.assetPath='assets'] - Directory for assets
   * @param {boolean} [config.verbose=false] - Enable logging
   */
  constructor(config) {
    super();

    if (!config.token) {
      throw new Error('GitHub token is required');
    }
    if (!config.owner || !config.repo) {
      throw new Error('GitHub owner and repo are required');
    }

    this.octokit = new Octokit({ auth: config.token });
    this.owner = config.owner;
    this.repo = config.repo;
    this.branch = config.branch || 'main';
    this.assetPath = config.assetPath || 'assets';
    this.verbose = config.verbose || false;
  }

  /**
   * Upload file to GitHub repository
   * @param {Buffer} fileBuffer - File content
   * @param {string} filename - Original filename
   * @param {string} mimeType - MIME type
   * @returns {Promise<string>} Raw GitHub URL
   */
  async upload(fileBuffer, filename, mimeType) {
    // Generate unique filename to avoid conflicts
    const uniqueFilename = this.generateUniqueFilename(filename, fileBuffer);
    const path = `${this.assetPath}/${uniqueFilename}`;

    this.log(`Uploading to GitHub: ${path}`);

    try {
      // Check if file already exists
      let sha = null;
      try {
        const existing = await this.octokit.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path,
          ref: this.branch,
        });
        sha = existing.data.sha;
        this.log(`File exists, updating (sha: ${sha})`);
      } catch (error) {
        if (error.status !== 404) {
          throw error;
        }
        this.log('File does not exist, creating new');
      }

      // Create or update file
      const content = fileBuffer.toString('base64');
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path,
        message: `Upload asset: ${filename}`,
        content,
        branch: this.branch,
        ...(sha && { sha }), // Include SHA if updating
      });

      const url = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}/${path}`;
      this.log(`Uploaded successfully: ${url}`);

      return url;
    } catch (error) {
      throw new Error(`GitHub upload failed: ${error.message}`);
    }
  }

  /**
   * Log if verbose enabled
   * @param {string} message
   * @private
   */
  log(message) {
    if (this.verbose) {
      console.log(`[GitHubAdapter] ${message}`);
    }
  }
}

/**
 * AWS S3 hosting adapter
 *
 * Uploads files to S3 bucket with public read access.
 */
export class S3HostingAdapter extends FileHostingAdapter {
  /**
   * @param {Object} config
   * @param {string} config.bucket - S3 bucket name
   * @param {string} config.region - AWS region
   * @param {string} [config.accessKeyId] - AWS access key ID
   * @param {string} [config.secretAccessKey] - AWS secret access key
   * @param {boolean} [config.verbose=false] - Enable logging
   */
  constructor(config) {
    super();

    if (!S3Client || !PutObjectCommand) {
      throw new Error('S3 backend requires @aws-sdk/client-s3: npm install @aws-sdk/client-s3');
    }

    if (!config.bucket || !config.region) {
      throw new Error('S3 bucket and region are required');
    }

    this.bucket = config.bucket;
    this.region = config.region;
    this.verbose = config.verbose || false;

    // Create S3 client
    this.s3 = new S3Client({
      region: config.region,
      ...(config.accessKeyId && config.secretAccessKey && {
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
      }),
    });
  }

  /**
   * Upload file to S3
   * @param {Buffer} fileBuffer - File content
   * @param {string} filename - Original filename
   * @param {string} mimeType - MIME type
   * @returns {Promise<string>} Public S3 URL
   */
  async upload(fileBuffer, filename, mimeType) {
    const uniqueFilename = this.generateUniqueFilename(filename, fileBuffer);

    this.log(`Uploading to S3: ${this.bucket}/${uniqueFilename}`);

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: uniqueFilename,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: 'public-read',
      });

      await this.s3.send(command);

      const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${uniqueFilename}`;
      this.log(`Uploaded successfully: ${url}`);

      return url;
    } catch (error) {
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  /**
   * Log if verbose enabled
   * @param {string} message
   * @private
   */
  log(message) {
    if (this.verbose) {
      console.log(`[S3Adapter] ${message}`);
    }
  }
}

/**
 * Imgur hosting adapter (images only)
 *
 * Uploads images to Imgur. Free tier with rate limits.
 */
export class ImgurHostingAdapter extends FileHostingAdapter {
  /**
   * @param {Object} config
   * @param {string} config.clientId - Imgur client ID
   * @param {boolean} [config.verbose=false] - Enable logging
   */
  constructor(config) {
    super();

    if (!config.clientId) {
      throw new Error('Imgur client ID is required');
    }

    this.clientId = config.clientId;
    this.verbose = config.verbose || false;
  }

  /**
   * Upload image to Imgur
   * @param {Buffer} fileBuffer - Image content
   * @param {string} filename - Original filename
   * @param {string} mimeType - MIME type
   * @returns {Promise<string>} Imgur URL
   */
  async upload(fileBuffer, filename, mimeType) {
    // Imgur only supports images
    if (!mimeType.startsWith('image/')) {
      throw new Error(`Imgur only supports images, got: ${mimeType}`);
    }

    this.log(`Uploading to Imgur: ${filename}`);

    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${this.clientId}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: fileBuffer.toString('base64'),
          type: 'base64',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.data?.error || 'Upload failed');
      }

      const url = data.data.link;
      this.log(`Uploaded successfully: ${url}`);

      return url;
    } catch (error) {
      throw new Error(`Imgur upload failed: ${error.message}`);
    }
  }

  /**
   * Log if verbose enabled
   * @param {string} message
   * @private
   */
  log(message) {
    if (this.verbose) {
      console.log(`[ImgurAdapter] ${message}`);
    }
  }
}

/**
 * Factory function to create hosting adapter from config
 * @param {Object} config - Configuration
 * @param {string} config.backend - Backend type (github|s3|imgur)
 * @param {Object} config[backend] - Backend-specific config
 * @returns {FileHostingAdapter} Adapter instance
 */
export function createFileHostingAdapter(config) {
  const backend = config.backend || 'github';

  switch (backend) {
    case 'github':
      return new GitHubHostingAdapter(config.github || config);

    case 's3':
      if (!config.s3) {
        throw new Error('S3 configuration is required');
      }
      return new S3HostingAdapter(config.s3);

    case 'imgur':
      if (!config.imgur) {
        throw new Error('Imgur configuration is required');
      }
      return new ImgurHostingAdapter(config.imgur);

    default:
      throw new Error(`Unknown backend: ${backend}. Supported: github, s3, imgur`);
  }
}

export default {
  FileHostingAdapter,
  GitHubHostingAdapter,
  S3HostingAdapter,
  ImgurHostingAdapter,
  createFileHostingAdapter,
};
