#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: ./scripts/generate/front-end-configuration.sh"

  exit
fi

echo -n "" > front-end/.env
echo "BACK_END_HOSTNAME=back-end" >> front-end/.env
echo "BACK_END_PORT=5000" >> front-end/.env
echo "PORT=3000" >> front-end/.env
echo "NEXT_TELEMETRY_DISABLED=1" >> front-end/.env
