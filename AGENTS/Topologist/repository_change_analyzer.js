/**
 * Repository Change Analyzer
 * 
 * This utility analyzes repository changes and generates human-readable reports
 * that group changes by directory, file, lines, and size impact, and calculates
 * an overall repository impact percentage.
 */

// Configuration
const CONFIG = {
  // Impact thresholds (percentage of repository changed)
  impactThresholds: {
    minimal: 0.1,   // 0.1% or less
    minor: 1.0,     // 1% or less
    moderate: 3.0,  // 3% or less
    significant: 7.0, // 7% or less
    major: 15.0,    // 15% or less
    critical: 100.0  // anything above 15%
  },
  
  // Category weights for scoring
  categoryWeights: {
    featureDevelopment: 1.2,
    refactoring: 0.9,
    documentation: 0.5,
    architecture: 1.5,
    bugFixes: 1.0,
    maintenance: 0.7
  },
  
  // Risk multipliers
  riskMultipliers: {
    low: 0.8,
    medium: 1.0,
    high: 1.5,
    critical: 2.0
  },
  
  // Color codes for terminal output
  colors: {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
    
    // Foreground colors
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    
    // Background colors
    bgBlack: "\x1b[40m",
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m",
    bgCyan: "\x1b[46m",
    bgWhite: "\x1b[47m"
  },
  
  // Impact category colors
  impactColors: {
    minimal: "green",
    minor: "cyan",
    moderate: "blue",
    significant: "yellow",
    major: "magenta",
    critical: "red"
  },
  
  // Risk level colors
  riskColors: {
    low: "green",
    medium: "yellow",
    high: "red",
    critical: "bgRed"
  },
  
  // Category colors
  categoryColors: {
    featureDevelopment: "cyan",
    refactoring: "green",
    documentation: "blue",
    architecture: "magenta",
    bugFixes: "yellow",
    maintenance: "white"
  }
};

/**
 * Represents a repository change analysis
 */
class RepositoryChangeAnalysis {
  constructor() {
    this.totalFiles = 0;
    this.changedFiles = 0;
    this.totalLines = 0;
    this.insertions = 0;
    this.deletions = 0;
    this.changesByDirectory = {};
    this.changesByExtension = {};
    this.changesByImpact = {
      critical: [],
      major: [],
      moderate: [],
      minor: []
    };
    this.conceptualGroups = {};
    this.overallImpactScore = 0;
    this.impactPercentage = 0;
    this.impactCategory = 'minimal';
    this.gitignoreAnalysis = {};
    this.useColors = process.stdout.isTTY; // Only use colors when output is to a terminal
  }
  
  /**
   * Calculate overall repository impact as a percentage
   * @param {number} totalFiles - Total number of files in repository
   * @param {number} totalLines - Total number of lines in repository
   */
  calculateImpactPercentage(totalFiles, totalLines) {
    this.totalFiles = totalFiles;
    this.totalLines = totalLines;
    
    // Calculate file impact
    const fileImpact = (this.changedFiles / this.totalFiles) * 100;
    
    // Calculate line impact
    const lineImpact = ((this.insertions + this.deletions) / this.totalLines) * 100;
    
    // Combined impact (weighted 40% files, 60% lines)
    this.impactPercentage = (fileImpact * 0.4) + (lineImpact * 0.6);
    
    // Determine impact category
    for (const [category, threshold] of Object.entries(CONFIG.impactThresholds)) {
      if (this.impactPercentage <= threshold) {
        this.impactCategory = category;
        break;
      }
    }
    
    return this.impactPercentage;
  }
  
  /**
   * Calculate impact score for a group of changes
   * @param {string} category - Change category
   * @param {string} risk - Risk level
   * @param {number} fileCount - Number of files
   * @param {number} lineCount - Number of lines
   * @returns {number} - Impact score
   */
  calculateImpactScore(category, risk, fileCount, lineCount) {
    const categoryWeight = CONFIG.categoryWeights[category] || 1.0;
    const riskMultiplier = CONFIG.riskMultipliers[risk] || 1.0;
    
    // Base score calculation
    const fileImpact = fileCount / this.totalFiles * 100;
    const lineImpact = lineCount / this.totalLines * 100;
    const baseScore = (fileImpact * 0.4) + (lineImpact * 0.6);
    
    // Apply weights and multipliers
    return baseScore * categoryWeight * riskMultiplier;
  }
  
