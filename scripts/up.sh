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
DATABASE_CKSM_FILE=check-sums/database.cksm
CURRENT_ENVIRONMENT_VARIABLES_CKSM=$(cat scripts/generate-environment-variables.sh | sha1sum)
CURRENT_DATABASE_CKSM=$(cat database/initialization-scripts/* | sha1sum)

if [ ! -d check-sums ]; then
  mkdir check-sums
else
  OLD_ENVIRONMENT_VARIABLES_CKSM=$(cat $ENVIRONMENT_VARIABLES_CKSM_FILE)
  OLD_INITIALIZE_DATABASE_CKSM=$(cat $DATABASE_CKSM_FILE)
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

if [ ! -d database/data ]; then
  mkdir database/data

  echo -n "$CURRENT_DATABASE_CKSM" > $DATABASE_CKSM_FILE
elif [ ! "$OLD_INITIALIZE_DATABASE_CKSM" = "$CURRENT_DATABASE_CKSM" ] || [ ! "$OLD_ENVIRONMENT_VARIABLES_CKSM" = "$CURRENT_ENVIRONMENT_VARIABLES_CKSM" ]; then
  rm -rf database/data/..?* database/data/.[!.]* database/data/*

  echo -n "$CURRENT_DATABASE_CKSM" > $DATABASE_CKSM_FILE
elif [ "$1" = "--clean" ] && [ "$(ls -A database/data)" ]; then
  rm -rf database/data/..?* database/data/.[!.]* database/data/*
fi

function resolve_node_dependencies() {
  CHECK_SUM_FILE=micro-$1s/$2/package-lock.cksm
  CURRENT_CHECK_SUM=$(cat micro-$1s/$2/package-lock.json | sha1sum)

  if [ ! -d check-sums ]; then
    mkdir check-sums
  elif [ -f "$CHECK_SUM_FILE" ]; then
    OLD_CHECK_SUM=$(cat $CHECK_SUM_FILE)
  fi

  if [ ! -d micro-$1s/$2/node_modules ]; then
    GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm-micro-$1-$2 install

    echo -n "$CURRENT_CHECK_SUM" > $CHECK_SUM_FILE
  elif [ ! "$OLD_CHECK_SUM" = "$CURRENT_CHECK_SUM" ]; then
    rm -rf micro-$1s/$2/node_modules micro-$1s/$2/$3

    GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm-micro-$1-$2 install

    echo -n "$CURRENT_CHECK_SUM" > $CHECK_SUM_FILE
  fi
}

resolve_node_dependencies service auth .nest
resolve_node_dependencies service system .nest
resolve_node_dependencies service user .nest
resolve_node_dependencies front-end application .next
resolve_node_dependencies front-end auth .next
resolve_node_dependencies front-end system .next
resolve_node_dependencies front-end user .next

GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose up --detach micro-front-end-application
