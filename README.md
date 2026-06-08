# pkgsource [![Lint, test, and publish](https://github.com/ffflorian/pkgsource/actions/workflows/lint_test_publish.yml/badge.svg)](https://github.com/ffflorian/pkgsource/actions/workflows/lint_test_publish.yml)

Redirect any npm package name to its source repository in one request.

When you visit `pkgsource.ffflorian.dev/<packageName>`, the server fetches the package metadata from the npm registry, extracts the `repository`, `homepage`, or `url` field, normalizes the URL (handling `git+`, `git://`, and `ssh://` variants), and issues an HTTP redirect to the resolved source.

## Usage

Visit `pkgsource.ffflorian.dev/{packageName}` in your browser, e.g. [`pkgsource.ffflorian.dev/nock`](https://pkgsource.ffflorian.dev/nock).

### Scoped packages

Visit `pkgsource.ffflorian.dev/{@scope}/{packageName}`, e.g. [`pkgsource.ffflorian.dev/@nestjs/core`](https://pkgsource.ffflorian.dev/@nestjs/core).

### Specific version or tag

Append `@{version}` to the package name, e.g.:

- [`pkgsource.ffflorian.dev/lodash@4.17.15`](https://pkgsource.ffflorian.dev/lodash@4.17.15)
- [`pkgsource.ffflorian.dev/typescript@beta`](https://pkgsource.ffflorian.dev/typescript@beta)

If no version is specified, the latest version is used.

### Raw JSON response

Add `?raw` to get a JSON response instead of a redirect, e.g. [`pkgsource.ffflorian.dev/commander?raw`](https://pkgsource.ffflorian.dev/commander?raw).

```json
{"code": 200, "url": "https://github.com/tj/commander.js"}
```

### Browse source on unpkg

Add `?unpkg` to redirect to the package's file tree on [unpkg.com](https://unpkg.com), e.g. [`pkgsource.ffflorian.dev/express@4.17.1?unpkg`](https://pkgsource.ffflorian.dev/express@4.17.1?unpkg). Combine with `?raw` to get the unpkg URL as JSON.

## Running locally

Prerequisites:

- [Node.js](https://nodejs.org) >= 26
- [Yarn](https://yarnpkg.com) >= 4

### Development mode

```
yarn
yarn start:dev
```

### Production mode

```
yarn
yarn dist
yarn start:prod
```

### Swagger UI

Open [`/_swagger-ui`](https://pkgsource.ffflorian.dev/_swagger-ui) in the browser to explore the API interactively.

## Docker

The image is published to the GitHub Container Registry.

### Pull and run

```bash
docker pull ghcr.io/ffflorian/pkgsource:latest
docker run -p 3000:3000 ghcr.io/ffflorian/pkgsource:latest
```

The server listens on port 3000. Visit `http://localhost:3000/<packageName>` to use it.

### Build locally

```bash
docker build -t pkgsource .
docker run -p 3000:3000 pkgsource
```
