#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: generate-environment-variables.sh"
  echo "  Generates the environment variables for the project in the env directory."

  exit
fi

MONGO_USERNAME="application"
MONGO_PASSWORD=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo "NEXT_TELEMETRY_DISABLED=1" >> env/npm.env

echo "NEXT_TELEMETRY_DISABLED=1" >> env/development-application.env
echo "NEXTAUTH_URL=http://localhost:3000" >> env/development-application.env
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET" >> env/development-application.env
echo "MONGO_USERNAME=$MONGO_USERNAME" >> env/development-application.env
echo "MONGO_PASSWORD=$MONGO_PASSWORD" >> env/development-application.env
echo "MONGO_HOSTNAME=development-database" >> env/development-application.env

echo "MONGO_INITDB_ROOT_USERNAME=$MONGO_USERNAME" >> env/development-database.env
echo "MONGO_INITDB_ROOT_PASSWORD=$MONGO_PASSWORD" >> env/development-database.env
