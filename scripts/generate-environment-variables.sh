#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: generate-environment-variables.sh"
  echo "  Generates the environment variables for the project in the env directory."

  exit
fi

MONGO_USERNAME="application"
MONGO_PASSWORD=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JSON_WEB_TOKEN_SECRET=$(openssl rand -base64 32)

echo "MONGO_INITDB_ROOT_USERNAME=$MONGO_USERNAME" >> env/database.env
echo "MONGO_INITDB_ROOT_PASSWORD=$MONGO_PASSWORD" >> env/database.env

echo "MONGO_SCHEME=mongodb" >> env/development-back-end.env
echo "MONGO_USERNAME=$MONGO_USERNAME" >> env/development-back-end.env
echo "MONGO_PASSWORD=$MONGO_PASSWORD" >> env/development-back-end.env
echo "MONGO_HOSTNAME=database" >> env/development-back-end.env
echo "JSON_WEB_TOKEN_SECRET=$JSON_WEB_TOKEN_SECRET" >> env/development-back-end.env

echo "TINI_KILL_PROCESS_GROUP=1" >> env/development-front-end.env
echo "NEXT_TELEMETRY_DISABLED=1" >> env/development-front-end.env
echo "NEXTAUTH_URL=http://localhost:3000" >> env/development-front-end.env
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET" >> env/development-front-end.env
echo "MONGO_USERNAME=$MONGO_USERNAME" >> env/development-front-end.env
echo "MONGO_PASSWORD=$MONGO_PASSWORD" >> env/development-front-end.env
echo "MONGO_HOSTNAME=database" >> env/development-front-end.env

echo "NEXT_TELEMETRY_DISABLED=1" >> env/npm-front-end.env
