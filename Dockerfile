# Build
FROM node:26.13.1-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS builder

ENV NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR /app

# hadolint ignore=DL3018
RUN apk add --no-cache yarn

# Copy only essential files for dependency installation
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/

RUN yarn install --immutable && yarn cache clean

# Copy source code
COPY tsconfig.json ./
COPY src/ src/

RUN yarn build && test -f dist/index.js

# Keep only production dependencies for the runtime image
RUN yarn workspaces focus --all --production && yarn cache clean

# Run
FROM node:26.13.1-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5

ARG COMMIT
ARG VERSION
ENV NODE_ENV=production
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NODE_DEBUG="pkgsource/*"
ENV COMMIT=${COMMIT}
ENV VERSION=${VERSION}

WORKDIR /app

# Do not install yarn here: Alpine's yarn package pulls in Alpine's own nodejs
RUN chown node:node /app

# Copy built application from builder
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./

EXPOSE 3000

CMD ["node", "dist/index.js"]
