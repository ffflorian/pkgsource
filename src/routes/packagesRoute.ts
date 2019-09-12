import * as express from 'express';
import packageJson = require('package-json');
const validatePackageName = require('validate-npm-package-name');

import {getLogger, parseRepository, validateUrl} from '../utils';

const logger = getLogger('pkgsource/mainRoute');
const router = express.Router();
const packageNameRegex = new RegExp('^\\/((?:@[^@/]+/)?[^@/]+)(?:@([^@/]+))?\\/?$');

export const packagesRoute = () => {
  return router.get(packageNameRegex, async (req, res) => {
    let packageInfo;
    let redirectSite = '';

    const packageName = req.params[0];
    const version = req.params[1] || 'latest';

    logger.info(`Got request for package "${packageName}" (version "${version}").`);

    const validateResult = validatePackageName(packageName);

    if (!validateResult.validForNewPackages) {
      logger.info(`Invalid package name: "${packageName}"`, validateResult);

      return res.status(422).json({
        code: 422,
        message: 'Invalid package name',
      });
    }

    try {
      packageInfo = await packageJson(packageName, {fullMetadata: true, version});
    } catch (error) {
      if (error instanceof packageJson.VersionNotFoundError) {
        logger.info(`Version "${version}" not found for package "${packageName}".`);
        return res.status(404).json({
          code: 404,
          message: 'Version not found',
        });
      }

      if (error instanceof packageJson.PackageNotFoundError) {
        logger.info(`Package "${packageName}" not found.`);
        return res.status(404).json({
          code: 404,
          message: 'Package not found',
        });
      }

      logger.error(error);

      return res.status(500).json({
        code: 500,
        message: 'Internal server error',
      });
    }

    const parsedRepository = !!packageInfo.repository && parseRepository(packageInfo.repository);

    if (parsedRepository) {
      logger.info(`Found repository "${parsedRepository}" for package "${packageName}" (version "${version}").`);
      redirectSite = parsedRepository;
    } else if (!!packageInfo.homepage && typeof packageInfo.homepage === 'string') {
      logger.info(`Found homepage "${packageInfo.homepage}" for package "${packageName}" (version "${version}").`);
      redirectSite = packageInfo.homepage;
    } else if (!!packageInfo.url && typeof packageInfo.url === 'string') {
      logger.info(`Found URL "${packageInfo.url}" for package "${packageName}" (version "${version}").`);
      redirectSite = packageInfo.url;
    }

    const urlIsValid = validateUrl(redirectSite);

    if (redirectSite && urlIsValid) {
      if ('raw' in req.query) {
        return res.json({
          code: 200,
          url: redirectSite,
        });
      }
      logger.info(`Redirecting package "${packageName}" to "${redirectSite}" ...`);
      return res.redirect(redirectSite);
    } else if (!urlIsValid) {
      logger.info(`Invalid URL "${redirectSite}" for package "${packageName}".`);
    }

    logger.info(`No source URL found in package "${packageName}".`);

    return res.status(404).json({
      code: 404,
      message: `No source URL found. Please visit https://www.npmjs.com/package/${packageName}.`,
    });
  });
};
