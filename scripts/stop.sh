#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: stop.sh"
  echo "  Stops any running containers specified by the docker-compose file."

  exit
fi

GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose stop
