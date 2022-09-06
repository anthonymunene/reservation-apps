FROM node:17-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY public ./public
COPY src ./src
COPY prisma ./prisma
COPY test ./test
COPY .env ./
COPY nodemon.json ./
COPY config ./config


RUN npm install

EXPOSE 3030

