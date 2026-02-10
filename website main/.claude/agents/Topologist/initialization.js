/**
 * Topologist Agent Initialization Script
 * 
 * This script generates a comprehensive repository analysis on initialization,
 * providing a human-readable report that includes changes grouped by directory,
 * file, lines, and size impact, as well as a calculated repository impact percentage.
 * It also analyzes .gitignore requirements based on the changes.
 */

const { RepositoryChangeAnalysis, CONFIG } = require('./repository_change_analyzer');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

/**
 * Check for uncommitted work and run commit protocol if needed
 * @returns {Object} Status of repository check and protocol execution
 */
function checkUncommittedWorkAndRunProtocol() {
  try {
    // Check repository status
    const gitStatus = execSync('git status --porcelain').toString().trim();
    const stagedFiles = execSync('git diff --cached --name-only').toString().trim();
    const unstagedFiles = execSync('git diff --name-only').toString().trim();
    
    const hasUncommittedWork = gitStatus.length > 0 || stagedFiles.length > 0 || unstagedFiles.length > 0;
    
    if (hasUncommittedWork) {
      console.log('🔍 Uncommitted work detected - executing pre-commit protocol...');
      
      // Execute mandatory pre-commit protocol
      const protocolResult = executePreCommitProtocol();
      
      return {
        hasUncommittedWork: true,
        protocolExecuted: true,
        protocolResult: protocolResult,
        gitStatus: gitStatus,
        stagedFiles: stagedFiles.split('\n').filter(f => f.trim()),
        unstagedFiles: unstagedFiles.split('\n').filter(f => f.trim())
      };
    }
    
    return {
      hasUncommittedWork: false,
      protocolExecuted: false,
      message: 'Repository is clean - no uncommitted work found'
    };
  } catch (error) {
    return {
      hasUncommittedWork: false,
      protocolExecuted: false,
      error: error.message
    };
  }
}

/**
 * Execute the mandatory pre-commit protocol
 * @returns {Object} Results of protocol execution
 */
function executePreCommitProtocol() {
  const protocolResults = {
    changeAnalysis: null,
    untrackedFiles: null,
    largeFiles: null,
    gitignoreCheck: null,
    topologyReport: null
  };
  
  try {
    // Step 1: Analyze all changes
    const diffStats = execSync('git diff --stat').toString().trim();
    protocolResults.changeAnalysis = diffStats;
    
    // Step 2: Check for untracked files
    const untrackedFiles = execSync('git status --porcelain | grep "^??" || true').toString().trim();
    protocolResults.untrackedFiles = untrackedFiles.split('\n').filter(f => f.trim());
    
    // Step 3: Check for large files
    try {
      const largeFiles = execSync('find . -name "*.rs" -o -name "*.md" -o -name "*.json" | xargs ls -la | awk \'$5 > 500000 {print $9, $5}\' || true').toString().trim();
      protocolResults.largeFiles = largeFiles.split('\n').filter(f => f.trim());
    } catch (error) {
      protocolResults.largeFiles = [];
    }
    
    // Step 4: Check .gitignore coverage
    try {
      const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
      protocolResults.gitignoreCheck = {
        exists: true,
        patterns: gitignoreContent.split('\n').filter(line => line.trim() && !line.trim().startsWith('#')).length
      };
    } catch (error) {
      protocolResults.gitignoreCheck = {
        exists: false,
        error: error.message
      };
    }
    
    // Step 5: Create topology report (session documentation)
    protocolResults.topologyReport = 'Session documentation will be created';
    
    return protocolResults;
  } catch (error) {
    return {
      error: error.message,
      partialResults: protocolResults
    };
  }
}

/**
 * Generate a repository initialization report
 * @returns {string} Formatted initialization report
 */
