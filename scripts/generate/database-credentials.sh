#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: ./scripts/generate/database-credentials.sh"

  exit
fi

if docker volume inspect pgdata >/dev/null 2>&1; then
  docker volume rm pgdata >/dev/null
fi

USERNAME="database"
PASSWORD=$(openssl rand -base64 32)

echo -n "" > database/credentials.env
echo "POSTGRES_USER=$USERNAME" >> database/credentials.env
echo "POSTGRES_PASSWORD=$PASSWORD" >> database/credentials.env

echo -n "" > back-end/database-credentials.env
echo "DATABASE_USERNAME=$USERNAME" >> back-end/database-credentials.env
echo "DATABASE_PASSWORD=$PASSWORD" >> back-end/database-credentials.env
