#!/bin/bash
# Phase 5: Validation and Finalization
# This script validates the restructuring and cleans up

set -e  # Exit on error

ROOT_DIR="/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence"
cd "$ROOT_DIR"

echo "Starting Phase 5: Validation and Finalization"
echo "-------------------------------------------"

# Step 1: Path reference updates
echo "Step 5.1: Updating path references in files"

function update_references() {
    local old_path=$1
    local new_path=$2
    local file_patterns=${3:-"*.md *.js *.rs *.ts *.tsx *.json *.toml *.sh"}
    
    for pattern in $file_patterns; do
        find . -name "$pattern" -type f -not -path "*/node_modules/*" -not -path "*/target/*" -not -path "*/.git/*" -exec grep -l "$old_path" {} \; | 
        while read file; do
            echo "Updating references in $file: $old_path -> $new_path"
            sed -i "" "s|$old_path|$new_path|g" "$file" || true
        done
    done
}

# Update paths in files
update_references "BENCHMARKS/" "benchmarks/"
update_references "CACHE/" "cache/"
update_references "CRITICAL_SYSTEM_ISSUES/" "critical-system-issues/"
update_references "MARKDOWN_DESIGNS/" "markdown-designs/"
update_references "OPTIMIZATIONS/" "optimizations/"
update_references "PRIORITY/" "priority/"
update_references "SPECS/" "specs/"
update_references "SYSTEMS/" "systems/"
update_references "Architectures/" "docs/architecture/"
update_references "Documentation/" "docs/"
update_references "Plans/" "docs/plans/"
update_references "Protocols/" "docs/protocols/"
update_references "Visions/" "docs/visions/"
update_references "agent_cache/" "src/agent-cache/"
update_references "ci-tools/" "src/cli/tools/"
update_references "ci-rust-minimal/" "src/cli/minimal/"
update_references "Terminal/" "src/terminal/"
update_references "KnowledgeRegistry/" "knowledge-registry/"
update_references "Projects/" "projects/"
update_references "Sessions/" "sessions/"

# Step 2: Update README with new structure
echo "Step 5.2: Updating README with new structure"

# Create a new README section documenting the structure
readme_addition="## Repository Structure

After restructuring, this repository follows a standardized organization pattern:

- \`AGENTS/\` - Agent definitions and their associated memory and session files
- \`src/\` - Implementation code 
  - \`cli/\` - Command line interface implementations
  - \`core/\` - Core system functionality
  - \`tools/\` - Tools and utilities
  - \`plugins/\` - Plugin system
  - \`db/\` - Database implementation
- \`docs/\` - Documentation
  - \`architecture/\` - System architecture documentation
  - \`agents/\` - Agent-specific documentation
  - \`protocols/\` - Protocol documentation
  - \`user-guides/\` - End-user guides
  - \`developer/\` - Developer documentation
  - \`specifications/\` - Detailed specifications
  - \`plans/\` - Project plans
  - \`visions/\` - Vision documents
- \`scripts/\` - Utility scripts
- \`config/\` - Configuration files
- \`templates/\` - Template files
- \`projects/\` - Project-specific files
- \`lib/\` - Shared libraries
- \`tests/\` - Test files
- \`data/\` - Data files and database
- \`knowledge-registry/\` - Knowledge Registry system
- \`sessions/\` - Session records
- \`Kanji/\` - Kanji project

This structure standardizes directory naming conventions (lowercase) with the exception of AGENTS, which maintains its uppercase status to signify its special role in the system."

# Add to README.md
if grep -q "## Repository Structure" README.md; then
    # Replace existing structure section
    sed -i "" '/## Repository Structure/,/^## /c\\'"$readme_addition"'\n\n## ' README.md
else
    # Add new structure section before the first ## header
    sed -i "" '0,/^## /s/^## /'"$readme_addition"'\n\n## /' README.md
fi

# Step 3: Clean up validation
echo "Step 5.3: Checking for broken references"

# Check for any remaining references to old directories
echo "Checking for remaining references to old directories..."
for old_dir in "BENCHMARKS/" "CACHE/" "CRITICAL_SYSTEM_ISSUES/" "MARKDOWN_DESIGNS/" "OPTIMIZATIONS/" "PRIORITY/" "SPECS/" "SYSTEMS/" "Architectures/" "Documentation/" "Plans/" "Protocols/" "Visions/" "agent_cache/" "ci-tools/" "ci-rust-minimal/" "Terminal/" "KnowledgeRegistry/" "Projects/" "Sessions/"; do
    echo "Checking references to $old_dir..."
    find . -name "*.md" -o -name "*.js" -o -name "*.rs" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.toml" -o -name "*.sh" -type f -not -path "*/node_modules/*" -not -path "*/target/*" -not -path "*/.git/*" -not -path "*/AGENTS/Cartographer/Sessions/RepositoryRestructuring/*" | xargs grep -l "$old_dir" || true
done

echo "Phase 5 complete: Validation and Finalization"
echo "-------------------------------------------"

echo "ALL PHASES COMPLETE"
echo "-----------------"
echo "The repository has been restructured according to the plan."
echo "Please review the changes before committing."
echo ""
echo "To revert changes if needed, use git to discard the changes."