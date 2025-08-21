# pkgsource [![Build Status](https://github.com/ffflorian/pkgsource/workflows/Build/badge.svg)](https://github.com/ffflorian/pkgsource/actions/)

Find (almost) every npm package's repository in an instant.

## Usage

Visit `pkgsource.ffflorian.dev/{packageName}` in your web browser, e.g. [`pkgsource.ffflorian.dev/nock`](https://pkgsource.ffflorian.dev/nock).

### Get the repository for a specific version

Visit `pkgsource.ffflorian.dev/{packageName}@{version}` in your web browser, e.g. [`pkgsource.ffflorian.dev/lodash@4.17.15`](https://pkgsource.ffflorian.dev/lodash@4.17.15). This also works with npm tags, e.g. [`pkgsource.ffflorian.dev/typescript@beta`](https://pkgsource.ffflorian.dev/typescript@beta)

If no version is specified, the latest version is assumed.

### Get the raw data

Visit `pkgsource.ffflorian.dev/{packageName}?raw` in your web browser, e.g. [`pkgsource.ffflorian.dev/commander?raw`](https://pkgsource.ffflorian.dev/commander?raw).

### Get source code for a specific version

Visit `pkgsource.ffflorian.dev/{packageName}?unpkg` in your web browser, e.g. [`pkgsource.ffflorian.dev/express@4.17.1?unpkg`](https://pkgsource.ffflorian.dev/express@4.17.1?unpkg). You can use the same features (`raw`, version, tags) as mentioned above.

## Server usage

### Docker

```
docker run -p 4000:4000 ffflorian/pkgsource
```

### Local

Prerequisites:

- [Node.js](https://nodejs.org) >= 20
- [yarn](https://yarnpkg.com) >= 3.5.0

### Start the server in development mode

```
yarn
yarn start:dev
```

### Start the server in production mode

```
yarn
yarn dist
yarn start
```

### Swagger UI

Open [`/_swagger-ui`](https://pkgsource.ffflorian.dev/_swagger-ui) in the browser to try it out.
