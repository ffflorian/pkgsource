import * as fs from 'fs';
import * as path from 'path';

import {RepositoryParser} from './RepositoryParser';

const defaultPackageJsonPath = path.join(__dirname, 'package.json');
const packageJsonPath = fs.existsSync(defaultPackageJsonPath)
  ? defaultPackageJsonPath
  : path.join(__dirname, '../package.json');

export const {repository: repositoryURL} = require(packageJsonPath);

const packageNameRegex = new RegExp('^\\/((?:@[^@/]+/)?[^@/]+)(?:@([^@/]+))?\\/?$');
export const unpkgBase = 'https://unpkg.com/browse';

export async function parseLibrary(rawPackageName?: string, getUnpkgLink?: boolean): Promise<string> {
  if (typeof rawPackageName === 'undefined') {
    rawPackageName = repositoryURL;
  }

  if (getUnpkgLink || (typeof rawPackageName === 'boolean' && rawPackageName === true)) {
    return  `${unpkgBase}/${rawPackageName}@${version}/`;
  }

  const parseResult = await RepositoryParser.getPackageUrl(packageName, version);
}
