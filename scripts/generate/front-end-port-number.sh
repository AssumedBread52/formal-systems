#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: ./scripts/generate/front-end-port-number.sh"

  exit
fi

echo -n "" > front-end/port-number.env
echo "PORT=3000" >> front-end/port-number.env
