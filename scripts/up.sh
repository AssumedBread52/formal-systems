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

if [ ! -d database/data ]; then
  mkdir database/data
fi

GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose up --detach
