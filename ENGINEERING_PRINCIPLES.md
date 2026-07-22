# Engineering Principles

> **Project:** Personal Dashboard  
> **Document status:** Active engineering charter  
> **Purpose:** Define the principles that guide technical decisions, implementation, review, and maintenance.

---

## Table of Contents

- [1. Why This Document Exists](#1-why-this-document-exists)
- [2. Principle 1: Own the System](#2-principle-1-own-the-system)
- [3. Principle 2: Prefer Simplicity](#3-principle-2-prefer-simplicity)
- [4. Principle 3: Keep Boundaries Clear](#4-principle-3-keep-boundaries-clear)
- [5. Principle 4: Build Secure Defaults](#5-principle-4-build-secure-defaults)
- [6. Principle 5: Treat Documentation as Engineering](#6-principle-5-treat-documentation-as-engineering)
- [7. Principle 6: Be Honest About Maturity](#7-principle-6-be-honest-about-maturity)
- [8. Principle 7: Make Changes Reproducible](#8-principle-7-make-changes-reproducible)
- [9. Principle 8: Prefer Small, Reviewable Changes](#9-principle-8-prefer-small-reviewable-changes)
- [10. Principle 9: Validate at Every Trust Boundary](#10-principle-9-validate-at-every-trust-boundary)
- [11. Principle 10: Design for Failure](#11-principle-10-design-for-failure)
- [12. Principle 11: Preserve User Control](#12-principle-11-preserve-user-control)
- [13. Principle 12: Use the Right Layer](#13-principle-12-use-the-right-layer)
- [14. Principle 13: Avoid Premature Scale](#14-principle-13-avoid-premature-scale)
- [15. Principle 14: Make Data Portable](#15-principle-14-make-data-portable)
- [16. Principle 15: Prefer Explicitness](#16-principle-15-prefer-explicitness)
- [17. Principle 16: Test What Matters](#17-principle-16-test-what-matters)
- [18. Principle 17: Protect the Repository](#18-principle-17-protect-the-repository)
- [19. Principle 18: Respect Future Maintainers](#19-principle-18-respect-future-maintainers)
- [20. Decision Framework](#20-decision-framework)
- [21. Review Questions](#21-review-questions)
- [22. Anti-Patterns](#22-anti-patterns)
- [23. Final Engineering Standard](#23-final-engineering-standard)

---

## 1. Why This Document Exists

Personal Dashboard is not only a collection of features.

It is an engineering system that should remain understandable, secure, maintainable, and honest as it grows.

These principles guide:

- Architecture
- Coding
- Documentation
- Reviews
- Refactoring
- Security
- Deployment
- Integrations
- Data ownership
- Long-term maintenance

When two implementation options are both technically possible, these principles should help decide which one better fits the project.

They are not rigid rules that replace judgment.

They are the default standard.

---

## 2. Principle 1: Own the System

The project should preserve meaningful ownership of:

- Source code
- Data
- Configuration
- Deployment
- Backups
- Integrations
- Domain names
- Operational knowledge

Ownership does not mean every dependency must be built from scratch.

It means the project should avoid becoming trapped by tools that make the application impossible to operate, move, inspect, or recover without a third party.

### In Practice

Prefer:

- Source-controlled configuration
- Documented deployment
- Exportable data
- Reproducible environments
- Self-hosting where practical
- Replaceable providers
- Open file formats

Avoid:

- Undocumented hosted dependencies
- Provider-specific lock-in without justification
- Critical workflows that cannot be exported
- Hidden automation no one can inspect
- Data that only exists inside an external platform

---

## 3. Principle 2: Prefer Simplicity

Use the simplest architecture that meets the current verified need.

Complexity must earn its place.

Do not introduce:

- Microservices
- Message queues
- Distributed systems
- Additional databases
- New state libraries
- Abstract frameworks
- Large dependency chains

merely because they may be useful someday.

### In Practice

Prefer:

- Small functions
- Direct data flow
- Clear naming
- Fewer moving parts
- Existing platform capabilities
- Incremental improvements

Avoid:

- Clever code
- Abstraction without repeated need
- Indirection that hides behavior
- Scaling solutions for nonexistent scale

Simple does not mean careless.

Simple means understandable.

---

## 4. Principle 3: Keep Boundaries Clear

Each part of the system should have a clear responsibility.

The current primary boundaries are:

- `apps/web` for presentation and browser interaction
- `apps/api` for server-side workflows and integrations
- `apps/pocketbase` for authentication, collections, persistence, migrations, and hooks

### In Practice

Frontend code should not:

- Contain privileged secrets
- Perform protected provider administration
- Replace backend authorization

API code should not:

- Become a UI layer
- Mix unrelated workflows inside route handlers

PocketBase hooks should not:

- Become a second undocumented application server
- Absorb complex external orchestration

When responsibility is unclear, place logic in the smallest trustworthy boundary that can own it well.

---

## 5. Principle 4: Build Secure Defaults

Security should not be added only after a feature is complete.

Every change should consider:

- Authentication
- Authorization
- Input validation
- Secret handling
- Error exposure
- Logging
- File access
- Database rules
- External callbacks
- Rate limits

### In Practice

Prefer:

- Deny-by-default access
- Environment-based secrets
- Least privilege
- Explicit CORS
- Restricted collection rules
- Structured errors
- Redacted logs
- Confirmation for destructive actions

Avoid:

- Hardcoded credentials
- Public secrets
- Trusting hidden UI as authorization
- Logging tokens
- Accepting unvalidated provider responses
- Broad permissions for convenience

---

## 6. Principle 5: Treat Documentation as Engineering

Documentation is part of the product.

A system that only works for the person who built it is not well engineered.

Documentation should explain:

- How to run the project
- How the architecture works
- How environment variables are configured
- How schema changes are managed
- How deployment works
- Which capabilities are current
- Which capabilities are planned

### In Practice

Update documentation when changing:

- Setup
- Commands
- Architecture
- Security
- Deployment
- Data flow
- Environment variables
- External providers
- Major workflows

Documentation should be reviewed before commit and verified after rendering.

---

## 7. Principle 6: Be Honest About Maturity

Do not overstate what the system can do.

A route, screen, schema, or integration stub does not make a workflow production-ready.

Use precise language such as:

- Implemented
- Partially implemented
- Experimental
- Planned
- Proposed
- Not yet verified

### In Practice

Do not claim:

- Production deployment before validation
- Full security before security review
- Complete integrations before provider testing
- Scalability before load evidence
- Reliability before operational evidence

Honest status builds more credibility than inflated claims.

---

## 8. Principle 7: Make Changes Reproducible

A future developer should be able to reproduce the system from the repository and documented configuration.

### In Practice

Version:

- Source code
- Lockfiles
- Migrations
- Safe configuration examples
- Runtime version files
- Documentation

Do not version:

- Secrets
- Runtime databases
- Local backups
- Generated binaries
- Uploaded production files
- Machine-specific state

Schema must be reproducible through migrations, not through sharing a live database file.

---

## 9. Principle 8: Prefer Small, Reviewable Changes

Large changes hide risk.

Small changes are easier to:

- Understand
- Test
- Review
- Revert
- Document
- Diagnose

### In Practice

Prefer one focused commit or pull request for:

- One feature
- One bug
- One refactor
- One migration
- One documentation update

Avoid mixing:

- Feature development
- Redesign
- Dependency upgrades
- Schema changes
- Large formatting changes

unless they are inseparable.

---

## 10. Principle 9: Validate at Every Trust Boundary

Validation should happen where trust changes.

Relevant boundaries include:

- User to browser
- Browser to API
- Browser to PocketBase
- API to PocketBase
- API to external provider
- Provider response to application
- File upload to storage

### In Practice

Client-side validation improves user experience.

Server-side validation protects the system.

Persistence rules protect data integrity.

Provider response validation protects against external inconsistency.

No single validation layer replaces the others.

---

## 11. Principle 10: Design for Failure

Networks fail.

Providers reject requests.

Tokens expire.

Databases become unavailable.

Users submit duplicate actions.

The system should expect failure rather than treat it as impossible.

### In Practice

Design for:

- Retries
- Partial completion
- Timeouts
- Expired credentials
- Rate limits
- Duplicate requests
- Rollback
- Recovery
- Clear failure states

A useful error should explain:

- What failed
- Whether data was saved
- Whether retry is safe
- Whether an external action may have completed

---

## 12. Principle 11: Preserve User Control

The application should support the user, not silently act beyond the user’s intent.

This is especially important for:

- Publishing
- Deletion
- AI-generated content
- External integrations
- Data export
- Account connections
- Automation

### In Practice

Prefer:

- Review before publish
- Confirmation before destructive actions
- Visible status
- Editable drafts
- Clear provider connection state
- Export capability
- Reversible operations where practical

AI-generated content should generally remain a draft until approved.

---

## 13. Principle 12: Use the Right Layer

A good solution is not only correct.

It is correct in the right place.

### Place Logic in the Frontend When

- It is presentation-specific
- It improves interaction
- It contains no secret
- It does not establish authorization

### Place Logic in the API When

- It requires secrets
- It coordinates multiple systems
- It performs privileged operations
- It normalizes providers
- It enforces business workflows

### Place Logic in PocketBase When

- It defines schema
- It defines collection rules
- It manages persistence
- It handles small data-local hooks
- It supports authentication

Do not choose a layer only because it is convenient in the moment.

---

## 14. Principle 13: Avoid Premature Scale

Build for the current stage while preserving a path forward.

The project does not need hyperscale infrastructure before it has hyperscale requirements.

### In Practice

Use the current stack while it remains appropriate:

- React
- Express
- PocketBase
- SQLite
- npm workspaces

Introduce additional systems only when evidence shows a need.

Potential future additions may include:

- Background workers
- Queues
- Redis
- PostgreSQL
- Object storage
- Multiple service instances

These should solve verified problems, not imagined prestige.

---

## 15. Principle 14: Make Data Portable

Users should not be trapped inside the application.

Important data should be exportable in understandable formats.

### In Practice

Prefer support for:

- JSON
- CSV
- Markdown
- Standard image formats
- Documented APIs
- Backup and restore procedures

Avoid proprietary formats unless necessary.

External provider identifiers should supplement internal records, not replace them.

---

## 16. Principle 15: Prefer Explicitness

Hidden behavior creates maintenance risk.

Prefer explicit:

- Inputs
- Outputs
- Dependencies
- State transitions
- Error conditions
- Environment variables
- Data ownership
- Provider boundaries

### In Practice

Prefer:

```text
Draft → Review → Approved → Published
```

over undocumented status changes.

Prefer named configuration over magic constants.

Prefer clear service calls over side effects hidden inside utilities.

---

## 17. Principle 16: Test What Matters

Testing should focus on risk and behavior.

The goal is confidence, not a vanity coverage percentage.

### High-Value Test Areas

- Authentication
- Authorization
- Migrations
- Publishing
- Destructive actions
- Data transformations
- Provider adapters
- Error handling
- Critical user workflows

### In Practice

Until complete automated coverage exists:

- Run linting
- Run builds
- Perform manual workflow validation
- Review diffs
- Verify migrations
- Confirm rendered documentation

As testing grows, bugs should receive regression tests where practical.

---

## 18. Principle 17: Protect the Repository

The repository is a durable record of the project.

Keep it clean.

### Do Not Commit

- Secrets
- Passwords
- Tokens
- Local databases
- Backups
- Runtime uploads
- Generated binaries
- Debug files
- Unrelated changes

### In Practice

Before every commit:

```bash
git status
git diff
git diff --cached
```

Stage intentionally.

Use focused commit messages.

Treat history as part of the engineering product.

---

## 19. Principle 18: Respect Future Maintainers

Write code and documentation for the person who will encounter it later.

That person may be:

- The original author six months later
- A collaborator
- A future employee
- An open-source contributor
- A reviewer evaluating the portfolio

### In Practice

Leave behind:

- Clear names
- Focused functions
- Useful comments
- Updated documentation
- Predictable structure
- Explicit assumptions
- Reproducible setup
- Clear migration history

Do not leave behind unexplained cleverness.

---

## 20. Decision Framework

Before introducing a technical change, ask:

1. What verified problem does this solve?
2. Which workspace should own it?
3. Does it introduce a new trust boundary?
4. Does it require a secret?
5. Does it affect data ownership?
6. Does it require a migration?
7. Can it be implemented more simply?
8. Can it be tested?
9. Can it be reverted?
10. Does documentation need to change?
11. Is it implemented now or only planned?
12. Will a future maintainer understand it?

If these questions cannot be answered, the change may not be ready.

---

## 21. Review Questions

During review, ask:

### Architecture

- Is the responsibility in the correct layer?
- Does this create unnecessary coupling?
- Is a new dependency justified?
- Is the change smaller than it needs to be?

### Security

- Are secrets protected?
- Is authorization enforced?
- Is input validated?
- Are errors safe?
- Are logs redacted?

### Data

- Is the schema change reproducible?
- Is data preserved?
- Is export still possible?
- Is ownership clear?

### Operations

- What happens when this fails?
- Can it be retried safely?
- Is deployment affected?
- Is recovery documented?

### Documentation

- Does the documentation match reality?
- Are planned capabilities labeled?
- Are commands and examples accurate?

---

## 22. Anti-Patterns

The following patterns should be treated as warning signs.

### 22.1 Feature Inflation

Adding multiple loosely related capabilities before validating the original workflow.

### 22.2 Architecture by Trend

Introducing tools because they are popular rather than necessary.

### 22.3 Hidden Authorization

Assuming a route is secure because the UI does not show it.

### 22.4 Documentation Drift

Allowing the README or architecture documents to describe behavior that no longer exists.

### 22.5 Secret Convenience

Putting credentials in source code because local setup feels easier.

### 22.6 Giant Commits

Combining unrelated changes into one difficult-to-review commit.

### 22.7 Silent Failure

Catching an error without informing the user or recording useful context.

### 22.8 Provider Leakage

Spreading provider-specific logic across components, routes, hooks, and utilities.

### 22.9 Premature Abstraction

Creating generic frameworks before repeated patterns are proven.

### 22.10 Production Theater

Using production language, badges, or claims without production validation.

---

## 23. Final Engineering Standard

Every meaningful change should leave Personal Dashboard:

- Easier to understand
- Safer to operate
- More reproducible
- More honest
- More maintainable
- More useful to the user

The project’s engineering standard is not perfection.

It is disciplined progress.

> Build what is needed.  
> Put it in the right place.  
> Protect the user and the data.  
> Document the truth.  
> Leave the system better than you found it.
