#!/bin/bash

if [ "$1" = "--help" ]; then
  echo "Usage: ./scripts/add-new-bash-script.sh FILENAME"
  echo "  A missing FILENAME has no effect. The script can create directories if needed."
  echo "  ./scripts/add-new-bash-script.sh a/b will create the directory a if needed and"
  echo "  create b.sh if needed. If a script already exists it will be reset."

  exit
fi

if [ -z "$1" ]; then
  exit
fi

NAMES=(`echo $1 | tr '/' ' '`)
NAMES_LENGTH=${#NAMES[@]}
INDEX=0
DIRECTORY_PATH=scripts

while [ $INDEX -lt $(( $NAMES_LENGTH - 1 )) ];
do
  DIRECTORY_PATH="$DIRECTORY_PATH/${NAMES[$INDEX]}"

  INDEX=$(( $INDEX + 1 ))
done

mkdir -p $DIRECTORY_PATH

touch scripts/$1.sh

chmod 755 scripts/$1.sh

echo "#!/bin/bash" > scripts/$1.sh
echo "" >> scripts/$1.sh
echo "if [ \"\$1\" = \"--help\" ]; then" >> scripts/$1.sh
echo "  echo \"Usage: ./scripts/$1.sh\"" >> scripts/$1.sh
echo "" >> scripts/$1.sh
echo "  exit" >> scripts/$1.sh
echo "fi" >> scripts/$1.sh
