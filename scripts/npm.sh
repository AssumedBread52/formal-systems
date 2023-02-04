#!/bin/bash

NETWORK=$(docker network ls | awk '/formal-systems/ {print $2}')

GROUP_ID=$(id -g) USER_ID=$(id -u) USER_NAME=$(whoami) docker-compose run --rm npm $@

if [ -z $NETWORK ]; then
  GROUP_ID=$(id -g) USER_ID=$(id -u) USER_NAME=$(whoami) docker-compose down
fi
