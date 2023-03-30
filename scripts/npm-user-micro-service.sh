#!/bin/bash

NETWORK=$(docker network ls | awk '/formal-systems/ {print $2}')

GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm-micro-service-user $@

if [ -z $NETWORK ]; then
  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose down
fi
