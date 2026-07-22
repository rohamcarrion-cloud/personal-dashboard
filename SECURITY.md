
# Security Policy

> **Project:** Personal Dashboard  
> **Document status:** Active Security Policy

---

# Table of Contents

1. Purpose
2. Security Philosophy
3. Supported Versions
4. Reporting a Vulnerability
5. Responsible Disclosure
6. Scope
7. Authentication
8. Authorization
9. Secrets Management
10. Environment Variables
11. Dependency Management
12. Database Security
13. File Upload Security
14. API Security
15. Frontend Security
16. Logging & Monitoring
17. Backups & Recovery
18. Third-Party Integrations
19. Secure Development Practices
20. Security Review Checklist
21. Planned Improvements
22. Acknowledgements

---

# 1. Purpose

This document describes the security expectations, development practices, and vulnerability reporting process for Personal Dashboard.

Security is treated as an ongoing engineering practice rather than a one-time milestone.

---

# 2. Security Philosophy

Core principles:

- Secure by default
- Least privilege
- Defense in depth
- Explicit trust boundaries
- Honest documentation
- No secrets in Git
- Validate all untrusted input
- Prefer reproducible infrastructure

---

# 3. Supported Versions

During active development, only the latest commit on the `main` branch is considered supported.

Historical versions may not receive security fixes.

---

# 4. Reporting a Vulnerability

Please **do not open a public issue** for suspected security vulnerabilities.

Instead:

1. Prepare a private report.
2. Include:
   - Summary
   - Steps to reproduce
   - Impact
   - Affected components
   - Suggested mitigation (optional)
3. Allow reasonable time for investigation before public disclosure.

If the project later publishes a dedicated security contact, this document should be updated.

---

# 5. Responsible Disclosure

Researchers are encouraged to:

- Act in good faith
- Avoid unnecessary data access
- Avoid service disruption
- Avoid privacy violations
- Coordinate disclosure before publication

---

# 6. Scope

Security considerations include:

- React frontend
- Express API
- PocketBase
- SQLite data
- Authentication
- OAuth integrations
- AI providers
- File uploads
- Deployment configuration

---

# 7. Authentication

PocketBase is the current authentication authority.

Guidelines:

- Never hardcode credentials.
- Protect administrator accounts.
- Require authentication for protected routes.
- Expire sessions appropriately.
- Review collection access rules.

---

# 8. Authorization

Hidden UI is **not** authorization.

Always enforce permissions through backend logic and/or PocketBase rules.

---

# 9. Secrets Management

Never commit:

- API keys
- OAuth secrets
- Passwords
- Tokens
- Private certificates
- Encryption keys

Secrets belong in environment variables or secure deployment configuration.

---

# 10. Environment Variables

Document required variables in `.env.example` files.

Example:

```env
PB_ADMIN_EMAIL=replace@example.com
PB_ADMIN_PASSWORD=replace-password
PB_ENCRYPTION_KEY=replace-with-random-value
```

Use placeholders only.

---

# 11. Dependency Management

Contributors should:

- Keep dependencies reasonably current
- Remove unused packages
- Review changelogs before major upgrades
- Watch for security advisories

---

# 12. Database Security

Treat schema as code.

Commit:

- migrations

Do not commit:

- runtime SQLite databases
- backups
- uploaded runtime files

Review collection rules whenever schema changes.

---

# 13. File Upload Security

Uploads should:

- Validate file type
- Validate size
- Reject malformed files
- Store outside Git
- Prevent executable uploads where inappropriate

---

# 14. API Security

The API should:

- Validate all input
- Return structured errors
- Avoid leaking stack traces
- Use rate limiting
- Apply security headers
- Restrict CORS appropriately

---

# 15. Frontend Security

Frontend code must never expose:

- API secrets
- OAuth client secrets
- Administrator passwords
- Encryption keys

Client-side validation improves UX but does not replace server validation.

---

# 16. Logging & Monitoring

Logs should help diagnose failures without exposing:

- passwords
- tokens
- API keys
- session identifiers
- sensitive personal information

Future production deployments should include centralized logging and alerting.

---

# 17. Backups & Recovery

Production deployments should include:

- Scheduled backups
- Restore testing
- Backup encryption
- Documented recovery procedures

A backup is only trustworthy if it has been restored successfully during testing.

---

# 18. Third-Party Integrations

External providers are untrusted boundaries.

Integration code should account for:

- Expired credentials
- Rate limits
- API changes
- Network failures
- Partial responses

---

# 19. Secure Development Practices

Before every commit:

```bash
git status
git diff
git diff --cached
```

Before every merge:

- Review architecture impact
- Review security impact
- Review documentation
- Review environment changes
- Review migration impact

---

# 20. Security Review Checklist

- [ ] No secrets committed
- [ ] Environment variables documented
- [ ] Authorization reviewed
- [ ] Input validated
- [ ] Errors sanitized
- [ ] Documentation updated
- [ ] Migrations reviewed
- [ ] Dependencies reviewed

---

# 21. Planned Improvements

Future security work includes:

- GitHub secret scanning
- Automated dependency scanning
- CI security checks
- HTTPS deployment
- CSP headers
- Security audit logging
- MFA support where appropriate
- Regular penetration testing
- Disaster recovery exercises

These items are planned unless implemented and documented elsewhere.

---

# 22. Acknowledgements

Responsible security research helps improve the project for everyone.

Thank you to anyone who reports issues professionally and gives maintainers time to investigate and remediate them before public disclosure.
