# Security Considerations

## Security Checklist for Integration

---

## 1. Authentication & Authorization

### Virtual User System

- [ ] **Fingerprint Hashing**: Ensure device fingerprints are hashed before storage
```typescript
// Use SHA-256 with salt
import { createHash } from 'crypto';

function hashFingerprint(data: string, salt: string): string {
  return createHash('sha256').update(data + salt).digest('hex');
}
```

- [ ] **No PII Storage**: Verify no personally identifiable information stored
- [ ] **Consent Management**: Implement GDPR consent flow
```typescript
interface ConsentRecord {
  userId: string;
  consents: {
    dataCollection: boolean;
    personalization: boolean;
    analytics: boolean;
  };
  timestamp: Date;
}
```

- [ ] **Data Export**: Implement GDPR data export endpoint
- [ ] **Data Deletion**: Implement right to be forgotten

---

## 2. API Security

### Rate Limiting

- [ ] **Enable rate limiting** on all endpoints
- [ ] **Use Redis-backed** store for distributed rate limiting
- [ ] **Set appropriate limits**:
  - AI Chat: 100/minute per user
  - Memory: 200/minute per user
  - General: 1000/minute per IP

### Input Validation

- [ ] **Validate all inputs** with Zod schemas
- [ ] **Sanitize user data** before database operations
- [ ] **Prevent SQL injection** (Prisma handles this, but verify)
- [ ] **Prevent NoSQL injection**:

```typescript
// Bad - NoSQL injection possible
const query = { key: userInput }; // userInput = { $ne: null }

// Good - validate input
const key = z.string().parse(userInput);
const query = { key };
```

### CORS Configuration

- [ ] **Whitelist specific origins** in production
```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,
};
```

- [ ] **Don't use `origin: '*'`** in production
- [ ] **Configure allowed methods and headers**

---

## 3. Data Protection

### Encryption

- [ ] **Encrypt sensitive data at rest**:
```typescript
import { encrypt, decrypt } from '../lib/encryption.js';

const encrypted = encrypt(sensitiveData, process.env.ENCRYPTION_KEY!);
```

- [ ] **Use TLS for data in transit**
- [ ] **Rotate encryption keys** periodically

### Environment Variables

- [ ] **Never commit secrets** to git
- [ ] **Use `.env.local`** for secrets
- [ ] **Add `.env*` to `.gitignore`**
- [ ] **Rotate secrets** regularly

```bash
# .gitignore should include:
.env
.env.local
.env.production
*.log
```

---

## 4. Database Security

### Prisma Security

- [ ] **Use parameterized queries** (Prisma default)
- [ ] **Set appropriate field constraints**:
```prisma
model User {
  email String @unique // Forces uniqueness
  password String @db.VarChar(255) // Length limit
}
```

- [ ] **Enable row-level security** if using multi-tenant
- [ ] **Regular backups** - test restore process

### Connection Security

- [ ] **Use SSL** for database connections
```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?sslmode=require',
    },
  },
});
```

- [ ] **Restrict database user permissions**:
```sql
-- Create read-only user for app
CREATE USER vivim_read WITH PASSWORD 'xxx';
GRANT CONNECT ON DATABASE vivim_db TO vivim_read;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO vivim_read;
```

---

## 5. AI Provider Security

### API Key Management

- [ ] **Never log API keys**
```typescript
// Bad
console.log('API Key:', apiKey);

// Good
console.log('API Key length:', apiKey.length);
```

- [ ] **Use separate keys** for dev/prod
- [ ] **Set budget alerts** on provider dashboards
- [ ] **Implement retry with backoff** to prevent rate limit abuse

### Prompt Injection

- [ ] **Sanitize user input** before AI prompts
- [ ] **Use system prompts** to define boundaries
- [ ] **Implement input length limits**:
```typescript
const MAX_INPUT_LENGTH = 10000;
if (input.length > MAX_INPUT_LENGTH) {
  throw new Error('Input too long');
}
```

---

## 6. Frontend Security

### XSS Prevention

- [ ] **Sanitize user-generated content**
- [ ] **Use React's default XSS protection**
- [ ] **Avoid `dangerouslySetInnerHTML`** unless necessary

### CSRF Protection

- [ ] **Use CSRF tokens** for state-changing operations
- [ ] **Configure SameSite cookies**

###敏感 Data

- [ ] **Don't store tokens in localStorage** (use httpOnly cookies)
- [ ] **Clear sensitive data** from memory after use
- [ ] **Implement session timeout**

---

## 7. WebSocket Security

### Connection Security

- [ ] **Authenticate WebSocket connections**
```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!verifyToken(token)) {
    return next(new Error('Unauthorized'));
  }
  next();
});
```

- [ ] **Validate connection origin**
- [ ] **Implement connection limits**

### Message Security

- [ ] **Validate all messages** from client
- [ ] **Implement rate limiting** per socket
- [ ] **Sanitize message content**

---

## 8. Logging & Monitoring

### Security Logging

- [ ] **Log authentication attempts** (success/failure)
- [ ] **Log data access** (who accessed what)
- [ ] **Log configuration changes**
- [ ] **Don't log sensitive data**:

```typescript
// Bad
logger.info('User login', { password: user.password });

// Good
logger.info('User login attempt', { userId: user.id, success: true });
```

### Monitoring

- [ ] **Set up alerts** for:
  - Failed login attempts (brute force)
  - Unusual API activity
  - Rate limit violations
  - Error spikes

- [ ] **Use Sentry** for error tracking
- [ ] **Monitor API usage** and costs

---

## 9. Dependency Security

### Vulnerability Scanning

- [ ] **Run security audit**:
```bash
npm audit
# or
bun audit
```

- [ ] **Keep dependencies updated**
- [ ] **Use known-good versions**:
```json
// package.json
"dependencies": {
  "express": "^4.18.0"  // Not latest (may have issues)
}
```

### Supply Chain

- [ ] **Verify package integrity**:
```bash
npm ci --audit
```

- [ ] **Use minimal dependencies**
- [ ] **Review new dependencies** before adding

---

## 10. Incident Response

### Prepare for Breaches

- [ ] **Document incident response plan**
- [ ] **Have rollback procedure** ready
- [ ] **Backup before deploying** new code

### Quick Actions

```bash
# 1. Disable the affected system
FEATURE_VIRTUAL_USERS=false

# 2. Check logs
tail -f logs/error.log | grep "suspicious"

# 3. Identify affected users
psql -d vivim_db -c "SELECT * FROM suspicious_activity;"

# 4. Revoke compromised sessions
redis-cli FLUSHDB  # If sessions compromised

# 5. Notify users (if required)
```

---

## Security Checklist Summary

Run this before production:

```bash
# Security Audit
npm audit
npm audit fix

# Check for secrets in git
git secret-check

# Environment variables set
grep -r "process.env" src/ | grep -v ".env"

# Rate limiting enabled
grep -r "rateLimit" src/routes/

# Input validation
grep -r "zod" src/routes/
```

---

## Security Configuration Template

Create `src/config/security.ts`:

```typescript
export const securityConfig = {
  // Rate limiting
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // requests per window
  },

  // CORS
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
    credentials: true,
  },

  // Session
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
  },

  // API
  api: {
    maxRequestSize: '10mb',
    timeout: 30000,
  },

  // Logging
  logging: {
    logSensitiveData: false,
    logLevel: process.env.LOG_LEVEL || 'info',
  },
};
```
