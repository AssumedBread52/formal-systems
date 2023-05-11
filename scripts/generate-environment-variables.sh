#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: generate-environment-variables.sh"
  echo "  Generates the environment variables for the project in the environment variables directory."

  exit
fi

MONGO_USERNAME="application"
MONGO_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JSON_WEB_TOKEN_SECRET=$(openssl rand -base64 32)
MICRO_FRONT_END_PORT_AUTH=3001
MICRO_FRONT_END_PORT_USER=3002
MICRO_SERVICE_PORT_AUTH=5001
MICRO_SERVICE_PORT_FORMAL_SYSTEM=5002
MICRO_SERVICE_PORT_USER=5003

echo "MONGO_INITDB_ROOT_USERNAME=$MONGO_USERNAME" >> environment-variables/database.env
echo "MONGO_INITDB_ROOT_PASSWORD=$MONGO_PASSWORD" >> environment-variables/database.env

echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> environment-variables/messaging-service.env
echo "REDISCLI_AUTH=$REDIS_PASSWORD" >> environment-variables/messaging-service.env

echo "REDIS_HOSTNAME=messaging-service" >> environment-variables/micro-service-auth.env
echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> environment-variables/micro-service-auth.env
echo "JSON_WEB_TOKEN_SECRET=$JSON_WEB_TOKEN_SECRET" >> environment-variables/micro-service-auth.env
echo "PORT=$MICRO_SERVICE_PORT_AUTH" >> environment-variables/micro-service-auth.env

echo "JSON_WEB_TOKEN_SECRET=$JSON_WEB_TOKEN_SECRET" >> environment-variables/micro-service-system.env
echo "MONGO_SCHEME=mongodb" >> environment-variables/micro-service-system.env
echo "MONGO_USERNAME=$MONGO_USERNAME" >> environment-variables/micro-service-system.env
echo "MONGO_PASSWORD=$MONGO_PASSWORD" >> environment-variables/micro-service-system.env
echo "MONGO_HOSTNAME=database" >> environment-variables/micro-service-system.env
echo "REDIS_HOSTNAME=messaging-service" >> environment-variables/micro-service-system.env
echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> environment-variables/micro-service-system.env
echo "PORT=$MICRO_SERVICE_PORT_FORMAL_SYSTEM" >> environment-variables/micro-service-system.env

echo "MONGO_SCHEME=mongodb" >> environment-variables/micro-service-user.env
echo "MONGO_USERNAME=$MONGO_USERNAME" >> environment-variables/micro-service-user.env
echo "MONGO_PASSWORD=$MONGO_PASSWORD" >> environment-variables/micro-service-user.env
echo "MONGO_HOSTNAME=database" >> environment-variables/micro-service-user.env
echo "REDIS_HOSTNAME=messaging-service" >> environment-variables/micro-service-user.env
echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> environment-variables/micro-service-user.env
echo "JSON_WEB_TOKEN_SECRET=$JSON_WEB_TOKEN_SECRET" >> environment-variables/micro-service-user.env
echo "PORT=$MICRO_SERVICE_PORT_USER" >> environment-variables/micro-service-user.env

echo "NEXT_TELEMETRY_DISABLED=1" >> environment-variables/micro-front-end-auth.env
echo "PORT=$MICRO_FRONT_END_PORT_AUTH" >> environment-variables/micro-front-end-auth.env
echo "SERVICE_PORT=$MICRO_SERVICE_PORT_AUTH" >> environment-variables/micro-front-end-auth.env

echo "NEXT_TELEMETRY_DISABLED=1" >> environment-variables/micro-front-end-user.env
echo "PORT=$MICRO_FRONT_END_PORT_USER" >> environment-variables/micro-front-end-user.env
echo "SERVICE_PORT=$MICRO_SERVICE_PORT_USER" >> environment-variables/micro-front-end-user.env

echo "TINI_KILL_PROCESS_GROUP=1" >> environment-variables/application.env
echo "NEXT_TELEMETRY_DISABLED=1" >> environment-variables/application.env
echo "NEXTAUTH_URL=http://localhost:3000" >> environment-variables/application.env
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET" >> environment-variables/application.env
echo "MONGO_USERNAME=$MONGO_USERNAME" >> environment-variables/application.env
echo "MONGO_PASSWORD=$MONGO_PASSWORD" >> environment-variables/application.env
echo "MONGO_HOSTNAME=database" >> environment-variables/application.env

echo "NEXT_TELEMETRY_DISABLED=1" >> environment-variables/npm-micro-front-end-auth.env

echo "NEXT_TELEMETRY_DISABLED=1" >> environment-variables/npm-micro-front-end-user.env

echo "NEXT_TELEMETRY_DISABLED=1" >> environment-variables/npm-application.env
