FROM node:26.2.0-alpine@sha256:7c6af15abe4e3de859690e7db171d0d711bf37d27528eddfe625b2fe89e097f8

ENV NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR /app

# hadolint ignore=DL3018
RUN apk add --no-cache curl

COPY --chown=node:node . ./

RUN npm install --global yarn@1.22.22
# hadolint ignore=DL3059
RUN yarn install --immutable && yarn cache clean
# hadolint ignore=DL3059
RUN yarn build

EXPOSE 3000

USER node

CMD ["yarn", "start"]
