FROM node:16

WORKDIR /usr/src/app

COPY ./package*.json ./

RUN npm install

COPY . .

USER root
EXPOSE 53/udp
CMD [ "node", "resolver/server.js" ]