function generateInitializationReport() {
  try {
    // First check for uncommitted work and run protocol if needed
    const protocolCheck = checkUncommittedWorkAndRunProtocol();
    
    // Create analysis instance
    const analysis = new RepositoryChangeAnalysis();
    
    // Get repository statistics
    const totalFiles = parseInt(execSync('git ls-files | wc -l').toString().trim());
    const totalLines = parseInt(execSync('git ls-files | xargs cat | wc -l').toString().trim());
    
    // Get modified files stats
    const gitStatus = execSync('git status -s').toString().trim();
    const modifiedFiles = gitStatus.split('\n').filter(line => line.trim() !== '');
    
    // Get diff statistics
    const diffStats = execSync('git diff --stat').toString().trim();
    const insertionsDeletions = diffStats.match(/(\d+) insertions\(\+\), (\d+) deletions\(-\)/);
    const insertions = insertionsDeletions ? parseInt(insertionsDeletions[1]) : 0;
    const deletions = insertionsDeletions ? parseInt(insertionsDeletions[2]) : 0;
    
    // Update analysis object
    analysis.changedFiles = modifiedFiles.length;
    analysis.insertions = insertions;
    analysis.deletions = deletions;
    
    // Process changes by directory
    const changesByDirectory = {};
    const potentialGitignoreUpdates = {
      largeSizeFiles: [],
      unignoredBuildArtifacts: [],
      sensitiveFiles: [],
      newPatterns: new Set()
    };
    
    modifiedFiles.forEach(fileLine => {
      const file = fileLine.substr(3);
      const directory = file.split('/')[0];
      
      if (!changesByDirectory[directory]) {
        changesByDirectory[directory] = {
          files: 0,
          insertions: 0,
          deletions: 0,
          extensions: new Set(),
          filesPercentage: 0
        };
      }
      
      changesByDirectory[directory].files++;
      const extension = file.includes('.') ? file.split('.').pop() : 'none';
      changesByDirectory[directory].extensions.add(extension);
      
      // Check for potential files that should be gitignored
      if (file.endsWith('.env') || file.endsWith('.key') || file.endsWith('.pem') || 
          file.includes('config.local.') || file.includes('settings.local.')) {
        potentialGitignoreUpdates.sensitiveFiles.push(file);
        
        // Generate appropriate gitignore pattern
        const pattern = `${directory}/**/${path.basename(file)}`;
        potentialGitignoreUpdates.newPatterns.add(pattern);
      }
      
      // Check for build artifacts
      if (file.includes('/target/') || file.includes('/build/') || 
          file.endsWith('.o') || file.endsWith('.a') || file.endsWith('.so')) {
        potentialGitignoreUpdates.unignoredBuildArtifacts.push(file);
      }
      
      // Check for large files (attempt to get file size if exists)
      try {
        if (fs.existsSync(file)) {
          const stats = fs.statSync(file);
          if (stats.size > 500000) { // 500KB threshold
            potentialGitignoreUpdates.largeSizeFiles.push({
              file,
              size: Math.round(stats.size / 1024) // KB
            });
          }
        }
      } catch (error) {
        // Ignore file size check errors
      }
    });
    
    // Calculate percentages
    Object.values(changesByDirectory).forEach(stats => {
      stats.filesPercentage = (stats.files / modifiedFiles.length) * 100;
      stats.extensions = Array.from(stats.extensions);
    });
    
    analysis.changesByDirectory = changesByDirectory;
    
    // Process changes by extension
    const changesByExtension = {};
    modifiedFiles.forEach(fileLine => {
      const file = fileLine.substr(3);
      const extension = file.includes('.') ? file.split('.').pop() : 'none';
      
      if (!changesByExtension[extension]) {
        changesByExtension[extension] = {
          files: 0,
          lines: 0,
          percentage: 0
        };
      }
      
      changesByExtension[extension].files++;
    });
    
    // Calculate percentages for extensions
    Object.values(changesByExtension).forEach(stats => {
      stats.percentage = (stats.files / modifiedFiles.length) * 100;
    });
    
    analysis.changesByExtension = changesByExtension;
    
    // Read current .gitignore
    let gitignoreContent = '';
    try {
      gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
    } catch (error) {
      gitignoreContent = '# No .gitignore file found';
    }
    
    // Analyze directories for size-based concerns
    // Try to find largest directories
    let directorySizes = {};
    try {
      // Only check top-level directories that are part of the changes
      const uniqueTopDirs = [...new Set(modifiedFiles
        .map(line => line.substr(3).split('/')[0])
        .filter(dir => dir))];
      
      uniqueTopDirs.forEach(dir => {
        try {
          // Get directory size using du command
          const duOutput = execSync(`du -sm "${dir}" 2>/dev/null || echo "0 ${dir}"`).toString().trim();
          const size = parseInt(duOutput.split('\t')[0]);
          if (size > 10) { // Only track dirs larger than 10MB
            directorySizes[dir] = size;
          }
        } catch (error) {
          // Ignore errors in directory size calculation
        }
      });
    } catch (error) {
      // Ignore errors in directory size calculation
    }
    
    // Create conceptual groups based on patterns
    const conceptualGroups = {
      'CLI Modernization': {
        pattern: /CLIs\/|cli\//i,
        category: 'architecture',
        risk: 'high',
        files: [],
        impactScore: 0,
        suggestedMessage: 'feat: Modernize CLI architecture with Rust implementation'
      },
      'Documentation Reorganization': {
        pattern: /docs\/|[dD]ocumentation\//i,
        category: 'documentation',
        risk: 'low',
        files: [],
        impactScore: 0,
        suggestedMessage: 'docs: Reorganize documentation into categorized structure'
      },
      'Agent Metadata Updates': {
        pattern: /AGENTS\/.*\/metadata\.json/i,
        category: 'maintenance',
        risk: 'low',
        files: [],
        impactScore: 0,
        suggestedMessage: 'chore: Update agent metadata and tracking information'
      },
      'Code Refactoring': {
        pattern: /\.rs$|\.js$|\.ts$/i,
        category: 'refactoring',
        risk: 'medium',
        files: [],
        impactScore: 0,
        suggestedMessage: 'refactor: Improve code organization and structure'
      },
      'Git Configuration': {
        pattern: /\.gitignore$|\.gitattributes$/i,
        category: 'maintenance',
        risk: 'low',
        files: [],
        impactScore: 0,
        suggestedMessage: 'chore: Update git configuration files'
      }
    };
    
    // Assign files to conceptual groups
    modifiedFiles.forEach(fileLine => {
      const file = fileLine.substr(3);
      
      for (const [groupName, group] of Object.entries(conceptualGroups)) {
        if (file.match(group.pattern)) {
          group.files.push(file);
        }
      }
    });
    
    // Calculate impact scores for each group
    for (const [groupName, group] of Object.entries(conceptualGroups)) {
      if (group.files.length > 0) {
        group.impactScore = analysis.calculateImpactScore(
          group.category,
          group.risk,
          group.files.length,
          (insertions + deletions) * (group.files.length / modifiedFiles.length)
        );
      }
    }
    
    // Remove empty groups
    for (const [groupName, group] of Object.entries(conceptualGroups)) {
      if (group.files.length === 0) {
        delete conceptualGroups[groupName];
      }
    }
    
    analysis.conceptualGroups = conceptualGroups;
    
    // Calculate overall impact
    analysis.calculateImpactPercentage(totalFiles, totalLines);
    
    // Calculate overall impact score (average of group scores)
    if (Object.keys(conceptualGroups).length > 0) {
      const groupScores = Object.values(conceptualGroups).map(g => g.impactScore);
      analysis.overallImpactScore = groupScores.reduce((sum, score) => sum + score, 0) / groupScores.length;
    }
    
    // Add gitignore analysis to the report
    analysis.gitignoreAnalysis = {
      currentPatterns: gitignoreContent.split('\n').filter(line => 
        line.trim() && !line.trim().startsWith('#')
      ),
      directorySizes,
      potentialGitignoreUpdates: {
        largeSizeFiles: potentialGitignoreUpdates.largeSizeFiles,
        unignoredBuildArtifacts: potentialGitignoreUpdates.unignoredBuildArtifacts,
        sensitiveFiles: potentialGitignoreUpdates.sensitiveFiles,
        newPatterns: Array.from(potentialGitignoreUpdates.newPatterns)
      }
    };
    
    // Add protocol check results to the analysis
    analysis.protocolCheck = protocolCheck;
    
    // Generate report including protocol check results
    const baseReport = analysis.generateReport();
    
    // Append protocol check information if work was found
    if (protocolCheck.hasUncommittedWork) {
      const protocolSection = `
## Initialization Protocol Check

### Uncommitted Work Detected
- **Status**: ${protocolCheck.protocolExecuted ? '✅ Pre-commit protocol executed' : '❌ Protocol execution failed'}
- **Git Status**: ${protocolCheck.gitStatus.split('\n').length} items found
- **Staged Files**: ${protocolCheck.stagedFiles.length} files
- **Unstaged Files**: ${protocolCheck.unstagedFiles.length} files

### Protocol Results
${protocolCheck.protocolResult && !protocolCheck.protocolResult.error ? 
  `- **Change Analysis**: ${protocolCheck.protocolResult.changeAnalysis ? 'Completed' : 'Failed'}
- **Untracked Files**: ${protocolCheck.protocolResult.untrackedFiles.length} found
- **Large Files**: ${protocolCheck.protocolResult.largeFiles.length} detected
- **GitIgnore Check**: ${protocolCheck.protocolResult.gitignoreCheck.exists ? 'Valid' : 'Missing'}` : 
  `- **Error**: ${protocolCheck.protocolResult?.error || 'Unknown protocol error'}`}

`;
      return baseReport + protocolSection;
    }
    
    return baseReport;
  } catch (error) {
    return `Error generating repository analysis: ${error.message}`;
  }
}

