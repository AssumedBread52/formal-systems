#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: ./scripts/generate/front-end-connection-configuration.sh"

  exit
fi

echo -n "" > front-end/connection-configuration.env
echo "PORT=3000" >> front-end/connection-configuration.env
