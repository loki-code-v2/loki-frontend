# build-stamp: 2026-09-24 files-route-revival (bust stale image cache)
# Stage 1: Build the application
FROM node:20 AS builder

WORKDIR /usr/src/app

COPY . .

# Vite inlines VITE_* variables at build time. Railway only passes service
# variables into Dockerfile builds for ARGs declared here, so without these
# the client bundle bakes `undefined` for every VITE_* value.
ARG VITE_LOKI_API_URL
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_GITHUB_APP_URL
ARG VITE_GITHUB_APP_INSTALLATION_CALLBACK_URL
ARG VITE_ENVIRONMENT

RUN npm install && npm run build

# Stage 2: Serve the application
FROM node:20-slim

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/server ./server
COPY --from=builder /usr/src/app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "server/entry.express.js"]
