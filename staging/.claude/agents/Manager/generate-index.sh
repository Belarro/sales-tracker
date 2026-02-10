#!/bin/bash

# generate-index.sh
# Script to generate a comprehensive agent documentation file
# by concatenating all agent README.md files into a single document

# Exit on any error
set -e

# Set variables
OUTPUT_FILE="$(dirname "$0")/AGENTS-FULL.md"
AGENTS_DIR="/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS"

# Create header
echo "# Comprehensive Agent Documentation" > "$OUTPUT_FILE"
echo -e "\nGenerated: $(date)\n" >> "$OUTPUT_FILE"
echo -e "This document contains the complete documentation for all agents in the Collaborative Intelligence System.\n" >> "$OUTPUT_FILE"
echo -e "## Table of Contents\n" >> "$OUTPUT_FILE"

# Generate table of contents
for dir in "$AGENTS_DIR"/*/; do
  if [ -d "$dir" ]; then
    agent_name=$(basename "$dir")
    echo "- [Agent: $agent_name](#agent-$agent_name)" >> "$OUTPUT_FILE"
  fi
done

# Add each agent's README content
for dir in "$AGENTS_DIR"/*/; do
  if [ -d "$dir" ]; then
    readme_file="$dir/README.md"
    if [ -f "$readme_file" ]; then
      agent_name=$(basename "$dir")
      echo -e "\n\n<a id=\"agent-$agent_name\"></a>" >> "$OUTPUT_FILE"
      echo -e "## Agent: $agent_name\n" >> "$OUTPUT_FILE"
      cat "$readme_file" >> "$OUTPUT_FILE"
      echo -e "\n---" >> "$OUTPUT_FILE"
    fi
  fi
done

# Make executable
chmod +x "$(dirname "$0")/generate-index.sh"

echo "✅ Successfully generated comprehensive agent index at: $OUTPUT_FILE"