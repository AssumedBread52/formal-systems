#!/bin/bash

if [ "$1" == "--help" ]; then
  echo "Usage: stop.sh"
  echo "  Stops the development environment. Stopped containers are removed as well as"
  echo "  the constructed network."
  echo "  --clean = Will removed generated database files that are normally preserved"
  echo "            between sessions. WARNING: all data in the database will be lost so"
  echo "            be certain."

  exit
fi

GROUP_ID=$(id -g) USER_ID=$(id -u) USER_NAME=$(whoami) docker-compose down

if [ "$1" == "--clean" ] && [ "$(ls -A database-files)" ]; then
  rm database-files/* -r
fi
