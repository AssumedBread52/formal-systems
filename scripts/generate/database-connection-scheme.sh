#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: ./scripts/generate/database-connection-scheme.sh"

  exit
fi

echo -n "" > back-end/database-connection-scheme.env
echo "MONGO_SCHEME=mongodb" >> back-end/database-connection-scheme.env
