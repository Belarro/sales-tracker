#!/bin/bash
# Fix nginx configuration issue on nuru.tools server

set -euo pipefail

# Configuration
SERVER="nuru.tools"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    local level="$1"
    shift
    local message="$*"
    
    case "$level" in
        "INFO")  echo -e "${BLUE}[INFO]${NC} $message" ;;
        "WARN")  echo -e "${YELLOW}[WARN]${NC} $message" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $message" ;;
        "SUCCESS") echo -e "${GREEN}[SUCCESS]${NC} $message" ;;
    esac
}

# Try different SSH connection methods
try_ssh_connection() {
    local ssh_cmd=""
    
    # Method 1: Standard port 22
    if ssh -o ConnectTimeout=5 -o BatchMode=yes root@$SERVER "echo 'connected'" >/dev/null 2>&1; then
        ssh_cmd="ssh root@$SERVER"
        log "SUCCESS" "Connected via standard SSH (port 22)"
    # Method 2: Port 2222 (hardened)
    elif ssh -p 2222 -o ConnectTimeout=5 -o BatchMode=yes root@$SERVER "echo 'connected'" >/dev/null 2>&1; then
        ssh_cmd="ssh -p 2222 root@$SERVER"
        log "SUCCESS" "Connected via hardened SSH (port 2222)"
    # Method 3: Direct IP
    elif ssh -o ConnectTimeout=5 -o BatchMode=yes root@185.189.45.80 "echo 'connected'" >/dev/null 2>&1; then
        ssh_cmd="ssh root@185.189.45.80"
        log "SUCCESS" "Connected via direct IP"
    else
        log "ERROR" "Cannot establish SSH connection to server"
        log "INFO" "Please ensure:"
        log "INFO" "  1. SSH keys are properly configured"
        log "INFO" "  2. Server is accessible"
        log "INFO" "  3. Firewall allows SSH connections"
        return 1
    fi
    
    echo "$ssh_cmd"
}

# Fix nginx configuration
fix_nginx_config() {
    local ssh_cmd="$1"
    
    log "INFO" "Fixing nginx configuration..."
    
    # Upload the simplified nginx config
    if [[ -f "$SCRIPT_DIR/universal_auth_nginx_simple.conf" ]]; then
        log "INFO" "Uploading simplified nginx configuration..."
        scp $(echo $ssh_cmd | sed 's/ssh/scp/' | sed 's/ root@/ /') \
            "$SCRIPT_DIR/universal_auth_nginx_simple.conf" \
            root@$SERVER:/tmp/universal_auth_nginx_simple.conf
    else
        log "ERROR" "Simplified nginx config not found"
        return 1
    fi
    
    # Apply the configuration
    $ssh_cmd << 'REMOTE_SCRIPT'
        set -euo pipefail
        
        echo "[$(date)] Applying fixed nginx configuration..."
        
        # Backup current config
        if [[ -f /etc/nginx/sites-enabled/universal-auth ]]; then
            cp /etc/nginx/sites-enabled/universal-auth /etc/nginx/sites-enabled/universal-auth.backup
        fi
        
        # Apply new config
        cp /tmp/universal_auth_nginx_simple.conf /etc/nginx/sites-available/universal-auth
        ln -sf /etc/nginx/sites-available/universal-auth /etc/nginx/sites-enabled/universal-auth
        
        # Test configuration
        if nginx -t; then
            echo "Nginx configuration test passed"
            systemctl reload nginx
            echo "Nginx reloaded successfully"
        else
            echo "Nginx configuration test failed"
            # Restore backup if exists
            if [[ -f /etc/nginx/sites-enabled/universal-auth.backup ]]; then
                cp /etc/nginx/sites-enabled/universal-auth.backup /etc/nginx/sites-enabled/universal-auth
                nginx -t && systemctl reload nginx
                echo "Restored backup configuration"
            fi
            exit 1
        fi
        
        # Check services
        systemctl status nginx --no-pager || true
        systemctl status universal-auth --no-pager || true
        
        echo "Configuration fix completed"
REMOTE_SCRIPT
}

# Check system status
check_system_status() {
    local ssh_cmd="$1"
    
    log "INFO" "Checking system status..."
    
    $ssh_cmd << 'REMOTE_SCRIPT'
        echo "=== System Status ==="
        echo "Nginx status:"
        systemctl is-active nginx || echo "nginx inactive"
        
        echo "Universal Auth status:"
        systemctl is-active universal-auth || echo "universal-auth inactive"
        
        echo "Port 3001 (auth service):"
        netstat -tlnp | grep :3001 || echo "Port 3001 not listening"
        
        echo "Nginx process:"
        pgrep nginx || echo "No nginx process found"
        
        echo "Recent nginx errors:"
        tail -5 /var/log/nginx/error.log 2>/dev/null || echo "No nginx error log"
REMOTE_SCRIPT
}

# Main function
main() {
    log "INFO" "Starting nginx configuration fix for $SERVER"
    
    # Try to establish SSH connection
    local ssh_cmd
    if ! ssh_cmd=$(try_ssh_connection); then
        exit 1
    fi
    
    log "INFO" "Using SSH command: $ssh_cmd"
    
    # Check current system status
    check_system_status "$ssh_cmd"
    
    # Fix nginx configuration
    if fix_nginx_config "$ssh_cmd"; then
        log "SUCCESS" "Nginx configuration fixed successfully"
    else
        log "ERROR" "Failed to fix nginx configuration"
        exit 1
    fi
    
    # Verify fix worked
    log "INFO" "Verifying fix..."
    check_system_status "$ssh_cmd"
    
    log "SUCCESS" "Universal authentication system should now be operational"
    log "INFO" "You can test it at: https://nuru.tools/auth"
}

# Handle script arguments
case "${1:-fix}" in
    "fix")
        main
        ;;
    "status")
        ssh_cmd=$(try_ssh_connection) && check_system_status "$ssh_cmd"
        ;;
    *)
        echo "Usage: $0 [fix|status]"
        echo ""
        echo "Commands:"
        echo "  fix    - Fix nginx configuration and restart services"
        echo "  status - Check current system status"
        exit 1
        ;;
esac