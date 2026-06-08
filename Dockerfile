# Build
FROM node:26.2.0-alpine@sha256:7c6af15abe4e3de859690e7db171d0d711bf37d27528eddfe625b2fe89e097f8 AS builder

ENV NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR /app

# hadolint ignore=DL3018
RUN apk add --no-cache curl yarn

# Copy only essential files for dependency installation
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/

RUN yarn install --immutable && yarn cache clean

# Copy source code
COPY tsconfig.json ./
COPY src/ src/

RUN yarn build

# Run
FROM node:26.2.0-alpine@sha256:7c6af15abe4e3de859690e7db171d0d711bf37d27528eddfe625b2fe89e097f8

ARG COMMIT
ARG VERSION
ENV NODE_ENV=production
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NODE_DEBUG="pkgsource/*"
ENV COMMIT=${COMMIT}
ENV VERSION=${VERSION}

WORKDIR /app

# hadolint ignore=DL3018
RUN apk add --no-cache yarn && chown node:node /app

# Copy built application from builder
COPY --from=builder --chown node:node /app/dist ./dist
COPY --from=builder --chown node:node /app/node_modules ./node_modules
COPY --from=builder --chown node:node /app/.yarn ./.yarn
COPY --from=builder --chown node:node /app/package.json /app/yarn.lock /app/.yarnrc.yml ./

RUN yarn install --immutable && yarn cache clean

EXPOSE 3000

CMD ["yarn", "start:prod"]
