/**
 * Topologist Agent Initialization Runner
 * 
 * This script runs the repository analysis and generates human-readable reports
 * with color formatting that works in both terminal and markdown contexts.
 */

const { generateInitializationReport, generateGitignoreAnalysis } = require('./initialization');
const fs = require('fs');

/**
 * Generate colorized markdown for the console output
 * @returns {string} - Formatted markdown report with unicode symbols for colorization
 */
function generateColorizedSummary() {
  // Use unicode symbols to represent colors in markdown
  const symbols = {
    critical: '🔴',  // red
    high: '🟠',      // orange 
    moderate: '🟡',  // yellow
    low: '🟢',       // green
    minimal: '🟢',   // green
    minor: '🟢',     // green
    significant: '🟡', // yellow
    major: '🟠',     // orange
    architecture: '🟣', // purple
    documentation: '🔵', // blue
    maintenance: '⚪', // white
    refactoring: '🟢', // green
    improving: '↗️',  // up arrow
    unchanged: '➡️',  // right arrow
    'needs updates': '⚠️', // warning
    adequate: '✅',   // checkmark
  };

  // Run the analysis
  const report = generateInitializationReport();
  const gitignoreReport = generateGitignoreAnalysis();
  
  // Extract key data from the analysis
  const lines = report.split('\n');
  const impactMatch = report.match(/Overall Impact: ([0-9.]+)% \(([a-z]+)\)/i);
  const impactPercentage = impactMatch ? impactMatch[1] : '?';
  const impactCategory = impactMatch ? impactMatch[2] : 'unknown';
  
  const filesMatch = report.match(/Files Changed: ([0-9]+) of ([0-9]+)/i);
  const changedFiles = filesMatch ? filesMatch[1] : '?';
  const totalFiles = filesMatch ? filesMatch[2] : '?';
  
  const linesMatch = report.match(/Lines Changed: ([0-9]+) \(\+([0-9]+) -([0-9]+)\)/i);
  const changedLines = linesMatch ? linesMatch[1] : '?';
  const insertions = linesMatch ? linesMatch[2] : '?';
  const deletions = linesMatch ? linesMatch[3] : '?';
  
  const scoreMatch = report.match(/Impact Score: ([0-9.]+) \/ 10.0/i);
  const impactScore = scoreMatch ? scoreMatch[1] : '?';
  
  // Extract commit groups
  const groups = [];
  let inGroup = false;
  let currentGroup = {};
  
  for (const line of lines) {
    if (line.match(/^## [^#]/)) {
      if (inGroup && currentGroup.name) {
        groups.push({...currentGroup});
      }
      inGroup = true;
      currentGroup = {
        name: line.replace(/^## /, '').trim(),
        score: '',
        category: '',
        risk: '',
        files: []
      };
    } else if (inGroup) {
      const scoreMatch = line.match(/Impact Score: ([0-9.]+) \/ 10.0/i);
      if (scoreMatch) {
        currentGroup.score = scoreMatch[1];
      }
      
      const categoryMatch = line.match(/Category: ([a-zA-Z]+)/i);
      if (categoryMatch) {
        currentGroup.category = categoryMatch[1];
      }
      
      const riskMatch = line.match(/Risk Level: ([a-zA-Z]+)/i);
      if (riskMatch) {
        currentGroup.risk = riskMatch[1];
      }
      
      const filesMatch = line.match(/Files: ([0-9]+)/i);
      if (filesMatch) {
        currentGroup.fileCount = filesMatch[1];
      }
    }
  }
  
  // Add the last group if there is one
  if (inGroup && currentGroup.name) {
    groups.push({...currentGroup});
  }
  
  // Filter out non-commit groups
  const commitGroups = groups.filter(g => 
    g.name !== 'Repository Impact Summary' && 
    g.name !== 'Changes by Directory' && 
    g.name !== 'Changes by File Type' &&
    g.name !== 'Implementation Sequence' &&
    g.name !== 'Repository Health Indicators'
  );
  
  // Extract health indicators
  const churnMatch = report.match(/Code Churn Rate: ([0-9.]+)%/i);
  const churnRate = churnMatch ? churnMatch[1] : '?';
  
  const docMatch = report.match(/Documentation Coverage: ([a-zA-Z]+)/i);
  const docCoverage = docMatch ? docMatch[1] : '?';
  
  const gitMatch = report.match(/Git Configuration: ([a-zA-Z ]+)/i);
  const gitConfig = gitMatch ? gitMatch[1] : '?';
  
  // Build colorized summary
  let summary = `# Repository Change Analysis Report\n\n`;
  
  // Impact summary with symbols
  summary += `## Repository Impact Summary\n\n`;
  summary += `- Overall Impact: ${impactPercentage}% ${symbols[impactCategory] || ''} (${impactCategory})\n`;
  summary += `- Files Changed: ${changedFiles} of ${totalFiles} (${((changedFiles / totalFiles) * 100).toFixed(2)}%)\n`;
  summary += `- Lines Changed: ${changedLines} (+${insertions} -${deletions})\n`;
  
  // Impact score with symbols based on score value
  const scoreSymbol = impactScore >= 9 ? symbols.critical :
                     impactScore >= 7 ? symbols.high :
                     impactScore >= 5 ? symbols.moderate :
                     symbols.low;
  
  summary += `- Impact Score: ${impactScore}/10.0 ${scoreSymbol}\n\n`;
  
  // GitIgnore Analysis
  const gitignoreLines = gitignoreReport.split('\n');
  const recommendationsIdx = gitignoreLines.findIndex(line => line.includes('Recommendations'));
  
  if (recommendationsIdx > -1) {
    const recommendations = gitignoreLines.slice(recommendationsIdx + 2)
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.trim().replace(/^- /, ''));
    
    if (recommendations.length > 0) {
      summary += `## GitIgnore Analysis ${symbols['needs updates']}\n\n`;
      recommendations.forEach(rec => {
        summary += `- ${rec}\n`;
      });
      summary += `\n`;
    } else {
      summary += `## GitIgnore Analysis ${symbols.adequate}\n\n`;
      summary += `- Current patterns appear adequate\n\n`;
    }
  }
  
  // Commit groups with symbols
  summary += `## Commit Recommendations\n\n`;
  
  commitGroups.forEach(group => {
    const categorySymbol = symbols[group.category] || '';
    const riskSymbol = symbols[group.risk] || '';
    const scoreValue = parseFloat(group.score);
    
    const scoreSymbol = scoreValue >= 9 ? symbols.critical :
                        scoreValue >= 7 ? symbols.high :
                        scoreValue >= 5 ? symbols.moderate :
                        symbols.low;
    
    summary += `### ${group.name}\n`;
    summary += `- Impact: ${group.score}/10.0 ${scoreSymbol}\n`;
    summary += `- Category: ${group.category} ${categorySymbol}\n`;
    summary += `- Risk: ${group.risk} ${riskSymbol}\n`;
    summary += `- Files: ${group.fileCount}\n\n`;
  });
  
  // Health indicators with symbols
  summary += `## Repository Health\n\n`;
  const churnSymbol = parseFloat(churnRate) > 5 ? symbols.high :
                     parseFloat(churnRate) > 2 ? symbols.moderate :
                     symbols.low;
  
  summary += `- Code Churn: ${churnRate}% ${churnSymbol}\n`;
  summary += `- Documentation: ${docCoverage} ${symbols[docCoverage] || ''}\n`;
  summary += `- Git Config: ${gitConfig} ${symbols[gitConfig] || ''}\n\n`;
  
  // Implementation sequence
  summary += `## Implementation Sequence\n\n`;
  if (gitConfig === 'needs updates') {
    summary += `1. ${symbols['needs updates']} Update .gitignore with new patterns\n`;
    summary += `2. Complete implementation changes\n`;
  } else {
    summary += `1. Proceed with changes following logical grouping\n`;
  }
  
  return summary;
}

// When this module is executed directly
if (require.main === module) {
  try {
    const summary = generateColorizedSummary();
    console.log(summary);
    
    // Save colorized summary to file
    const reportsDir = 'docs/repository/reports';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    fs.writeFileSync(`${reportsDir}/colorized_summary_${date}.md`, summary);
  } catch (error) {
    console.error(`Error generating colorized summary: ${error.message}`);
  }
}

module.exports = {
  generateColorizedSummary
};