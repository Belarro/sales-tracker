#!/bin/bash
# Metalist Sync Tool - Intelligent Project Synchronization
# Coordinates between local machine and nuru.tools server

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="/Users/joshkornreich/Documents/Projects"
REMOTE_SERVER="root@nuru.tools"
REMOTE_ROOT="/root/projects"
SYNC_LOG="/tmp/metalist_sync.log"
WORKLOAD_ANALYZER="$SCRIPT_DIR/metalist_workload_analyzer.py"

# Performance tracking
SYNC_STATS="/tmp/metalist_sync_stats.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        "INFO")  echo -e "${BLUE}[INFO]${NC} $message" ;;
        "WARN")  echo -e "${YELLOW}[WARN]${NC} $message" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $message" ;;
        "SUCCESS") echo -e "${GREEN}[SUCCESS]${NC} $message" ;;
        "SYNC") echo -e "${PURPLE}[SYNC]${NC} $message" ;;
    esac
    
    echo "[$timestamp] [$level] $message" >> "$SYNC_LOG"
}

# Check prerequisites
check_prerequisites() {
    log "INFO" "Checking prerequisites..."
    
    # Check SSH connectivity
    if ! ssh -o ConnectTimeout=5 -q "$REMOTE_SERVER" exit; then
        log "ERROR" "Cannot connect to $REMOTE_SERVER"
        return 1
    fi
    
    # Check if workload analyzer exists
    if [[ ! -f "$WORKLOAD_ANALYZER" ]]; then
        log "WARN" "Workload analyzer not found at $WORKLOAD_ANALYZER"
    fi
    
    # Check for synapse CLI
    if command -v synapse >/dev/null 2>&1; then
        log "INFO" "Synapse CLI available"
        SYNAPSE_AVAILABLE=true
    else
        log "INFO" "Synapse CLI not available, using rsync fallback"
        SYNAPSE_AVAILABLE=false
    fi
    
    # Create remote projects directory
    ssh "$REMOTE_SERVER" "mkdir -p $REMOTE_ROOT"
    
    log "SUCCESS" "Prerequisites check completed"
}

# Sync with synapse (primary method)
sync_with_synapse() {
    local source="$1"
    local dest="$2"
    local description="$3"
    
    if [[ "$SYNAPSE_AVAILABLE" != true ]]; then
        return 1  # Fall back to rsync
    fi
    
    log "SYNC" "🚀 Attempting Synapse transfer: $description"
    
    local start_time=$(date +%s)
    
    # Try synapse with timeout
    if timeout 60s synapse "$source" "$REMOTE_SERVER:$dest" 2>/dev/null; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log "SUCCESS" "✅ Synapse transfer successful ($duration seconds)"
        
        # Record performance
        record_sync_performance "synapse" "$source" "$duration" "success"
        return 0
    else
        log "WARN" "⚠️ Synapse transfer failed or timed out"
        return 1
    fi
}

# Fallback sync with rsync
sync_with_rsync() {
    local source="$1"
    local dest="$2"
    local description="$3"
    local sync_type="${4:-standard}"
    
    log "SYNC" "🔄 Using rsync for: $description"
    
    local start_time=$(date +%s)
    local rsync_opts=()
    
    case "$sync_type" in
        "fast")
            rsync_opts=(
                --archive
                --compress
                --partial
                --timeout=60
                --exclude='.git'
                --exclude='target/'
                --exclude='node_modules/'
                --exclude='dist/'
                --exclude='*.log'
            )
            ;;
        "full")
            rsync_opts=(
                --archive
                --verbose
                --compress
                --partial
                --progress
                --timeout=300
                --exclude='.git'
            )
            ;;
        *)
            rsync_opts=(
                --archive
                --compress
                --partial
                --timeout=120
                --exclude='.git'
                --exclude='target/'
                --exclude='node_modules/'
            )
            ;;
    esac
    
    if rsync "${rsync_opts[@]}" "$source" "$REMOTE_SERVER:$dest"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log "SUCCESS" "✅ Rsync transfer successful ($duration seconds)"
        
        record_sync_performance "rsync_$sync_type" "$source" "$duration" "success"
        return 0
    else
        log "ERROR" "❌ Rsync transfer failed"
        record_sync_performance "rsync_$sync_type" "$source" "0" "failed"
        return 1
    fi
}