  /**
   * Colorize text for terminal output
   * @param {string} text - Text to colorize
   * @param {string} color - Color name from CONFIG.colors
   * @returns {string} - Colorized text for terminal or plain text for markdown
   */
  colorize(text, color) {
    if (!this.useColors || !CONFIG.colors[color]) {
      return text;
    }
    return `${CONFIG.colors[color]}${text}${CONFIG.colors.reset}`;
  }
  
  /**
   * Get color for a numeric score
   * @param {number} score - Score from 0-10
   * @returns {string} - Color name
   */
  getScoreColor(score) {
    if (score >= 9) return "red";
    if (score >= 7) return "magenta";
    if (score >= 5) return "yellow";
    if (score >= 3) return "blue";
    return "green";
  }
  
  /**
   * Create a formatted report of the repository changes
   * @param {boolean} useColors - Whether to use terminal colors
   * @returns {string} - Human-readable report
   */
  generateReport(useColors = process.stdout.isTTY) {
    this.useColors = useColors;
    
    // Create header
    let report = this.colorize(`# Repository Change Analysis\n\n`, "bright");
    
    // Overall statistics
    report += this.colorize(`## Repository Impact Summary\n\n`, "bright");
    
    const impactColor = CONFIG.impactColors[this.impactCategory] || "white";
    report += `- **Overall Impact**: ${this.colorize(`${this.impactPercentage.toFixed(2)}% (${this.impactCategory})`, impactColor)}\n`;
    report += `- **Files Changed**: ${this.changedFiles} of ${this.totalFiles} (${((this.changedFiles / this.totalFiles) * 100).toFixed(2)}%)\n`;
    report += `- **Lines Changed**: ${this.insertions + this.deletions} (${this.colorize(`+${this.insertions}`, "green")} ${this.colorize(`-${this.deletions}`, "red")})\n`;
    
    const scoreColor = this.getScoreColor(this.overallImpactScore);
    report += `- **Impact Score**: ${this.colorize(`${this.overallImpactScore.toFixed(1)} / 10.0`, scoreColor)}\n\n`;
    
    // Changes by directory
    report += this.colorize(`## Changes by Directory\n\n`, "bright");
    for (const [directory, stats] of Object.entries(this.changesByDirectory)) {
      report += this.colorize(`### ${directory}/\n`, "cyan");
      report += `- Files: ${stats.files} (${stats.filesPercentage.toFixed(1)}% of changes)\n`;
      report += `- Lines: ${this.colorize(`+${stats.insertions}`, "green")} ${this.colorize(`-${stats.deletions}`, "red")}\n`;
      report += `- Primary file types: ${stats.extensions.join(', ')}\n\n`;
    }
    
    // Changes by file extension
    report += this.colorize(`## Changes by File Type\n\n`, "bright");
    for (const [extension, stats] of Object.entries(this.changesByExtension)) {
      report += `- **${extension}**: ${stats.files} files, ${stats.lines} lines (${stats.percentage.toFixed(1)}% of changes)\n`;
    }
    
    // GitIgnore Analysis
    if (this.gitignoreAnalysis && Object.keys(this.gitignoreAnalysis).length > 0) {
      report += this.colorize(`\n## GitIgnore Analysis\n\n`, "bright");
      
      // Directory sizes
      if (this.gitignoreAnalysis.directorySizes && Object.keys(this.gitignoreAnalysis.directorySizes).length > 0) {
        report += `### Directory Sizes\n`;
        for (const [dir, size] of Object.entries(this.gitignoreAnalysis.directorySizes)) {
          const sizeColor = size > 100 ? "red" : size > 50 ? "yellow" : "green";
          report += `- **${dir}**: ${this.colorize(`${size}MB`, sizeColor)}\n`;
        }
        report += `\n`;
      }
      
      // Potential gitignore updates
      if (this.gitignoreAnalysis.potentialGitignoreUpdates) {
        const updates = this.gitignoreAnalysis.potentialGitignoreUpdates;
        
        if (updates.sensitiveFiles && updates.sensitiveFiles.length > 0) {
          report += `### Sensitive Files Detected\n`;
          for (const file of updates.sensitiveFiles) {
            report += `- ${this.colorize(file, "red")}\n`;
          }
          report += `\n`;
        }
        
        if (updates.newPatterns && updates.newPatterns.length > 0) {
          report += `### Recommended .gitignore Additions\n`;
          for (const pattern of updates.newPatterns) {
            report += `- \`${pattern}\`\n`;
          }
          report += `\n`;
        }
      }
    }
    
    // Visual separator
    report += `\n${this.colorize('='.repeat(80), "dim")}\n\n`;
    
    // Conceptual groupings
    report += this.colorize(`# Recommended Commit Groupings\n\n`, "bright");
    
    // Sort conceptual groups by impact score
    const sortedGroups = Object.entries(this.conceptualGroups)
      .sort((a, b) => b[1].impactScore - a[1].impactScore);
    
    for (const [groupName, group] of sortedGroups) {
      const categoryColor = CONFIG.categoryColors[group.category] || "white";
      const riskColor = CONFIG.riskColors[group.risk] || "white";
      const scoreColor = this.getScoreColor(group.impactScore);
      
      report += this.colorize(`## ${groupName}\n\n`, "bright");
      report += `- **Impact Score**: ${this.colorize(`${group.impactScore.toFixed(1)} / 10.0`, scoreColor)}\n`;
      report += `- **Category**: ${this.colorize(group.category, categoryColor)}\n`;
      report += `- **Risk Level**: ${this.colorize(group.risk, riskColor)}\n`;
      report += `- **Files**: ${group.files.length}\n\n`;
      
      report += `### Files:\n`;
      for (const file of group.files) {
        report += `- ${file}\n`;
      }
      
      report += `\n### Suggested Commit Message:\n`;
      report += `\`\`\`\n${group.suggestedMessage}\n\`\`\`\n\n`;
    }
    
    // Repository Health Indicators
    report += this.colorize(`## Repository Health Indicators\n\n`, "bright");
    
    // Calculate churn rate
    const churnRate = ((this.insertions + this.deletions) / this.totalLines) * 100;
    const churnColor = churnRate > 5 ? "red" : churnRate > 2 ? "yellow" : "green";
    report += `- **Code Churn Rate**: ${this.colorize(`${churnRate.toFixed(1)}%`, churnColor)}\n`;
    
    // Generate documentation coverage estimate
    const docFiles = Object.entries(this.changesByExtension).filter(([ext]) => ext === 'md').map(([_, stats]) => stats.files)[0] || 0;
    const docCoverage = docFiles > 0 ? "improving" : "unchanged";
    const docColor = docCoverage === "improving" ? "green" : "yellow";
    report += `- **Documentation Coverage**: ${this.colorize(docCoverage, docColor)}\n`;
    
    // Git Configuration status based on gitignore analysis
    const gitConfigStatus = this.gitignoreAnalysis?.potentialGitignoreUpdates?.newPatterns?.length > 0 ? 
      "needs updates" : "adequate";
    const gitConfigColor = gitConfigStatus === "adequate" ? "green" : "yellow";
    report += `- **Git Configuration**: ${this.colorize(gitConfigStatus, gitConfigColor)}\n`;
    
    // Implementation sequence
    report += `\n${this.colorize(`## Implementation Sequence\n\n`, "bright")}`;
    if (gitConfigStatus === "needs updates") {
      report += `1. ${this.colorize("Update .gitignore with new patterns", "yellow")}\n`;
      report += `2. Complete the implementation changes\n`;
    } else {
      report += `1. Proceed with changes following logical grouping\n`;
    }
    
    return report;
  }
}

// Export the analysis class
module.exports = {
  RepositoryChangeAnalysis,
  CONFIG
};