#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: ./scripts/down.sh"
  echo "  Brings down the development environment. Containers are first stopped and then"
  echo "  removed. The docker network is cleaned up as well."
  echo "  --clear  Removes the database named volume which clears the database"

  exit
fi

if [ "$1" = "--clear" ]; then
  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose down --volumes
else
  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose down
fi
