#!/usr/bin/env node
/**
 * Universal Auth Server for *.nuru.tools
 * Handles Apple biometric authentication across all subdomains
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { randomBytes, createHash } = require('crypto');
const jwt = require('jsonwebtoken');
const { 
    generateRegistrationOptions, 
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse 
} = require('@simplewebauthn/server');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration
const config = {
    domain: 'nuru.tools',
    origin: [
        'https://nuru.tools',
        /^https:\/\/.*\.nuru\.tools$/  // All *.nuru.tools subdomains
    ],
    rpName: 'nuru.tools Universal Access',
    jwtSecret: process.env.JWT_SECRET || randomBytes(32).toString('hex'),
    sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours
};

// In-memory storage (replace with Redis/Database in production)
const storage = {
    challenges: new Map(),
    credentials: new Map(),
    users: new Map()
};

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://*.nuru.tools"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration for *.nuru.tools subdomains
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests from any *.nuru.tools subdomain or main domain
        if (!origin || 
            origin.endsWith('.nuru.tools') || 
            origin === 'https://nuru.tools' ||
            origin === 'http://localhost:3000' ||  // Development
            origin === 'http://127.0.0.1:3000') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/universal-auth/', authLimiter);

// Utility functions
function generateUserId() {
    return randomBytes(32);
}

function generateChallenge() {
    return randomBytes(32);
}

function createJWT(payload) {
    return jwt.sign(payload, config.jwtSecret, { 
        expiresIn: '24h',
        issuer: 'nuru.tools',
        audience: '*.nuru.tools'
    });
}

function verifyJWT(token) {
    try {
        return jwt.verify(token, config.jwtSecret, {
            issuer: 'nuru.tools',
            audience: '*.nuru.tools'
        });
    } catch (error) {
        return null;
    }
}

function getSubdomainInfo(req) {
    const host = req.get('host') || req.body.subdomain || 'nuru.tools';
    const parts = host.split('.');
    
    return {
        subdomain: parts.length > 2 ? parts[0] : 'www',
        fullDomain: host,
        isMainDomain: host === 'nuru.tools' || host === 'www.nuru.tools'
    };
}

// Routes

// Health check
app.get('/api/universal-auth/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        service: 'Universal Auth Server',
        domain: config.domain,
        timestamp: new Date().toISOString()
    });
});

// Registration challenge
app.post('/api/universal-auth/register/challenge', async (req, res) => {
    try {
        const { domain, subdomain } = req.body;
        const subdomainInfo = getSubdomainInfo(req);
        
        // Generate user ID and challenge
        const userId = generateUserId();
        const challenge = generateChallenge();
        
        // Create user record
        const user = {
            id: Array.from(userId),
            name: `user@${subdomainInfo.fullDomain}`,
            displayName: `Universal User (${subdomainInfo.subdomain})`,
            createdAt: new Date().toISOString(),
            subdomain: subdomainInfo.subdomain
        };
        
        // Store challenge temporarily (5 minutes)
        const challengeKey = challenge.toString('hex');
        storage.challenges.set(challengeKey, {
            challenge: Array.from(challenge),
            userId: Array.from(userId),
            user,
            subdomain: subdomainInfo.subdomain,
            expiresAt: Date.now() + 5 * 60 * 1000
        });
        
        // Generate WebAuthn registration options
        const options = await generateRegistrationOptions({
            rpName: config.rpName,
            rpID: config.domain,
            userID: userId,
            userName: user.name,
            userDisplayName: user.displayName,
            attestationType: 'direct',
            authenticatorSelection: {
                authenticatorAttachment: 'platform',
                userVerification: 'required',
                requireResidentKey: true
            },
            supportedAlgorithmIDs: [-7, -257] // ES256, RS256
        });
        
        res.json({
            challenge: Array.from(Buffer.from(options.challenge)),
            user: {
                id: Array.from(userId),
                name: user.name,
                displayName: user.displayName
            },
            options
        });
        
    } catch (error) {
        console.error('Registration challenge error:', error);
        res.status(500).json({ error: 'Failed to generate registration challenge' });
    }
});

// Complete registration
app.post('/api/universal-auth/register/complete', async (req, res) => {
    try {
        const { id, rawId, response, domain, subdomain } = req.body;
        const subdomainInfo = getSubdomainInfo(req);
        
        // Find challenge
        const challengeData = Array.from(storage.challenges.values())
            .find(c => c.subdomain === subdomainInfo.subdomain && c.expiresAt > Date.now());
            
        if (!challengeData) {
            return res.status(400).json({ error: 'Invalid or expired challenge' });
        }
        
        // Verify registration
        const verification = await verifyRegistrationResponse({
            response: {
                id,
                rawId: new Uint8Array(rawId),
                response: {
                    clientDataJSON: new Uint8Array(response.clientDataJSON),
                    attestationObject: new Uint8Array(response.attestationObject)
                }
            },
            expectedChallenge: Buffer.from(challengeData.challenge).toString('base64url'),
            expectedOrigin: `https://${subdomainInfo.fullDomain}`,
            expectedRPID: config.domain,
            requireUserVerification: true
        });
        
        if (!verification.verified) {
            return res.status(400).json({ error: 'Registration verification failed' });
        }
        
        // Store credential
        const credentialId = Buffer.from(rawId).toString('base64url');
        const userId = Buffer.from(challengeData.userId).toString('hex');
        
        storage.credentials.set(credentialId, {
            id: credentialId,
            publicKey: verification.registrationInfo.credentialPublicKey,
            counter: verification.registrationInfo.counter,
            userId,
            createdAt: new Date().toISOString(),
            transports: ['internal'],
            subdomain: subdomainInfo.subdomain,
            universalAccess: true
        });
        
        storage.users.set(userId, {
            ...challengeData.user,
            credentials: [credentialId],
            universalAuth: true,
            registeredSubdomains: [subdomainInfo.subdomain]
        });
        
        // Generate universal access token
        const token = createJWT({
            userId,
            credentialId,
            subdomain: subdomainInfo.subdomain,
            universalAccess: true,
            registeredAt: new Date().toISOString()
        });
        
        // Clean up challenge
        storage.challenges.delete(Buffer.from(challengeData.challenge).toString('hex'));
        
        res.json({
            success: true,
            token,
            universalAccess: true,
            subdomains: [subdomainInfo.subdomain]
        });
        
    } catch (error) {
        console.error('Registration completion error:', error);
        res.status(500).json({ error: 'Registration completion failed' });
    }
});

// Authentication challenge
app.post('/api/universal-auth/authenticate/challenge', async (req, res) => {
    try {
        const { domain, subdomain } = req.body;
        const subdomainInfo = getSubdomainInfo(req);
        
        // Generate challenge
        const challenge = generateChallenge();
        
        // Get all credentials that support universal access
        const allowCredentials = Array.from(storage.credentials.values())
            .filter(cred => cred.universalAccess)
            .map(cred => ({
                id: cred.id,
                transports: cred.transports
            }));
        
        if (allowCredentials.length === 0) {
            return res.status(400).json({ error: 'No universal credentials found' });
        }
        
        // Store challenge
        const challengeKey = challenge.toString('hex');
        storage.challenges.set(challengeKey, {
            challenge: Array.from(challenge),
            subdomain: subdomainInfo.subdomain,
            expiresAt: Date.now() + 5 * 60 * 1000,
            type: 'authentication'
        });
        
        res.json({
            challenge: Array.from(challenge),
            allowCredentials: allowCredentials.map(cred => ({
                id: Array.from(Buffer.from(cred.id, 'base64url')),
                transports: cred.transports
            }))
        });
        
    } catch (error) {
        console.error('Authentication challenge error:', error);
        res.status(500).json({ error: 'Failed to generate authentication challenge' });
    }
});

// Complete authentication
app.post('/api/universal-auth/authenticate/complete', async (req, res) => {
    try {
        const { id, rawId, response, domain, subdomain } = req.body;
        const subdomainInfo = getSubdomainInfo(req);
        
        // Find challenge
        const challengeData = Array.from(storage.challenges.values())
            .find(c => c.type === 'authentication' && c.expiresAt > Date.now());
            
        if (!challengeData) {
            return res.status(400).json({ error: 'Invalid or expired authentication challenge' });
        }
        
        // Find credential
        const credentialId = Buffer.from(rawId).toString('base64url');
        const credential = storage.credentials.get(credentialId);
        
        if (!credential || !credential.universalAccess) {
            return res.status(400).json({ error: 'Invalid credential or no universal access' });
        }
        
        // Verify authentication
        const verification = await verifyAuthenticationResponse({
            response: {
                id,
                rawId: new Uint8Array(rawId),
                response: {
                    authenticatorData: new Uint8Array(response.authenticatorData),
                    clientDataJSON: new Uint8Array(response.clientDataJSON),
                    signature: new Uint8Array(response.signature),
                    userHandle: response.userHandle ? new Uint8Array(response.userHandle) : undefined
                }
            },
            expectedChallenge: Buffer.from(challengeData.challenge).toString('base64url'),
            expectedOrigin: `https://${subdomainInfo.fullDomain}`,
            expectedRPID: config.domain,
            authenticator: {
                credentialID: new Uint8Array(Buffer.from(credentialId, 'base64url')),
                credentialPublicKey: credential.publicKey,
                counter: credential.counter,
                transports: credential.transports
            },
            requireUserVerification: true
        });
        
        if (!verification.verified) {
            return res.status(400).json({ error: 'Authentication verification failed' });
        }
        
        // Update counter
        credential.counter = verification.authenticationInfo.newCounter;
        storage.credentials.set(credentialId, credential);
        
        // Update user's accessed subdomains
        const user = storage.users.get(credential.userId);
        if (user && !user.registeredSubdomains.includes(subdomainInfo.subdomain)) {
            user.registeredSubdomains.push(subdomainInfo.subdomain);
            user.lastAccessed = new Date().toISOString();
            storage.users.set(credential.userId, user);
        }
        
        // Generate universal access token
        const token = createJWT({
            userId: credential.userId,
            credentialId,
            subdomain: subdomainInfo.subdomain,
            universalAccess: true,
            authenticatedAt: new Date().toISOString(),
            accessFrom: subdomainInfo.fullDomain
        });
        
        // Clean up challenge
        storage.challenges.delete(Buffer.from(challengeData.challenge).toString('hex'));
        
        res.json({
            success: true,
            token,
            universalAccess: true,
            subdomain: subdomainInfo.subdomain,
            accessibleSubdomains: user?.registeredSubdomains || []
        });
        
    } catch (error) {
        console.error('Authentication completion error:', error);
        res.status(500).json({ error: 'Authentication completion failed' });
    }
});

// Validate universal token
app.post('/api/universal-auth/validate', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No valid token provided' });
        }
        
        const token = authHeader.slice(7);
        const payload = verifyJWT(token);
        
        if (!payload || !payload.universalAccess) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        
        const { domain, subdomain } = req.body;
        const subdomainInfo = getSubdomainInfo(req);
        
        // Check if user exists and has universal access
        const user = storage.users.get(payload.userId);
        if (!user || !user.universalAuth) {
            return res.status(401).json({ error: 'User not found or no universal access' });
        }
        
        res.json({
            valid: true,
            userId: payload.userId,
            subdomain: subdomainInfo.subdomain,
            universalAccess: true,
            accessibleSubdomains: user.registeredSubdomains,
            expiresAt: payload.exp * 1000
        });
        
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(500).json({ error: 'Token validation failed' });
    }
});

// Get user's universal access info
app.get('/api/universal-auth/user/info', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No valid token provided' });
        }
        
        const token = authHeader.slice(7);
        const payload = verifyJWT(token);
        
        if (!payload || !payload.universalAccess) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        const user = storage.users.get(payload.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            user: {
                id: payload.userId,
                displayName: user.displayName,
                createdAt: user.createdAt,
                universalAccess: user.universalAuth,
                registeredSubdomains: user.registeredSubdomains,
                lastAccessed: user.lastAccessed
            },
            credentials: user.credentials.length,
            currentSubdomain: payload.subdomain
        });
        
    } catch (error) {
        console.error('User info error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// Revoke universal access
app.post('/api/universal-auth/revoke', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No valid token provided' });
        }
        
        const token = authHeader.slice(7);
        const payload = verifyJWT(token);
        
        if (!payload || !payload.universalAccess) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Remove user and associated credentials
        const user = storage.users.get(payload.userId);
        if (user) {
            user.credentials.forEach(credId => {
                storage.credentials.delete(credId);
            });
            storage.users.delete(payload.userId);
        }
        
        res.json({ success: true, message: 'Universal access revoked' });
        
    } catch (error) {
        console.error('Revoke error:', error);
        res.status(500).json({ error: 'Failed to revoke access' });
    }
});

// Middleware to serve the universal auth page
app.get('/universal-auth', (req, res) => {
    res.sendFile(__dirname + '/universal_auth_system.html');
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Universal auth error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🍎 Universal Auth Server running on port ${PORT}`);
    console.log(`🔒 Serving authentication for *.${config.domain}`);
    console.log(`🌍 Origin patterns: ${JSON.stringify(config.origin)}`);
    console.log(`⚡ Server started at ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = app;