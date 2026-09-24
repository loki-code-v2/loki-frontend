# Security Policy

## Reporting a vulnerability

Please report vulnerabilities privately via GitHub Security Advisories
("Report a vulnerability" button on this repository's Security tab).

Do NOT open public issues for security problems.

## Scope

- Secrets/credentials: this project loads all secrets from environment variables.
  Never commit `.env`, `*.pem`, or API keys. Use `.env.example` as the template.
- The deploy-request API authenticates via per-project API keys (`loki_...`).

## Supported versions

Only the latest `main` branch is supported.
