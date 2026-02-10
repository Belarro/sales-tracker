#!/bin/bash
# Navigation Flow Test - Check if documentation has clear paths

BASE_DIR="/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence"

echo "=== Navigation Flow Analysis ==="
echo ""

# Test 1: Entry points exist
echo "=== 1. Entry Point Verification ==="
entry_points=(
    "docs/integration/CLAUDE_CODE_DOCUMENTATION_INDEX.md"
    "docs/integration/CLAUDE_CODE_QUICK_START.md"
    "docs/integration/KNOWN_ISSUES.md"
    "docs/integration/FINAL_INTEGRATION_STATUS.md"
)

for entry in "${entry_points[@]}"; do
    if [ -f "${BASE_DIR}/${entry}" ]; then
        echo "  ✅ $(basename "$entry")"
    else
        echo "  ❌ MISSING: $entry"
    fi
done

echo ""
echo "=== 2. Dead-End Documents (No Onward Links) ==="
find "${BASE_DIR}/docs/integration" -name "*.md" -type f | while read file; do
    link_count=$(grep -c '\[.*\](.*\.md)' "$file" 2>/dev/null || echo 0)
    if [ "$link_count" -eq 0 ]; then
        rel_path="${file#$BASE_DIR/}"
        echo "  ⚠️  Dead-end: $rel_path (no onward links)"
    fi
done

echo ""
echo "=== 3. Circular Reference Detection ==="
# Simple check: if A links to B and B links to A
for file in "${BASE_DIR}"/docs/integration/*.md; do
    [ -f "$file" ] || continue

    basename_file=$(basename "$file")

    # Find files this one links to
    grep -oE '\[.*\]\(([^)]+\.md)\)' "$file" | sed -E 's/.*\(([^)]+)\).*/\1/' | while read linked; do
        # Resolve to full path
        file_dir=$(dirname "$file")
        linked_full="${file_dir}/${linked}"

        # Check if linked file exists and links back
        if [ -f "$linked_full" ]; then
            if grep -q "$basename_file" "$linked_full" 2>/dev/null; then
                echo "  🔄 Circular: $(basename "$file") ↔ $(basename "$linked")"
            fi
        fi
    done
done | sort -u

echo ""
echo "=== 4. Navigation Path Coverage ==="
# Check if key user journeys exist
echo "User Journey: New Developer"
journeys=(
    "docs/integration/CLAUDE_CODE_QUICK_START.md:Quick Start"
    "docs/integration/CLAUDE_CODE_INSTALLATION_GUIDE.md:Installation"
    "docs/guides/AGENT_USAGE_GUIDE.md:Agent Usage"
    "docs/architecture/CI_COLLABORATIVEINTELLIGENCE_INTEGRATION_ARCHITECTURE.md:Architecture"
)

for journey in "${journeys[@]}"; do
    path="${journey%%:*}"
    label="${journey##*:}"
    if [ -f "${BASE_DIR}/${path}" ]; then
        echo "  ✅ $label"
    else
        echo "  ❌ Missing: $label ($path)"
    fi
done
