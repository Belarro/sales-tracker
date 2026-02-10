#!/usr/bin/env node

/**
 * Progress Tracker for NotionManager v3.6
 *
 * Provides:
 * - Progress indicators for long operations
 * - Time estimates based on current rate
 * - Structured logging with levels
 * - Summary statistics
 * - Elapsed time tracking
 */

export class ProgressTracker {
  constructor(total, label, options = {}) {
    this.total = total;
    this.current = 0;
    this.label = label;
    this.startTime = Date.now();
    this.lastUpdateTime = Date.now();

    // Options
    this.updateInterval = options.updateInterval || 1; // Update every N items
    this.minUpdateDelay = options.minUpdateDelay || 100; // Min ms between updates
    this.showETA = options.showETA !== false; // Default true
    this.showRate = options.showRate !== false; // Default true
    this.verbose = options.verbose || false;

    // Stats
    this.errors = 0;
    this.warnings = 0;
    this.successes = 0;
  }

  /**
   * Update progress
   * @param {number} count - Number of items processed
   * @param {Object} stats - Optional stats (errors, warnings, successes)
   */
  update(count = 1, stats = {}) {
    this.current += count;

    // Track stats
    if (stats.error) this.errors++;
    if (stats.warning) this.warnings++;
    if (stats.success) this.successes++;

    // Throttle updates
    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastUpdateTime;

    if (
      this.current % this.updateInterval === 0 &&
      timeSinceLastUpdate >= this.minUpdateDelay
    ) {
      this.lastUpdateTime = now;
      this.display();
    }
  }

  /**
   * Display current progress
   */
  display() {
    const percent = Math.floor((this.current / this.total) * 100);
    const elapsed = Date.now() - this.startTime;
    const rate = this.current / (elapsed / 1000); // items per second
    const remaining = (this.total - this.current) / rate; // seconds

    let message = `${this.label}: ${this.current}/${this.total} (${percent}%)`;

    if (this.showRate && rate > 0) {
      message += ` - ${rate.toFixed(1)} items/s`;
    }

    if (this.showETA && remaining > 0 && isFinite(remaining)) {
      if (remaining < 60) {
        message += ` - ${Math.floor(remaining)}s remaining`;
      } else if (remaining < 3600) {
        message += ` - ${Math.floor(remaining / 60)}m ${Math.floor(remaining % 60)}s remaining`;
      } else {
        const hours = Math.floor(remaining / 3600);
        const mins = Math.floor((remaining % 3600) / 60);
        message += ` - ${hours}h ${mins}m remaining`;
      }
    }

    console.log(`  📊 ${message}`);

    // Show detailed stats if verbose
    if (this.verbose && (this.errors > 0 || this.warnings > 0)) {
      console.log(`      ✅ ${this.successes} | ⚠️  ${this.warnings} | ❌ ${this.errors}`);
    }
  }

  /**
   * Mark progress as complete and show summary
   * @returns {Object} Summary statistics
   */
  complete() {
    const elapsed = Date.now() - this.startTime;
    const rate = this.current / (elapsed / 1000);

    console.log(`  ✅ ${this.label} complete: ${this.current} items in ${this.formatTime(elapsed)}`);

    if (this.showRate && rate > 0) {
      console.log(`     Average rate: ${rate.toFixed(1)} items/s`);
    }

    if (this.errors > 0 || this.warnings > 0) {
      console.log(`     Results: ✅ ${this.successes} | ⚠️  ${this.warnings} | ❌ ${this.errors}`);
    }

    return {
      total: this.current,
      elapsed,
      rate,
      successes: this.successes,
      warnings: this.warnings,
      errors: this.errors,
    };
  }

  /**
   * Format time in human-readable format
   * @param {number} ms - Milliseconds
   * @returns {string} Formatted time
   */
  formatTime(ms) {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else if (ms < 3600000) {
      const mins = Math.floor(ms / 60000);
      const secs = Math.floor((ms % 60000) / 1000);
      return `${mins}m ${secs}s`;
    } else {
      const hours = Math.floor(ms / 3600000);
      const mins = Math.floor((ms % 3600000) / 60000);
      return `${hours}h ${mins}m`;
    }
  }
}

/**
 * Logger with structured levels
 */
