#!/usr/bin/env node

import * as commander from 'commander';
import * as fs from 'fs';
import * as logdown from 'logdown';
import * as path from 'path';

import {ApproverConfig, AutoApprover} from './AutoApprover';

const logger = logdown('auto-approver', {
  logger: console,
  markdown: false,
});
logger.state.isEnabled = true;

const defaultPackageJsonPath = path.join(__dirname, 'package.json');
const packageJsonPath = fs.existsSync(defaultPackageJsonPath)
  ? defaultPackageJsonPath
  : path.join(__dirname, '../package.json');

const {bin, description, version} = require(packageJsonPath);

commander
  .name(Object.keys(bin)[0])
  .description(description)
  .option('-c, --config <path>', 'specify a configuration file (default: .approverrc.json)')
  .version(version)
  .parse(process.argv);

const configExplorer = cosmiconfigSync('approver');
const configResult = commander.config ? configExplorer.load(commander.config) : configExplorer.search();

if (!configResult || configResult.isEmpty) {
  logger.error('No valid configuration file found.');
  commander.help();
}

const configFileData = configResult.config as ApproverConfig;

logger.info('Found the following repositories to check:', configFileData.projects.gitHub);
input.question('ℹ️  auto-approver Which branch would you like to approve? ', answer => {
  new AutoApprover(configFileData)
    .approveAllByMatch(new RegExp(answer))
    .then(() => process.exit())
    .catch(error => logger.error(error));
});
