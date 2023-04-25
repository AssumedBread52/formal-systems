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
BACK_END_NODE_MODULES_CKSM_FILE=check-sums/back-end-node-modules.cksm
MICRO_FRONT_END_AUTH_NODE_MODULES_CKSM_FILE=check-sums/micro-front-end-auth.cksm
MICRO_FRONT_END_USER_NODE_MODULES_CKSM_FILE=check-sums/micro-front-end-user.cksm
APPLICATION_NODE_MODULES_CKSM_FILE=check-sums/application-node-modules.cksm
CURRENT_ENVIRONMENT_VARIABLES_CKSM=$(cat scripts/generate-environment-variables.sh | sha1sum)
CURRENT_DATABASE_CKSM=$(cat database/initialization-scripts/* | sha1sum)
CURRENT_BACK_END_NODE_MODULES_CKSM=$(cat back-end/package-lock.json | sha1sum)
CURRENT_MICRO_FRONT_END_AUTH_NODE_MODULES_CKSM=$(cat micro-front-ends/auth/package-lock.json | sha1sum)
CURRENT_MICRO_FRONT_END_USER_NODE_MODULES_CKSM=$(cat micro-front-ends/user/package-lock.json | sha1sum)
CURRENT_APPLICATION_NODE_MODULES_CKSM=$(cat application/package-lock.json | sha1sum)

if [ ! -d check-sums ]; then
  mkdir check-sums
else
  OLD_ENVIRONMENT_VARIABLES_CKSM=$(cat $ENVIRONMENT_VARIABLES_CKSM_FILE)
  OLD_INITIALIZE_DATABASE_CKSM=$(cat $DATABASE_CKSM_FILE)
  OLD_BACK_END_NODE_MODULES_CKSM=$(cat $BACK_END_NODE_MODULES_CKSM_FILE)
  OLD_MICRO_FRONT_END_AUTH_NODE_MODULES_CKSM=$(cat $MICRO_FRONT_END_AUTH_NODE_MODULES_CKSM_FILE)
  OLD_MICRO_FRONT_END_USER_NODE_MODULES_CKSM=$(cat $MICRO_FRONT_END_USER_NODE_MODULES_CKSM_FILE)
  OLD_APPLICATION_NODE_MODULES_CKSM=$(cat $APPLICATION_NODE_MODULES_CKSM_FILE)
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
  CHECK_SUM_FILE=check-sums/micro-$1-$2.cksm
  CURRENT_CHECK_SUM=$(cat micro-$1s/$2/package-lock.json | sha1sum)

  if [ ! -d check-sums ]; then
    mkdir check-sums
  elif [ -f "$CHECK_SUM_FILE" ]; then
    OLD_CHECK_SUM=$(cat $CHECK_SUM_FILE)
  fi

  if [ ! -d micro-$1s/$2/node_modules ]; then
    GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm-micro-$1-$2 install

    echo -n "$CURRENT_CHECK_SUM" > $CURRENT_CHECK_SUM
  elif [ ! "$OLD_CHECK_SUM" = "$CURRENT_CHECK_SUM" ]; then
    rm -rf micro-$1s/$2/node_modules micro-$1s/$2/$3

    GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm-micro-$1-$2 install

    echo -n "$CURRENT_CHECK_SUM" > $CURRENT_CHECK_SUM
  fi
}

resolve_node_dependencies service auth .nest
resolve_node_dependencies service user .nest

if [ ! -d back-end/node_modules ]; then
  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm-back-end install

  echo -n "$CURRENT_BACK_END_NODE_MODULES_CKSM" > $BACK_END_NODE_MODULES_CKSM_FILE
elif [ ! "$OLD_BACK_END_NODE_MODULES_CKSM" = "$CURRENT_BACK_END_NODE_MODULES_CKSM" ]; then
  rm -rf back-end/node_modules back-end/.nest

  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm-back-end install

  echo -n "$CURRENT_BACK_END_NODE_MODULES_CKSM" > $BACK_END_NODE_MODULES_CKSM_FILE
fi

if [ ! -d micro-front-ends/auth/node_modules ]; then
  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm-micro-front-end-auth install

  echo -n "$CURRENT_MICRO_FRONT_END_AUTH_NODE_MODULES_CKSM" > $MICRO_FRONT_END_AUTH_NODE_MODULES_CKSM_FILE
elif [ ! "$OLD_MICRO_FRONT_END_AUTH_NODE_MODULES_CKSM" = "$CURRENT_MICRO_FRONT_END_AUTH_NODE_MODULES_CKSM" ]; then
  rm -rf micro-front-ends/auth/node_modules micro-front-ends/auth/.next

  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm-micro-front-end-auth install

  echo -n "$CURRENT_MICRO_FRONT_END_AUTH_NODE_MODULES_CKSM" > $MICRO_FRONT_END_AUTH_NODE_MODULES_CKSM_FILE
fi

if [ ! -d micro-front-ends/user/node_modules ]; then
  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm-micro-front-end-user install

  echo -n "$CURRENT_MICRO_FRONT_END_USER_NODE_MODULES_CKSM" > $MICRO_FRONT_END_USER_NODE_MODULES_CKSM_FILE
elif [ ! "$OLD_MICRO_FRONT_END_USER_NODE_MODULES_CKSM" = "$CURRENT_MICRO_FRONT_END_USER_NODE_MODULES_CKSM" ]; then
  rm -rf micro-front-ends/user/node_modules micro-front-ends/user/.next

  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm-micro-front-end-user install

  echo -n "$CURRENT_MICRO_FRONT_END_USER_NODE_MODULES_CKSM" > $MICRO_FRONT_END_USER_NODE_MODULES_CKSM_FILE
fi

if [ ! -d application/node_modules ]; then
  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm-application install

  echo -n "$CURRENT_APPLICATION_NODE_MODULES_CKSM" > $APPLICATION_NODE_MODULES_CKSM_FILE
elif [ ! "$OLD_APPLICATION_NODE_MODULES_CKSM" = "$CURRENT_APPLICATION_NODE_MODULES_CKSM" ]; then
  rm -rf application/node_modules application/.next

  GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose run --rm npm-application install

  echo -n "$CURRENT_APPLICATION_NODE_MODULES_CKSM" > $APPLICATION_NODE_MODULES_CKSM_FILE
fi

GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose up --detach application
