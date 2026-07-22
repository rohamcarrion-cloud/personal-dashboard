# Contributing to Personal Dashboard

Thank you for your interest in contributing to Personal Dashboard.

This project is being developed as a self-hosted personal operating system for creators, founders, and professionals. Contributions should improve the project while preserving its architectural clarity, security boundaries, documentation quality, and long-term maintainability.

This document explains how to propose changes, prepare a local development environment, work within the repository, and submit contributions responsibly.

---

## Table of Contents

- [1. Project Status](#1-project-status)
- [2. Before You Contribute](#2-before-you-contribute)
- [3. Ways to Contribute](#3-ways-to-contribute)
- [4. Repository Structure](#4-repository-structure)
- [5. Development Environment](#5-development-environment)
- [6. Local Setup](#6-local-setup)
- [7. Development Workflow](#7-development-workflow)
- [8. Branching Strategy](#8-branching-strategy)
- [9. Commit Guidelines](#9-commit-guidelines)
- [10. Pull Request Guidelines](#10-pull-request-guidelines)
- [11. Code Quality Standards](#11-code-quality-standards)
- [12. Frontend Contribution Guidelines](#12-frontend-contribution-guidelines)
- [13. API Contribution Guidelines](#13-api-contribution-guidelines)
- [14. PocketBase Contribution Guidelines](#14-pocketbase-contribution-guidelines)
- [15. Documentation Guidelines](#15-documentation-guidelines)
- [16. Security Guidelines](#16-security-guidelines)
- [17. Environment Variables and Secrets](#17-environment-variables-and-secrets)
- [18. Database and Migration Guidelines](#18-database-and-migration-guidelines)
- [19. External Integration Guidelines](#19-external-integration-guidelines)
- [20. Testing Expectations](#20-testing-expectations)
- [21. Reporting Bugs](#21-reporting-bugs)
- [22. Requesting Features](#22-requesting-features)
- [23. Review Process](#23-review-process)
- [24. Contribution Checklist](#24-contribution-checklist)
- [25. Code of Conduct](#25-code-of-conduct)
- [26. License and Ownership](#26-license-and-ownership)

---

## 1. Project Status

Personal Dashboard is under active development.

The repository currently contains:

- A React and Vite frontend
- A Node.js and Express API
- A PocketBase backend
- npm workspace coordination
- Local development workflows
- Architecture and project documentation

Some areas may be implemented, partially implemented, experimental, or planned.

Contributors must not describe a feature as production-ready unless it has been implemented, tested, and documented accordingly.

When contributing, clearly distinguish between:

- Current behavior
- Experimental behavior
- Planned behavior
- Proposed behavior

---

## 2. Before You Contribute

Before starting work, review the following files:

- [README.md](README.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [ROADMAP.md](ROADMAP.md)
- [ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md)
- [SECURITY.md](SECURITY.md)

Some of these documents may still be under development. Where documentation is incomplete, use the current codebase as the source of truth and note any ambiguity in your contribution.

Before making a significant change, understand:

- Which workspace owns the behavior
- Whether the change affects architecture
- Whether the change affects environment variables
- Whether the change affects PocketBase collections or migrations
- Whether the change introduces an external dependency
- Whether the change introduces a security boundary
- Whether documentation must also be updated

---

## 3. Ways to Contribute

Contributions may include:

- Bug fixes
- Accessibility improvements
- Documentation improvements
- Developer experience improvements
- Frontend components
- API routes and services
- PocketBase migrations
- Security hardening
- Testing
- Performance improvements
- Refactoring
- Integration improvements
- Reproducible deployment improvements

For large features or architectural changes, open an issue or discussion before implementing the full solution.

This helps prevent:

- Duplicate work
- Conflicting architectural assumptions
- Unreviewed scope expansion
- Changes that do not align with the roadmap

---

## 4. Repository Structure

The repository is organized as a monorepo.

```text
personal-dashboard/
├── apps/
│   ├── web/
│   ├── api/
│   └── pocketbase/
├── docs/
├── README.md
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── SECURITY.md
├── ROADMAP.md
├── ENGINEERING_PRINCIPLES.md
└── package.json
```

### Workspace Responsibilities

| Workspace | Responsibility |
| --- | --- |
| `apps/web` | React interface, routes, forms, dashboard experiences, client-side behavior |
| `apps/api` | Express routes, middleware, services, integrations, protected workflows |
| `apps/pocketbase` | Authentication, collections, migrations, hooks, persistence, local file storage |
| `docs` | Development, environment, deployment, and supporting technical documentation |

Contributors should keep changes inside the correct responsibility boundary.

---

## 5. Development Environment

The repository currently expects:

- Node.js 22
- npm
- Git
- Visual Studio Code or another code editor
- PocketBase as defined by the repository version file

Recommended tools:

- GitHub CLI
- Docker Desktop for future containerized workflows
- VS Code Markdown Preview
- Browser developer tools

Confirm the expected Node.js version using:

```bash
cat .nvmrc
```

If you use `nvm`:

```bash
nvm use
```

---

## 6. Local Setup

Clone the repository:

```bash
git clone git@github.com:rohamcarrion-cloud/personal-dashboard.git
cd personal-dashboard
```

Install dependencies:

```bash
npm install
```

Review environment templates:

```bash
find apps -name ".env.example" -print
```

Create local environment files as needed:

```bash
cp apps/api/.env.example apps/api/.env
```

Do not commit local `.env` files.

Start the development environment:

```bash
npm run dev
```

Before making changes, confirm the application starts successfully in its current state.

---

## 7. Development Workflow

Use the following workflow for each contribution.

### Step 1: Synchronize the Repository

```bash
git checkout main
git pull origin main
```

### Step 2: Create a Focused Branch

```bash
git checkout -b type/short-description
```

Examples:

```bash
git checkout -b fix/login-error-message
git checkout -b feat/content-calendar-filter
git checkout -b docs/update-development-guide
git checkout -b refactor/publishing-service
```

### Step 3: Make a Focused Change

Keep the contribution narrow enough to review.

Avoid combining unrelated changes such as:

- A feature
- A redesign
- A dependency upgrade
- A database migration
- Documentation cleanup

in the same pull request unless they are inseparable.

### Step 4: Review the Change Locally

Run relevant checks:

```bash
npm run lint
npm run build
```

Run the development environment and manually test the affected workflow.

### Step 5: Review Git Changes

```bash
git status
git diff
```

Stage only intended files:

```bash
git add path/to/file
```

Review the staged diff:

```bash
git diff --cached
```

### Step 6: Commit the Change

```bash
git commit -m "type: concise description"
```

### Step 7: Push the Branch

```bash
git push -u origin branch-name
```

### Step 8: Open a Pull Request

Describe what changed, why it changed, and how it was validated.

---

## 8. Branching Strategy

The default branch is:

```text
main
```

Direct commits to `main` may occur during early solo development, but branch-based development is preferred as the repository grows.

Recommended branch prefixes:

| Prefix | Purpose |
| --- | --- |
| `feat/` | New capability |
| `fix/` | Bug fix |
| `docs/` | Documentation |
| `refactor/` | Internal restructuring without intended behavior change |
| `test/` | Test additions or corrections |
| `chore/` | Maintenance |
| `security/` | Security hardening |
| `perf/` | Performance work |
| `ci/` | Continuous integration |
| `build/` | Build system or dependency work |

Use lowercase, hyphenated branch names.

Good:

```text
feat/add-content-status-filter
```

Avoid:

```text
new-stuff
final-fix
roham-changes
update2
```

---

## 9. Commit Guidelines

Commits should be:

- Focused
- Reviewable
- Descriptive
- Reversible
- Free of unrelated changes

Recommended commit format:

```text
type: concise description
```

Examples:

```text
docs: add contribution guidelines
fix: prevent duplicate publishing requests
feat: add content status filter
refactor: isolate PocketBase client configuration
security: restrict production CORS origin
chore: update development dependencies
```

### Commit Types

| Type | Use |
| --- | --- |
| `feat` | New functionality |
| `fix` | Bug correction |
| `docs` | Documentation only |
| `refactor` | Structural change without intended feature change |
| `test` | Tests |
| `chore` | Maintenance |
| `security` | Security improvement |
| `perf` | Performance improvement |
| `ci` | CI workflow |
| `build` | Build configuration or dependency behavior |

### Commit Rules

Do not commit:

- Secrets
- Access tokens
- Passwords
- Runtime databases
- Generated backups
- Platform-specific binaries
- Unrelated formatting changes
- Debug logs
- Temporary files

---

## 10. Pull Request Guidelines

A pull request should answer:

- What changed?
- Why was it necessary?
- Which workspace is affected?
- How was it tested?
- Does it change architecture?
- Does it require a migration?
- Does it introduce or modify environment variables?
- Does it affect security?
- Does it affect deployment?
- Does documentation need updating?

### Recommended Pull Request Structure

```markdown
## Summary

Explain the change.

## Reason

Explain why the change is needed.

## Scope

List affected workspaces and files.

## Validation

Describe commands and manual checks performed.

## Architecture Impact

State whether architecture changed.

## Security Impact

State whether security boundaries changed.

## Migration Required

Yes or no.

## Documentation Updated

List updated documentation.
```

### Pull Request Size

Prefer smaller pull requests.

A contribution that is too large to explain clearly is usually too large to review safely.

Split large work into stages when possible.

---

## 11. Code Quality Standards

Code should be:

- Readable
- Explicit
- Consistent
- Maintainable
- Secure
- Appropriately documented
- Aligned with the current architecture

Prefer:

- Clear names
- Small functions
- Predictable data flow
- Explicit error handling
- Minimal hidden behavior
- Reusable logic when reuse is real
- Local simplicity over premature abstraction

Avoid:

- Unnecessary abstractions
- Large multi-purpose components
- Provider logic inside route handlers
- Secret values in client code
- Silent error swallowing
- Large unrelated refactors
- Copy-pasted business rules
- Undocumented side effects

---

## 12. Frontend Contribution Guidelines

Frontend code belongs in:

```text
apps/web
```

### Frontend Contributions Should

- Preserve route clarity
- Use reusable components appropriately
- Provide accessible labels
- Handle loading states
- Handle empty states
- Handle errors
- Validate user input
- Avoid exposing secrets
- Respect existing visual patterns
- Avoid redesigning unrelated screens

### Components

Components should generally:

- Have one clear responsibility
- Receive explicit props
- Avoid unnecessary global state
- Keep provider-specific logic outside presentation code
- Separate reusable UI from route-level screens

### Forms

Forms should:

- Validate required fields
- Show actionable errors
- Avoid losing valid user input
- Prevent duplicate submissions where appropriate
- Make save, publish, delete, and destructive actions clear

### Accessibility

Contributions should preserve or improve:

- Keyboard navigation
- Focus visibility
- Form labels
- Semantic structure
- Contrast
- Screen-reader meaning
- Destructive action confirmation

---

## 13. API Contribution Guidelines

API code belongs in:

```text
apps/api
```

### Route Handlers

Route handlers should:

- Parse requests
- Validate inputs
- Call services
- Return consistent responses
- Avoid complex orchestration

### Services

Services should:

- Own workflows
- Coordinate PocketBase and providers
- Normalize provider behavior
- Handle expected failures
- Avoid leaking provider-specific details unnecessarily

### Middleware

Middleware may handle:

- Authentication
- Authorization
- Logging
- Rate limiting
- CORS
- Security headers
- Request identifiers
- Error handling

### API Errors

Errors should be:

- Structured
- Safe for the client
- Useful for debugging
- Free of secrets
- Mapped to appropriate HTTP status codes

Do not return raw stack traces in production responses.

---

## 14. PocketBase Contribution Guidelines

PocketBase code belongs in:

```text
apps/pocketbase
```

### Collections and Schema

Schema changes should:

- Be deliberate
- Use migrations
- Preserve existing data where possible
- Include safe defaults
- Avoid breaking changes without documentation
- Include access rule review

### Hooks

Hooks should:

- Remain small
- Be documented
- Avoid duplicating Express services
- Avoid embedding large external workflows
- Fail predictably

### Access Rules

Every collection change should review:

- List rules
- View rules
- Create rules
- Update rules
- Delete rules
- Ownership rules
- Administrative access

Hidden UI is not authorization.

---

## 15. Documentation Guidelines

Documentation is treated as part of the product.

Update documentation when a contribution changes:

- Setup
- Commands
- Architecture
- Environment variables
- Deployment
- Security expectations
- Data flow
- Major user workflows
- Project status

### Markdown Standards

Use:

- Clear heading hierarchy
- Short paragraphs
- Fenced code blocks
- Relative repository links
- Mermaid diagrams where useful
- Tables when they improve scanning

Avoid:

- Unsupported claims
- Marketing language in technical documentation
- Describing planned capabilities as implemented
- Large undocumented code examples
- Broken links
- Raw secrets or real credentials

### Preview Before Commit

Preview Markdown in VS Code before committing:

```text
Command + Shift + V
```

Review Mermaid diagrams and relative links on GitHub after pushing.

---

## 16. Security Guidelines

Security-sensitive changes require extra care.

Do not disclose a suspected vulnerability publicly before reviewing [SECURITY.md](SECURITY.md).

Security contributions should consider:

- Authentication
- Authorization
- Secret handling
- CORS
- Rate limiting
- Input validation
- Token storage
- Provider callbacks
- File uploads
- Error exposure
- Logs
- Database rules

Never include real credentials in:

- Issues
- Pull requests
- Screenshots
- Logs
- Test fixtures
- Documentation
- Commit history

---

## 17. Environment Variables and Secrets

Environment variables must be documented in:

- Relevant `.env.example` files
- `docs/ENVIRONMENT.md`

When adding a variable:

1. Add it to the appropriate `.env.example`
2. Use a safe placeholder
3. Document whether it is required
4. Document which workspace reads it
5. Document the expected format
6. Document whether it is secret
7. Update deployment documentation if necessary

Example:

```env
EXAMPLE_API_KEY=replace-with-provider-key
```

Never use a real key in an example file.

---

## 18. Database and Migration Guidelines

Database changes must be reproducible.

Use PocketBase migrations for schema changes.

Do not commit:

- `pb_data`
- SQLite runtime files
- Local backups
- Uploaded runtime files
- Temporary migration exports

A migration should:

- Have one clear purpose
- Preserve existing records where possible
- Include reversible behavior when practical
- Be tested on a clean local environment
- Be tested against existing local schema state when practical
- Be reviewed for access rule changes

If a migration is destructive, document the risk clearly.

---

## 19. External Integration Guidelines

External integrations should be isolated behind services or adapters.

Do not spread provider-specific logic across:

- UI components
- Route handlers
- Database hooks
- Utility files

Integration code should account for:

- Expired tokens
- Missing scopes
- Rate limits
- Provider outages
- Partial responses
- Duplicate requests
- Retries
- Revocation
- Sandbox versus production behavior

Do not claim an integration is fully operational unless it has been verified with the real provider workflow.

---

## 20. Testing Expectations

The project’s automated testing strategy is still evolving.

Until formal coverage requirements are established, contributors must perform relevant manual and command-based validation.

At minimum:

```bash
npm run lint
npm run build
```

Also verify the affected workflow in local development.

When tests exist for an affected area:

- Run them
- Update them if behavior changes
- Add tests for bugs when practical
- Do not remove failing tests merely to pass validation

Future testing may include:

- Unit tests
- Component tests
- API integration tests
- Migration tests
- End-to-end tests
- Security tests

---

## 21. Reporting Bugs

A useful bug report should include:

- Clear title
- Affected workspace
- Expected behavior
- Actual behavior
- Steps to reproduce
- Environment
- Browser or runtime version
- Relevant logs
- Screenshots when helpful
- Whether the issue is consistent or intermittent

Remove secrets before posting logs or screenshots.

Suggested format:

```markdown
## Summary

## Expected Behavior

## Actual Behavior

## Steps to Reproduce

1.
2.
3.

## Environment

## Logs or Screenshots

## Additional Context
```

---

## 22. Requesting Features

A feature request should explain:

- The problem
- Who experiences the problem
- The current workaround
- The proposed outcome
- Why the change belongs in Personal Dashboard
- Whether it affects architecture
- Whether it introduces external dependencies

Prefer problem statements over implementation demands.

Good:

```text
Content drafts are difficult to prioritize because no status filter exists.
```

Less useful:

```text
Add this exact dropdown library and redesign the entire toolbar.
```

---

## 23. Review Process

A contribution may be reviewed for:

- Correctness
- Scope
- Architecture
- Security
- Maintainability
- Documentation
- User experience
- Accessibility
- Migration safety
- Deployment impact

Review feedback may request:

- Smaller scope
- Better naming
- Additional validation
- Documentation updates
- Migration revisions
- Security changes
- Removal of unrelated edits

Feedback should remain focused on the contribution.

---

## 24. Contribution Checklist

Before submitting a contribution, confirm:

- [ ] I reviewed the relevant documentation
- [ ] I created a focused branch
- [ ] My change belongs in the workspace I modified
- [ ] I did not include secrets
- [ ] I did not commit runtime database files
- [ ] I reviewed `git status`
- [ ] I reviewed `git diff`
- [ ] I staged only intended files
- [ ] I reviewed `git diff --cached`
- [ ] I ran relevant linting
- [ ] I ran the build
- [ ] I manually tested the affected workflow
- [ ] I updated documentation where necessary
- [ ] I distinguished planned behavior from implemented behavior
- [ ] I reviewed security impact
- [ ] I reviewed migration impact
- [ ] My commit message is clear
- [ ] My pull request explains validation performed

---

## 25. Code of Conduct

Contributors are expected to communicate professionally and respectfully.

Acceptable participation includes:

- Constructive feedback
- Clear technical disagreement
- Good-faith questions
- Respect for contributor time
- Focus on the work
- Patience with learners
- Honest acknowledgement of uncertainty

Unacceptable participation includes:

- Harassment
- Personal attacks
- Discrimination
- Threats
- Deliberate deception
- Publishing private information
- Abusive or dismissive review behavior

Project maintainers may remove contributions or participation that violates these expectations.

---

## 26. License and Ownership

Before contributing, review the repository’s [LICENSE](LICENSE).

Unless otherwise stated in writing, contributions are submitted under the repository’s current license and ownership terms.

Do not contribute code, assets, documentation, or data that you do not have the right to provide.

This includes:

- Proprietary employer code
- Unlicensed images
- Restricted datasets
- Copied commercial templates
- Confidential provider documentation
- Third-party secrets
- Code with incompatible licensing

---

## Final Principle

A good contribution does more than make the application work.

It should also leave the repository:

- Easier to understand
- Safer to operate
- More honest about its capabilities
- More maintainable for the next developer
