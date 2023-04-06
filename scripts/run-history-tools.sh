#!/bin/sh

PROD_COMPOSE="$(dirname "$0")/../docker-compose.yml"
ENV="$(dirname "$0")/../.env"

while getopts s:e:m:k: flag
do
    case "${flag}" in
        s) start=${OPTARG};;
        e) end=${OPTARG};;
        m) mode=${OPTARG};;
        k) key=${OPTARG};;
    esac
done

# Build .env file
node $(dirname "$0")/make-env.js -s=$start -e=$end -m=$mode -k=$key

# Run app
docker compose --env-file "$ENV" -p "leaderboard-api-history-tools" -f "$PROD_COMPOSE" up --build

exit $?
