#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: ./scripts/generate/database-connection-configuration.sh"

  exit
fi

echo -n "" > back-end/database-connection-configuration.env
echo "DATABASE_TYPE=mongodb" >> back-end/database-connection-configuration.env
echo "DATABASE_SCHEME=mongodb" >> back-end/database-connection-configuration.env
echo "DATABASE_HOST=database" >> back-end/database-connection-configuration.env
echo "DATABASE_PORT=27017" >> back-end/database-connection-configuration.env
echo "DATABASE_NAME=formal-systems" >> back-end/database-connection-configuration.env
