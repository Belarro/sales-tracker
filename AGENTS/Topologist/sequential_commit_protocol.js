/**
 * Sequential Commit Protocol for Multi-Repository Management
 * 
 * This module implements a sophisticated commit protocol that can handle
 * multiple independent repositories in a coordinated, sequential manner
 * with full rollback capabilities and dependency management.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SequentialCommitProtocol {
  constructor(repositories = new Map()) {
    this.repositories = repositories;
    this.commitQueue = [];
    this.rollbackStack = [];
    this.transactionLog = [];
    this.dependencyGraph = new Map();
    this.config = this.loadConfiguration();
  }

  /**
   * Load configuration for multi-repository operations
   */
  loadConfiguration() {
    try {
      const configPath = path.join(process.cwd(), 'multi_repo_config.json');
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (error) {
      console.log('No multi-repository configuration found, using defaults');
    }
    
    return {
      requireCleanWorkingTree: true,
      validateCommitMessages: true,
      enableRollback: true,
      parallelExecution: false,
      maxRetries: 3,
      rollbackOnAnyFailure: true
    };
  }

  /**
   * Discover repositories in the specified root directory
   */
  async discoverRepositories(rootPath) {
    const repositories = new Map();
    
    try {
      const entries = fs.readdirSync(rootPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const repoPath = path.join(rootPath, entry.name);
          const gitPath = path.join(repoPath, '.git');
          
          if (fs.existsSync(gitPath)) {
            const metadata = await this.analyzeRepository(repoPath);
            if (metadata.isValid) {
              repositories.set(entry.name, {
                name: entry.name,
                path: repoPath,
                ...metadata
              });
            }
          }
        }
      }
      
      this.repositories = repositories;
      console.log(`Discovered ${repositories.size} repositories`);
      return repositories;
    } catch (error) {
      throw new Error(`Failed to discover repositories: ${error.message}`);
    }
  }

  /**
   * Analyze a single repository for health and commit readiness
   */
  async analyzeRepository(repoPath) {
    try {
      const originalCwd = process.cwd();
      process.chdir(repoPath);
      
      try {
        // Check if it's a valid git repository
        execSync('git rev-parse --git-dir', { stdio: 'pipe' });
        
        // Get current status
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
        const lastCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
        
        // Check for uncommitted changes
        const hasUncommittedChanges = status.trim().length > 0;
        const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
        const unstagedFiles = execSync('git diff --name-only', { encoding: 'utf8' }).trim();
        
        // Analyze changes if any exist
        let changeAnalysis = null;
        if (hasUncommittedChanges) {
          changeAnalysis = this.analyzeChanges(status, stagedFiles, unstagedFiles);
        }
        
        return {
          isValid: true,
          currentBranch,
          lastCommit,
          hasUncommittedChanges,
          stagedFiles: stagedFiles ? stagedFiles.split('\n').filter(f => f.trim()) : [],
          unstagedFiles: unstagedFiles ? unstagedFiles.split('\n').filter(f => f.trim()) : [],
          changeAnalysis,
          status: status.trim(),
          health: 'healthy'
        };
      } finally {
        process.chdir(originalCwd);
      }
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
        health: 'unhealthy'
      };
    }
  }

  /**
   * Analyze the nature and scope of changes in a repository
   */
  analyzeChanges(status, stagedFiles, unstagedFiles) {
    const lines = status.split('\n').filter(line => line.trim());
    const analysis = {
      totalFiles: lines.length,
      newFiles: 0,
      modifiedFiles: 0,
      deletedFiles: 0,
      renamedFiles: 0,
      categories: {
        code: 0,
        documentation: 0,
        configuration: 0,
        other: 0
      }
    };
    
    lines.forEach(line => {
      const statusCode = line.substring(0, 2);
      const filename = line.substring(3);
      
      // Count by status
      if (statusCode.includes('A')) analysis.newFiles++;
      if (statusCode.includes('M')) analysis.modifiedFiles++;
      if (statusCode.includes('D')) analysis.deletedFiles++;
      if (statusCode.includes('R')) analysis.renamedFiles++;
      
      // Categorize by file type
      const ext = path.extname(filename).toLowerCase();
      if (['.js', '.ts', '.rs', '.py', '.java', '.cpp', '.c'].includes(ext)) {
        analysis.categories.code++;
      } else if (['.md', '.txt', '.doc', '.pdf'].includes(ext)) {
        analysis.categories.documentation++;
      } else if (['.json', '.yml', '.yaml', '.xml', '.toml', '.ini'].includes(ext)) {
        analysis.categories.configuration++;
      } else {
        analysis.categories.other++;
      }
    });
    
    return analysis;
  }

  /**
   * Build dependency graph between repositories
   */
  buildDependencyGraph() {
    const graph = new Map();
    
    for (const [repoName, repo] of this.repositories) {
      graph.set(repoName, {
        dependencies: [],
        dependents: [],
        priority: 0
      });
    }
    
    // Check for dependency configuration
    if (this.config.repositories) {
      for (const [repoName, repoConfig] of Object.entries(this.config.repositories)) {
        if (graph.has(repoName) && repoConfig.dependencies) {
          graph.get(repoName).dependencies = repoConfig.dependencies;
          graph.get(repoName).priority = repoConfig.commitPriority || 0;
          
          // Update dependents
          repoConfig.dependencies.forEach(dep => {
            if (graph.has(dep)) {
              graph.get(dep).dependents.push(repoName);
            }
          });
        }
      }
    }
    
    this.dependencyGraph = graph;
    return graph;
  }

  /**
   * Create execution plan for sequential commits
   */
  createExecutionPlan() {
    this.buildDependencyGraph();
    
    const plan = {
      phases: [],
      totalRepositories: this.repositories.size,
      repositoriesWithChanges: 0,
      estimatedDuration: 0
    };
    
    const remaining = new Set(this.repositories.keys());
    const committed = new Set();
    let phase = 1;
    
    // Count repositories with changes
    for (const [name, repo] of this.repositories) {
      if (repo.hasUncommittedChanges) {
        plan.repositoriesWithChanges++;
      }
    }
    
    // Build phases based on dependencies
    while (remaining.size > 0) {
      const currentPhase = {
        phase,
        repositories: [],
        canRunInParallel: this.config.parallelExecution,
        estimatedDuration: 0
      };
      
      const readyRepos = [];
      
      for (const repoName of remaining) {
        const repo = this.repositories.get(repoName);
        const deps = this.dependencyGraph.get(repoName).dependencies;
        
        // Check if all dependencies are satisfied
        const depsReady = deps.every(dep => committed.has(dep));
        
        if (depsReady && repo.hasUncommittedChanges) {
          readyRepos.push({
            name: repoName,
            priority: this.dependencyGraph.get(repoName).priority,
            changeCount: repo.changeAnalysis ? repo.changeAnalysis.totalFiles : 0
          });
        }
      }
      
      // Sort by priority and change count
      readyRepos.sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.changeCount - b.changeCount;
      });
      
      if (readyRepos.length === 0) {
        // Check for circular dependencies or repositories without changes
        const reposWithoutChanges = Array.from(remaining).filter(name => 
          !this.repositories.get(name).hasUncommittedChanges
        );
        
        if (reposWithoutChanges.length > 0) {
          // Remove repositories without changes
          reposWithoutChanges.forEach(name => {
            remaining.delete(name);
            committed.add(name);
          });
          continue;
        } else {
          throw new Error('Circular dependency detected or unresolvable dependencies');
        }
      }
      
      currentPhase.repositories = readyRepos.map(r => r.name);
      currentPhase.estimatedDuration = Math.max(...readyRepos.map(r => r.changeCount)) * 2; // 2 seconds per file estimate
      
      plan.phases.push(currentPhase);
      plan.estimatedDuration += currentPhase.estimatedDuration;
      
      // Mark these repositories as ready for commit
      readyRepos.forEach(r => {
        remaining.delete(r.name);
        committed.add(r.name);
      });
      
      phase++;
    }
    
    return plan;
  }

  /**
   * Execute the sequential commit protocol
   */
  async executeSequentialCommits(executionPlan, options = {}) {
    const results = {
      successful: [],
      failed: [],
      skipped: [],
      rollbacks: [],
      startTime: new Date(),
      endTime: null,
      totalDuration: 0
    };
    
    console.log(`Starting sequential commit protocol for ${executionPlan.totalRepositories} repositories`);
    console.log(`Execution plan: ${executionPlan.phases.length} phases`);
    
    try {
      for (let i = 0; i < executionPlan.phases.length; i++) {
        const phase = executionPlan.phases[i];
        console.log(`\n--- Phase ${phase.phase}: ${phase.repositories.length} repositories ---`);
        
        const phaseResults = await this.executePhase(phase, options);
        
        // Aggregate results
        results.successful.push(...phaseResults.successful);
        results.failed.push(...phaseResults.failed);
        results.skipped.push(...phaseResults.skipped);
        
        // Check if we should continue or rollback
        if (phaseResults.failed.length > 0 && this.config.rollbackOnAnyFailure) {
          console.log(`\nFailures detected in Phase ${phase.phase}. Initiating rollback...`);
          const rollbackResults = await this.rollbackCommits(results.successful);
          results.rollbacks = rollbackResults;
          break;
        }
      }
    } catch (error) {
      console.error(`Critical error during execution: ${error.message}`);
      results.criticalError = error.message;
    }
    
    results.endTime = new Date();
    results.totalDuration = results.endTime - results.startTime;
    
    return results;
  }

  /**
   * Execute a single phase of the commit protocol
   */
  async executePhase(phase, options = {}) {
    const results = {
      successful: [],
      failed: [],
      skipped: []
    };
    
    for (const repoName of phase.repositories) {
      const repo = this.repositories.get(repoName);
      console.log(`Committing ${repoName}...`);
      
      try {
        const commitResult = await this.commitRepository(repo, options);
        
        if (commitResult.success) {
          results.successful.push({
            repository: repoName,
            commitHash: commitResult.commitHash,
            message: commitResult.message,
            timestamp: new Date()
          });
          console.log(`✅ ${repoName}: ${commitResult.commitHash.substring(0, 8)}`);
        } else {
          results.failed.push({
            repository: repoName,
            error: commitResult.error,
            timestamp: new Date()
          });
          console.log(`❌ ${repoName}: ${commitResult.error}`);
        }
      } catch (error) {
        results.failed.push({
          repository: repoName,
          error: error.message,
          timestamp: new Date()
        });
        console.log(`❌ ${repoName}: ${error.message}`);
      }
    }
    
    return results;
  }

  /**
   * Commit changes in a single repository
   */
  async commitRepository(repo, options = {}) {
    const originalCwd = process.cwd();
    
    try {
      process.chdir(repo.path);
      
      // Validate pre-commit conditions
      if (this.config.requireCleanWorkingTree) {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        if (!status.trim()) {
          return { success: false, error: 'No changes to commit' };
        }
      }
      
      // Stage all changes if nothing is staged
      if (repo.stagedFiles.length === 0 && repo.unstagedFiles.length > 0) {
        execSync('git add .', { stdio: 'pipe' });
      }
      
      // Generate commit message
      const commitMessage = options.commitMessage || this.generateCommitMessage(repo);
      
      if (this.config.validateCommitMessages && !this.validateCommitMessage(commitMessage)) {
        return { success: false, error: 'Invalid commit message format' };
      }
      
      // Create rollback point
      const rollbackData = this.createRollbackPoint(repo);
      this.rollbackStack.push(rollbackData);
      
      // Execute commit
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'pipe' });
      
      // Get the new commit hash
      const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      
      // Log the transaction
      this.transactionLog.push({
        repository: repo.name,
        commitHash,
        message: commitMessage,
        timestamp: new Date(),
        rollbackData
      });
      
      return {
        success: true,
        commitHash,
        message: commitMessage
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    } finally {
      process.chdir(originalCwd);
    }
  }

  /**
   * Generate an appropriate commit message based on changes
   */
  generateCommitMessage(repo) {
    if (!repo.changeAnalysis) {
      return `Update ${repo.name}`;
    }
    
    const analysis = repo.changeAnalysis;
    const parts = [];
    
    // Determine primary change type
    if (analysis.newFiles > analysis.modifiedFiles) {
      parts.push('feat');
    } else if (analysis.categories.documentation > analysis.categories.code) {
      parts.push('docs');
    } else if (analysis.categories.configuration > 0) {
      parts.push('config');
    } else {
      parts.push('update');
    }
    
    // Generate description
    let description = '';
    if (analysis.totalFiles === 1) {
      description = 'single file update';
    } else if (analysis.categories.code > 0) {
      description = `update ${analysis.categories.code} code files`;
    } else if (analysis.categories.documentation > 0) {
      description = `update ${analysis.categories.documentation} documentation files`;
    } else {
      description = `update ${analysis.totalFiles} files`;
    }
    
    return `${parts[0]}: ${description} in ${repo.name}`;
  }

  /**
   * Validate commit message format
   */
  validateCommitMessage(message) {
    // Basic validation - starts with type: and has reasonable length
    const pattern = /^(feat|fix|docs|style|refactor|test|chore|config|update):\s.{10,}$/;
    return pattern.test(message);
  }

  /**
   * Create a rollback point for a repository
   */
  createRollbackPoint(repo) {
    const originalCwd = process.cwd();
    
    try {
      process.chdir(repo.path);
      
      return {
        repository: repo.name,
        path: repo.path,
        previousCommit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
        stagedFiles: execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim(),
        workingTreeChanges: execSync('git diff --name-only', { encoding: 'utf8' }).trim(),
        timestamp: new Date()
      };
    } catch (error) {
      return {
        repository: repo.name,
        path: repo.path,
        error: error.message,
        timestamp: new Date()
      };
    } finally {
      process.chdir(originalCwd);
    }
  }

  /**
   * Rollback commits for specified repositories
   */
  async rollbackCommits(commitResults) {
    const rollbackResults = [];
    
    // Rollback in reverse order
    for (let i = commitResults.length - 1; i >= 0; i--) {
      const commit = commitResults[i];
      console.log(`Rolling back ${commit.repository}...`);
      
      try {
        const rollbackData = this.rollbackStack.find(r => r.repository === commit.repository);
        if (!rollbackData) {
          throw new Error('No rollback data found');
        }
        
        const originalCwd = process.cwd();
        const repo = this.repositories.get(commit.repository);
        process.chdir(repo.path);
        
        try {
          // Reset to previous commit
          execSync(`git reset --hard ${rollbackData.previousCommit}`, { stdio: 'pipe' });
          
          rollbackResults.push({
            repository: commit.repository,
            success: true,
            rolledBackTo: rollbackData.previousCommit,
            timestamp: new Date()
          });
          
          console.log(`✅ Rolled back ${commit.repository} to ${rollbackData.previousCommit.substring(0, 8)}`);
        } finally {
          process.chdir(originalCwd);
        }
      } catch (error) {
        rollbackResults.push({
          repository: commit.repository,
          success: false,
          error: error.message,
          timestamp: new Date()
        });
        console.log(`❌ Failed to rollback ${commit.repository}: ${error.message}`);
      }
    }
    
    return rollbackResults;
  }

  /**
   * Generate comprehensive execution report
   */
  generateExecutionReport(results, executionPlan) {
    const report = {
      summary: {
        totalRepositories: executionPlan.totalRepositories,
        repositoriesWithChanges: executionPlan.repositoriesWithChanges,
        successful: results.successful.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
        rolledBack: results.rollbacks.length,
        duration: results.totalDuration
      },
      executionPlan,
      results,
      timestamp: new Date().toISOString()
    };
    
    return report;
  }
}

module.exports = {
  SequentialCommitProtocol
};