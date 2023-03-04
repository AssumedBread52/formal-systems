#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: down.sh"
  echo "  Stops the development environment. Stopped containers are removed as well as"
  echo "  the constructed network."
  echo "  --clean = Will removed generated database files that are normally preserved"
  echo "            between sessions. WARNING: all data in the database will be lost so"
  echo "            be certain."

  exit
fi

if [ ! -z "$(docker network ls | awk '/formal-systems/ {print $2}')" ]; then
  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose down
fi

if [ "$1" == "--clean" ] && [ "$(ls -A database-files)" ]; then
  rm database-files/.[!.]* database-files/* -r
fi
