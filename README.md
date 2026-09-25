# Loki Code — Frontend

Qwik City (SSR) frontend for [Loki Code](https://lokicode.io) — a smart contract
development platform.

> **Backend repo:** [loki-code-v2/loki-backend](https://github.com/loki-code-v2/loki-backend) — NestJS API this app consumes.

## Stack

- [Qwik City](https://qwik.dev) + Shoelace web components + Vite
- Clerk (`@clerk/clerk-js`) for authentication
- Highlight.js with Solidity grammar for code viewing
- Express server adapter (`npm run build` produces `server/entry.express.js`)

## Setup

1. `npm install`
2. `cp .env.example .env` and fill in values
3. `npm run dev` (dev server) or `npm run build && node server/entry.express.js` (prod build)

> **Note:** `VITE_*` variables are inlined at build time. When deploying with Docker,
> each `VITE_*` variable must also be declared as an `ARG` in the Dockerfile.

## Features

- GitHub-connected project workspace: browse repo files and branches
- In-browser Solidity compilation (files with `import` statements are rejected —
  use deploy requests for those)
- Deployment history: GitHub Action artifacts, in-app compilations, and API deploy requests
- Organizations with seat-based Stripe billing and member invitations
- Project API keys for the deploy-request API

## License

[MIT](LICENSE)
