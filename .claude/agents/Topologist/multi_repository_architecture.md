# Multi-Repository Topologist Architecture

## Overview

This architecture extends the Topologist's capabilities to handle initialization and sequential commit protocols across multiple independent repositories within a parent directory structure.

## Architecture Components

### 1. Repository Discovery System

```javascript
class MultiRepositoryDiscovery {
  constructor(rootPath) {
    this.rootPath = rootPath;
    this.repositories = new Map();
  }
  
  async discoverRepositories() {
    // Scan for .git directories in subdirectories
    // Validate repository health and accessibility
    // Build repository registry with metadata
  }
  
  validateRepository(repoPath) {
    // Check .git directory exists and is valid
    // Verify repository is not bare
    // Test basic git operations (status, log)
    // Return repository metadata
  }
}
```

### 2. Sequential Commit Protocol Engine

```javascript
class SequentialCommitProtocol {
  constructor(repositories) {
    this.repositories = repositories;
    this.commitQueue = [];
    this.rollbackStack = [];
  }
  
  async executeSequentialCommits() {
    // Pre-commit validation across all repositories
    // Execute commits in dependency order
    // Handle rollback on failures
    // Generate comprehensive reports
  }
}
```

### 3. Repository State Manager

```javascript
class RepositoryStateManager {
  constructor() {
    this.repositoryStates = new Map();
    this.commitHistory = [];
    this.transactionLog = [];
  }
  
  capturePreCommitState(repoPath) {
    // Capture git status, staged files, branch info
    // Create rollback point
    // Store in transaction log
  }
  
  validateCommitReadiness(repoPath) {
    // Check for uncommitted dependencies
    // Verify no merge conflicts
    // Validate commit message standards
  }
}
```

## System Flow

### Initialization Phase

1. **Repository Discovery**
   ```
   Parent Directory
   ├── repo-a/              ← Independent Git Repository
   │   ├── .git/
   │   └── source files
   ├── repo-b/              ← Independent Git Repository
   │   ├── .git/
   │   └── source files
   └── repo-c/              ← Independent Git Repository
       ├── .git/
       └── source files
   ```

2. **Repository Validation**
   - Verify each subdirectory contains a valid .git repository
   - Check repository health and accessibility
   - Identify repository dependencies and commit order
   - Generate repository topology map

3. **State Capture**
   - Record current branch, commit hash, and status for each repository
   - Identify uncommitted changes across all repositories
   - Create baseline state for rollback capabilities

### Sequential Commit Protocol

1. **Pre-Commit Analysis**
   ```
   For each repository:
     ├── Analyze uncommitted changes
     ├── Check for dependency conflicts
     ├── Validate commit message requirements
     └── Generate impact assessment
   ```

2. **Dependency Resolution**
   - Determine commit order based on inter-repository dependencies
   - Identify repositories that can be committed in parallel
   - Create commit execution plan

3. **Sequential Execution**
   ```
   Phase 1: Independent repositories (parallel)
   Phase 2: Dependent repositories (sequential)
   Phase 3: Integration repositories (final)
   ```

4. **Rollback Capability**
   - Maintain rollback stack for each committed repository
   - Implement atomic rollback on any failure
   - Preserve pre-commit state for recovery

## Configuration System

### Repository Configuration

```json
{
  "multiRepository": {
    "rootPath": "/path/to/parent/directory",
    "repositories": {
      "repo-a": {
        "path": "./repo-a",
        "type": "independent",
        "commitPriority": 1,
        "dependencies": []
      },
      "repo-b": {
        "path": "./repo-b", 
        "type": "dependent",
        "commitPriority": 2,
        "dependencies": ["repo-a"]
      }
    },
    "commitProtocol": {
      "requireCleanWorkingTree": true,
      "validateCommitMessages": true,
      "enableRollback": true,
      "parallelExecution": true
    }
  }
}
```

### Commit Order Strategies

1. **Dependency-Based Ordering**
   - Repositories with no dependencies commit first
   - Dependent repositories wait for their dependencies
   - Circular dependencies are detected and reported

2. **Priority-Based Ordering**
   - Manual priority assignment for commit sequence
   - Higher priority repositories commit first
   - Useful for critical infrastructure repositories

3. **Change Impact Ordering**
   - Repositories with minimal changes commit first
   - High-impact changes are committed last
   - Reduces rollback complexity

## Error Handling Architecture

### Failure Detection

```javascript
class FailureDetection {
  detectCommitFailure(repoPath, error) {
    return {
      repository: repoPath,
      errorType: this.classifyError(error),
      severity: this.assessSeverity(error),
      rollbackRequired: this.requiresRollback(error),
      retryPossible: this.canRetry(error)
    };
  }
}
```

