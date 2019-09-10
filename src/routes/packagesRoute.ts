import * as express from 'express';
import * as logdown from 'logdown';
import packageJson = require('package-json');
import {parseRepository} from '../utils';

const logger = logdown('pkgsource/mainRoute', {
  logger: console,
  markdown: false,
});

const router = express.Router();

const packageNameRegex = new RegExp('^\\/((?:@[^@/]+/)?[^@/]+)(?:@([^@/]+))?\\/?$');

export const packagesRoute = () => {
  return router.get(packageNameRegex, async (req, res) => {
    let redirectSite = '';

    const packageName = req.params[0];
    const version = req.params[1] || 'latest';

    logger.info(`Got request for package "${packageName}" (version "${version}").`);

    try {
      const info = await packageJson(packageName, {fullMetadata: true, version});
      const parsedRepository = !!info.repository && parseRepository(info.repository);
      if (parsedRepository) {
        logger.info(`Found repository "${parsedRepository}" for "${packageName}" (version "${version}").`);
        redirectSite = parsedRepository;
      } else if (info.homepage) {
        logger.info(`Found homepage "${info.homepage}" for "${packageName}" (version "${version}").`);
        redirectSite = info.homepage;
      }
    } catch (error) {
      if (error instanceof packageJson.VersionNotFoundError) {
        return res.status(404).json({
          code: 404,
          message: 'Version not found',
        });
      }

      if (error instanceof packageJson.PackageNotFoundError) {
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

    if (redirectSite) {
      if ('raw' in req.query) {
        return res.contentType('text/plain; charset=UTF-8').send(redirectSite);
      }
      logger.info(`Redirecting to "${redirectSite}" ...`);
      return res.redirect(redirectSite);
    }

    return res.status(404).json({
      code: 404,
      message: 'No source link found',
    });
  });
};
