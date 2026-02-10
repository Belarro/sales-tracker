#!/bin/bash
# Cross-Reference Verification Script
# Verifies all markdown links in key documentation files

BASE_DIR="/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence"
DOCS_DIR="${BASE_DIR}/docs/integration"

echo "=== Cross-Reference Verification Report ==="
echo "Date: $(date)"
echo "Base Directory: ${BASE_DIR}"
echo ""

# Files to check
KEY_FILES=(
    "${DOCS_DIR}/CLAUDE_CODE_DOCUMENTATION_INDEX.md"
    "${DOCS_DIR}/FINAL_INTEGRATION_STATUS.md"
    "${DOCS_DIR}/KNOWN_ISSUES.md"
)

total_refs=0
valid_refs=0
broken_refs=0

for file in "${KEY_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "ERROR: Key file not found: $file"
        continue
    fi

    echo "=== Checking: $(basename "$file") ==="

    # Extract all markdown links
    while IFS= read -r line; do
        # Extract link path
        link=$(echo "$line" | sed -E 's/.*\[.*\]\(([^)]+)\).*/\1/')

        # Skip non-file links (URLs, anchors)
        if [[ "$link" =~ ^http ]] || [[ "$link" =~ ^# ]]; then
            continue
        fi

        # Resolve relative path
        link_dir=$(dirname "$file")
        full_path="${link_dir}/${link}"

        # Normalize path
        full_path=$(cd "$(dirname "$full_path")" 2>/dev/null && pwd)/$(basename "$full_path") 2>/dev/null

        total_refs=$((total_refs + 1))

        if [ -f "$full_path" ]; then
            valid_refs=$((valid_refs + 1))
            echo "  ✅ $link"
        else
            broken_refs=$((broken_refs + 1))
            echo "  ❌ BROKEN: $link"
            echo "     Expected: $full_path"
        fi
    done < <(grep -E '\[.*\]\(.*\.md\)' "$file")

    echo ""
done

# Summary
echo "=== SUMMARY ==="
echo "Total References: $total_refs"
echo "Valid References: $valid_refs"
echo "Broken References: $broken_refs"
if [ $total_refs -gt 0 ]; then
    accuracy=$(awk "BEGIN {printf \"%.1f\", ($valid_refs / $total_refs) * 100}")
    echo "Accuracy: ${accuracy}%"
fi
