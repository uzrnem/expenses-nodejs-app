FROM node:16-alpine3.14

ENV NODE_ENV=production

# Create app directory
WORKDIR /app

COPY package*.json /app/

COPY config.docker.js /app/env.js

RUN npm install

# Bundle app source
COPY . /app

EXPOSE 9000

CMD [ "node", "server.js" ]