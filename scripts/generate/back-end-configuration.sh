#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: ./scripts/generate/back-end-configuration.sh"

  exit
fi

JSON_WEB_TOKEN_SECRET=$(openssl rand -base64 32)

echo -n "" > back-end/.env
echo "PORT=5000" >> back-end/.env
echo "DATABASE_TYPE=mongodb" >> back-end/.env
echo "DATABASE_SCHEME=mongodb" >> back-end/.env
echo "DATABASE_HOST=database" >> back-end/.env
echo "DATABASE_PORT=27017" >> back-end/.env
echo "DATABASE_NAME=formal-systems" >> back-end/.env
echo "JSON_WEB_TOKEN_SECRET=$JSON_WEB_TOKEN_SECRET" >> back-end/.env
echo "JSON_WEB_TOKEN_EXPIRES_IN=60s" >> back-end/.env
echo "AUTH_COOKIE_MAX_AGE_MILLISECONDS=60000" >> back-end/.env
