# BUILDER

FROM node:17-alpine3.12 AS leaderboard-api-history-tools-builder

ARG GITHUB_TOKEN
ENV GITHUB_TOKEN=${GITHUB_TOKEN}

RUN apk add --no-cache --virtual build-dependencies python2 g++ make

RUN apk add curl

RUN mkdir -p /var/history-tools

WORKDIR /var/history-tools

ADD scripts /var/history-tools/scripts
ADD src /var/history-tools/src

COPY package.json .npmrc tsconfig.json tsconfig.build.json yarn.lock /var/history-tools/

RUN yarn
RUN yarn build:prod

# PRODUCTION

FROM node:17-alpine3.12 AS leaderboard-api-history-tools

ARG GITHUB_TOKEN
ENV GITHUB_TOKEN=${GITHUB_TOKEN}

WORKDIR /var/history-tools

COPY package.json .npmrc .env ./
COPY --from=leaderboard-api-history-tools-builder /var/history-tools/build ./build

RUN yarn --production