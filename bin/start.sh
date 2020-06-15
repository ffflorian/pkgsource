#!/usr/bin/env bash

export NODE_DEBUG="pkgsource/*"

git clone https://github.com/ffflorian/pkgsource.git /home/node/app --depth 1

cd /home/node/app

yarn
yarn dist

yarn start
