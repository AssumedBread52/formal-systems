#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: up.sh"
  echo "  Starts the development environment. There are missing files and directories"
  echo "  necessary for execution that are not committed for several reasons: (1) they"
  echo "  are empty directories, (2) it would pose a security risk, (3) there is enough"
  echo "  data committed to easily generate them. This script will add those files and"
  echo "  directories if they are missing."
  echo "  --clean = Will removed generated database files that are normally preserved"
  echo "            between sessions. WARNING: all data in the database will be lost so"
  echo "            be certain."

  exit
fi

./scripts/down.sh

ENVIRONMENT_VARIABLES_CKSM_FILE=check-sums/environment-variables.cksm
INITIALIZE_DATABASE_CKSM_FILE=check-sums/initialize-database.cksm
NODE_MODULES_CKSM_FILE=check-sums/node-modules.cksm
CURRENT_ENVIRONMENT_VARIABLES_CKSM=$(cat scripts/generate-environment-variables.sh | sha1sum)
CURRENT_INITIALIZE_DATABASE_CKSM=$(cat initialize-database/* | sha1sum)
CURRENT_NODE_MODULES_CKSM=$(cat source/package-lock.json | sha1sum)

if [ ! -d check-sums ]; then
  mkdir check-sums
else
  OLD_ENVIRONMENT_VARIABLES_CKSM=$(cat $ENVIRONMENT_VARIABLES_CKSM_FILE)
  OLD_INITIALIZE_DATABASE_CKSM=$(cat $INITIALIZE_DATABASE_CKSM_FILE)
  OLD_NODE_MODULES_CKSM=$(cat $NODE_MODULES_CKSM_FILE)
fi

if [ ! -d env ]; then
  mkdir env

  ./scripts/generate-environment-variables.sh

  echo -n "$CURRENT_ENVIRONMENT_VARIABLES_CKSM" > $ENVIRONMENT_VARIABLES_CKSM_FILE
elif [ ! "$OLD_ENVIRONMENT_VARIABLES_CKSM" = "$CURRENT_ENVIRONMENT_VARIABLES_CKSM" ]; then
  if [ ! -z "$(ls -A env)" ]; then
    rm -rf env/..?* env/.[!.]* env/*
  fi

  ./scripts/generate-environment-variables.sh

  echo -n "$CURRENT_ENVIRONMENT_VARIABLES_CKSM" > $ENVIRONMENT_VARIABLES_CKSM_FILE
fi

if [ ! -d database-files ]; then
  mkdir database-files

  echo -n "$CURRENT_INITIALIZE_DATABASE_CKSM" > $INITIALIZE_DATABASE_CKSM_FILE
elif [ ! "$OLD_INITIALIZE_DATABASE_CKSM" = "$CURRENT_INITIALIZE_DATABASE_CKSM" ] || [ ! "$OLD_ENVIRONMENT_VARIABLES_CKSM" = "$CURRENT_ENVIRONMENT_VARIABLES_CKSM" ]; then
  rm -rf database-files/..?* database-files/.[!.]* database-files/*

  echo -n "$CURRENT_INITIALIZE_DATABASE_CKSM" > $INITIALIZE_DATABASE_CKSM_FILE
elif [ "$1" = "--clean" ] && [ "$(ls -A database-files)" ]; then
  rm -rf database-files/..?* database-files/.[!.]* database-files/*
fi

if [ ! -d source/node_modules ]; then
  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm-front-end install

  echo -n "$CURRENT_NODE_MODULES_CKSM" > $NODE_MODULES_CKSM_FILE
elif [ ! "$OLD_NODE_MODULES_CKSM" = "$CURRENT_NODE_MODULES_CKSM" ]; then
  rm -rf source/node_modules source/.next

  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm-front-end install

  echo -n "$CURRENT_NODE_MODULES_CKSM" > $NODE_MODULES_CKSM_FILE
fi

GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose up --detach development-application
