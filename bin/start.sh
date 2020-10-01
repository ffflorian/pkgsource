#!/usr/bin/env bash

export NODE_DEBUG="pkgsource/*"

git clone https://github.com/ffflorian/pkgsource.git /pkgsource --depth 1

cd /pkgsource

yarn
yarn dist

yarn start
npx pm2 logs
