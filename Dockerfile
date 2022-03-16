FROM node:16-slim

RUN apt-get update \
    && apt-get -y install git procps \
    && rm -rf /var/lib/apt/lists/*

ADD bin /etc/scripts

ENV PORT=4000

EXPOSE ${PORT}

CMD [ "/etc/scripts/start.sh" ]
