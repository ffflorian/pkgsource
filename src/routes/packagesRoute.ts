import * as express from 'express';
import * as logdown from 'logdown';
import packageJson = require('package-json');

const logger = logdown('pkgsource/mainRoute', {
  logger: console,
  markdown: false,
});

const router = express.Router();

export const packagesRoute = () => {
  return router.get(/^\/((?:@[^@/]+\/)?[^@/]+)(?:@([^@/]+))?\/?$/, async (req, res) => {
    let redirectSite = '';

    const packageName = req.params[0];
    const version = req.params[1] || 'latest';

    try {
      const info = await packageJson(packageName, {fullMetadata: true, version});
      if (info.homepage) {
        logger.info(`Found homepage "${info.homepage}" for "${packageName}".`);
        redirectSite = info.homepage;
      } else if (info.repository) {
        if (typeof info.repository === 'string') {
          logger.info(`Found repository "${info.repository}" for "${packageName}".`);
          redirectSite = info.repository;
        } else if (info.repository.url) {
          logger.info(`Found repository URL "${info.repository.url}" for "${packageName}".`);
          redirectSite = info.repository.url;
        }
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
      logger.info(`Redirecting to "${redirectSite}" ...`);
      return res.redirect(redirectSite);
    }

    return res.status(404).json({
      code: 404,
      message: 'No source link found',
    });
  });
};
