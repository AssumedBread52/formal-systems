#!/bin/bash

if [ "$1" == "--help" ]; then
  echo "Usage: add-bash-script-file.sh FILENAME"
  echo "  A missing FILENAME has no effect."
elif ! [ -z "$1" ]; then
  MY_PATH=`dirname "$0"`
  touch $MY_PATH/$1.sh
  chmod 755 $MY_PATH/$1.sh
fi
