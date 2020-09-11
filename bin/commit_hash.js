#!/usr/bin/env node

const {promisify} = require('util');
const path = require('path');
const {exec} = require('child_process');

const fs = require('fs-extra');
const execAsync = promisify(exec);

const commitHashFile = path.join(__dirname, '../commit');

void (async () => {
  try {
    const {stderr, stdout} = await execAsync('git rev-parse HEAD');
    if (stderr) {
      console.error(stderr);
    }
    if (stdout) {
      return fs.writeFile(commitHashFile, stdout.trim(), 'utf-8');
    }
  } catch (error) {
    console.error(error);
  }
})();
