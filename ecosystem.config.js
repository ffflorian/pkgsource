module.exports = {
  apps: [
    {
      env: {
        LOG_ERROR: `${process.env.HOME}/.pm2/logs/pkgsource-error.log`,
        LOG_OUTPUT: `${process.env.HOME}/.pm2/logs/pkgsource-out.log`,
        NODE_DEBUG: 'pkgsource/*',
      },
      name: 'pkgsource',
      script: 'dist/index.js',
    },
  ],
};
