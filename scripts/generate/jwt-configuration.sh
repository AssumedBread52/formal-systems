#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: ./scripts/generate/jwt-configuration.sh"

  exit
fi

JSON_WEB_TOKEN_SECRET=$(openssl rand -base64 32)

echo -n "" > back-end/jwt-configuration.env
echo "JSON_WEB_TOKEN_SECRET=$JSON_WEB_TOKEN_SECRET" >> back-end/jwt-configuration.env
echo "JSON_WEB_TOKEN_EXPIRES_IN=60s" >> back-end/jwt-configuration.env