# Smart sync - tries synapse first, falls back to rsync
smart_sync() {
    local source="$1"
    local dest="$2"
    local description="$3"
    local sync_priority="${4:-normal}"
    
    # Ensure destination directory exists
    local dest_dir=$(dirname "$dest")
    ssh "$REMOTE_SERVER" "mkdir -p $dest_dir"
    
    case "$sync_priority" in
        "critical")
            # Critical files - try both methods if needed
            if ! sync_with_synapse "$source" "$dest" "$description"; then
                sync_with_rsync "$source" "$dest" "$description" "fast"
            fi
            ;;
        "normal")
            # Normal priority - synapse preferred
            if ! sync_with_synapse "$source" "$dest" "$description"; then
                sync_with_rsync "$source" "$dest" "$description" "standard"
            fi
            ;;
        "bulk")
            # Bulk transfer - use rsync directly
            sync_with_rsync "$source" "$dest" "$description" "full"
            ;;
    esac
}

# Sync specific project
sync_project() {
    local project_name="$1"
    local sync_mode="${2:-smart}"  # smart, fast, full
    
    local project_path="$PROJECT_ROOT/$project_name"
    local remote_path="$REMOTE_ROOT/$project_name"
    
    if [[ ! -d "$project_path" ]]; then
        log "ERROR" "Project $project_name not found at $project_path"
        return 1
    fi
    
    log "INFO" "📁 Syncing project: $project_name (mode: $sync_mode)"
    
    case "$sync_mode" in
        "fast")
            # Sync only critical development files
            smart_sync "$project_path/" "$remote_path/" "Fast sync: $project_name" "critical"
            ;;
        "smart")
            # Intelligent sync based on project analysis
            if [[ -f "$WORKLOAD_ANALYZER" ]]; then
                # Use workload analyzer to determine sync strategy
                local analysis_result
                analysis_result=$(python3 "$WORKLOAD_ANALYZER" "sync_project" "$project_path" 2>/dev/null || echo "fallback")
                
                if [[ "$analysis_result" == *"REMOTE"* ]]; then
                    smart_sync "$project_path/" "$remote_path/" "Smart sync: $project_name" "normal"
                else
                    log "INFO" "📊 Analysis suggests local processing for $project_name"
                fi
            else
                smart_sync "$project_path/" "$remote_path/" "Standard sync: $project_name" "normal"
            fi
            ;;
        "full")
            # Complete sync including all files
            smart_sync "$project_path/" "$remote_path/" "Full sync: $project_name" "bulk"
            ;;
    esac
}

# Sync results back from server
sync_results_back() {
    local project_name="$1"
    local result_patterns="${2:-target dist build out}"
    
    log "INFO" "⬇️ Syncing results back from $project_name"
    
    local project_path="$PROJECT_ROOT/$project_name"
    local remote_path="$REMOTE_ROOT/$project_name"
    
    for pattern in $result_patterns; do
        local local_dir="$project_path/$pattern"
        local remote_dir="$remote_path/$pattern"
        
        # Check if remote directory exists
        if ssh "$REMOTE_SERVER" "test -d $remote_dir"; then
            log "SYNC" "📥 Syncing back: $pattern"
            mkdir -p "$local_dir"
            
            if ! rsync -avz --timeout=120 "$REMOTE_SERVER:$remote_dir/" "$local_dir/"; then
                log "WARN" "Failed to sync back $pattern"
            fi
        fi
    done
}

# Execute command with intelligent distribution
execute_distributed() {
    local command="$1"
    local project_name="$2"
    local force_local="${3:-false}"
    
    if [[ "$force_local" == "true" ]]; then
        log "INFO" "💻 Executing locally (forced): $command"
        cd "$PROJECT_ROOT/$project_name" && eval "$command"
        return $?
    fi
    
    # Analyze workload if analyzer available
    if [[ -f "$WORKLOAD_ANALYZER" ]]; then
        local analysis
        analysis=$(python3 "$WORKLOAD_ANALYZER" "$command" "$PROJECT_ROOT/$project_name" 2>/dev/null || echo "")
        
        if [[ "$analysis" == *"nuru.tools"* ]]; then
            log "INFO" "🚀 Executing on nuru.tools: $command"
            
            # Sync project first
            sync_project "$project_name" "fast"
            
            # Execute remotely
            if ssh "$REMOTE_SERVER" "cd $REMOTE_ROOT/$project_name && $command"; then
                # Sync results back
                sync_results_back "$project_name"
                return 0
            else
                log "ERROR" "Remote execution failed"
                return 1
            fi
        fi
    fi
    
    # Default to local execution
    log "INFO" "💻 Executing locally: $command"
    cd "$PROJECT_ROOT/$project_name" && eval "$command"
}

