#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: down.sh"
  echo "  Stops the development environment. Stopped containers are removed as well as"
  echo "  the constructed network."

  exit
fi

if [ ! -z "$(docker network ls | awk '/formal-systems/ {print $2}')" ]; then
  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose down
fi
