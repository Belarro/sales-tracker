#!/bin/bash

# ============================================================================
# Wellness Agent Trigger System
# 
# This script implements a trigger system for the Wellness agent to provide
# timely wellness interventions based on user activity and time patterns.
# ============================================================================

# Configuration
SESSION_DURATION_THRESHOLD=90  # Minutes
CHECK_INTERVAL=30              # Seconds
LOG_FILE="/tmp/wellness_trigger.log"
CACHE_DIR="/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/CACHE/SESSIONS"
CI_TOOLS_DIR="/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/ci-tools"

# Ensure log file exists
touch "$LOG_FILE"

# Initialize timestamps
LAST_INTERVENTION_TIME=$(date +%s)
SESSION_START_TIME=$(date +%s)
LAST_ACTIVITY_TIME=$(date +%s)

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

detect_user_activity() {
    # Simple activity detection based on terminal input
    # In a real implementation, this would be more sophisticated
    # to detect keyboard/mouse activity system-wide
    
    # For now, we'll use the modification time of the bash history file
    # as a proxy for terminal activity
    local hist_file="$HOME/.bash_history"
    if [[ -f "$hist_file" ]]; then
        local mod_time=$(stat -f "%m" "$hist_file")
        local current_time=$(date +%s)
        
        if (( mod_time > (current_time - 300) )); then  # Activity in the last 5 minutes
            LAST_ACTIVITY_TIME=$current_time
            return 0  # Activity detected
        fi
    fi
    
    return 1  # No activity detected
}

check_session_duration() {
    local current_time=$(date +%s)
    local elapsed_minutes=$(( (current_time - SESSION_START_TIME) / 60 ))
    local since_last_intervention=$(( (current_time - LAST_INTERVENTION_TIME) / 60 ))
    
    if (( elapsed_minutes >= SESSION_DURATION_THRESHOLD && since_last_intervention >= SESSION_DURATION_THRESHOLD )); then
        log "Session duration threshold reached: $elapsed_minutes minutes"
        return 0  # Trigger wellness intervention
    fi
    
    return 1  # Don't trigger yet
}

is_wellness_agent_active() {
    # Check if Wellness agent is already active
    local current_date=$(date +'%Y-%m-%d')
    local cache_file="$CACHE_DIR/Wellness_CollaborativeIntelligence_*_$current_date*.md"
    
    if ls $cache_file 2>/dev/null | grep -q .; then
        local active=$(grep -l "Status: Active" $cache_file)
        if [[ -n "$active" ]]; then
            return 0  # Wellness agent is active
        fi
    fi
    
    return 1  # Wellness agent is not active
}

trigger_wellness_agent() {
    log "Triggering Wellness agent"
    
    # Check if agent is already active
    if is_wellness_agent_active; then
        log "Wellness agent is already active, sending notification"
        # In a real implementation, this would send a message to the active agent
        # For now, we'll create a notification file
        echo "Wellness reminder: Time for a break! You've been working for over 90 minutes." > /tmp/wellness_notification.txt
        return
    fi
    
    # Activate the Wellness agent
    if [[ -f "$CI_TOOLS_DIR/lib/agent-activator.sh" ]]; then
        log "Activating Wellness agent using agent-activator.sh"
        cd /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence
        bash "$CI_TOOLS_DIR/lib/agent-activator.sh" Wellness "Automatic time-based activation after extended work session"
        LAST_INTERVENTION_TIME=$(date +%s)
    else
        log "ERROR: Could not find agent-activator.sh"
    fi
}

# Main monitoring loop
log "Starting Wellness trigger system"
log "Session duration threshold: $SESSION_DURATION_THRESHOLD minutes"
log "Check interval: $CHECK_INTERVAL seconds"

while true; do
    # Update activity status
    detect_user_activity
    
    # Check if we should trigger the Wellness agent
    if check_session_duration; then
        trigger_wellness_agent
    fi
    
    # Sleep for the defined interval
    sleep $CHECK_INTERVAL
done