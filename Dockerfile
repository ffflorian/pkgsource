FROM node:26.1.0-alpine@sha256:e71ac5e964b9201072425d59d2e876359efa25dc96bb1768cb73295728d6e4ea

ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# Set working directory
WORKDIR /app

RUN apk add --no-cache curl

# Copy needed files
COPY --chown=node:node . ./

RUN npm install --global yarn@1.22.22

# Install dependencies
RUN yarn install --immutable

# Build the backend
RUN yarn build

# Expose the port
EXPOSE 3000

USER node

# Start the application
CMD ["yarn", "start"]
