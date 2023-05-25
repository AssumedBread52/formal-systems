#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: ./scripts/generate/back-end-hostnames.sh"

  exit
fi

echo -n "" > front-end/back-end-hostnames.env
echo "BACK_END_HOSTNAME_SERVER=back-end" >> front-end/back-end-hostnames.env
echo "BACK_END_HOSTNAME_CLIENT=localhost" >> front-end/back-end-hostnames.env
