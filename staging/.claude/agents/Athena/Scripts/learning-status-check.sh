#!/bin/bash

# Quick Agent Learning Status Monitor
# Provides immediate verification of agent learning activity

echo "🧠 AGENT LEARNING STATUS MONITOR"
echo "=================================="
echo

# Check for recent learning activity (last 24 hours)
echo "📈 Recent Learning Activity (Last 24 hours):"
echo "--------------------------------------------"

recent_learning=$(find /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS/*/ContinuousLearning.md -mtime -1 2>/dev/null)

if [ -n "$recent_learning" ]; then
    echo "✅ Active learning detected:"
    for file in $recent_learning; do
        agent_name=$(basename $(dirname "$file"))
        last_modified=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$file" 2>/dev/null)
        echo "   • $agent_name - Last update: $last_modified"
    done
else
    echo "⚠️  No recent learning activity detected"
fi

echo
echo "📊 Learning Summary (Last 7 days):"
echo "-----------------------------------"

# Count learning entries from last week
total_learning=0
for agent_dir in /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS/*/; do
    if [ -d "$agent_dir" ] && [ -f "$agent_dir/ContinuousLearning.md" ]; then
        agent_name=$(basename "$agent_dir")
        
        # Count learning entries from last 7 days
        learning_count=$(grep -c "Learning captured:" "$agent_dir/ContinuousLearning.md" 2>/dev/null || echo "0")
        
        if [ "$learning_count" -gt 0 ]; then
            echo "   • $agent_name: $learning_count learning entries"
            total_learning=$((total_learning + learning_count))
        fi
    fi
done

echo
echo "📋 Quick Stats:"
echo "---------------"
echo "   • Total learning entries: $total_learning"
echo "   • Active agents: $(echo "$recent_learning" | wc -l | tr -d ' ')"
echo "   • Total agents: $(ls -1 /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS/ | grep -v '\.' | wc -l | tr -d ' ')"

echo
echo "🔍 Learning Quality Check:"
echo "-------------------------"

# Check for quality learning indicators
quality_learning=$(grep -r "Learning captured:" /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS/*/ContinuousLearning.md 2>/dev/null | head -5)

if [ -n "$quality_learning" ]; then
    echo "✅ Recent quality learning examples:"
    echo "$quality_learning" | while read line; do
        agent_path=$(echo "$line" | cut -d: -f1)
        agent_name=$(basename $(dirname "$agent_path"))
        learning_text=$(echo "$line" | cut -d: -f2-)
        echo "   • $agent_name:$learning_text"
    done
else
    echo "⚠️  No learning footers found"
fi

echo
echo "🎯 Next Steps:"
echo "-------------"
echo "   • For detailed analysis: review dashboard plans in /AGENTS/Athena/Plans/"
echo "   • For real-time monitoring: implement web dashboard"
echo "   • For automation: set up learning alerts"
echo