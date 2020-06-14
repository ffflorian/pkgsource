FROM node:14-slim

RUN apt update \
    && apt -y install git

RUN mkdir -p /home/node/app
RUN chown -R node:node /home/node/app

WORKDIR /home/node/app
USER node

RUN git clone https://github.com/ffflorian/pkgsource.git . --depth 1

RUN yarn

EXPOSE 4000

CMD [ "yarn", "start:dev" ]
