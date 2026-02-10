#!/bin/bash
# Deploy Universal Authentication System for *.nuru.tools
# Sets up Apple biometric authentication across all subdomains

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
DOMAIN="nuru.tools"
SERVER_IP="185.189.45.80"
SERVER_USER="root"
AUTH_PORT="3001"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Logging
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
        "DEPLOY") echo -e "${PURPLE}[DEPLOY]${NC} $message" ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    log "INFO" "Checking deployment prerequisites..."
    
    # Check SSH connectivity
    if ! ssh -o ConnectTimeout=5 -q "$SERVER_USER@$SERVER_IP" exit; then
        log "ERROR" "Cannot connect to $SERVER_IP"
        exit 1
    fi
    
    # Check required files
    local required_files=(
        "$SCRIPT_DIR/universal_auth_system.html"
        "$SCRIPT_DIR/universal_auth_server.js"
        "$SCRIPT_DIR/universal_auth_nginx.conf"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            log "ERROR" "Required file not found: $file"
            exit 1
        fi
    done
    
    log "SUCCESS" "Prerequisites check passed"
}

# Create deployment package
create_deployment_package() {
    log "INFO" "Creating deployment package..."
    
    local package_dir="/tmp/universal_auth_deploy"
    rm -rf "$package_dir"
    mkdir -p "$package_dir"
    
    # Copy files
    cp "$SCRIPT_DIR/universal_auth_system.html" "$package_dir/"
    cp "$SCRIPT_DIR/universal_auth_server.js" "$package_dir/"
    cp "$SCRIPT_DIR/universal_auth_nginx.conf" "$package_dir/"
    
    # Create package.json for Node.js dependencies
    cat > "$package_dir/package.json" << 'EOF'
{
  "name": "universal-auth-server",
  "version": "1.0.0",
  "description": "Universal authentication for *.nuru.tools",
  "main": "universal_auth_server.js",
  "scripts": {
    "start": "node universal_auth_server.js",
    "dev": "nodemon universal_auth_server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^6.10.0",
    "jsonwebtoken": "^9.0.2",
    "@simplewebauthn/server": "^8.3.4"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF
    
    # Create systemd service file
    cat > "$package_dir/universal-auth.service" << EOF
[Unit]
Description=Universal Auth Server for *.nuru.tools
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/universal-auth
ExecStart=/usr/bin/node universal_auth_server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=$AUTH_PORT
Environment=JWT_SECRET=\$(openssl rand -hex 32)

# Security settings
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/universal-auth/logs
PrivateTmp=true
ProtectKernelTunables=true
ProtectControlGroups=true
RestrictRealtime=true
LockPersonality=true
MemoryDenyWriteExecute=true
RestrictNamespaces=true
SystemCallFilter=@system-service
SystemCallErrorNumber=EPERM

[Install]
WantedBy=multi-user.target
EOF
    
    # Create installation script
    cat > "$package_dir/install.sh" << 'EOF'
#!/bin/bash
set -euo pipefail

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

# Update system
log "Updating system packages..."
apt-get update && apt-get upgrade -y

# Install Node.js 18+ if not present
if ! node --version | grep -q "v1[8-9]\|v[2-9][0-9]"; then
    log "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Create application directory
log "Setting up application directory..."
mkdir -p /opt/universal-auth/logs
chown -R www-data:www-data /opt/universal-auth

# Install dependencies
log "Installing Node.js dependencies..."
cd /opt/universal-auth
npm install --production

# Set up systemd service
log "Installing systemd service..."
cp universal-auth.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable universal-auth

# Configure nginx
log "Configuring nginx..."
cp universal_auth_nginx.conf /etc/nginx/sites-available/universal-auth
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/universal-auth /etc/nginx/sites-enabled/

# Test nginx configuration
nginx -t

# Create SSL certificates directory if not exists
mkdir -p /etc/ssl/certs /etc/ssl/private
chmod 700 /etc/ssl/private

# Generate self-signed certificate if not exists (replace with real cert)
if [[ ! -f /etc/ssl/certs/nuru.tools.crt ]]; then
    log "Generating temporary self-signed certificate..."
    openssl req -x509 -newkey rsa:4096 -keyout /etc/ssl/private/nuru.tools.key \
        -out /etc/ssl/certs/nuru.tools.crt -days 365 -nodes \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=*.nuru.tools"
    chmod 600 /etc/ssl/private/nuru.tools.key
fi

# Create auth assets directory
mkdir -p /var/www/universal-auth
cp universal_auth_system.html /var/www/universal-auth/index.html
chown -R www-data:www-data /var/www/universal-auth

# Set up log directories
mkdir -p /var/log/nginx
mkdir -p /opt/universal-auth/logs
chown -R www-data:www-data /opt/universal-auth/logs

# Start services
log "Starting services..."
systemctl restart universal-auth
systemctl restart nginx

# Show status
systemctl status universal-auth --no-pager
systemctl status nginx --no-pager

log "Universal authentication system deployed successfully!"
log "Auth server running on port $AUTH_PORT"
log "Available on all *.nuru.tools subdomains"

EOF
    
    chmod +x "$package_dir/install.sh"
    
    # Create archive
    tar -czf "/tmp/universal_auth_deploy.tar.gz" -C "/tmp" "universal_auth_deploy"
    
    log "SUCCESS" "Deployment package created: /tmp/universal_auth_deploy.tar.gz"
}

# Deploy to server
deploy_to_server() {
    log "DEPLOY" "Deploying universal authentication system to $SERVER_IP..."
    
    # Upload package
    log "INFO" "Uploading deployment package..."
    scp "/tmp/universal_auth_deploy.tar.gz" "$SERVER_USER@$SERVER_IP:/tmp/"
    
    # Execute deployment
    log "INFO" "Executing remote deployment..."
    ssh "$SERVER_USER@$SERVER_IP" << 'REMOTE_SCRIPT'
        set -euo pipefail
        
        # Extract package
        cd /tmp
        tar -xzf universal_auth_deploy.tar.gz
        cd universal_auth_deploy
        
        # Copy files to application directory
        mkdir -p /opt/universal-auth
        cp * /opt/universal-auth/
        
        # Run installation
        cd /opt/universal-auth
        chmod +x install.sh
        ./install.sh
        
        # Clean up
        rm -rf /tmp/universal_auth_deploy*
        
        echo "Universal authentication deployment completed!"
REMOTE_SCRIPT
    
    log "SUCCESS" "Deployment completed successfully!"
}

# Verify deployment
verify_deployment() {
    log "INFO" "Verifying deployment..."
    
    # Check service status
    local service_status
    service_status=$(ssh "$SERVER_USER@$SERVER_IP" "systemctl is-active universal-auth" || echo "failed")
    
    if [[ "$service_status" == "active" ]]; then
        log "SUCCESS" "Universal auth service is running"
    else
        log "ERROR" "Universal auth service is not running"
        return 1
    fi
    
    # Check nginx status
    local nginx_status
    nginx_status=$(ssh "$SERVER_USER@$SERVER_IP" "systemctl is-active nginx" || echo "failed")
    
    if [[ "$nginx_status" == "active" ]]; then
        log "SUCCESS" "Nginx is running"
    else
        log "ERROR" "Nginx is not running"
        return 1
    fi
    
    # Check port availability
    local port_check
    port_check=$(ssh "$SERVER_USER@$SERVER_IP" "netstat -tlnp | grep :$AUTH_PORT" || echo "")
    
    if [[ -n "$port_check" ]]; then
        log "SUCCESS" "Universal auth server listening on port $AUTH_PORT"
    else
        log "WARN" "Universal auth server may not be listening on port $AUTH_PORT"
    fi
    
    # Test health endpoint
    local health_check
    health_check=$(ssh "$SERVER_USER@$SERVER_IP" "curl -s localhost:$AUTH_PORT/api/universal-auth/health" || echo "{}")
    
    if echo "$health_check" | grep -q "healthy"; then
        log "SUCCESS" "Health check passed"
    else
        log "WARN" "Health check did not return expected response"
    fi
    
    log "INFO" "Verification completed"
}

# Show post-deployment information
show_deployment_info() {
    log "INFO" "Universal Authentication System Deployed!"
    
    cat << EOF

${GREEN}🍎 Universal Authentication System Ready${NC}

${BLUE}Access URLs:${NC}
• Main auth:      https://nuru.tools/auth
• Dashboard auth: https://dashboard.nuru.tools/auth
• Analytics auth: https://analytics.nuru.tools/auth
• Oracle auth:    https://oracle.nuru.tools/auth

${BLUE}API Endpoints:${NC}
• Health:         https://nuru.tools/api/universal-auth/health
• Register:       https://nuru.tools/api/universal-auth/register/challenge
• Authenticate:   https://nuru.tools/api/universal-auth/authenticate/challenge

${BLUE}Features:${NC}
• ✅ Works across ALL *.nuru.tools subdomains
• ✅ Apple Face ID / Touch ID integration
• ✅ Zero-password authentication
• ✅ Enterprise-grade security
• ✅ Automatic SSL/TLS encryption

${BLUE}Next Steps:${NC}
1. Replace self-signed certificate with real SSL certificate
2. Configure subdomain routing for your applications
3. Test authentication on all required subdomains
4. Set up monitoring and logging

${YELLOW}Important Security Notes:${NC}
• Replace the temporary SSL certificate with a valid wildcard certificate
• Review and customize the nginx configuration for your specific needs
• Monitor auth logs for security events
• Regular security updates recommended

EOF
}

# Main execution
main() {
    log "INFO" "Starting Universal Authentication System deployment..."
    log "INFO" "Target: $SERVER_USER@$SERVER_IP"
    log "INFO" "Domain: *.${DOMAIN}"
    
    check_prerequisites
    create_deployment_package
    deploy_to_server
    verify_deployment
    show_deployment_info
    
    log "SUCCESS" "Universal Authentication System deployment completed!"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "verify")
        verify_deployment
        ;;
    "info")
        show_deployment_info
        ;;
    "package")
        check_prerequisites
        create_deployment_package
        log "SUCCESS" "Package created. Use '$0 deploy' to deploy to server."
        ;;
    *)
        echo "Usage: $0 [deploy|verify|info|package]"
        echo ""
        echo "Commands:"
        echo "  deploy  - Full deployment to server (default)"
        echo "  verify  - Verify existing deployment"
        echo "  info    - Show deployment information"
        echo "  package - Create deployment package only"
        exit 1
        ;;
esac