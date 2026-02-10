#!/bin/bash
# Phase 5: Validation Script
# This script validates the restructured repository

set -e  # Exit on error
BASE_DIR="/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence"
cd "$BASE_DIR"

echo "Phase 5: Validating restructured repository..."

# 1. Check for critical files
echo "Checking for critical files..."
critical_files=(
  "core/AGENT_INDEX.md"
  "docs/CLAUDE.md"
  "docs/guides/QuickStart.md"
  "agents/README.md"
  "cli/README.md"
  "core/README.md"
  "docs/README.md"
  "README.md"
)

missing_files=0
for file in "${critical_files[@]}"; do
  if [ ! -f "$BASE_DIR/$file" ]; then
    echo "ERROR: Critical file missing: $file"
    missing_files=$((missing_files + 1))
  else
    echo "✓ Found critical file: $file"
  fi
done

if [ $missing_files -gt 0 ]; then
  echo "WARNING: $missing_files critical files are missing"
else
  echo "All critical files are present"
fi

# 2. Check directory structure
echo "Checking directory structure..."
critical_dirs=(
  "agents/core"
  "agents/development"
  "agents/knowledge"
  "agents/specialized"
  "cli/ci-tools"
  "cli/plugins"
  "cli/scripts"
  "core/memory"
  "core/protocols"
  "core/architecture"
  "docs/guides"
  "docs/architecture"
  "docs/protocols"
  "docs/api"
  "data/cache"
  "data/sessions"
  "data/benchmarks"
  "examples/conversations"
  "examples/projects"
  "tools/testing"
  "tools/development"
  "extensions/kanji"
  "extensions/tauri"
)

missing_dirs=0
for dir in "${critical_dirs[@]}"; do
  if [ ! -d "$BASE_DIR/$dir" ]; then
    echo "ERROR: Critical directory missing: $dir"
    missing_dirs=$((missing_dirs + 1))
  else
    echo "✓ Found critical directory: $dir"
  fi
done

if [ $missing_dirs -gt 0 ]; then
  echo "WARNING: $missing_dirs critical directories are missing"
else
  echo "All critical directories are present"
fi

# 3. Check agent categorization
echo "Checking agent categorization..."
agent_categories=(
  "agents/core/athena"
  "agents/core/gaia"
  "agents/core/manager"
  "agents/core/hermes"
  "agents/development/developer"
  "agents/development/engineer"
  "agents/development/refactorer"
  "agents/knowledge/memory"
  "agents/knowledge/mnemosyne"
  "agents/knowledge/sage"
  "agents/knowledge/sage-keeper"
)

missing_agents=0
for agent in "${agent_categories[@]}"; do
  if [ ! -d "$BASE_DIR/$agent" ]; then
    echo "ERROR: Categorized agent missing: $agent"
    missing_agents=$((missing_agents + 1))
  else
    echo "✓ Found categorized agent: $agent"
  fi
done

if [ $missing_agents -gt 0 ]; then
  echo "WARNING: $missing_agents categorized agents are missing"
else
  echo "All categorized agents are present"
fi

# 4. Validate path references
echo "Validating path references..."
# Grep for absolute paths in markdown files
old_paths=$(grep -r "/AGENTS/" --include="*.md" "$BASE_DIR/docs" | wc -l)
if [ $old_paths -gt 0 ]; then
  echo "WARNING: Found $old_paths references to old paths in documentation"
else
  echo "✓ No old path references found in documentation"
fi

# 5. Create validation report
echo "Creating validation report..."
cat > "$BASE_DIR/AGENTS/Cartographer/Sessions/RepositoryRestructuring/validation-report.md" << EOF
# Repository Restructuring Validation Report

Date: $(date +"%Y-%m-%d %H:%M:%S")

## Summary
- Critical Files Check: $missing_files missing
- Directory Structure Check: $missing_dirs missing
- Agent Categorization Check: $missing_agents missing
- Path Reference Check: $old_paths old references found

## Detailed Results

### Critical Files
$(for file in "${critical_files[@]}"; do
  if [ -f "$BASE_DIR/$file" ]; then
    echo "- ✓ \`$file\` is present"
  else
    echo "- ❌ \`$file\` is missing"
  fi
done)

### Directory Structure
$(for dir in "${critical_dirs[@]}"; do
  if [ -d "$BASE_DIR/$dir" ]; then
    echo "- ✓ \`$dir\` is present"
  else
    echo "- ❌ \`$dir\` is missing"
  fi
done)

### Agent Categorization
$(for agent in "${agent_categories[@]}"; do
  if [ -d "$BASE_DIR/$agent" ]; then
    echo "- ✓ \`$agent\` is properly categorized"
  else
    echo "- ❌ \`$agent\` is missing from expected location"
  fi
done)

### Path References
Old path references in documentation: $old_paths

## Recommendations

$(if [ $missing_files -gt 0 ] || [ $missing_dirs -gt 0 ] || [ $missing_agents -gt 0 ] || [ $old_paths -gt 0 ]; then
  echo "Some issues were found during validation. Consider running the following:"
  
  if [ $missing_files -gt 0 ] || [ $missing_dirs -gt 0 ]; then
    echo "- Re-run Phase 1 (Directory Standardization) and Phase 2 (Resource Consolidation)"
  fi
  
  if [ $missing_agents -gt 0 ]; then
    echo "- Verify agent categorization in Phase 2 script"
  fi
  
  if [ $old_paths -gt 0 ]; then
    echo "- Re-run Phase 4 (Special Resources) to update all path references"
  fi
else
  echo "All validation checks passed successfully. The repository restructuring is complete and valid."
fi)
EOF

# Show validation summary
if [ $missing_files -eq 0 ] && [ $missing_dirs -eq 0 ] && [ $missing_agents -eq 0 ] && [ $old_paths -eq 0 ]; then
  echo "All validation checks passed!"
  echo "Repository restructuring validation complete."
  echo "See full report at: AGENTS/Cartographer/Sessions/RepositoryRestructuring/validation-report.md"
else
  echo "WARNING: Some validation checks failed."
  echo "See detailed report at: AGENTS/Cartographer/Sessions/RepositoryRestructuring/validation-report.md"
  echo "Consider rerunning problematic phases to address issues."
fi

echo "Phase 5 complete."