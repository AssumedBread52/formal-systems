#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: ./scripts/generate/environment-variables.sh"
  echo "  Generates the environment variables for the project."

  exit
fi

MONGO_USERNAME="application"
MONGO_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JSON_WEB_TOKEN_SECRET=$(openssl rand -base64 32)
MICRO_FRONT_END_PORT_AUTH=3001
MICRO_FRONT_END_PORT_SYSTEM=3002
MICRO_FRONT_END_PORT_USER=3003
MICRO_SERVICE_PORT_AUTH=5001
MICRO_SERVICE_PORT_SYSTEM=5002
MICRO_SERVICE_PORT_USER=5003

echo -n "" > database/variables.env
echo "MONGO_INITDB_ROOT_USERNAME=$MONGO_USERNAME" >> database/variables.env
echo "MONGO_INITDB_ROOT_PASSWORD=$MONGO_PASSWORD" >> database/variables.env

echo -n "" > messaging-service/variables.env
echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> messaging-service/variables.env
echo "REDISCLI_AUTH=$REDIS_PASSWORD" >> messaging-service/variables.env

echo -n "" > micro-services/auth/variables.env
echo "REDIS_HOSTNAME=messaging-service" >> micro-services/auth/variables.env
echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> micro-services/auth/variables.env
echo "JSON_WEB_TOKEN_SECRET=$JSON_WEB_TOKEN_SECRET" >> micro-services/auth/variables.env
echo "PORT=$MICRO_SERVICE_PORT_AUTH" >> micro-services/auth/variables.env

echo -n "" > micro-services/system/variables.env
echo "JSON_WEB_TOKEN_SECRET=$JSON_WEB_TOKEN_SECRET" >> micro-services/system/variables.env
echo "MONGO_SCHEME=mongodb" >> micro-services/system/variables.env
echo "MONGO_USERNAME=$MONGO_USERNAME" >> micro-services/system/variables.env
echo "MONGO_PASSWORD=$MONGO_PASSWORD" >> micro-services/system/variables.env
echo "MONGO_HOSTNAME=database" >> micro-services/system/variables.env
echo "REDIS_HOSTNAME=messaging-service" >> micro-services/system/variables.env
echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> micro-services/system/variables.env
echo "PORT=$MICRO_SERVICE_PORT_SYSTEM" >> micro-services/system/variables.env

echo -n "" > micro-services/user/variables.env
echo "MONGO_SCHEME=mongodb" >> micro-services/user/variables.env
echo "MONGO_USERNAME=$MONGO_USERNAME" >> micro-services/user/variables.env
echo "MONGO_PASSWORD=$MONGO_PASSWORD" >> micro-services/user/variables.env
echo "MONGO_HOSTNAME=database" >> micro-services/user/variables.env
echo "REDIS_HOSTNAME=messaging-service" >> micro-services/user/variables.env
echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> micro-services/user/variables.env
echo "JSON_WEB_TOKEN_SECRET=$JSON_WEB_TOKEN_SECRET" >> micro-services/user/variables.env
echo "PORT=$MICRO_SERVICE_PORT_USER" >> micro-services/user/variables.env

echo -n "" > micro-front-ends/application/variables.env
echo "TINI_KILL_PROCESS_GROUP=1" >> micro-front-ends/application/variables.env
echo "NEXT_TELEMETRY_DISABLED=1" >> micro-front-ends/application/variables.env
echo "NEXTAUTH_URL=http://localhost:3000" >> micro-front-ends/application/variables.env
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET" >> micro-front-ends/application/variables.env
echo "MONGO_USERNAME=$MONGO_USERNAME" >> micro-front-ends/application/variables.env
echo "MONGO_PASSWORD=$MONGO_PASSWORD" >> micro-front-ends/application/variables.env
echo "MONGO_HOSTNAME=database" >> micro-front-ends/application/variables.env
echo "NEXT_PUBLIC_MICRO_SERVICE_PORT_AUTH=$MICRO_SERVICE_PORT_AUTH" >> micro-front-ends/application/variables.env
echo "NEXT_PUBLIC_MICRO_SERVICE_PORT_SYSTEM=$MICRO_SERVICE_PORT_SYSTEM" >> micro-front-ends/application/variables.env
echo "NEXT_PUBLIC_MICRO_SERVICE_PORT_USER=$MICRO_SERVICE_PORT_USER" >> micro-front-ends/application/variables.env

echo -n "" > micro-front-ends/auth/variables.env
echo "NEXT_TELEMETRY_DISABLED=1" >> micro-front-ends/auth/variables.env
echo "PORT=$MICRO_FRONT_END_PORT_AUTH" >> micro-front-ends/auth/variables.env
echo "NEXT_PUBLIC_MICRO_SERVICE_PORT_AUTH=$MICRO_SERVICE_PORT_AUTH" >> micro-front-ends/auth/variables.env

echo -n "" > micro-front-ends/system/variables.env
echo "NEXT_TELEMETRY_DISABLED=1" >> micro-front-ends/system/variables.env
echo "PORT=$MICRO_FRONT_END_PORT_SYSTEM" >> micro-front-ends/system/variables.env
echo "NEXT_PUBLIC_MICRO_SERVICE_PORT_SYSTEM=$MICRO_SERVICE_PORT_SYSTEM" >> micro-front-ends/system/variables.env

echo -n "" > micro-front-ends/user/variables.env
echo "NEXT_TELEMETRY_DISABLED=1" >> micro-front-ends/user/variables.env
echo "PORT=$MICRO_FRONT_END_PORT_USER" >> micro-front-ends/user/variables.env
echo "NEXT_PUBLIC_MICRO_SERVICE_PORT_USER=$MICRO_SERVICE_PORT_USER" >> micro-front-ends/user/variables.env

echo -n "" > micro-front-ends/application/npm.env
echo "NEXT_TELEMETRY_DISABLED=1" >> micro-front-ends/application/npm.env

echo -n "" > micro-front-ends/auth/npm.env
echo "NEXT_TELEMETRY_DISABLED=1" >> micro-front-ends/auth/npm.env

echo -n "" > micro-front-ends/system/npm.env
echo "NEXT_TELEMETRY_DISABLED=1" >> micro-front-ends/system/npm.env

echo -n "" > micro-front-ends/user/npm.env
echo "NEXT_TELEMETRY_DISABLED=1" >> micro-front-ends/user/npm.env
