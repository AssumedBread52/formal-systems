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
BACK_END_NODE_MODULES_CKSM_FILE=check-sums/back-end-node-modules.cksm
FRONT_END_NODE_MODULES_CKSM_FILE=check-sums/front-end-node-modules.cksm
CURRENT_ENVIRONMENT_VARIABLES_CKSM=$(cat scripts/generate-environment-variables.sh | sha1sum)
CURRENT_INITIALIZE_DATABASE_CKSM=$(cat initialize-database/* | sha1sum)
CURRENT_BACK_END_NODE_MODULES_CKSM=$(cat back-end/package-lock.json | sha1sum)
CURRENT_FRONT_END_NODE_MODULES_CKSM=$(cat front-end/package-lock.json | sha1sum)

if [ ! -d check-sums ]; then
  mkdir check-sums
else
  OLD_ENVIRONMENT_VARIABLES_CKSM=$(cat $ENVIRONMENT_VARIABLES_CKSM_FILE)
  OLD_INITIALIZE_DATABASE_CKSM=$(cat $INITIALIZE_DATABASE_CKSM_FILE)
  OLD_BACK_END_NODE_MODULES_CKSM=$(cat $BACK_END_NODE_MODULES_CKSM_FILE)
  OLD_FRONT_END_NODE_MODULES_CKSM=$(cat $FRONT_END_NODE_MODULES_CKSM_FILE)
fi

if [ ! -d environment-variables ]; then
  mkdir environment-variables

  ./scripts/generate-environment-variables.sh

  echo -n "$CURRENT_ENVIRONMENT_VARIABLES_CKSM" > $ENVIRONMENT_VARIABLES_CKSM_FILE
elif [ ! "$OLD_ENVIRONMENT_VARIABLES_CKSM" = "$CURRENT_ENVIRONMENT_VARIABLES_CKSM" ]; then
  if [ ! -z "$(ls -A environment-variables)" ]; then
    rm -rf environment-variables/..?* environment-variables/.[!.]* environment-variables/*
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

if [ ! -d back-end/node_modules ]; then
  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm-back-end install

  echo -n "$CURRENT_BACK_END_NODE_MODULES_CKSM" > $BACK_END_NODE_MODULES_CKSM_FILE
elif [ ! "$OLD_BACK_END_NODE_MODULES_CKSM" = "$CURRENT_BACK_END_NODE_MODULES_CKSM" ]; then
  rm -rf back-end/node_modules back-end/.nest

  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm-back-end install

  echo -n "$CURRENT_BACK_END_NODE_MODULES_CKSM" > $BACK_END_NODE_MODULES_CKSM_FILE
fi

if [ ! -d front-end/node_modules ]; then
  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm-front-end install

  echo -n "$CURRENT_FRONT_END_NODE_MODULES_CKSM" > $FRONT_END_NODE_MODULES_CKSM_FILE
elif [ ! "$OLD_FRONT_END_NODE_MODULES_CKSM" = "$CURRENT_FRONT_END_NODE_MODULES_CKSM" ]; then
  rm -rf front-end/node_modules front-end/.next

  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm-front-end install

  echo -n "$CURRENT_FRONT_END_NODE_MODULES_CKSM" > $FRONT_END_NODE_MODULES_CKSM_FILE
fi

GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose up --detach development-front-end
