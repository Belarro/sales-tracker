#!/bin/bash
# Master Repository Restructuring Execution Script
# This script orchestrates the entire restructuring process

set -e  # Exit on error

BASE_DIR="/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence"
SCRIPT_DIR="$BASE_DIR/AGENTS/Cartographer/Sessions/RepositoryRestructuring"
BACKUP_DIR="$BASE_DIR/restructuring-backup-$(date +%Y%m%d%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print section header
section() {
  echo
  echo -e "${BLUE}=================================${NC}"
  echo -e "${BLUE}== $1${NC}"
  echo -e "${BLUE}=================================${NC}"
  echo
}

# Print success message
success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Print warning message
warning() {
  echo -e "${YELLOW}! $1${NC}"
}

# Print error message
error() {
  echo -e "${RED}✗ $1${NC}"
}

# Create backup of repository
create_backup() {
  section "Creating Backup"
  echo "Creating backup at: $BACKUP_DIR"
  mkdir -p "$BACKUP_DIR"
  cp -r "$BASE_DIR"/* "$BACKUP_DIR"/ 2>/dev/null || true
  success "Backup created successfully"
}

# Check if scripts exist
check_scripts() {
  section "Checking Scripts"
  missing=0
  
  scripts=(
    "phase1-directory-standardization.sh"
    "phase2-resource-consolidation.sh"
    "phase3-project-organization.sh"
    "phase4-special-resources.sh"
    "phase5-validation.sh"
  )
  
  for script in "${scripts[@]}"; do
    if [ ! -f "$SCRIPT_DIR/$script" ]; then
      error "Missing script: $script"
      missing=$((missing + 1))
    else
      success "Found script: $script"
      # Make sure script is executable
      chmod +x "$SCRIPT_DIR/$script"
    fi
  done
  
  if [ $missing -gt 0 ]; then
    error "Some required scripts are missing. Aborting."
    exit 1
  else
    success "All required scripts are present"
  fi
}

# Execute a specific phase
execute_phase() {
  phase_num=$1
  phase_name=$2
  script_name=$3
  
  section "Phase $phase_num: $phase_name"
  echo "Executing: $script_name"
  
  # Ask for confirmation
  read -p "Execute Phase $phase_num? (y/n): " choice
  case "$choice" in 
    y|Y ) 
      echo "Executing Phase $phase_num..."
      bash "$SCRIPT_DIR/$script_name"
      if [ $? -eq 0 ]; then
        success "Phase $phase_num completed successfully"
        return 0
      else
        error "Phase $phase_num failed"
        return 1
      fi
      ;;
    * ) 
      warning "Skipping Phase $phase_num"
      return 2
      ;;
  esac
}

# Restore from backup
restore_backup() {
  section "Restoring from Backup"
  echo "This will delete all changes and restore from backup at: $BACKUP_DIR"
  read -p "Are you sure you want to restore? (y/n): " choice
  case "$choice" in 
    y|Y ) 
      echo "Restoring from backup..."
      rm -rf "$BASE_DIR"/* 2>/dev/null || true
      cp -r "$BACKUP_DIR"/* "$BASE_DIR"/ 2>/dev/null || true
      success "Restoration completed"
      ;;
    * ) 
      warning "Restoration cancelled"
      ;;
  esac
}

# Main menu
main_menu() {
  clear
  section "Repository Restructuring Master Script"
  echo "This script will guide you through the repository restructuring process."
  echo
  echo "Available options:"
  echo "1. Create Backup (RECOMMENDED)"
  echo "2. Execute All Phases"
  echo "3. Execute Phase 1: Directory Standardization"
  echo "4. Execute Phase 2: Resource Consolidation"
  echo "5. Execute Phase 3: Project Organization"
  echo "6. Execute Phase 4: Special Resources"
  echo "7. Execute Phase 5: Validation"
  echo "8. Restore from Backup"
  echo "9. Exit"
  echo
  read -p "Select an option (1-9): " option
  
  case $option in
    1)
      create_backup
      ;;
    2)
      check_scripts
      execute_phase 1 "Directory Standardization" "phase1-directory-standardization.sh"
      execute_phase 2 "Resource Consolidation" "phase2-resource-consolidation.sh"
      execute_phase 3 "Project Organization" "phase3-project-organization.sh"
      execute_phase 4 "Special Resources" "phase4-special-resources.sh"
      execute_phase 5 "Validation" "phase5-validation.sh"
      section "Restructuring Complete"
      echo "Repository restructuring process has been completed."
      echo "Please review the validation report at:"
      echo "$SCRIPT_DIR/validation-report.md"
      ;;
    3)
      execute_phase 1 "Directory Standardization" "phase1-directory-standardization.sh"
      ;;
    4)
      execute_phase 2 "Resource Consolidation" "phase2-resource-consolidation.sh"
      ;;
    5)
      execute_phase 3 "Project Organization" "phase3-project-organization.sh"
      ;;
    6)
      execute_phase 4 "Special Resources" "phase4-special-resources.sh"
      ;;
    7)
      execute_phase 5 "Validation" "phase5-validation.sh"
      ;;
    8)
      restore_backup
      ;;
    9)
      echo "Exiting..."
      exit 0
      ;;
    *)
      error "Invalid option"
      ;;
  esac
  
  echo
  read -p "Press Enter to return to main menu..."
  main_menu
}

# Check if this script is being run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  # Make script executable
  chmod +x "$SCRIPT_DIR"/*.sh
  # Start main menu
  main_menu
fi