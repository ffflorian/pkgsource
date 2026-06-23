# Build
FROM node:26.3.1-alpine@sha256:a2dc166a387cc6ca1e62d0c8e265e49ca985d6e60abc9fe6e6c3d6ce8e63f606 AS builder

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

RUN yarn build

# Run
FROM node:26.3.1-alpine@sha256:a2dc166a387cc6ca1e62d0c8e265e49ca985d6e60abc9fe6e6c3d6ce8e63f606

ARG COMMIT
ARG VERSION
ENV NODE_ENV=production
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NODE_DEBUG="pkgsource/*"
ENV COMMIT=${COMMIT}
ENV VERSION=${VERSION}

WORKDIR /app

# hadolint ignore=DL3018
RUN apk add --no-cache curl yarn && chown node:node /app

# Copy built application from builder
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.yarn ./.yarn
COPY --from=builder --chown=node:node /app/package.json /app/yarn.lock /app/.yarnrc.yml ./

RUN yarn install --immutable && yarn cache clean

EXPOSE 3000

CMD ["yarn", "start:prod"]
