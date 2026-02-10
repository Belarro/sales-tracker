#!/bin/bash
echo "=== CollaborativeIntelligence Agents Verification ==="
echo ""
echo "Checking .claude/AGENTS directory..."
if [ -d ".claude/AGENTS" ]; then
    echo "✅ AGENTS directory exists"
    
    agent_count=$(find .claude/AGENTS -maxdepth 1 -type d -name "[A-Z]*" | wc -l)
    echo "✅ Found $agent_count agent directories"
    
    memory_count=$(find .claude/AGENTS -name "MEMORY.md" | wc -l)
    echo "✅ Found $memory_count MEMORY.md files"
    
    context_count=$(find .claude/AGENTS -name "CONTEXT_INJECTION.md" | wc -l)
    echo "✅ Found $context_count CONTEXT_INJECTION.md files"
    
    total_files=$(find .claude/AGENTS -type f -name "*.md" | wc -l)
    echo "✅ Total markdown files: $total_files"
    
    size=$(du -sh .claude/AGENTS | cut -f1)
    echo "✅ Total size: $size"
    
    echo ""
    echo "Sample agents:"
    ls .claude/AGENTS | grep -E "^[A-Z]" | head -10
    
    echo ""
    echo "Developer agent files:"
    ls -lh .claude/AGENTS/Developer/*.md | head -5
    
else
    echo "❌ AGENTS directory not found!"
fi
