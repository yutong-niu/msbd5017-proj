FROM node:16

WORKDIR /usr/src/app

COPY ./package*.json ./

RUN npm install

COPY . .

USER root
EXPOSE 3000
CMD [ "npm", "run", "dev" ]