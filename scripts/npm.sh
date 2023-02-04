#!/bin/bash

GROUP_ID=$(id -g) USER_ID=$(id -u) USER_NAME=$(whoami) docker-compose run --rm npm $@
GROUP_ID=$(id -g) USER_ID=$(id -u) USER_NAME=$(whoami) docker-compose down
