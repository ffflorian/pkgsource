# pkgsource [![Build Status](https://github.com/ffflorian/pkgsource/workflows/Build/badge.svg)](https://github.com/ffflorian/pkgsource/actions/) [![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=ffflorian/pkgsource)](https://dependabot.com)

Find (almost) every npm package's repository in an instant.

## Usage

Visit `pkgsource.xyz/{packageName}` in your web browser, e.g. [`pkgsource.xyz/nock`](https://pkgsource.xyz/nock).

### Get the repository for a specific version

Visit `pkgsource.xyz/{packageName}@{version}` in your web browser, e.g. [`pkgsource.xyz/lodash@4.17.15`](https://pkgsource.xyz/lodash@4.17.15). This also works with npm tags, e.g. [`pkgsource.xyz/typescript@beta`](https://pkgsource.xyz/typescript@beta)

If no version is specified, the latest version is assumed.

### Get the raw data

Visit `pkgsource.xyz/{packageName}?raw` in your web browser, e.g. [`pkgsource.xyz/commander?raw`](https://pkgsource.xyz/commander?raw).

### Get source code for a specific version

Visit `pkgsource.xyz/{packageName}?unpkg` in your web browser, e.g. [`pkgsource.xyz/express@4.17.1?unpkg`](https://pkgsource.xyz/express@4.17.1?unpkg). You can use the same features (`raw`, version, tags) as mentioned above.

## Server usage

### Docker

```
docker run -p 4000:4000 ffflorian/pkgsource
```

### Local

Prerequisites:

- [Node.js](https://nodejs.org) >= 10.9
- [yarn](https://yarnpkg.com)

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

Open [`/_swagger-ui`](https://pkgsource.xyz/_swagger-ui) in the browser to try it out.
