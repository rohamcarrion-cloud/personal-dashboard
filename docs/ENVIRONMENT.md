# Environment Reference

> **Project:** Personal Dashboard  
> **Document status:** Active environment reference

---

## Purpose

This document defines how environment variables are managed throughout the project.

It is the source of truth for:

- Required variables
- Optional variables
- Development configuration
- Production configuration
- Secret handling

Actual values must **never** be committed to Git.

---

## Principles

- Store secrets outside the repository.
- Commit only `.env.example` files.
- Use descriptive variable names.
- Document every new variable.
- Remove unused variables.
- Review variables during pull requests.

---

## Environment Files

Typical layout:

```text
apps/
├── api/
│   ├── .env.example
│   └── .env
├── web/
│   ├── .env.example
│   └── .env
└── pocketbase/
```

Only `.env.example` belongs in version control.

---

## Frontend Variables

Frontend variables are visible to the browser.

Never place:

- API secrets
- OAuth secrets
- Administrator passwords
- Private keys

Example:

```env
VITE_API_URL=http://localhost:3000
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

---

## API Variables

Typical server variables may include:

```env
PORT=3000
NODE_ENV=development
POCKETBASE_URL=http://127.0.0.1:8090
OPENAI_API_KEY=replace-with-key
SESSION_SECRET=replace-with-random-value
```

These are examples only.

Document actual variables as they are introduced.

---

## PocketBase

Typical values:

```env
PB_ADMIN_EMAIL=replace@example.com
PB_ADMIN_PASSWORD=replace-password
```

Never commit administrator credentials.

---

## Variable Documentation Template

| Variable | Required | Secret | Workspace | Description |
|----------|----------|--------|-----------|-------------|
| EXAMPLE_VARIABLE | Yes | Yes | apps/api | Short description |

---

## Development

Create local files from templates:

```bash
cp apps/api/.env.example apps/api/.env
```

Review:

```bash
git status
```

before every commit.

---

## Production

Production variables belong in server or deployment configuration.

Never place them in:

- Git
- Screenshots
- Documentation examples
- Public issues

---

## Naming Conventions

Prefer uppercase names.

Good:

```text
OPENAI_API_KEY
SESSION_SECRET
POCKETBASE_URL
```

Avoid:

```text
KEY
SECRET
VALUE
TOKEN2
```

---

## Rotation

Rotate secrets when:

- Accidentally exposed
- Personnel changes occur
- Providers recommend rotation
- Compromise is suspected

---

## Validation Checklist

- [ ] No real secrets committed
- [ ] `.env.example` updated
- [ ] Documentation updated
- [ ] Variable names reviewed
- [ ] Workspace ownership documented

---

## Related Documentation

- README.md
- DEVELOPMENT.md
- DEPLOYMENT.md
- SECURITY.md

---

## Final Principle

Environment configuration should be:

- Documented
- Reproducible
- Secure
- Easy for contributors
- Free of committed secrets