/**
 * Generate a .gitignore analysis report based on the current changes
 * @returns {string} Formatted .gitignore analysis report
 */
function generateGitignoreAnalysis() {
  try {
    // Read current .gitignore
    const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
    const currentPatterns = gitignoreContent.split('\n').filter(line => 
      line.trim() && !line.trim().startsWith('#')
    );
    
    // Check for large directories in changed files
    const gitStatus = execSync('git status -s').toString().trim();
    const modifiedFiles = gitStatus.split('\n').filter(line => line.trim() !== '');
    const modifiedDirs = [...new Set(modifiedFiles
      .map(line => line.substr(3).split('/')[0])
      .filter(dir => dir))];
    
    // Get directory sizes
    const directorySizes = {};
    modifiedDirs.forEach(dir => {
      try {
        const duOutput = execSync(`du -sm "${dir}" 2>/dev/null || echo "0 ${dir}"`).toString().trim();
        const size = parseInt(duOutput.split('\t')[0]);
        if (size > 10) { // Only track dirs larger than 10MB
          directorySizes[dir] = size;
        }
      } catch (error) {
        // Ignore errors
      }
    });
    
    // Generate report
    let report = `# .gitignore Analysis - ${new Date().toISOString().split('T')[0]}\n\n`;
    
    report += `## Current Patterns\n\n`;
    report += `${currentPatterns.length} patterns are currently defined in .gitignore.\n\n`;
    
    report += `## Directory Size Analysis\n\n`;
    if (Object.keys(directorySizes).length > 0) {
      report += `Large directories detected in changes:\n\n`;
      for (const [dir, size] of Object.entries(directorySizes)) {
        report += `- **${dir}**: ${size}MB\n`;
      }
    } else {
      report += `No large directories detected in current changes.\n`;
    }
    
    report += `\n## Recommendations\n\n`;
    
    // Generate recommendations based on directory sizes and changed files
    const recommendations = [];
    
    for (const [dir, size] of Object.entries(directorySizes)) {
      if (size > 100 && !currentPatterns.some(p => p.includes(`${dir}/target/`))) {
        recommendations.push(`${dir}/target/`);
      }
    }
    
    if (recommendations.length > 0) {
      report += `Consider adding these patterns to .gitignore:\n\n`;
      recommendations.forEach(rec => {
        report += `- \`${rec}\`\n`;
      });
    } else {
      report += `Current .gitignore patterns appear adequate for the changed files.\n`;
    }
    
    return report;
  } catch (error) {
    return `Error generating .gitignore analysis: ${error.message}`;
  }
}

// When this module is executed directly
if (require.main === module) {
  const report = generateInitializationReport();
  console.log(report);
  
  // Save reports to file
  const reportsDir = 'docs/repository/reports';
  try {
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    fs.writeFileSync(`${reportsDir}/repository_analysis_${date}.md`, report);
    
    // Also generate .gitignore analysis
    const gitignoreReport = generateGitignoreAnalysis();
    fs.writeFileSync(`${reportsDir}/gitignore_analysis_${date}.md`, gitignoreReport);
  } catch (error) {
    console.error(`Error saving reports: ${error.message}`);
  }
}

module.exports = {
  generateInitializationReport,
  generateGitignoreAnalysis,
  checkUncommittedWorkAndRunProtocol,
  executePreCommitProtocol
};