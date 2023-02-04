#!/bin/bash

if [ "$1" == "--help" ]; then
  echo "Usage: start.sh"
  echo "  Starts the development environment. There are missing files and directory"
  echo "  necessary for execution that are not committed for several reasons: (1) they"
  echo "  are empty directories, (2) it would pose a security risk, (3) there is enough"
  echo "  data committed to easily generate them. This script will add those file and"
  echo "  directories if they are missing."
  echo "  --clean = Will removed generated database files that are normally preserved"
  echo "            between sessions. WARNING: all data in the database will be lost so"
  echo "            be certain."

  exit
fi

if [ ! -d "env" ]; then
  mkdir env
  touch env/development-application.env
  NEW_PASSWORD=$(openssl rand -base64 32)
  echo "POSTGRES_PASSWORD=$NEW_PASSWORD" >> env/development-database.env
fi

if [ ! -d "database-files" ]; then
  mkdir database-files
  mkdir database-files/lib-postgresql-data
  mkdir database-files/run-postgresql
elif [ "$1" == "--clean" ]; then
  rm database-files/lib-postgresql-data/* -r
fi

if [ ! -d "source/node_modules" ]; then
  ./scripts/npm.sh install
fi

GROUP_ID=$(id -g) USER_ID=$(id -u) USER_NAME=$(whoami) docker-compose up --detach development-application