export class Logger {
  static LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
  };

  constructor(options = {}) {
    this.level = options.level || Logger.LEVELS.INFO;
    this.prefix = options.prefix || '';
    this.timestamps = options.timestamps || false;
  }

  /**
   * Get timestamp prefix if enabled
   */
  getTimestamp() {
    if (!this.timestamps) return '';
    const now = new Date();
    return `[${now.toLocaleTimeString()}] `;
  }

  /**
   * Log error message
   */
  error(message, ...args) {
    if (this.level >= Logger.LEVELS.ERROR) {
      console.error(`${this.getTimestamp()}${this.prefix}❌ ${message}`, ...args);
    }
  }

  /**
   * Log warning message
   */
  warn(message, ...args) {
    if (this.level >= Logger.LEVELS.WARN) {
      console.warn(`${this.getTimestamp()}${this.prefix}⚠️  ${message}`, ...args);
    }
  }

  /**
   * Log info message
   */
  info(message, ...args) {
    if (this.level >= Logger.LEVELS.INFO) {
      console.log(`${this.getTimestamp()}${this.prefix}ℹ️  ${message}`, ...args);
    }
  }

  /**
   * Log debug message
   */
  debug(message, ...args) {
    if (this.level >= Logger.LEVELS.DEBUG) {
      console.log(`${this.getTimestamp()}${this.prefix}🔍 ${message}`, ...args);
    }
  }

  /**
   * Log success message
   */
  success(message, ...args) {
    if (this.level >= Logger.LEVELS.INFO) {
      console.log(`${this.getTimestamp()}${this.prefix}✅ ${message}`, ...args);
    }
  }

  /**
   * Log step message
   */
  step(step, total, message) {
    if (this.level >= Logger.LEVELS.INFO) {
      console.log(`${this.getTimestamp()}${this.prefix}📋 Step ${step}/${total}: ${message}`);
    }
  }
}

/**
 * Operation timer for performance tracking
 */
export class OperationTimer {
  constructor(label) {
    this.label = label;
    this.startTime = Date.now();
    this.checkpoints = [];
  }

  /**
   * Add a checkpoint
   */
  checkpoint(label) {
    const elapsed = Date.now() - this.startTime;
    this.checkpoints.push({ label, elapsed });
  }

  /**
   * Complete and show summary
   */
  complete() {
    const total = Date.now() - this.startTime;

    console.log(`\n⏱️  ${this.label} Performance:`);
    console.log(`   Total: ${this.formatTime(total)}`);

    if (this.checkpoints.length > 0) {
      console.log(`\n   Breakdown:`);

      for (let i = 0; i < this.checkpoints.length; i++) {
        const checkpoint = this.checkpoints[i];
        const prev = i > 0 ? this.checkpoints[i - 1].elapsed : 0;
        const duration = checkpoint.elapsed - prev;
        const percent = Math.floor((duration / total) * 100);

        console.log(`     ${checkpoint.label}: ${this.formatTime(duration)} (${percent}%)`);
      }
    }

    return {
      total,
      checkpoints: this.checkpoints,
    };
  }

  /**
   * Format time in human-readable format
   */
  formatTime(ms) {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`;
    } else {
      const mins = Math.floor(ms / 60000);
      const secs = ((ms % 60000) / 1000).toFixed(1);
      return `${mins}m ${secs}s`;
    }
  }
}

/**
 * Test progress tracking
 */
async function testProgressTracking() {
  console.log('=== Progress Tracking Test ===\n');

  // Test 1: Basic progress tracking
  console.log('Test 1: Basic progress tracking...\n');

  const progress1 = new ProgressTracker(100, 'Processing items', {
    updateInterval: 10,
    showETA: true,
    showRate: true,
  });

  for (let i = 0; i < 100; i++) {
    await new Promise(resolve => setTimeout(resolve, 10)); // Simulate work
    progress1.update(1, { success: i % 10 !== 0, warning: i % 10 === 0 });
  }

  const stats1 = progress1.complete();
  console.log('\nStats:', JSON.stringify(stats1, null, 2));
  console.log();

  // Test 2: Logger with different levels
  console.log('Test 2: Structured logging...\n');

  const logger = new Logger({
    level: Logger.LEVELS.DEBUG,
    prefix: '[NotionManager] ',
    timestamps: true,
  });

  logger.error('This is an error');
  logger.warn('This is a warning');
  logger.info('This is info');
  logger.debug('This is debug');
  logger.success('This is success');
  logger.step(1, 5, 'First step');
  console.log();

  // Test 3: Operation timer
  console.log('Test 3: Operation timing...\n');

  const timer = new OperationTimer('Multi-step operation');

  await new Promise(resolve => setTimeout(resolve, 100));
  timer.checkpoint('Step 1: Validation');

  await new Promise(resolve => setTimeout(resolve, 200));
  timer.checkpoint('Step 2: Processing');

  await new Promise(resolve => setTimeout(resolve, 150));
  timer.checkpoint('Step 3: Sync');

  timer.complete();
  console.log();

  // Test 4: Real-world scenario
  console.log('Test 4: Real-world scenario (page resolution)...\n');

  const progress2 = new ProgressTracker(50, 'Resolving pages', {
    updateInterval: 5,
    verbose: true,
  });

  for (let i = 0; i < 50; i++) {
    await new Promise(resolve => setTimeout(resolve, 20));

    const isError = Math.random() < 0.05; // 5% error rate
    const isWarning = Math.random() < 0.1; // 10% warning rate

    progress2.update(1, {
      success: !isError && !isWarning,
      warning: isWarning,
      error: isError,
    });
  }

  progress2.complete();
  console.log();

  console.log('✅ All tests complete!');
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testProgressTracking().catch(console.error);
}
