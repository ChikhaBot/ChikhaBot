FROM tarampampam/node:16.8-alpine

RUN npm install pm2 -g
RUN apk update \
    && apk add --no-cache libsodium-dev

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
COPY ecosystem.config.js ./

RUN yarn install --non-interactive

COPY ./dist ./dist

CMD ["pm2-runtime", "start", "ecosystem.config.js"]