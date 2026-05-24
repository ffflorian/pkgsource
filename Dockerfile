FROM node:26.2.0-alpine@sha256:7c6af15abe4e3de859690e7db171d0d711bf37d27528eddfe625b2fe89e097f8

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
