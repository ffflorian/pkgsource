# pkgsource [![Build Status](https://action-badges.now.sh/ffflorian/pkgsource)](https://github.com/ffflorian/pkgsource/actions/) [![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=ffflorian/pkgsource)](https://dependabot.com)

Find (almost) every npm package's repository in an instant.

## Usage

Visit `pkgsource.xyz/{packageName}` in your web browser, e.g. [`pkgsource.xyz/nock`](https://pkgsource.xyz/nock).

### Get the repository for a specific version

**Note**: this doesn't mean you will get the exact source for the specific version, instead you will be redirected to the package's repository. If you need the source code for the exact version, please use [unpkg](https://unpkg.com).

Visit `pkgsource.xyz/{packageName}@{version}` in your web browser, e.g. [`pkgsource.xyz/lodash@4.17.15`](https://pkgsource.xyz/lodash@4.17.15). This also works with npm tags, e.g. [`pkgsource.xyz/typescript@beta`](https://pkgsource.xyz/typescript@beta)

If no version is specified, the latest version is assumed.

### Get the raw data

Visit `pkgsource.xyz/{packageName}?raw` in your web browser, e.g. [`pkgsource.xyz/commander?raw`](https://pkgsource.xyz/commander?raw).

## Server usage

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
