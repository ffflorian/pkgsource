const path = require('path');

module.exports = {
  apps: [
    {
      env: {
        LOG_ERROR: path.join(__filename, 'logs/pkgsource-error.log'),
        LOG_OUTPUT: path.join(__filename, 'logs/pkgsource-out.log'),
        NODE_DEBUG: 'pkgsource/*',
      },
      name: 'pkgsource',
      script: 'dist/index.js',
    },
  ],
};