### Rollback Mechanisms

1. **Single Repository Rollback**
   - Revert to pre-commit state using git reset
   - Restore working directory changes
   - Update repository state registry

2. **Cascade Rollback**
   - Rollback all repositories committed after failed repository
   - Maintain commit order in reverse for rollback
   - Preserve dependency relationships during rollback

3. **Partial Rollback**
   - Allow partial success with user confirmation
   - Mark failed repositories for manual intervention
   - Continue with successful repositories

## State Management

### Transaction Log

```javascript
class TransactionLog {
  logCommitAttempt(repository, changes, timestamp) {
    this.log.push({
      id: generateTransactionId(),
      repository,
      changes,
      timestamp,
      status: 'attempted',
      rollbackData: this.captureRollbackData(repository)
    });
  }
  
  markCommitSuccess(transactionId, commitHash) {
    const transaction = this.findTransaction(transactionId);
    transaction.status = 'committed';
    transaction.commitHash = commitHash;
    transaction.rollbackData = null; // Clear rollback data on success
  }
}
```

### Repository Registry

```javascript
class RepositoryRegistry {
  constructor() {
    this.repositories = new Map();
    this.dependencyGraph = new Map();
    this.commitHistory = new Map();
  }
  
  registerRepository(path, metadata) {
    this.repositories.set(path, {
      ...metadata,
      lastCommit: null,
      currentBranch: null,
      uncommittedChanges: false,
      health: 'unknown'
    });
  }
}
```

## Implementation Specifications

### 1. Multi-Repository Initialization Script

```javascript
// multi_repository_initializer.js
class MultiRepositoryInitializer {
  async initialize(rootPath) {
    const discovery = new MultiRepositoryDiscovery(rootPath);
    const repositories = await discovery.discoverRepositories();
    
    const stateManager = new RepositoryStateManager();
    await stateManager.captureInitialStates(repositories);
    
    const commitProtocol = new SequentialCommitProtocol(repositories);
    const executionPlan = await commitProtocol.createExecutionPlan();
    
    return {
      repositories,
      executionPlan,
      stateManager,
      commitProtocol
    };
  }
}
```

### 2. Configuration Validation

```javascript
class ConfigurationValidator {
  validateMultiRepositoryConfig(config) {
    // Validate repository paths exist
    // Check dependency graph for cycles
    // Verify commit protocol settings
    // Return validation results with errors/warnings
  }
  
  detectCircularDependencies(dependencies) {
    // Implement cycle detection algorithm
    // Return list of circular dependency chains
  }
}
```

### 3. Reporting System

```javascript
class MultiRepositoryReporter {
  generateInitializationReport(repositories, states) {
    return {
      repositoryCount: repositories.size,
      healthyRepositories: this.countHealthy(repositories),
      uncommittedChanges: this.countUncommitted(states),
      dependencyComplexity: this.analyzeDependencies(repositories),
      recommendedCommitOrder: this.generateCommitOrder(repositories)
    };
  }
  
  generateCommitReport(transactionLog) {
    return {
      totalRepositories: transactionLog.length,
      successfulCommits: this.countSuccessful(transactionLog),
      failedCommits: this.countFailed(transactionLog),
      rollbacksRequired: this.countRollbacks(transactionLog),
      executionTime: this.calculateExecutionTime(transactionLog)
    };
  }
}
```

## Integration with Existing Topologist

### Backward Compatibility

- Existing single-repository functionality remains unchanged
- Multi-repository features are additive enhancements
- Configuration-driven activation of multi-repository mode
- Fallback to single-repository mode if multi-repository config is absent

### Enhanced Capabilities

- Extended initialization script detects multi-repository environments
- Enhanced commit protocol handles cross-repository dependencies
- Improved reporting includes multi-repository metrics
- Advanced state management tracks multiple repository states

### Command Interface

```bash
# Initialize multi-repository environment
node initialization.js --multi-repo --root-path /path/to/parent

# Execute sequential commit protocol
node commit_protocol.js --sequential --validate-dependencies

# Generate multi-repository report
node repository_analyzer.js --multi-repo --include-dependencies
```

## Security Considerations

### Repository Isolation

- Each repository maintains independent git history
- No cross-repository file operations
- Isolated rollback capabilities prevent cross-contamination
- Independent authentication and access controls

### Transaction Safety

- Atomic commit operations within each repository
- Transaction log provides full audit trail
- Rollback capabilities prevent partial failure states
- State validation before and after each operation

---

**Architect**
System Design Specialist