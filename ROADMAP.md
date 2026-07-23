# Personal Dashboard Roadmap

> **Project:** Personal Dashboard  
> **Document status:** Active roadmap  
> **Roadmap type:** Engineering and product evolution  
> **Current stage:** Foundation and stabilization

---

## Table of Contents

- [1. Purpose](#1-purpose)
- [2. Roadmap Principles](#2-roadmap-principles)
- [3. Current Project Position](#3-current-project-position)
- [4. Phase 0: Repository Foundation](#4-phase-0-repository-foundation)
- [5. Phase 1: Local Development Baseline](#5-phase-1-local-development-baseline)
- [6. Phase 2: Quality and Reliability](#6-phase-2-quality-and-reliability)
- [7. Phase 3: Data and Workflow Hardening](#7-phase-3-data-and-workflow-hardening)
- [8. Phase 4: Containerization](#8-phase-4-containerization)
- [9. Phase 5: VPS Deployment](#9-phase-5-vps-deployment)
- [10. Phase 6: Publishing and Integrations](#10-phase-6-publishing-and-integrations)
- [11. Phase 7: AI-Assisted Workflows](#11-phase-7-ai-assisted-workflows)
- [12. Phase 8: Multi-User and Platform Readiness](#12-phase-8-multi-user-and-platform-readiness)
- [13. Phase 9: Enbrandi Evolution](#13-phase-9-enbrandi-evolution)
- [14. Cross-Cutting Workstreams](#14-cross-cutting-workstreams)
- [15. Deferred Capabilities](#15-deferred-capabilities)
- [16. Definition of Done](#16-definition-of-done)
- [17. Roadmap Review Process](#17-roadmap-review-process)
- [18. Success Criteria](#18-success-criteria)

---

## 1. Purpose

This roadmap defines the intended technical and product evolution of Personal Dashboard.

It exists to:

- Establish development order
- Prevent uncontrolled scope expansion
- Separate current work from future ideas
- Make technical dependencies visible
- Preserve realistic implementation expectations
- Guide issues, milestones, and pull requests
- Support the long-term evolution toward Enbrandi

This roadmap is directional and may change as verified project needs evolve.

---

## 2. Roadmap Principles

### 2.1 Foundations Before Expansion

The repository, local environment, architecture, security expectations, and development workflow should be stable before major capabilities are added.

### 2.2 Verified Progress Over Feature Count

A smaller number of tested and documented workflows is more valuable than many incomplete modules.

### 2.3 Current Needs Before Future Scale

The project should solve current verified problems before introducing infrastructure for hypothetical scale.

### 2.4 Documentation Moves With Implementation

Each phase should update relevant documentation at the same time as code.

### 2.5 Planned Does Not Mean Implemented

Future items must not be presented as complete until they are implemented, tested, and documented.

---

## 3. Current Project Position

Personal Dashboard currently has a monorepo architecture containing:

- React and Vite frontend
- Node.js and Express API
- PocketBase backend
- npm workspaces
- Local development workflows
- Content and workflow interfaces
- Project documentation

### Completed Documentation Foundations

- [x] `README.md`
- [x] `ARCHITECTURE.md`
- [x] `CONTRIBUTING.md`
- [x] `ENGINEERING_PRINCIPLES.md`
- [x] `SECURITY.md`

### Remaining Documentation Foundations

- [ ] `ROADMAP.md`
- [ ] `docs/DEVELOPMENT.md`
- [ ] `docs/ENVIRONMENT.md`
- [ ] `docs/DEPLOYMENT.md`
- [ ] `LICENSE`

---

## 4. Phase 0: Repository Foundation

**Status:** In progress

### Objective

Create a professional, understandable, and maintainable repository foundation.

### Deliverables

- [x] Production-quality README
- [x] Architecture documentation
- [x] Contribution guidelines
- [x] Engineering principles
- [x] Security policy
- [ ] Roadmap
- [ ] Local development documentation
- [ ] Environment variable reference
- [ ] Deployment documentation
- [ ] License
- [ ] Issue templates
- [ ] Pull request template
- [ ] Repository labels
- [ ] Branch protection when appropriate

### Exit Criteria

Phase 0 is complete when:

- A new contributor can understand the project
- Repository responsibilities are documented
- Development expectations are documented
- Security expectations are documented
- Planned and current architecture are clearly separated
- Legal ownership and contribution terms are explicit

---

## 5. Phase 1: Local Development Baseline

**Status:** Planned

### Objective

Make local development reproducible and predictable.

### Deliverables

- [ ] Verify root workspace scripts
- [ ] Confirm Node.js version behavior
- [ ] Verify PocketBase version setup
- [ ] Standardize local environment setup
- [ ] Add missing `.env.example` files
- [ ] Document required ports
- [ ] Document startup order
- [ ] Add health endpoints where appropriate
- [ ] Validate clean-clone setup
- [ ] Remove obsolete local files
- [ ] Review ignored files
- [ ] Confirm all runtime data is excluded from Git

### Exit Criteria

- Clean-clone setup is verified
- The application starts successfully
- Environment variables are documented
- Common setup failures are documented
- Runtime data remains outside version control

---

## 6. Phase 2: Quality and Reliability

**Status:** Planned

### Objective

Introduce automated validation and reduce regression risk.

### Deliverables

- [ ] Standardize linting
- [ ] Standardize formatting
- [ ] Add unit testing framework
- [ ] Add frontend component tests
- [ ] Add API route tests
- [ ] Add service tests
- [ ] Add PocketBase migration tests
- [ ] Add critical workflow integration tests
- [ ] Add regression tests for confirmed bugs
- [ ] Add GitHub Actions
- [ ] Run linting in CI
- [ ] Run builds in CI
- [ ] Run tests in CI
- [ ] Add dependency scanning
- [ ] Add secret scanning

### High-Priority Test Areas

- Authentication
- Authorization
- Content creation
- Content editing
- Publishing state transitions
- Destructive actions
- Migration execution
- Environment validation
- Error handling

### Exit Criteria

- Pull requests receive automated validation
- Critical workflows have baseline tests
- Builds fail when required checks fail
- Migration failures are detectable
- Repository security checks are active

---

## 7. Phase 3: Data and Workflow Hardening

**Status:** Planned

### Objective

Stabilize the application’s internal data model and workflow state.

### Deliverables

- [ ] Review PocketBase collections
- [ ] Document collection responsibilities
- [ ] Review access rules
- [ ] Normalize status fields
- [ ] Review ownership fields
- [ ] Review timestamps
- [ ] Review references between records
- [ ] Validate migration history
- [ ] Add data integrity checks
- [ ] Define archive behavior
- [ ] Define deletion behavior
- [ ] Define export behavior
- [ ] Define backup and restore expectations

### Workflow Areas

- Blog content
- Repurposed content
- Campaigns
- Editorial planning
- Production workflow
- Publishing activity
- Assets
- AI drafts
- Project tracking

### Exit Criteria

- Core collections are documented
- Access rules are reviewed
- Workflow statuses are consistent
- Destructive actions are deliberate
- Data can be exported
- Migrations reproduce the current schema

---

## 8. Phase 4: Containerization

**Status:** Planned

### Objective

Create reproducible service environments for local and future production use.

### Deliverables

- [ ] Dockerfile for web build
- [ ] Dockerfile for API
- [ ] Container strategy for PocketBase
- [ ] Docker Compose configuration
- [ ] Persistent volumes
- [ ] Environment injection
- [ ] Health checks
- [ ] Development compose workflow
- [ ] Production compose workflow
- [ ] Container documentation
- [ ] Backup volume strategy

### Exit Criteria

- The full stack can run through documented container commands
- Persistent data survives container restarts
- Secrets are not embedded in images
- Services expose health status
- Local and production configurations are clearly separated

---

## 9. Phase 5: VPS Deployment

**Status:** Planned

### Objective

Deploy Personal Dashboard to a controlled self-hosted environment.

### Deliverables

- [ ] Select VPS provider and baseline specification
- [ ] Provision Linux server
- [ ] Create non-root deployment user
- [ ] Configure SSH keys
- [ ] Configure firewall
- [ ] Configure reverse proxy
- [ ] Configure HTTPS
- [ ] Configure domain and DNS
- [ ] Configure process supervision or containers
- [ ] Configure production environment variables
- [ ] Configure persistent storage
- [ ] Configure automated backups
- [ ] Test restoration
- [ ] Configure logging
- [ ] Configure monitoring
- [ ] Document updates and rollback
- [ ] Complete deployment runbook

### Exit Criteria

- Application is reachable through HTTPS
- Services restart automatically
- Secrets are stored outside Git
- Backups run successfully
- A backup has been restored in testing
- Deployment and rollback procedures are documented
- Monitoring can detect service failure

---

## 10. Phase 6: Publishing and Integrations

**Status:** Planned

### Objective

Turn content workflows into reliable external publishing workflows.

### Deliverables

- [ ] Define provider adapter interface
- [ ] Implement OAuth connection lifecycle
- [ ] Protect token storage
- [ ] Add token refresh handling
- [ ] Add provider connection status
- [ ] Add publishing attempt records
- [ ] Add retry strategy
- [ ] Add idempotency controls
- [ ] Add provider-specific validation
- [ ] Add rate-limit handling
- [ ] Add failure recovery
- [ ] Add publishing audit history

### Potential Platforms

- LinkedIn
- Facebook
- Instagram
- X
- YouTube
- TikTok
- Newsletter providers

Each integration must be treated independently.

A UI presence does not prove production integration.

### Exit Criteria

For each supported provider:

- OAuth is verified
- Publishing is verified
- Errors are handled
- Tokens are protected
- Rate limits are understood
- Retry behavior is documented
- Publishing results are recorded internally

---

## 11. Phase 7: AI-Assisted Workflows

**Status:** Planned

### Objective

Introduce secure and reviewable AI assistance across content and operational workflows.

### Deliverables

- [ ] Define AI provider abstraction
- [ ] Add provider configuration
- [ ] Add model selection
- [ ] Add secure server-side requests
- [ ] Add prompt templates
- [ ] Add usage tracking
- [ ] Add cost tracking where possible
- [ ] Add failure handling
- [ ] Add timeout handling
- [ ] Add human review gates
- [ ] Add output persistence rules
- [ ] Add sensitive-data handling guidance
- [ ] Add audit metadata

### Candidate Workflows

- Draft generation
- Content repurposing
- Summarization
- Campaign planning
- Metadata generation
- Editorial assistance
- Workflow recommendations
- Research organization

### Exit Criteria

- AI secrets remain server-side
- Generated content is clearly identified
- Human review is preserved
- Usage is observable
- Provider failures do not corrupt workflow state
- Sensitive content handling is documented

---

## 12. Phase 8: Multi-User and Platform Readiness

**Status:** Future

### Objective

Prepare the system for more than one user and for eventual productization.

### Deliverables

- [ ] User ownership model
- [ ] Organization model
- [ ] Roles and permissions
- [ ] Resource isolation
- [ ] Administrative boundaries
- [ ] Invitation workflow
- [ ] Account lifecycle
- [ ] Audit logs
- [ ] Usage limits
- [ ] Tenant-aware queries
- [ ] Tenant-aware file storage
- [ ] Data export by user or organization
- [ ] Data deletion process
- [ ] Privacy controls

### Exit Criteria

- One user cannot access another user’s resources
- Ownership is enforced in backend rules
- Administrative actions are auditable
- Data can be exported and deleted intentionally
- Multi-user behavior is covered by tests

---

## 13. Phase 9: Enbrandi Evolution

**Status:** Long-term

### Objective

Evolve Personal Dashboard into the foundation for Enbrandi.

Enbrandi is expected to expand beyond a personal dashboard into a broader platform for:

- Personal brands
- Websites
- Content operations
- Campaigns
- Publishing
- Analytics
- Custom domains
- Owned infrastructure
- AI-assisted workflows

### Candidate Capabilities

- Customer workspaces
- Custom domains
- Hosted websites
- Content management
- Brand management
- Asset management
- Social publishing
- Analytics
- Campaign management
- Website deployment
- Domain and DNS workflows
- Modular integrations
- Subscription management
- Platform administration

### Required Architectural Changes

Before Enbrandi can be treated as a platform, the system will likely require:

- Mature multi-tenancy
- Strong role-based authorization
- Durable background jobs
- Production-grade database strategy
- Object storage
- Billing integration
- Tenant isolation
- Audit logging
- Usage metering
- Stronger observability
- Deployment automation
- Disaster recovery
- Legal and privacy policies

### Exit Criteria

This phase should not be considered complete until Enbrandi operates as a distinct, validated product rather than a renamed personal dashboard.

---

## 14. Cross-Cutting Workstreams

### Documentation

- Keep architecture current
- Keep setup instructions accurate
- Keep environment variables documented
- Keep deployment instructions tested
- Clearly label planned capabilities

### Security

- Protect secrets
- Review authorization
- Validate inputs
- Restrict CORS
- Review dependencies
- Protect tokens
- Test backups
- Review logs

### Accessibility

- Keyboard navigation
- Focus visibility
- Labels
- Semantic structure
- Contrast
- Screen-reader support

### Developer Experience

- Clear commands
- Predictable setup
- Useful errors
- Fast feedback
- Focused scripts
- Documented workflows

### Data Portability

- JSON export
- CSV export
- Markdown export where relevant
- Backup and restore
- Provider-independent internal records

---

## 15. Deferred Capabilities

The following capabilities are intentionally deferred until earlier foundations are complete:

- Kubernetes
- Microservices
- Multi-region deployment
- Dedicated event streaming
- Large-scale data warehousing
- Advanced recommendation systems
- Custom AI model hosting
- Native mobile applications
- Complex billing architecture
- Marketplace architecture
- Public plugin marketplace

Deferred does not mean rejected.

It means the project does not currently have enough verified need to justify the complexity.

---

## 16. Definition of Done

A roadmap item is not complete merely because code exists.

### Implementation

- [ ] Code is complete
- [ ] Relevant errors are handled
- [ ] Security boundaries are reviewed
- [ ] Migration behavior is verified

### Validation

- [ ] Linting passes
- [ ] Build passes
- [ ] Tests pass
- [ ] Manual workflow is verified
- [ ] Failure behavior is reviewed

### Documentation

- [ ] README updated if needed
- [ ] Architecture updated if needed
- [ ] Environment reference updated if needed
- [ ] Deployment guide updated if needed
- [ ] Status is described honestly

### Git

- [ ] Diff is reviewed
- [ ] Commit is focused
- [ ] Commit message is clear
- [ ] Pull request explains the change
- [ ] Unrelated files are excluded

---

## 17. Roadmap Review Process

Review this roadmap:

- At the beginning of a major phase
- At the completion of a major phase
- After a meaningful architecture change
- When project priorities change
- When a major integration becomes available or unavailable
- Before beginning Enbrandi platform work

Roadmap changes should explain:

- What changed
- Why it changed
- Which phase is affected
- Which dependencies changed
- Whether scope increased or decreased
- Whether documentation must also change

---

## 18. Success Criteria

Personal Dashboard is successful when it becomes:

- Reliable enough for daily use
- Understandable to a new contributor
- Reproducible from the repository
- Secure enough for its verified use case
- Self-hosted with tested backups
- Honest about its maturity
- Useful as a professional engineering portfolio
- A stable foundation for future Enbrandi development

The long-term goal is not simply to add more features.

The goal is to create a system that can be trusted, maintained, operated, and evolved.

> Build the foundation.  
> Validate the workflow.  
> Protect the data.  
> Automate carefully.  
> Scale only when the evidence requires it.
