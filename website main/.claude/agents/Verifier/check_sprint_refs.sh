#!/bin/bash
# Check Sprint README cross-references

sprint5="/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/docs/development/sprints/sprint-005"
sprint4="/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/docs/development/sprints/sprint-004"

echo "=== Sprint Documentation Cross-Reference Check ==="

for sprint_dir in "$sprint5" "$sprint4"; do
    sprint_name=$(basename "$sprint_dir")
    readme="${sprint_dir}/README.md"

    if [ ! -f "$readme" ]; then
        echo "⚠️  No README in $sprint_name"
        continue
    fi

    echo ""
    echo "=== $sprint_name ==="

    grep -E '\[.*\]\(.*\.md\)' "$readme" | sed -E 's/.*\[(.*)\]\(([^)]+)\).*/\2/' | sort -u | while read ref; do
        # Try relative to sprint directory
        full_path="${sprint_dir}/${ref}"
        if [ -f "$full_path" ]; then
            echo "  ✅ $ref"
            continue
        fi

        # Try relative to sprints directory
        full_path="${sprint_dir}/../${ref}"
        if [ -f "$full_path" ]; then
            echo "  ✅ $ref (parent)"
            continue
        fi

        echo "  ❌ BROKEN: $ref"
    done
done
