# Deployment Guide

> **Project:** Personal Dashboard  
> **Document status:** Active deployment runbook  
> **Target environment:** Linux VPS  
> **Deployment maturity:** Planned and partially documented

---

## Table of Contents

- [1. Purpose](#1-purpose)
- [2. Deployment Principles](#2-deployment-principles)
- [3. Current Deployment Status](#3-current-deployment-status)
- [4. Target Architecture](#4-target-architecture)
- [5. Prerequisites](#5-prerequisites)
- [6. Server Baseline](#6-server-baseline)
- [7. Deployment User](#7-deployment-user)
- [8. SSH Configuration](#8-ssh-configuration)
- [9. Firewall](#9-firewall)
- [10. Domain and DNS](#10-domain-and-dns)
- [11. Runtime Strategy](#11-runtime-strategy)
- [12. Repository Setup](#12-repository-setup)
- [13. Environment Variables](#13-environment-variables)
- [14. Build Process](#14-build-process)
- [15. PocketBase Persistence](#15-pocketbase-persistence)
- [16. Reverse Proxy](#16-reverse-proxy)
- [17. HTTPS](#17-https)
- [18. Process Management](#18-process-management)
- [19. Deployment Procedure](#19-deployment-procedure)
- [20. Verification](#20-verification)
- [21. Updates](#21-updates)
- [22. Rollback](#22-rollback)
- [23. Backups](#23-backups)
- [24. Restore Testing](#24-restore-testing)
- [25. Logs and Monitoring](#25-logs-and-monitoring)
- [26. Security Checklist](#26-security-checklist)
- [27. Incident Response](#27-incident-response)
- [28. Disaster Recovery](#28-disaster-recovery)
- [29. Planned Improvements](#29-planned-improvements)
- [30. Related Documentation](#30-related-documentation)

---

## 1. Purpose

This guide describes the intended deployment process for Personal Dashboard.

It is designed to support a controlled self-hosted deployment on a Linux VPS.

The guide covers:

- Server preparation
- SSH access
- Firewall configuration
- Environment variables
- Application build
- PocketBase persistence
- Reverse proxy
- HTTPS
- Process management
- Deployment verification
- Updates
- Rollback
- Backups
- Recovery

This document must remain honest about what has and has not been implemented.

---

## 2. Deployment Principles

Deployment should follow these principles:

- Reproducible
- Secure by default
- Documented
- Reversible
- Observable
- Backed up
- Tested before production use
- Free of committed secrets

A deployment is not complete merely because the application responds once.

It should also:

- Restart after failure
- Survive a server reboot
- Preserve data
- Protect secrets
- Use HTTPS
- Support rollback
- Produce useful logs
- Have tested backups

---

## 3. Current Deployment Status

At the time of writing:

- Local development is the primary verified environment.
- VPS deployment is planned.
- Containerization may be introduced before or during deployment.
- Production environment variables must still be finalized.
- Backup and restore procedures must be tested.
- Monitoring and alerting remain planned.

Do not describe the application as production-ready until these controls are implemented and verified.

---

## 4. Target Architecture

A simple initial VPS topology may look like:

```text
Internet
   |
   v
DNS
   |
   v
Reverse Proxy
   |
   +-------------------+
   |                   |
   v                   v
Web Application      API
                         |
                         v
                    PocketBase
                         |
                         v
                    Persistent Data
```

The reverse proxy should terminate HTTPS and route traffic to internal services.

Typical responsibilities:

| Component | Responsibility |
| --- | --- |
| Reverse proxy | HTTPS, routing, security headers |
| Web service | Frontend delivery |
| API service | Server-side workflows |
| PocketBase | Authentication, collections, files, persistence |
| Backup system | Scheduled data protection |
| Monitoring | Availability and error detection |

---

## 5. Prerequisites

Before deployment, confirm:

- A Linux VPS exists
- A domain or subdomain is available
- DNS can be modified
- SSH key access works
- The repository is accessible
- Required environment variables are documented
- The application builds successfully
- PocketBase data paths are understood
- Backup storage is available
- A rollback plan exists

Recommended server operating systems include current supported LTS releases of:

- Ubuntu Server
- Debian

Use a supported operating system version with active security updates.

---

## 6. Server Baseline

After provisioning the VPS, connect using SSH:

```bash
ssh root@SERVER_IP
```

Update packages:

```bash
apt update
apt upgrade -y
```

Install baseline tools:

```bash
apt install -y \
  git \
  curl \
  ca-certificates \
  ufw \
  unzip
```

Additional packages depend on the selected runtime strategy.

### Server Identity

Set a meaningful hostname:

```bash
hostnamectl set-hostname personal-dashboard
```

Confirm:

```bash
hostnamectl
```

### Timezone

Use UTC for server consistency unless there is a documented reason otherwise:

```bash
timedatectl set-timezone UTC
```

Confirm:

```bash
timedatectl
```

---

## 7. Deployment User

Do not run the application as `root`.

Create a deployment user:

```bash
adduser deploy
```

Grant administrative access where appropriate:

```bash
usermod -aG sudo deploy
```

Create the application directory:

```bash
mkdir -p /srv/personal-dashboard
chown -R deploy:deploy /srv/personal-dashboard
```

Switch to the deployment user:

```bash
su - deploy
```

---

## 8. SSH Configuration

Use SSH keys rather than password-only authentication.

From the local machine:

```bash
ssh-copy-id deploy@SERVER_IP
```

Test access:

```bash
ssh deploy@SERVER_IP
```

After key access is verified, review SSH hardening.

Typical settings in:

```text
/etc/ssh/sshd_config
```

may include:

```text
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Reload SSH safely:

```bash
sudo systemctl reload ssh
```

Important:

- Keep the current session open while testing a second SSH session.
- Do not disable password access before confirming key authentication.
- Do not lock yourself out of the server.

---

## 9. Firewall

Configure UFW:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

Enable it:

```bash
sudo ufw enable
```

Check status:

```bash
sudo ufw status verbose
```

Do not expose internal application ports publicly unless there is a verified need.

PocketBase and API ports should normally be reachable only through the reverse proxy or local network interface.

---

## 10. Domain and DNS

Create DNS records that point to the VPS.

Example:

| Type | Name | Value |
| --- | --- | --- |
| A | dashboard | SERVER_IP |
| A | api.dashboard | SERVER_IP |

A simpler initial deployment may use one domain with path-based routing.

Example:

```text
dashboard.example.com
dashboard.example.com/api
```

Allow time for DNS propagation.

Verify:

```bash
dig dashboard.example.com
```

or:

```bash
nslookup dashboard.example.com
```

---

## 11. Runtime Strategy

Two initial strategies are reasonable.

### Option A: Native Services

Install and run:

- Node.js
- Built frontend
- Express API
- PocketBase
- Nginx or Caddy
- systemd services

Advantages:

- Simple resource usage
- Easy to inspect directly
- Good Linux operations practice

Disadvantages:

- More host-specific configuration
- More manual dependency management

### Option B: Containers

Use:

- Docker
- Docker Compose
- Reverse proxy
- Persistent volumes
- Environment files

Advantages:

- Reproducible service definitions
- Easier environment consistency
- Clear service boundaries

Disadvantages:

- Additional container knowledge required
- Volume and networking mistakes can affect persistence

The final strategy should be documented before production use.

Do not mix strategies without a clear reason.

---

## 12. Repository Setup

As the deployment user:

```bash
cd /srv
git clone git@github.com:rohamcarrion-cloud/personal-dashboard.git
cd personal-dashboard
```

If the repository already exists:

```bash
cd /srv/personal-dashboard
git status
git remote -v
```

Confirm the expected branch:

```bash
git branch --show-current
```

Production deployments should come from a known commit or release.

Record it:

```bash
git rev-parse HEAD
```

---

## 13. Environment Variables

Production secrets must remain outside Git.

Review:

```text
docs/ENVIRONMENT.md
```

Possible storage options include:

- systemd environment files
- Docker secrets
- protected server-side `.env` files
- deployment platform secret storage

Example protected file:

```text
/etc/personal-dashboard/api.env
```

Set ownership and permissions:

```bash
sudo chown root:deploy /etc/personal-dashboard/api.env
sudo chmod 640 /etc/personal-dashboard/api.env
```

Never print complete secret values into logs or shell history.

---

## 14. Build Process

From the repository root:

```bash
npm ci
```

Use `npm ci` for deployment when a valid lockfile exists.

Run validation:

```bash
npm run lint
npm run build
npm run test
```

Only run scripts that are currently defined.

A deployment should stop when required validation fails.

Do not replace a failed build with manually copied local output unless there is a documented emergency procedure.

---

## 15. PocketBase Persistence

PocketBase runtime data must be stored in a persistent location.

Typical runtime content includes:

- SQLite database
- Uploaded files
- Application settings
- Authentication records

Potential persistent path:

```text
/var/lib/personal-dashboard/pocketbase
```

Create it:

```bash
sudo mkdir -p /var/lib/personal-dashboard/pocketbase
sudo chown -R deploy:deploy /var/lib/personal-dashboard/pocketbase
```

Do not store production data inside a temporary container layer or replaceable build directory.

### Migrations

Before deployment:

- Review migration files
- Confirm backup availability
- Test migrations locally
- Understand destructive changes
- Record the deployed commit

Never use a copied development database as the production schema strategy.

---

## 16. Reverse Proxy

A reverse proxy should:

- Terminate HTTPS
- Route traffic
- Restrict internal ports
- Set appropriate headers
- Support request size limits
- Forward client information safely

Possible reverse proxies:

- Nginx
- Caddy
- Traefik

### Example Routing Concept

```text
/       -> web service
/api/   -> Express API
/_/     -> deny or restrict PocketBase admin
```

PocketBase administration should not be publicly exposed without strong controls.

### Important Proxy Settings

Review:

- Host headers
- WebSocket support
- Request body limits
- Timeouts
- Forwarded protocol
- Client IP headers
- Static asset caching
- Security headers

---

## 17. HTTPS

Production traffic should use HTTPS.

Certificates may be managed by:

- Caddy automatically
- Certbot with Nginx
- A trusted reverse proxy service

For Nginx with Certbot, a typical setup may include:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Then:

```bash
sudo certbot --nginx -d dashboard.example.com
```

Verify renewal:

```bash
sudo certbot renew --dry-run
```

Do not deploy authentication, tokens, or private data over unencrypted HTTP.

---

## 18. Process Management

Services must restart after failure and server reboot.

### systemd

Typical services may include:

```text
personal-dashboard-api.service
personal-dashboard-pocketbase.service
```

A service definition should specify:

- Non-root user
- Working directory
- Start command
- Environment file
- Restart policy
- Log behavior

Example concept:

```ini
[Service]
User=deploy
WorkingDirectory=/srv/personal-dashboard/apps/api
EnvironmentFile=/etc/personal-dashboard/api.env
ExecStart=/usr/bin/npm run start
Restart=on-failure
```

The exact command must match the repository.

### Docker Compose

If using containers:

```bash
docker compose up -d
docker compose ps
docker compose logs
```

Ensure persistent volumes and restart policies are configured.

---

## 19. Deployment Procedure

A controlled deployment should follow a repeatable sequence.

### 19.1 Pre-Deployment

- [ ] Confirm approved commit
- [ ] Review changes
- [ ] Confirm backup
- [ ] Verify environment variables
- [ ] Review migrations
- [ ] Confirm rollback target
- [ ] Announce maintenance if required

### 19.2 Update Code

```bash
cd /srv/personal-dashboard
git fetch origin
git checkout main
git pull --ff-only origin main
```

Record:

```bash
git rev-parse HEAD
```

### 19.3 Install and Validate

```bash
npm ci
npm run lint
npm run build
npm run test
```

### 19.4 Apply Migrations

Use the repository’s documented PocketBase migration procedure.

Do not invent migration commands during production deployment.

### 19.5 Restart Services

For systemd:

```bash
sudo systemctl restart personal-dashboard-api
sudo systemctl restart personal-dashboard-pocketbase
```

For containers:

```bash
docker compose up -d --build
```

### 19.6 Verify

Perform the checks in the next section.

---

## 20. Verification

After deployment, verify:

### Infrastructure

- [ ] DNS resolves
- [ ] HTTPS works
- [ ] Certificate is valid
- [ ] Firewall is active
- [ ] Services are running
- [ ] Internal ports are not publicly exposed

### Application

- [ ] Frontend loads
- [ ] API health endpoint responds
- [ ] PocketBase is reachable internally
- [ ] Login works
- [ ] Protected routes remain protected
- [ ] Critical workflows work
- [ ] File access works
- [ ] No unexpected browser console errors

### Operations

- [ ] Logs are available
- [ ] No repeated crash loop
- [ ] Disk usage is acceptable
- [ ] Backup job remains configured
- [ ] Monitoring sees the service

Useful commands:

```bash
systemctl status SERVICE_NAME
journalctl -u SERVICE_NAME --since "10 minutes ago"
curl -I https://dashboard.example.com
```

---

## 21. Updates

Before every update:

- Review the incoming changes
- Confirm compatibility
- Back up persistent data
- Review migrations
- Confirm rollback commit

Prefer:

```bash
git pull --ff-only
```

Avoid editing production source files directly.

If an emergency production edit occurs, reproduce it properly in Git immediately afterward.

---

## 22. Rollback

A rollback restores the previous known-good application version.

### Code Rollback

Identify the previous commit:

```bash
git log --oneline -10
```

Check out the approved rollback commit:

```bash
git checkout COMMIT_SHA
```

Reinstall and rebuild as required:

```bash
npm ci
npm run build
```

Restart services.

### Migration Warning

Application rollback does not automatically reverse database migrations.

Before deploying a migration, determine:

- Whether old code can read the new schema
- Whether the migration is destructive
- Whether rollback requires a data restore
- Whether a forward fix is safer

Do not roll back blindly after schema changes.

---

## 23. Backups

Back up at least:

- PocketBase SQLite data
- Uploaded files
- Environment configuration
- Reverse proxy configuration
- Service definitions
- Deployment documentation

Do not rely on the VPS provider snapshot as the only backup.

### Backup Requirements

Backups should be:

- Automated
- Encrypted
- Timestamped
- Stored off-server
- Retained according to policy
- Monitored
- Tested through restoration

### Example Backup Structure

```text
backups/
└── 2026-07-23/
    ├── pocketbase-data.tar.gz
    ├── config.tar.gz
    └── manifest.txt
```

The actual backup procedure must account for SQLite consistency.

Use a safe method rather than copying an actively written database file without planning.

---

## 24. Restore Testing

A backup is not considered reliable until restored successfully.

A restore test should verify:

- Database opens
- Records exist
- Authentication works
- Uploaded files are available
- Application connects
- Migrations remain consistent
- Permissions are correct

Document:

- Backup used
- Restore date
- Restore environment
- Steps performed
- Problems found
- Final result

Schedule recurring restore exercises after production deployment.

---

## 25. Logs and Monitoring

Monitor:

- Web availability
- API health
- PocketBase health
- Service restarts
- Disk usage
- Memory usage
- CPU usage
- Certificate expiration
- Backup success
- Repeated authentication failures

Logs must not expose:

- Passwords
- Tokens
- API keys
- Session values
- Sensitive personal data

A future production setup should include centralized logging or at least durable, rotated system logs.

---

## 26. Security Checklist

Before production use:

- [ ] Non-root application user
- [ ] SSH key authentication
- [ ] Root login disabled
- [ ] Firewall active
- [ ] Only required ports open
- [ ] HTTPS active
- [ ] Secrets outside Git
- [ ] Strong administrator credentials
- [ ] PocketBase admin access restricted
- [ ] Access rules reviewed
- [ ] CORS restricted
- [ ] Rate limiting enabled
- [ ] Security headers reviewed
- [ ] Dependencies reviewed
- [ ] Backups encrypted
- [ ] Restore tested
- [ ] Logging reviewed
- [ ] Monitoring enabled

Review [SECURITY.md](../SECURITY.md) before production deployment.

---

## 27. Incident Response

When a security or availability incident occurs:

1. Confirm the incident.
2. Preserve logs and evidence.
3. Limit further impact.
4. Rotate exposed credentials.
5. Restore service safely.
6. Identify the root cause.
7. Document the timeline.
8. Implement corrective action.
9. Add tests or monitoring where practical.
10. Update documentation.

Do not destroy evidence during cleanup.

---

## 28. Disaster Recovery

A disaster recovery plan should define:

- Maximum acceptable data loss
- Maximum acceptable downtime
- Backup frequency
- Backup retention
- Restore location
- Required credentials
- Responsible operator
- DNS recovery
- Server replacement
- Communication process

A practical recovery sequence may be:

1. Provision replacement server.
2. Apply baseline hardening.
3. Restore repository and configuration.
4. Restore persistent data.
5. Restore reverse proxy.
6. Restore environment variables.
7. Start services.
8. Verify functionality.
9. Update DNS if needed.
10. Monitor closely.

---

## 29. Planned Improvements

Future deployment work may include:

- Docker and Docker Compose
- Automated CI/CD
- Staging environment
- Release tags
- Automated rollback
- Blue-green deployment
- Centralized logging
- Uptime monitoring
- Error tracking
- Backup verification automation
- Infrastructure as code
- Managed object storage
- Production database migration
- Multi-server deployment

These items are planned unless implemented and verified elsewhere.

---

## 30. Related Documentation

- [README.md](../README.md)
- [ARCHITECTURE.md](../ARCHITECTURE.md)
- [SECURITY.md](../SECURITY.md)
- [ROADMAP.md](../ROADMAP.md)
- [DEVELOPMENT.md](DEVELOPMENT.md)
- [ENVIRONMENT.md](ENVIRONMENT.md)

---

## Final Deployment Standard

A deployment is complete when:

- The correct version is running
- HTTPS is active
- Secrets are protected
- Data persists
- Services restart safely
- Logs are available
- Monitoring works
- Backups succeed
- Restore has been tested
- Rollback is understood
- Documentation matches reality

> Deploy deliberately.  
> Verify every layer.  
> Protect persistent data.  
> Prepare for failure before failure occurs.
