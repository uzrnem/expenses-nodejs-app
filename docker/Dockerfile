FROM node:16-alpine3.14

ENV NODE_ENV=production

# Create app directory
WORKDIR /app

COPY package.json package.json

RUN npm install

COPY docker/config.docker.js env.js
COPY server.js server.js
COPY public public
COPY src src

EXPOSE 9000

CMD [ "node", "server.js" ]