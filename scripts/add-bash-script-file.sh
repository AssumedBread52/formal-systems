#!/bin/bash

if [ "$1" == "--help" ]; then
  echo "Usage: add-bash-script-file.sh FILENAME"
  echo "  A missing FILENAME has no effect."

  exit
fi

if ! [ -z "$1" ]; then
  FILE=scripts/$1.sh

  echo "#!/bin/bash" >> $FILE
  echo "" >> $FILE
  echo "if [ \"\$1\" == \"--help\" ]; then" >> $FILE
  echo "  echo \"Usage: $1.sh\"" >> $FILE
  echo "" >> $FILE
  echo "  exit" >> $FILE
  echo "fi" >> $FILE

  chmod 755 $FILE
fi
