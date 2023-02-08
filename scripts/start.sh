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
  MONGO_USERNAME="application"
  MONGO_PASSWORD=$(openssl rand -base64 32)
  NEXTAUTH_SECRET=$(openssl rand -base64 32)
  echo "NEXT_TELEMETRY_DISABLED=1" >> env/development-application.env
  echo "NEXTAUTH_URL=localhost" >> env/development-application.env
  echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET" >> env/development-application.env
  echo "MONGO_USERNAME=$MONGO_USERNAME" >> env/development-application.env
  echo "MONGO_PASSWORD=$MONGO_PASSWORD" >> env/development-application.env
  echo "MONGO_HOSTNAME=development-database" >> env/development-application.env
  echo "MONGO_INITDB_ROOT_USERNAME=$MONGO_USERNAME" >> env/development-database.env
  echo "MONGO_INITDB_ROOT_PASSWORD=$MONGO_PASSWORD" >> env/development-database.env
fi

if [ ! -d "database-files" ]; then
  mkdir database-files
elif [ "$1" == "--clean" ] && [ "$(ls -A database-files)" ]; then
  rm database-files/.[!.]* database-files/* -r
fi

if [ ! -d "source/node_modules" ]; then
  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm install
fi

GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose up --detach development-application
