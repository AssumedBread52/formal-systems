#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: ./scripts/generate/back-end-port-number.sh"

  exit
fi

PORT=5000

echo -n "" > back-end/port-number.env
echo "PORT=$PORT" >> back-end/port-number.env

echo -n "" > front-end/back-end-port-number.env
echo "BACK_END_PORT=$PORT" >> front-end/back-end-port-number.env
