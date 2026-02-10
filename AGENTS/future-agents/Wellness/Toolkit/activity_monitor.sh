#!/bin/bash

# ============================================================================
# Wellness Agent Activity Monitor
# 
# This script monitors user activity patterns to determine when to trigger
# wellness interventions based on activity type and duration.
# ============================================================================

# Configuration
ACTIVITY_LOG_FILE="/tmp/wellness_activity.log"
ACTIVITY_SAMPLE_INTERVAL=60  # Seconds
INACTIVITY_THRESHOLD=300     # 5 minutes in seconds
CODING_SESSION_THRESHOLD=45  # 45 minutes of continuous coding

# Activity types and their associated patterns
declare -A ACTIVITY_PATTERNS
ACTIVITY_PATTERNS["coding"]="\.py$|\.js$|\.ts$|\.html$|\.css$|\.rs$|\.go$|\.java$|\.c$|\.cpp$|\.h$|\.md$"
ACTIVITY_PATTERNS["reading"]="less|more|cat|tail|head|man"
ACTIVITY_PATTERNS["browsing"]="firefox|chrome|safari"
ACTIVITY_PATTERNS["communication"]="slack|discord|zoom|teams"

# Ensure log file exists
touch "$ACTIVITY_LOG_FILE"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$ACTIVITY_LOG_FILE"
}

detect_current_activity() {
    # This is a simplified version. In a real implementation, this would use
    # more sophisticated methods to detect the active application and activity type
    
    # Check which applications are running
    local running_apps=$(ps -eo comm | grep -E "code|vim|emacs|subl|nano|atom|VSCode")
    
    if [[ -n "$running_apps" ]]; then
        echo "coding"
        return
    fi
    
    # Check for terminal activity with reading commands
    local reading_cmds=$(ps -eo command | grep -E "$(echo ${ACTIVITY_PATTERNS["reading"]})")
    if [[ -n "$reading_cmds" ]]; then
        echo "reading"
        return
    fi
    
    # Check for browsers
    local browser_apps=$(ps -eo comm | grep -E "$(echo ${ACTIVITY_PATTERNS["browsing"]})")
    if [[ -n "$browser_apps" ]]; then
        echo "browsing"
        return
    fi
    
    # Check for communication apps
    local comm_apps=$(ps -eo comm | grep -E "$(echo ${ACTIVITY_PATTERNS["communication"]})")
    if [[ -n "$comm_apps" ]]; then
        echo "communication"
        return
    fi
    
    # If we can't determine activity but there's recent input, classify as "other"
    local last_input=$(date -r "$HOME/.bash_history" +%s 2>/dev/null || echo 0)
    local current_time=$(date +%s)
    
    if (( current_time - last_input < INACTIVITY_THRESHOLD )); then
        echo "other"
        return
    fi
    
    echo "inactive"
}

track_activity_duration() {
    local activity_type=$1
    local current_time=$(date +%s)
    
    # Update activity duration for the current activity type
    if [[ "$CURRENT_ACTIVITY" == "$activity_type" ]]; then
        ACTIVITY_DURATION=$((ACTIVITY_DURATION + ACTIVITY_SAMPLE_INTERVAL))
    else
        # Activity type changed, reset duration
        ACTIVITY_DURATION=$ACTIVITY_SAMPLE_INTERVAL
        CURRENT_ACTIVITY="$activity_type"
        log "Activity changed to: $activity_type"
    fi
    
    log "Current activity: $activity_type, Duration: $ACTIVITY_DURATION seconds"
}

check_activity_thresholds() {
    # Check if any activity thresholds have been reached
    case "$CURRENT_ACTIVITY" in
        "coding")
            if (( ACTIVITY_DURATION >= CODING_SESSION_THRESHOLD * 60 )); then
                log "Coding session threshold reached: $ACTIVITY_DURATION seconds"
                return 0  # Trigger wellness intervention
            fi
            ;;
        "reading")
            if (( ACTIVITY_DURATION >= 30 * 60 )); then  # 30 minutes
                log "Reading session threshold reached: $ACTIVITY_DURATION seconds"
                return 0  # Trigger wellness intervention
            fi
            ;;
        "browsing")
            if (( ACTIVITY_DURATION >= 40 * 60 )); then  # 40 minutes
                log "Browsing session threshold reached: $ACTIVITY_DURATION seconds"
                return 0  # Trigger wellness intervention
            fi
            ;;
        "communication")
            if (( ACTIVITY_DURATION >= 60 * 60 )); then  # 60 minutes
                log "Communication session threshold reached: $ACTIVITY_DURATION seconds"
                return 0  # Trigger wellness intervention
            fi
            ;;
        "inactive")
            # Don't trigger for inactivity
            ;;
        *)
            if (( ACTIVITY_DURATION >= 50 * 60 )); then  # 50 minutes
                log "General activity threshold reached: $ACTIVITY_DURATION seconds"
                return 0  # Trigger wellness intervention
            fi
            ;;
    esac
    
    return 1  # No threshold reached
}

# Initialize global variables
CURRENT_ACTIVITY="unknown"
ACTIVITY_DURATION=0

# Main monitoring loop
log "Starting activity monitoring"

while true; do
    # Detect current activity
    activity=$(detect_current_activity)
    
    # Track duration of the current activity
    track_activity_duration "$activity"
    
    # Check if we need to trigger a wellness intervention
    if check_activity_thresholds; then
        # Signal the main wellness trigger script
        touch /tmp/wellness_activity_trigger
        
        # Reset activity duration after triggering
        ACTIVITY_DURATION=0
        log "Triggered wellness intervention based on activity pattern"
    fi
    
    # Sleep for the defined interval
    sleep $ACTIVITY_SAMPLE_INTERVAL
done