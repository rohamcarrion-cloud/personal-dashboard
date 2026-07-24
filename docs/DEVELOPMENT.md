# Development Guide

> **Project:** Personal Dashboard  
> **Document status:** Active development guide  
> **Audience:** Contributors and maintainers

---

## Table of Contents

- [1. Purpose](#1-purpose)
- [2. Repository Overview](#2-repository-overview)
- [3. Prerequisites](#3-prerequisites)
- [4. Recommended Tools](#4-recommended-tools)
- [5. Clone the Repository](#5-clone-the-repository)
- [6. Node.js Version](#6-nodejs-version)
- [7. Install Dependencies](#7-install-dependencies)
- [8. Environment Configuration](#8-environment-configuration)
- [9. PocketBase Setup](#9-pocketbase-setup)
- [10. Start the Development Environment](#10-start-the-development-environment)
- [11. Workspace Responsibilities](#11-workspace-responsibilities)
- [12. Development Commands](#12-development-commands)
- [13. Frontend Development](#13-frontend-development)
- [14. API Development](#14-api-development)
- [15. PocketBase Development](#15-pocketbase-development)
- [16. Database Migrations](#16-database-migrations)
- [17. Authentication Development](#17-authentication-development)
- [18. Debugging](#18-debugging)
- [19. Validation Before Commit](#19-validation-before-commit)
- [20. Git Workflow](#20-git-workflow)
- [21. Common Problems](#21-common-problems)
- [22. Clean-Clone Verification](#22-clean-clone-verification)
- [23. Development Safety Rules](#23-development-safety-rules)
- [24. Related Documentation](#24-related-documentation)

---

## 1. Purpose

This guide explains how to develop Personal Dashboard locally.

It covers:

- Required software
- Repository setup
- Dependency installation
- Environment configuration
- Starting the application
- Workspace responsibilities
- Local debugging
- Migration practices
- Validation before commit
- Common setup problems

The goal is to make local development reproducible and understandable.

---

## 2. Repository Overview

Personal Dashboard uses an npm workspace monorepo.

```text
personal-dashboard/
├── apps/
│   ├── web/
│   ├── api/
│   └── pocketbase/
├── docs/
├── package.json
├── README.md
└── ARCHITECTURE.md
```

### Main Workspaces

| Workspace | Responsibility |
| --- | --- |
| `apps/web` | React and Vite frontend |
| `apps/api` | Node.js and Express API |
| `apps/pocketbase` | PocketBase runtime, migrations, hooks, and local data |
| `docs` | Development, environment, deployment, and operational documentation |

Review [ARCHITECTURE.md](../ARCHITECTURE.md) before making structural changes.

---

## 3. Prerequisites

Install the following before beginning:

- Git
- Node.js
- npm
- A code editor
- A modern browser

The current development environment is primarily tested on macOS.

Linux should also be suitable with equivalent commands.

Windows contributors may use:

- Native PowerShell
- Git Bash
- Windows Subsystem for Linux

Command differences should be documented when they affect the workflow.

---

## 4. Recommended Tools

Recommended development tools include:

- Visual Studio Code
- GitHub CLI
- Docker Desktop
- Browser developer tools
- `nvm` for Node.js version management
- PocketBase Admin UI
- VS Code Markdown Preview

### Useful VS Code Features

- Integrated terminal
- Source Control panel
- Search across files
- Markdown preview
- JSON formatting
- JavaScript and TypeScript diagnostics
- ESLint integration when configured

Open the repository in VS Code:

```bash
code .
```

---

## 5. Clone the Repository

Using SSH:

```bash
git clone git@github.com:rohamcarrion-cloud/personal-dashboard.git
cd personal-dashboard
```

Using HTTPS:

```bash
git clone https://github.com/rohamcarrion-cloud/personal-dashboard.git
cd personal-dashboard
```

Confirm the remote:

```bash
git remote -v
```

Expected remote repository:

```text
rohamcarrion-cloud/personal-dashboard
```

---

## 6. Node.js Version

Check whether the repository includes a Node.js version file:

```bash
ls -la
cat .nvmrc
```

If `nvm` is installed:

```bash
nvm install
nvm use
```

Confirm versions:

```bash
node --version
npm --version
```

Use the repository-defined Node.js version whenever available.

Avoid changing the Node.js version casually because it may affect:

- Dependency installation
- Build behavior
- Native packages
- Lockfile resolution
- CI compatibility

---

## 7. Install Dependencies

From the repository root:

```bash
npm install
```

Because the project uses npm workspaces, root installation should install dependencies for all configured workspaces.

After installation, review:

```bash
git status
```

A normal install should not create unexpected tracked changes.

Do not commit `node_modules`.

### Dependency Installation Rules

Add a dependency to the workspace that uses it.

Example pattern:

```bash
npm install package-name --workspace apps/web
```

Development dependency example:

```bash
npm install package-name --save-dev --workspace apps/api
```

Before adding a package, confirm:

- Existing dependencies do not already solve the need
- The package is actively maintained
- Its license is acceptable
- It does not introduce unnecessary complexity
- Its security history is reasonable

---

## 8. Environment Configuration

Search for environment templates:

```bash
find . -name ".env.example" -print
```

Create local environment files only where required.

Example:

```bash
cp apps/api/.env.example apps/api/.env
```

Environment variable details belong in:

[ENVIRONMENT.md](ENVIRONMENT.md)

### Rules

Do not commit:

- `.env`
- `.env.local`
- Production secrets
- OAuth secrets
- API keys
- Administrator passwords

Before committing, always verify:

```bash
git status
git diff
git diff --cached
```

---

## 9. PocketBase Setup

PocketBase provides:

- Authentication
- Collections
- Record persistence
- File storage
- Admin interface
- Migrations
- Hooks

The repository may manage the PocketBase binary through scripts, a version file, or a local setup process.

Inspect the workspace:

```bash
ls -la apps/pocketbase
```

Review available scripts:

```bash
cat apps/pocketbase/package.json
```

### Runtime Data

PocketBase runtime data must not be committed.

Typical runtime paths may include:

```text
pb_data/
pb_public/
```

Repository-specific exclusions should be verified in `.gitignore`.

### Admin Access

Use local development credentials only.

Never place PocketBase administrator credentials in:

- Source code
- Documentation
- Screenshots
- Git history
- Public issues

---

## 10. Start the Development Environment

Start from the repository root:

```bash
npm run dev
```

This command should be the preferred development entry point when configured.

Review root scripts:

```bash
cat package.json
```

If services must be started individually, inspect each workspace:

```bash
cat apps/web/package.json
cat apps/api/package.json
cat apps/pocketbase/package.json
```

### Expected Services

The local environment may include:

- Vite development server
- Express API
- PocketBase server

The exact ports and variables should be documented in [ENVIRONMENT.md](ENVIRONMENT.md).

### Startup Verification

After starting the environment, verify:

- The frontend loads
- The API responds
- PocketBase starts
- Authentication works where implemented
- Browser console has no unexpected errors
- Terminal output has no repeated failures

---

## 11. Workspace Responsibilities

### `apps/web`

Use for:

- React components
- Routes
- Forms
- UI state
- Client-side validation
- Dashboard experiences
- Browser API calls

Do not place privileged secrets in frontend code.

### `apps/api`

Use for:

- Express routes
- Middleware
- Server-side validation
- Privileged workflows
- Provider integrations
- Secret-dependent requests
- Error normalization

Avoid placing complex business logic directly inside route handlers.

### `apps/pocketbase`

Use for:

- Collections
- Schema migrations
- Access rules
- Authentication configuration
- Persistence
- Small data-local hooks

Avoid turning PocketBase hooks into a second undocumented application server.

---

## 12. Development Commands

Available scripts are defined in the repository’s `package.json` files.

Inspect them before assuming command behavior:

```bash
npm run
```

Common commands may include:

```bash
npm run dev
npm run build
npm run lint
npm run test
```

Run workspace-specific scripts when needed:

```bash
npm run dev --workspace apps/web
npm run dev --workspace apps/api
```

Only use commands that are currently defined.

If documentation and scripts disagree, treat the current code as the source of truth and update the documentation.

---

## 13. Frontend Development

The frontend uses React and Vite.

### Frontend Workflow

1. Start the development environment.
2. Open the local Vite URL.
3. Navigate to the affected route.
4. Make the smallest focused change.
5. Check responsive behavior.
6. Check browser console errors.
7. Test loading, empty, success, and failure states.
8. Run linting and build validation.

### Frontend Expectations

New or changed interfaces should consider:

- Accessibility
- Keyboard navigation
- Form labels
- Loading states
- Empty states
- Error messages
- Destructive action confirmation
- Duplicate submission prevention
- Mobile and desktop layouts

### Browser Debugging

Use browser developer tools to inspect:

- Console errors
- Network requests
- Request payloads
- Response status
- CORS behavior
- Layout issues
- Storage state

Do not share screenshots that reveal tokens or private information.

---

## 14. API Development

The API uses Node.js and Express.

### API Workflow

1. Identify the correct route or service.
2. Validate inputs.
3. Keep route handlers small.
4. Move workflow logic into services.
5. Handle expected failures.
6. Return consistent responses.
7. Avoid exposing stack traces.
8. Test success and failure paths.

### Server-Side Responsibilities

The API should own workflows that require:

- Secrets
- Privileged access
- Multiple providers
- Protected business logic
- Server-side authorization
- Provider normalization

### Logging

Logs should contain enough context to diagnose problems without exposing:

- Passwords
- Tokens
- API keys
- Session data
- Sensitive personal information

---

## 15. PocketBase Development

PocketBase development should be deliberate because schema and access rules affect persistent data.

### Before Changing a Collection

Review:

- Collection purpose
- Existing fields
- Required fields
- Defaults
- Relations
- Access rules
- Existing records
- Migration impact

### Access Rules

Review all applicable rules:

- List
- View
- Create
- Update
- Delete

Hidden frontend routes do not replace access rules.

### Local Admin UI

Use the PocketBase Admin UI for inspection and local testing.

Do not rely on undocumented manual Admin UI changes as the final schema source.

Persist intended schema changes through migrations.

---

## 16. Database Migrations

Schema changes must be reproducible.

### Migration Principles

A migration should:

- Have one clear purpose
- Preserve existing data when possible
- Include safe defaults
- Be reviewed for access changes
- Be tested locally
- Avoid unrelated schema changes

### Migration Validation

Test when practical:

1. Against a clean database
2. Against the current local schema
3. With representative existing records
4. With rollback or recovery planning for destructive changes

Do not commit the local SQLite runtime database as a substitute for migrations.

---

## 17. Authentication Development

Authentication changes are security-sensitive.

When changing authentication behavior, review:

- Login
- Logout
- Session persistence
- Token expiration
- Protected routes
- Password handling
- Administrator access
- Record ownership
- Authorization rules

Client-side route guards improve experience but do not provide sufficient authorization by themselves.

Backend or database rules must enforce protected behavior.

---

## 18. Debugging

Start with the smallest observable failure.

### Recommended Debugging Order

1. Reproduce the problem.
2. Record the exact behavior.
3. Check browser console.
4. Check browser network requests.
5. Check API logs.
6. Check PocketBase logs.
7. Review recent code changes.
8. Verify environment variables.
9. Isolate the failing workspace.
10. Fix the root cause.
11. Test the original reproduction steps.

### Useful Git Commands

Review current changes:

```bash
git status
git diff
```

Review recent commits:

```bash
git log --oneline --decorate -10
```

Inspect a file from the previous commit:

```bash
git show HEAD~1:path/to/file
```

Do not delete or reset work until you understand what will be lost.

### Avoid Debugging by Guessing

Do not repeatedly change unrelated code.

Prefer:

- One hypothesis
- One targeted change
- One verification step

---

## 19. Validation Before Commit

Run the checks relevant to the change.

At minimum, when available:

```bash
npm run lint
npm run build
```

Run tests when configured:

```bash
npm run test
```

Manually test the affected workflow.

### Documentation Validation

For Markdown:

- Preview in VS Code
- Check headings
- Check code blocks
- Check relative links
- Check Mermaid diagrams
- Review rendering on GitHub after push

### Final Diff Review

```bash
git status
git diff
git add path/to/intended-file
git diff --cached
```

Do not commit unrelated files.

---

## 20. Git Workflow

Synchronize:

```bash
git checkout main
git pull origin main
```

Create a branch when appropriate:

```bash
git checkout -b feat/short-description
```

Make and validate the change.

Stage intentionally:

```bash
git add path/to/file
```

Review:

```bash
git diff --cached
```

Commit:

```bash
git commit -m "type: concise description"
```

Push:

```bash
git push -u origin branch-name
```

For early solo development, direct commits to `main` may occur, but focused branch-based changes are preferred as the project grows.

---

## 21. Common Problems

### 21.1 `npm install` Fails

Check:

```bash
node --version
npm --version
```

Then confirm the repository’s expected Node.js version.

Remove dependencies only when appropriate:

```bash
rm -rf node_modules
npm install
```

Do not delete the lockfile unless there is a clear reason.

---

### 21.2 Port Already in Use

Identify the process using the port:

```bash
lsof -i :PORT_NUMBER
```

Stop the correct process or configure a different local port.

Do not kill unrelated system processes.

---

### 21.3 Frontend Cannot Reach API

Check:

- API is running
- Frontend API base URL
- Port configuration
- CORS configuration
- Browser network errors
- Environment file location
- Variable naming conventions

Remember that Vite-exposed browser variables generally require the expected prefix defined by the project.

---

### 21.4 PocketBase Does Not Start

Check:

- Binary exists
- Binary permissions
- Correct command
- Port conflicts
- Migration errors
- Runtime directory permissions
- Architecture compatibility

On macOS or Linux, a downloaded binary may require executable permission:

```bash
chmod +x path/to/pocketbase
```

Use the repository’s actual PocketBase path.

---

### 21.5 Authentication Fails

Check:

- PocketBase is running
- User exists
- Collection rules
- Credentials
- Frontend PocketBase URL
- Session state
- Browser storage
- Token expiration

Do not print complete tokens into shared logs.

---

### 21.6 Changes Do Not Appear

Check:

- Correct repository folder
- Correct branch
- Correct workspace
- Development server status
- Browser cache
- Vite hot reload output
- Unsaved files

Confirm:

```bash
pwd
git branch --show-current
git status
```

---

### 21.7 Git Push Is Rejected

Synchronize before pushing:

```bash
git pull --rebase origin main
```

Resolve conflicts carefully.

Do not force-push `main` unless there is a deliberate and fully understood reason.

---

### 21.8 Build Works Locally but Not Elsewhere

Check:

- Node.js version
- Environment variables
- Case-sensitive file names
- Untracked required files
- Platform-specific paths
- Missing dependency declarations
- Build-time versus runtime configuration

---

## 22. Clean-Clone Verification

A clean-clone test confirms the repository contains everything required to reproduce development.

Use a separate directory:

```bash
cd ..
git clone git@github.com:rohamcarrion-cloud/personal-dashboard.git personal-dashboard-clean
cd personal-dashboard-clean
npm install
```

Create required local environment files using documented templates.

Then run:

```bash
npm run dev
```

A clean-clone test should not depend on:

- Untracked source files
- Undocumented secrets
- A copied runtime database
- Global packages not listed as prerequisites
- Manual schema changes not represented by migrations

---

## 23. Development Safety Rules

Never:

- Commit secrets
- Commit runtime databases
- Commit production data
- Disable authorization to make testing easier
- Run destructive migrations without backups
- Publish from development unintentionally
- Expose administrator interfaces publicly
- Log private credentials
- Claim unverified functionality works

Prefer:

- Local test data
- Focused branches
- Small commits
- Reviewed diffs
- Documented variables
- Reproducible migrations
- Safe failure behavior

---

## 24. Related Documentation

- [README.md](../README.md)
- [ARCHITECTURE.md](../ARCHITECTURE.md)
- [CONTRIBUTING.md](../CONTRIBUTING.md)
- [ENGINEERING_PRINCIPLES.md](../ENGINEERING_PRINCIPLES.md)
- [SECURITY.md](../SECURITY.md)
- [ROADMAP.md](../ROADMAP.md)
- [ENVIRONMENT.md](ENVIRONMENT.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Final Development Standard

A development environment is successful when a contributor can:

- Clone the repository
- Understand the workspaces
- Configure required variables
- Start the services
- Make a focused change
- Validate the change
- Review the diff
- Commit without exposing secrets
- Reproduce the result later

> Understand the system before changing it.  
> Change one thing at a time.  
> Validate the result.  
> Document what future contributors need to know.
