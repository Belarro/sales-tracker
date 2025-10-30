#!/bin/bash

# ============================================================================
# Wellness Agent Service Manager
# 
# This script manages the wellness trigger and activity monitor services,
# orchestrating the automatic activation of wellness interventions.
# ============================================================================

# Configuration
WELLNESS_DIR="/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS/Wellness"
TOOLKIT_DIR="$WELLNESS_DIR/Toolkit"
TRIGGER_SCRIPT="$TOOLKIT_DIR/wellness_trigger.sh"
ACTIVITY_SCRIPT="$TOOLKIT_DIR/activity_monitor.sh"
LOG_DIR="/tmp/wellness_logs"
MAIN_LOG="$LOG_DIR/wellness_service.log"
TRIGGER_PID_FILE="$LOG_DIR/trigger.pid"
ACTIVITY_PID_FILE="$LOG_DIR/activity.pid"

# Ensure log directory exists
mkdir -p "$LOG_DIR"
touch "$MAIN_LOG"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$MAIN_LOG"
}

start_service() {
    log "Starting Wellness Service"
    
    # Check if trigger script exists and is executable
    if [[ ! -x "$TRIGGER_SCRIPT" ]]; then
        log "ERROR: Trigger script not found or not executable: $TRIGGER_SCRIPT"
        return 1
    fi
    
    # Check if activity script exists and is executable
    if [[ ! -x "$ACTIVITY_SCRIPT" ]]; then
        log "ERROR: Activity script not found or not executable: $ACTIVITY_SCRIPT"
        return 1
    fi
    
    # Start trigger script
    nohup "$TRIGGER_SCRIPT" > "$LOG_DIR/trigger.log" 2>&1 &
    TRIGGER_PID=$!
    echo $TRIGGER_PID > "$TRIGGER_PID_FILE"
    log "Started trigger service with PID: $TRIGGER_PID"
    
    # Start activity monitor script
    nohup "$ACTIVITY_SCRIPT" > "$LOG_DIR/activity.log" 2>&1 &
    ACTIVITY_PID=$!
    echo $ACTIVITY_PID > "$ACTIVITY_PID_FILE"
    log "Started activity monitor service with PID: $ACTIVITY_PID"
    
    log "Wellness Service started successfully"
    return 0
}

stop_service() {
    log "Stopping Wellness Service"
    
    # Stop trigger script
    if [[ -f "$TRIGGER_PID_FILE" ]]; then
        TRIGGER_PID=$(cat "$TRIGGER_PID_FILE")
        if kill -0 $TRIGGER_PID 2>/dev/null; then
            kill $TRIGGER_PID
            log "Stopped trigger service with PID: $TRIGGER_PID"
        else
            log "Trigger service not running"
        fi
        rm -f "$TRIGGER_PID_FILE"
    fi
    
    # Stop activity monitor script
    if [[ -f "$ACTIVITY_PID_FILE" ]]; then
        ACTIVITY_PID=$(cat "$ACTIVITY_PID_FILE")
        if kill -0 $ACTIVITY_PID 2>/dev/null; then
            kill $ACTIVITY_PID
            log "Stopped activity monitor service with PID: $ACTIVITY_PID"
        else
            log "Activity monitor service not running"
        fi
        rm -f "$ACTIVITY_PID_FILE"
    fi
    
    log "Wellness Service stopped successfully"
    return 0
}

status_service() {
    local status=0
    
    # Check trigger script
    if [[ -f "$TRIGGER_PID_FILE" ]]; then
        TRIGGER_PID=$(cat "$TRIGGER_PID_FILE")
        if kill -0 $TRIGGER_PID 2>/dev/null; then
            echo "Trigger service: RUNNING (PID: $TRIGGER_PID)"
        else
            echo "Trigger service: STOPPED (stale PID file exists)"
            status=1
        fi
    else
        echo "Trigger service: STOPPED"
        status=1
    fi
    
    # Check activity monitor script
    if [[ -f "$ACTIVITY_PID_FILE" ]]; then
        ACTIVITY_PID=$(cat "$ACTIVITY_PID_FILE")
        if kill -0 $ACTIVITY_PID 2>/dev/null; then
            echo "Activity monitor service: RUNNING (PID: $ACTIVITY_PID)"
        else
            echo "Activity monitor service: STOPPED (stale PID file exists)"
            status=1
        fi
    else
        echo "Activity monitor service: STOPPED"
        status=1
    fi
    
    return $status
}

setup_autostart() {
    log "Setting up autostart for Wellness Service"
    
    # Create a LaunchAgent plist file for the user
    local plist_dir="$HOME/Library/LaunchAgents"
    local plist_file="$plist_dir/com.collaborativeintelligence.wellness.plist"
    
    mkdir -p "$plist_dir"
    
    cat > "$plist_file" << EOL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.collaborativeintelligence.wellness</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$WELLNESS_DIR/Toolkit/wellness_service.sh</string>
        <string>start</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
    <key>StandardOutPath</key>
    <string>$LOG_DIR/launchd_out.log</string>
    <key>StandardErrorPath</key>
    <string>$LOG_DIR/launchd_err.log</string>
</dict>
</plist>
EOL
    
    log "Created LaunchAgent plist at: $plist_file"
    echo "To load the service now, run: launchctl load $plist_file"
    echo "The service will start automatically on login"
}

# Process command line arguments
case "$1" in
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        stop_service
        sleep 1
        start_service
        ;;
    status)
        status_service
        ;;
    setup)
        setup_autostart
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|setup}"
        echo
        echo "Commands:"
        echo "  start   - Start the Wellness Service"
        echo "  stop    - Stop the Wellness Service"
        echo "  restart - Restart the Wellness Service"
        echo "  status  - Check the status of the Wellness Service"
        echo "  setup   - Configure the service to start automatically at login"
        exit 1
        ;;
esac

exit $?