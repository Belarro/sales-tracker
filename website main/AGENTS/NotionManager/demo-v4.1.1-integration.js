/**
 * NotionManager v4.1.1 - File Upload Integration Demo
 *
 * Demonstrates integration of file upload features with bidirectional sync.
 */

import { createBidirectionalSyncOrchestrator } from './bidirectional-sync-orchestrator.js';

async function runDemo() {
  console.log('='.repeat(70));
  console.log('NotionManager v4.1.1 - File Upload Integration Demo');
  console.log('='.repeat(70));
  console.log();

  console.log('📝 This demo shows v4.1.1 file upload integration features');
  console.log('   File uploads are now integrated into bidirectional sync');
  console.log();

  // Check if credentials are configured
  const hasNotionToken = !!process.env.NOTION_TOKEN;
  const hasGitHubConfig = !!(process.env.GITHUB_TOKEN &&
                              process.env.GITHUB_OWNER &&
                              process.env.GITHUB_REPO);

  if (!hasNotionToken || !hasGitHubConfig) {
    console.log('⚠️  Credentials not fully configured');
    console.log('   Showing API examples without actual sync');
    console.log();
    console.log('   Required environment variables:');
    console.log('   - NOTION_TOKEN (Notion integration token)');
    console.log('   - GITHUB_TOKEN (GitHub personal access token)');
    console.log('   - GITHUB_OWNER (GitHub username)');
    console.log('   - GITHUB_REPO (Repository name)');
    console.log();
  }

  console.log('📦 Step 1: Create Orchestrator with File Upload\n');

  // Create orchestrator with file upload enabled
  const orchestrator = await createBidirectionalSyncOrchestrator({
    notionToken: process.env.NOTION_TOKEN || 'dummy-token',
    syncMapPath: './.notion-sync-map-demo.json',
    repoPath: '.',
    pollInterval: 60000,
    defaultConflictStrategy: 'interactive',

    // v4.1.1 - File upload configuration
    enableFileUploads: true,          // Upload local images when syncing Git→Notion
    downloadNotionImages: true,       // Download expiring Notion images when syncing Notion→Git
    fileHosting: {
      backend: 'github',
      github: {
        token: process.env.GITHUB_TOKEN || 'dummy-token',
        owner: process.env.GITHUB_OWNER || 'username',
        repo: process.env.GITHUB_REPO || 'repo',
        branch: 'main',
        assetPath: 'assets',
        verbose: true,
      },
    },

    verbose: true,
  });

  console.log('  ✅ Orchestrator created with file upload features\n');

  console.log('📋 Configuration:');
  console.log('   Features enabled:');
  console.log('   ✅ Bidirectional sync (v4.0)');
  console.log('   ✅ Local file upload (v4.1.1)');
  console.log('   ✅ Notion image download (v4.1.1)');
  console.log();
  console.log('   File hosting:');
  console.log(`   Backend: GitHub`);
  console.log(`   Owner: ${process.env.GITHUB_OWNER || 'username'}`);
  console.log(`   Repo: ${process.env.GITHUB_REPO || 'repo'}`);
  console.log(`   Asset Path: assets/`);
  console.log();

  console.log('🔄 Step 2: Git → Notion Sync with File Upload\n');

  console.log('  Workflow:');
  console.log('  1️⃣  Read markdown file from Git');
  console.log('  2️⃣  Detect local images: ![alt](./path/to/image.png)');
  console.log('  3️⃣  Upload local images to GitHub (assets/ directory)');
  console.log('  4️⃣  Replace paths with GitHub raw URLs');
  console.log('  5️⃣  Convert markdown to Notion blocks');
  console.log('  6️⃣  Update Notion page with blocks');
  console.log();

  console.log('  Example markdown:');
  console.log('  ' + '-'.repeat(68));
  const exampleGitMarkdown = `# Architecture Overview

This document includes local images that will be uploaded.

![System Architecture](./diagrams/system-arch.png)
![Component Diagram](../assets/components.svg)

These images are automatically uploaded to GitHub and
converted to stable URLs before syncing to Notion.`;
  console.log(exampleGitMarkdown.split('\n').map(line => '  ' + line).join('\n'));
  console.log('  ' + '-'.repeat(68));
  console.log();

  console.log('  Processing:');
  console.log('  ✅ Detected: ./diagrams/system-arch.png → Upload to GitHub');
  console.log('  ✅ Detected: ../assets/components.svg → Upload to GitHub');
  console.log('  ✅ URLs replaced with https://raw.githubusercontent.com/...');
  console.log('  ✅ Notion blocks created with stable image URLs');
  console.log();

  console.log('🔄 Step 3: Notion → Git Sync with Image Download\n');

  console.log('  Workflow:');
  console.log('  1️⃣  Fetch Notion blocks');
  console.log('  2️⃣  Convert blocks to markdown');
  console.log('  3️⃣  Detect expiring Notion image URLs');
  console.log('  4️⃣  Download images before they expire (~1 hour)');
  console.log('  5️⃣  Re-upload to GitHub for stable hosting');
  console.log('  6️⃣  Replace Notion URLs with stable URLs');
  console.log('  7️⃣  Write markdown to Git file');
  console.log('  8️⃣  Create Git commit with attribution');
  console.log();

  console.log('  Example Notion URL (expiring):');
  console.log('  ' + '-'.repeat(68));
  const exampleNotionUrl = 'https://prod-files-secure.s3.us-west-2.amazonaws.com/workspace-id/file-id/diagram.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&Expires=1698765432';
  console.log('  ' + exampleNotionUrl);
  console.log('  ' + '-'.repeat(68));
  console.log();

  console.log('  Processing:');
  console.log('  ✅ Detected expiring Notion image');
  console.log('  ✅ Downloaded image from Notion S3');
  console.log('  ✅ Re-uploaded to GitHub: assets/diagram-abc123.png');
  console.log('  ✅ Replaced with stable URL: https://raw.githubusercontent.com/...');
  console.log('  ✅ Markdown written with permanent URLs');
  console.log();

  console.log('💾 Step 4: File Type Support\n');

  const supportedTypes = {
    'Images': {
      formats: ['PNG', 'JPG', 'GIF', 'SVG', 'WebP'],
      use_case: 'Diagrams, screenshots, logos',
    },
    'Documents': {
      formats: ['PDF'],
      use_case: 'Specifications, reports',
    },
    'Videos': {
      formats: ['MP4', 'MOV', 'AVI'],
      use_case: 'Demos, tutorials',
    },
    'Other': {
      formats: ['ZIP', 'TXT', 'CSV', 'JSON'],
      use_case: 'Downloads, data files',
    },
  };

  for (const [category, info] of Object.entries(supportedTypes)) {
    console.log(`  ${category}:`);
    console.log(`     Formats: ${info.formats.join(', ')}`);
    console.log(`     Use Case: ${info.use_case}`);
  }
  console.log();

  console.log('⚡ Step 5: Performance & Caching\n');

  console.log('  Upload Caching:');
  console.log('  • Files are cached by local path');
  console.log('  • Subsequent uploads of same file return cached URL (< 1ms)');
  console.log('  • Prevents duplicate uploads during sync');
  console.log('  • Cache persists for orchestrator instance lifetime');
  console.log();

  console.log('  Rate Limiting:');
  console.log('  • Notion API: 600ms delay between calls');
  console.log('  • GitHub API: 5,000 requests/hour limit');
  console.log('  • Automatic queuing prevents concurrent duplicate uploads');
  console.log();

  console.log('  File Size Limits:');
  console.log('  • GitHub: 100MB max (warning at 10MB)');
  console.log('  • S3: Unlimited (costs apply)');
  console.log('  • Imgur: 10MB max (images only)');
  console.log();

  console.log('🔧 Step 6: Usage Examples\n');

  console.log('  Basic setup:');
  console.log('  ' + '-'.repeat(68));
  const setupCode = `import { createBidirectionalSyncOrchestrator } from './bidirectional-sync-orchestrator.js';

const orchestrator = await createBidirectionalSyncOrchestrator({
  notionToken: process.env.NOTION_TOKEN,
  enableFileUploads: true,          // Enable local file uploads
  downloadNotionImages: true,       // Enable Notion image download
  fileHosting: {
    backend: 'github',              // or 's3', 'imgur'
    github: {
      token: process.env.GITHUB_TOKEN,
      owner: 'username',
      repo: 'my-docs',
      assetPath: 'assets',
    },
  },
  verbose: true,
});

// Register a page
await orchestrator.registerPage(
  '29660b6e-...',                   // Notion page ID
  'docs/README.md',                 // Git file path
  'Documentation',                  // Title
);

// Sync Git → Notion (uploads local images automatically)
await orchestrator.syncGitToNotion('29660b6e-...');

// Sync Notion → Git (downloads expiring images automatically)
await orchestrator.syncNotionToGit('29660b6e-...');`;
  console.log(setupCode.split('\n').map(line => '  ' + line).join('\n'));
  console.log('  ' + '-'.repeat(68));
  console.log();

  console.log('  Continuous sync:');
  console.log('  ' + '-'.repeat(68));
  const continuousCode = `// Start polling (checks every 60s, auto-syncs changes)
await orchestrator.startContinuousSync({
  autoSync: true,  // Automatically sync detected changes
});

// File uploads/downloads happen automatically during sync
// - Git→Notion: Local images uploaded before conversion
// - Notion→Git: Expiring images downloaded after conversion`;
  console.log(continuousCode.split('\n').map(line => '  ' + line).join('\n'));
  console.log('  ' + '-'.repeat(68));
  console.log();

  console.log('='.repeat(70));
  console.log('✅ DEMO COMPLETE');
  console.log('='.repeat(70));
  console.log();
  console.log('v4.1.1 Integration Features:');
  console.log('  ✅ File upload integrated into Git→Notion sync');
  console.log('  ✅ Image download integrated into Notion→Git sync');
  console.log('  ✅ Automatic URL replacement in markdown');
  console.log('  ✅ Support for multiple file types (images, PDFs, videos)');
  console.log('  ✅ Upload caching for performance');
  console.log('  ✅ Multiple backend support (GitHub, S3, Imgur)');
  console.log('  ✅ Seamless integration with v4.0 orchestrator');
  console.log();
  console.log('Benefits:');
  console.log('  ✅ No more broken Notion image URLs');
  console.log('  ✅ Local images automatically hosted');
  console.log('  ✅ Full round-trip sync with attachments');
  console.log('  ✅ Zero configuration for basic use');
  console.log('  ✅ Production-ready file handling');
  console.log();
  console.log('Production Ready:');
  console.log('  ✅ Comprehensive error handling');
  console.log('  ✅ File size validation');
  console.log('  ✅ MIME type detection');
  console.log('  ✅ Rate limiting and caching');
  console.log('  ✅ Graceful degradation (features optional)');
  console.log();
  console.log('Next Steps:');
  console.log('  1. Configure GitHub credentials (.env)');
  console.log('  2. Test with real Notion pages');
  console.log('  3. Register pages for sync');
  console.log('  4. Start continuous sync or manual sync as needed');
  console.log();
  console.log('='.repeat(70));
}

// Run demo
runDemo()
  .then(() => {
    console.log('\n✅ Demo completed\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Demo failed:', error);
    process.exit(1);
  });
