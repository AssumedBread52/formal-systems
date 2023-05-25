#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: ./scripts/generate/database-credentials.sh"

  exit
fi

rm -rf database/data

MONGO_USERNAME="database"
MONGO_PASSWORD=$(openssl rand -base64 32)

echo -n "" > database/credentials.env
echo "MONGO_INITDB_ROOT_USERNAME=$MONGO_USERNAME" >> database/credentials.env
echo "MONGO_INITDB_ROOT_PASSWORD=$MONGO_PASSWORD" >> database/credentials.env

echo -n "" > back-end/database-credentials.env
echo "MONGO_USERNAME=$MONGO_USERNAME" >> back-end/database-credentials.env
echo "MONGO_PASSWORD=$MONGO_PASSWORD" >> back-end/database-credentials.env
