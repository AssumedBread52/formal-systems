#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: ./scripts/generate/back-end-connection-configuration.sh"

  exit
fi

PORT=5000

echo -n "" > back-end/connection-configuration.env
echo "PORT=$PORT" >> back-end/connection-configuration.env

echo -n "" > front-end/back-end-connection-configuration.env
echo "BACK_END_HOSTNAME_SERVER=back-end" >> front-end/back-end-connection-configuration.env
echo "BACK_END_HOSTNAME_CLIENT=localhost" >> front-end/back-end-connection-configuration.env
echo "BACK_END_PORT=$PORT" >> front-end/back-end-connection-configuration.env
