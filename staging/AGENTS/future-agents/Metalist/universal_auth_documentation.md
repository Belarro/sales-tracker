# Universal Authentication System for *.nuru.tools
## Complete Apple Biometric Authentication Across All Subdomains

### 🎯 **System Overview**

The Universal Authentication System extends the existing Apple biometric authentication from `nuru.tools` to work seamlessly across **ALL** `*.nuru.tools` subdomains including:

- `dashboard.nuru.tools`
- `analytics.nuru.tools` 
- `oracle.nuru.tools`
- `api.nuru.tools`
- Any future subdomains

### ✨ **Key Features**

#### **Universal Single Sign-On**
- ✅ **One-time setup**: Register Face ID/Touch ID once, access all subdomains
- ✅ **Seamless experience**: No re-authentication needed across subdomains
- ✅ **Apple ecosystem**: Optimized for iPhone, iPad, MacBook biometric sensors

#### **Enterprise Security**
- ✅ **WebAuthn standard**: Industry-standard biometric authentication
- ✅ **Zero server storage**: Biometric data never leaves your device
- ✅ **Encrypted tokens**: JWT with rotating secrets
- ✅ **Domain isolation**: Secure cross-subdomain token sharing

#### **Developer Friendly**
- ✅ **Easy integration**: Simple API for any subdomain application
- ✅ **Flexible routing**: Nginx-based subdomain management
- ✅ **Real-time validation**: Fast auth checks for protected routes

---

## 🏗️ **Architecture Components**

### **1. Frontend Authentication** (`universal_auth_system.html`)
```html
<!-- Enhanced from existing nuru.tools design -->
<div class="subdomain-badge">Dashboard</div>
<h1>*.nuru.tools</h1>
<div class="subtitle">Universal biometric access for all subdomains</div>
```

**Key Enhancements**:
- **Subdomain detection**: Automatically detects current subdomain
- **Universal credential**: Creates credential for root domain `nuru.tools`
- **Cross-domain tokens**: Stores auth tokens in universal cookies
- **Smart redirects**: Returns to original subdomain after auth

### **2. Backend API Server** (`universal_auth_server.js`)
```javascript
// Supports all *.nuru.tools subdomains
const config = {
    domain: 'nuru.tools',
    origin: [
        'https://nuru.tools',
        /^https:\/\/.*\.nuru\.tools$/  // All subdomains
    ]
};
```

**Core Features**:
- **WebAuthn integration**: Full biometric authentication flow
- **Universal credentials**: Root domain credential creation
- **JWT management**: Secure token generation and validation
- **Subdomain awareness**: Tracks which subdomains user has accessed

### **3. Nginx Configuration** (`universal_auth_nginx.conf`)
```nginx
# Universal auth endpoints available on ALL subdomains
location /api/universal-auth/ {
    proxy_pass http://universal_auth_backend;
    add_header Access-Control-Allow-Origin "https://$host" always;
}

# Subdomain-specific routing with auth checks
if ($subdomain = "dashboard") {
    proxy_pass http://127.0.0.1:3002;
}
```

**Advanced Features**:
- **Wildcard SSL**: Single certificate for `*.nuru.tools`
- **Auth middleware**: Automatic authentication checking
- **Smart routing**: Different apps for different subdomains
- **Security headers**: Enhanced CSP and CORS policies

---

## 🚀 **Deployment Process**

### **Automated Deployment**
```bash
# Deploy complete universal auth system
./deploy_universal_auth.sh deploy

# Verify deployment
./deploy_universal_auth.sh verify

# Show system info
./deploy_universal_auth.sh info
```

### **Manual Steps (if needed)**
1. **SSL Certificate**: Replace self-signed cert with wildcard certificate
2. **Application Routing**: Configure subdomain-specific application ports
3. **DNS Configuration**: Ensure wildcard DNS points to server
4. **Monitoring Setup**: Configure logging and alerting

---

## 🔧 **Integration Guide**

### **For New Subdomain Applications**

#### **1. Add Nginx Route**
```nginx
# Add to universal_auth_nginx.conf
if ($subdomain = "newapp") {
    proxy_pass http://127.0.0.1:3006;  # Your app port
}
```

#### **2. Protect Your Routes**
```nginx
# Require auth for entire subdomain
location / {
    auth_request /auth-check;
    error_page 401 = @auth_redirect;
    proxy_pass http://your_app_backend;
}
```

#### **3. Handle Auth in Your App**
```javascript
// Check auth status from nginx headers
app.use((req, res, next) => {
    const authUser = req.headers['x-auth-user'];
    const authToken = req.headers['x-auth-token'];
    
    if (authUser && authToken) {
        req.user = { authenticated: true, token: authToken };
    }
    next();
});
```

### **API Integration Examples**

#### **JavaScript/Frontend**
```javascript
// Check if user is authenticated
async function checkAuth() {
    const token = localStorage.getItem('nuru_universal_token') || 
                  getCookie('nuru_universal_auth');
    
    const response = await fetch('/api/universal-auth/validate', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    return response.ok;
}

// Redirect to auth if needed
if (!await checkAuth()) {
    window.location.href = '/auth?returnTo=' + encodeURIComponent(window.location.href);
}
```

#### **Node.js/Backend**
```javascript
// Middleware to verify universal auth token
const verifyUniversalAuth = async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'No auth token' });
    }
    
    try {
        const response = await fetch('http://localhost:3001/api/universal-auth/validate', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                subdomain: req.headers['x-subdomain'] || 'www'
            })
        });
        
        if (response.ok) {
            req.auth = await response.json();
            next();
        } else {
            res.status(401).json({ error: 'Invalid auth token' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Auth validation failed' });
    }
};

// Use in routes
app.get('/protected-endpoint', verifyUniversalAuth, (req, res) => {
    res.json({ message: 'Access granted', user: req.auth });
});
```

