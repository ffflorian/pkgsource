#!/usr/bin/env bash

export NODE_DEBUG="pkgsource/*"

git clone https://github.com/ffflorian/pkgsource.git /app --depth 1

cd /app

yarn
yarn dist

yarn start
