## Project Overview

pkgsource redirects npm package names to their source repository. It is a NestJS application served on Vercel.

## Architecture

- **Framework:** NestJS (CommonJS) with `@nestjs/platform-express`
- **Entry point:** `src/index.ts` → `src/Server.ts` (`createApp` / `startServer`)
- **Controllers:** `src/controllers/` (health, info, main, packages)
- **Exception filter:** `src/filters/all-exceptions.filter.ts`
- **Vercel handler:** `api/vercel.ts` (Promise-based lazy init)

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

Query parameters supported on package routes: `?raw` (return JSON instead of redirect), `?unpkg` (redirect to unpkg.com instead).

## Commands

```bash
yarn build          # compile TypeScript → dist/
yarn start          # node dist/src/index.js
yarn start:dev      # tsx src/index.ts (with NODE_DEBUG)
yarn lint           # oxlint + eslint
yarn fix            # auto-fix lint issues + prettier
```

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
