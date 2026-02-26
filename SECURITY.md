# Security Policy

## Supported Versions

The following versions of VIVIM are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | ✅ Supported       |
| 0.x     | ❌ Unsupported     |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Email**: Send an email to **security@vivim.live**
2. **GitHub Security Advisories**: Use [GitHub's private vulnerability reporting](https://github.com/owenservera/vivim-live/security/advisories/new)

### What to Include

When reporting a vulnerability, please include:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

- **Initial Response**: Within 24 hours, we will acknowledge receipt of your report
- **Status Update**: Within 7 days, we will provide a more detailed response including our assessment and expected timeline for a fix
- **Resolution**: We aim to release a fix within 30 days, depending on complexity

### Disclosure Policy

- We follow a **coordinated disclosure** process
- We request that you give us reasonable time to address the vulnerability before public disclosure
- We will credit reporters in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

When developing with VIVIM, please follow these security best practices:

### Data Privacy

- Always use HTTPS in production
- Implement proper authentication and authorization
- Encrypt sensitive data at rest
- Follow the principle of least privilege

### Dependencies

- Keep dependencies up to date
- Use `bun audit` or `npm audit` regularly
- Review dependency changes before updating
- Enable Dependabot security updates

### API Security

- Never expose API keys in client-side code
- Implement rate limiting
- Validate and sanitize all inputs
- Use secure session management

### Deployment

- Use environment variables for secrets
- Enable HTTPS
- Configure proper CORS policies
- Implement proper logging and monitoring

## Security Updates

Security updates will be released as:

- **Patch releases**: For critical security fixes
- **Security advisories**: Published on GitHub

Subscribe to our security advisories to be notified of security updates:

- Go to [Security Advisories](https://github.com/owenservera/vivim-live/security/advisories)
- Click "Watch" → "All Activity"

## Credits

We would like to thank the following security researchers and contributors who have helped improve VIVIM's security:

- (Your name could be here!)

---

**Thank you for helping keep VIVIM and its users safe!** 🔒