---

## 🔒 **Security Implementation**

### **Token Management**
```javascript
// Universal token storage strategy
localStorage.setItem('nuru_universal_token', token);  // Local storage
document.cookie = `nuru_universal_auth=${token}; domain=.nuru.tools; Secure; SameSite=Strict`;  // Universal cookie
```

### **CORS Configuration**
```javascript
// Allow all *.nuru.tools subdomains
origin: (origin, callback) => {
    if (!origin || 
        origin.endsWith('.nuru.tools') || 
        origin === 'https://nuru.tools') {
        callback(null, true);
    } else {
        callback(new Error('Not allowed by CORS'));
    }
}
```

### **Nginx Security Headers**
```nginx
# Comprehensive security headers
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; connect-src 'self' https://*.nuru.tools" always;
add_header X-Frame-Options "SAMEORIGIN" always;
```

---

## 📊 **Monitoring & Logging**

### **Application Logs**
```bash
# Universal auth server logs
tail -f /opt/universal-auth/logs/auth.log

# Nginx access logs with subdomain info
tail -f /var/log/nginx/universal_auth_access.log
```

### **Health Monitoring**
```bash
# Check service status
curl https://nuru.tools/api/universal-auth/health

# Monitor auth success rates
grep "authentication successful" /opt/universal-auth/logs/auth.log | tail -10
```

### **Key Metrics to Track**
- **Registration rate**: New biometric registrations per day
- **Authentication success**: Successful logins across subdomains  
- **Cross-subdomain usage**: Users accessing multiple subdomains
- **Token refresh rate**: Token renewals and expirations
- **Error rates**: Failed authentications and system errors

---

## 🚨 **Troubleshooting Guide**

### **Common Issues**

#### **"Biometric authentication not available"**
```javascript
// Check WebAuthn support
if (!window.PublicKeyCredential) {
    console.log('WebAuthn not supported');
}

// Check platform authenticator
const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
console.log('Biometric available:', available);
```

#### **CORS errors between subdomains**
```nginx
# Ensure nginx CORS headers are correct
add_header Access-Control-Allow-Origin "https://$host" always;
add_header Access-Control-Allow-Credentials "true" always;
```

#### **Token not working across subdomains**
```javascript
// Verify cookie domain setting
document.cookie = `nuru_universal_auth=${token}; domain=.nuru.tools; path=/; Secure; SameSite=Strict`;
```

#### **Auth service not responding**
```bash
# Check service status
systemctl status universal-auth

# Check port binding
netstat -tlnp | grep :3001

# Check logs
journalctl -u universal-auth -f
```

### **Debug Commands**

```bash
# Test auth endpoints
curl -X POST https://nuru.tools/api/universal-auth/register/challenge \
  -H "Content-Type: application/json" \
  -d '{"subdomain":"test"}'

# Check nginx configuration
nginx -t

# Reload nginx safely  
systemctl reload nginx

# Monitor real-time logs
multitail /var/log/nginx/universal_auth_access.log /opt/universal-auth/logs/auth.log
```

---

## 🎯 **User Experience Flow**

### **First-Time Registration**
1. User visits any `*.nuru.tools` subdomain
2. Redirected to universal auth page
3. Sets up Face ID/Touch ID once
4. Credential stored for entire `*.nuru.tools` domain
5. Redirected back to original subdomain
6. Universal access granted

### **Subsequent Access**
1. User visits any `*.nuru.tools` subdomain
2. System checks for universal token
3. If valid, immediate access granted
4. If expired/invalid, biometric re-authentication
5. Seamless access across all subdomains

### **Cross-Subdomain Navigation**
1. User authenticated on `dashboard.nuru.tools`
2. Navigates to `analytics.nuru.tools`
3. No re-authentication required
4. Immediate access with same session
5. Universal token validates across domains

---

## 📈 **Performance Optimization**

### **Token Caching Strategy**
- **LocalStorage**: Immediate access for same-tab navigation
- **Universal Cookie**: Cross-subdomain session persistence
- **Memory Cache**: Server-side token validation caching

### **Request Optimization**
- **Connection Pooling**: Persistent connections to auth service
- **Response Compression**: Gzip enabled for all responses
- **CDN Integration**: Static assets served from edge locations

### **Database Considerations**
```javascript
// Replace in-memory storage with Redis for production
const redis = require('redis');
const client = redis.createClient();

// Store credentials with TTL
await client.setex(`credential:${credentialId}`, 3600, JSON.stringify(credential));
```

---

## 🔄 **Maintenance Tasks**

### **Daily**
- Monitor authentication success rates
- Check error logs for unusual patterns
- Verify all subdomains are accessible

### **Weekly**
- Review security logs for suspicious activity
- Update SSL certificates if needed
- Performance metrics analysis

### **Monthly**
- Security updates for Node.js dependencies
- Review and rotate JWT secrets
- Capacity planning based on usage metrics

---

## 🎉 **Success Metrics**

### **Technical KPIs**
- **Authentication Speed**: <2 seconds average
- **Cross-Subdomain Access**: 100% success rate  
- **Uptime**: 99.9% availability target
- **Security**: Zero successful attacks

### **User Experience KPIs**
- **Registration Completion**: >90% success rate
- **Re-authentication Frequency**: <1 per week per user
- **Cross-Subdomain Usage**: Users accessing 2+ subdomains
- **Support Tickets**: <1% authentication-related issues

---

**The Universal Authentication System transforms your `*.nuru.tools` ecosystem into a seamless, secure, and user-friendly experience powered by Apple's cutting-edge biometric technology.**