# Performance tracking
record_sync_performance() {
    local method="$1"
    local source="$2"
    local duration="$3"
    local status="$4"
    
    local file_size=0
    if [[ -f "$source" ]]; then
        file_size=$(stat -f%z "$source" 2>/dev/null || echo "0")
    elif [[ -d "$source" ]]; then
        file_size=$(du -s "$source" | cut -f1)
    fi
    
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local throughput=0
    
    if [[ "$duration" -gt 0 ]] && [[ "$file_size" -gt 0 ]]; then
        throughput=$((file_size / duration))
    fi
    
    # Create or update stats file
    local stats_entry=$(cat <<EOF
{
  "timestamp": "$timestamp",
  "method": "$method",
  "source": "$source",
  "file_size": $file_size,
  "duration": $duration,
  "throughput": $throughput,
  "status": "$status"
}
EOF
    )
    
    echo "$stats_entry" >> "$SYNC_STATS"
}

# Monitor sync health
monitor_sync_health() {
    log "INFO" "🏥 Checking sync coordination health..."
    
    # Test connectivity
    if ssh -q "$REMOTE_SERVER" exit; then
        log "SUCCESS" "✅ Server connectivity: OK"
    else
        log "ERROR" "❌ Server connectivity: FAILED"
        return 1
    fi
    
    # Check remote load
    local remote_load
    remote_load=$(ssh "$REMOTE_SERVER" "uptime | awk '{print \$(NF-2)}' | tr -d ','")
    log "INFO" "📊 Remote server load: $remote_load"
    
    # Check recent sync failures
    local sync_failures=0
    if [[ -f "$SYNC_LOG" ]]; then
        sync_failures=$(grep -c "ERROR.*transfer failed" "$SYNC_LOG" 2>/dev/null || echo "0")
    fi
    log "INFO" "🔄 Recent sync failures: $sync_failures"
    
    # Check disk space
    local remote_disk
    remote_disk=$(ssh "$REMOTE_SERVER" "df -h / | tail -1 | awk '{print \$5}'")
    log "INFO" "💾 Remote disk usage: $remote_disk"
    
    return 0
}

# Show usage
usage() {
    cat <<EOF
Metalist Sync Tool - Intelligent Project Synchronization

Usage: $0 <command> [options]

Commands:
  sync <project> [mode]     Sync project to server (modes: fast, smart, full)
  exec <project> <command>  Execute command with optimal distribution
  back <project> [patterns] Sync results back from server
  health                    Check sync coordination health
  stats                     Show sync performance statistics

Examples:
  $0 sync AI_TRADING_BOT_PROJECT smart
  $0 exec AI_TRADING_BOT_PROJECT "cargo build --release"
  $0 back AI_TRADING_BOT_PROJECT "target dist"
  $0 health

Options:
  -f, --force-local        Force local execution
  -v, --verbose           Verbose output
  -h, --help             Show this help

Server: $REMOTE_SERVER
Remote Path: $REMOTE_ROOT
EOF
}

# Main function
main() {
    case "${1:-}" in
        "sync")
            check_prerequisites
            if [[ -n "${2:-}" ]]; then
                sync_project "$2" "${3:-smart}"
            else
                log "ERROR" "Project name required for sync command"
                exit 1
            fi
            ;;
        "exec")
            check_prerequisites
            if [[ -n "${2:-}" && -n "${3:-}" ]]; then
                execute_distributed "$3" "$2"
            else
                log "ERROR" "Project name and command required for exec"
                exit 1
            fi
            ;;
        "back")
            if [[ -n "${2:-}" ]]; then
                sync_results_back "$2" "${3:-target dist build out}"
            else
                log "ERROR" "Project name required for back command"
                exit 1
            fi
            ;;
        "health")
            monitor_sync_health
            ;;
        "stats")
            if [[ -f "$SYNC_STATS" ]]; then
                echo "📈 Recent sync performance:"
                tail -10 "$SYNC_STATS"
            else
                log "INFO" "No performance statistics available yet"
            fi
            ;;
        "-h"|"--help"|"help")
            usage
            ;;
        "")
            log "ERROR" "No command specified"
            usage
            exit 1
            ;;
        *)
            log "ERROR" "Unknown command: $1"
            usage
            exit 1
            ;;
    esac
}

# Handle script execution
main "$@"