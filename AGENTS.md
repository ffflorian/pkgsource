# AGENTS Guide

This file explains how coding agents should work in this repository.

## General

### Approach

- Think before acting. Read existing files before writing code.
- Be concise in output but thorough in reasoning.
- Prefer editing over rewriting whole files.
- Do not re-read files you have already read.
- Test your code before declaring done.
- No sycophantic openers or closing fluff.
- Keep solutions simple and direct.
- User instructions always override this file.

### Output

- Return code first. Explanation after, only if non-obvious.
- No inline prose. Use comments sparingly - only where logic is unclear.
- No boilerplate unless explicitly requested.

### Code Rules

- Simplest working solution. No over-engineering.
- No abstractions for single-use operations.
- No speculative features or "you might also want..."
- Read the file before modifying it. Never edit blind.
- No docstrings or type annotations on code not being changed.
- No error handling for scenarios that cannot happen.
- Three similar lines is better than a premature abstraction.

### Review Rules

- State the bug. Show the fix. Stop.
- No suggestions beyond the scope of the review.
- No compliments on the code before or after the review.

### Debugging Rules

- Never speculate about a bug without reading the relevant code first.
- State what you found, where, and the fix. One pass.
- If cause is unclear: say so. Do not guess.

### Simple Formatting

- No em dashes, smart quotes, or decorative Unicode symbols.
- Plain hyphens and straight quotes only.
- Natural language characters (accented letters, CJK, etc.) are fine when the content requires them.
- Code output must be copy-paste safe.

## Project Overview

pkgsource redirects npm package names to their source repository. It is a NestJS application that is shipped as a Docker image and deployed via Coolify.

## Runtime & Deployment

- **Runtime:** Node.js 26 + Yarn 4
- **Container:** Multi-stage Docker build (`Dockerfile`)
- **Distribution:** GitHub Container Registry image (no npm package release)
- **Deploy target:** Coolify (`lint_test_publish.yml` deploy job)

## Architecture

- **Framework:** NestJS (ESM) with `@nestjs/platform-express`
- **Entry point:** `src/index.ts` → `src/Server.ts` (`createApp` / `startServer`)
- **Controllers:** `src/controllers/` (health, info, main, packages)
- **Exception filter:** `src/filters/all-exceptions.filter.ts`
- **Security middleware:** `helmet` + in-memory request rate limiting in `src/Server.ts`
- **Tests:** Vitest tests in `test/`
- **Swagger:** Generated at runtime and served at `/_swagger-ui`

## API

| Route              | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| `GET /`            | Redirects to the pkgsource GitHub repo                           |
| `GET /_health`     | Health check — returns `OK`                                      |
| `GET /_info`       | Returns `{"code":200,"version":"<semver>"}`                      |
| `GET /:pkg`        | Redirects to the source repo for an npm package                  |
| `GET /:scope/:pkg` | Redirects to the source repo for a scoped package (`@scope/pkg`) |
| `GET /robots.txt`  | Returns `User-agent: *\nDisallow: /`                             |
| `GET /favicon.ico` | Returns 404                                                      |
| `GET /_swagger-ui` | Swagger UI                                                       |

Query parameters supported on package routes: `?raw` (return JSON instead of redirect), `?unpkg` (redirect to unpkg.com instead). Versioned requests are supported via `name@version` and scoped forms like `@scope/name@version`.

## Commands

```bash
yarn build          # compile TypeScript → dist/
yarn dist           # clean + build + write commit hash file
yarn start          # run app from source with tsx
yarn start:dev      # start + NODE_DEBUG
yarn start:prod     # node dist/src/index.js
yarn lint           # oxlint + eslint
yarn test           # run Vitest test suite
yarn fix            # auto-fix lint issues + prettier
```

## CI/CD

- `lint_test_publish.yml` runs TypeScript lint/test/build and Dockerfile linting on pushes and PRs.
- On `main`, the publish job creates releases and publishes Docker images.
- Deploy is triggered from the same workflow after a new release, or manually via workflow dispatch.

## Approach

- Think before acting. Read existing files before writing code.
- Be concise in output but thorough in reasoning.
- Prefer editing over rewriting whole files.
- Do not re-read files you have already read unless the file may have changed.
- Test your code before declaring done.
- No sycophantic openers or closing fluff.
- Keep solutions simple and direct. No over-engineering.
- If unsure: say so. Never guess or invent file paths.
- User instructions always override this file.

## Efficiency

- Read before writing. Understand the problem before coding.
- No redundant file reads. Read each file once.
- One focused coding pass. Avoid write-delete-rewrite cycles.
- Test once, fix if needed, verify once. No unnecessary iterations.
- Budget: 50 tool calls maximum. Work efficiently.
