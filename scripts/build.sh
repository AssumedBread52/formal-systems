#!/bin/bash

# Bind mounts will create missing directories but under root ownership.
# Create bind mount directories if they don't exist.
if ! [ -d "source" ]; then
  mkdir source
fi

# Expecting current user's group and user IDs as build arguments.
GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose build
