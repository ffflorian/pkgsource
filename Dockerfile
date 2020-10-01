FROM node:14-slim

RUN apt-get update \
    && apt-get -y install git \
    && rm -rf /var/lib/apt/lists/*

ADD bin /etc/scripts

ENV PORT=4000

EXPOSE ${PORT}

CMD [ "/etc/scripts/start.sh" ]
