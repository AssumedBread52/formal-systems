#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: ./scripts/up.sh"
  echo "  Brings up the development environment. There are missing files and directories"
  echo "  necessary for execution but not committed for several reasons: (1) they are"
  echo "  empty directories, (2) it would pose serious security risks, (3) there is"
  echo "  enough data committed to easily generate them. If any needed files and"
  echo "  directories are missing, then this script will generate them."

  exit
fi

./scripts/down.sh

DATABASE_CHECK_SUM_FILE=database/initialization-scripts.cksm
DATABASE_CURRENT_CHECK_SUM=$(cat database/initialization-scripts/* | sha1sum)

if [ -f "$DATABASE_CHECK_SUM_FILE" ]; then
  DATABASE_OLD_CHECK_SUM=$(cat $DATABASE_CHECK_SUM_FILE)
fi

if [ ! -d database/data ]; then
  mkdir database/data

  echo -n "$DATABASE_CURRENT_CHECK_SUM" > $DATABASE_CHECK_SUM_FILE
elif [ ! "$DATABASE_OLD_CHECK_SUM" = "$DATABASE_CURRENT_CHECK_SUM" ]; then
  rm -rf database/data

  mkdir database/data

  echo -n "$DATABASE_CURRENT_CHECK_SUM" > $DATABASE_CHECK_SUM_FILE
fi

GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose up --detach
