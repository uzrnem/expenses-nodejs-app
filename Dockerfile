FROM node:16-alpine3.14

ENV NODE_ENV=production

# Create app directory
WORKDIR /app

COPY package.json package.json

RUN npm install

COPY config.docker.js env.js

# Bundle app source
COPY . .

EXPOSE 9000

CMD [ "node", "server.js" ]