#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: ./scripts/down.sh"
  echo "  Brings down the development containers. Containers are first stopped and then"
  echo "  removed. The docker network is cleaned up as well."

  exit
fi

docker-compose down
