const path = require('path');

module.exports = {
  apps: [
    {
      env: {
        NODE_DEBUG: 'pkgsource/*',
      },
      error_file: path.join(__dirname, 'logs/pkgsource-error.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      name: 'pkgsource',
      out_file: path.join(__dirname, 'logs/pkgsource-out.log'),
      script: 'dist/index.js',
    },
  ],
};
