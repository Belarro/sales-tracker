#!/bin/bash
# Phase 1: Directory Standardization Script
# This script creates the new standardized directory structure

set -e  # Exit on error
BASE_DIR="/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence"
cd "$BASE_DIR"

echo "Phase 1: Creating standardized directory structure..."

# Create new top-level directories with lowercase naming
mkdir -p agents/{core,development,knowledge,specialized}
mkdir -p cli/{ci-tools,plugins,scripts}
mkdir -p core/{memory,protocols,architecture}
mkdir -p docs/{guides,architecture,protocols,api}
mkdir -p data/{cache,sessions,benchmarks}
mkdir -p examples/{conversations,projects}
mkdir -p tools/{testing,development}
mkdir -p extensions/{kanji,tauri}

echo "Directory structure created successfully."
echo "Phase 1 complete."