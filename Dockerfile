FROM node:14-slim

RUN apt-get update \
    && apt-get -y install git \
    && rm -rf /var/lib/apt/lists/*

ADD bin /etc/scripts

EXPOSE 4000

CMD [ "/etc/scripts/start.sh" ]
