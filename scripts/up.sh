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

function generate_environment_variables() {
  CHECK_SUM_FILE=scripts/generate/$1.cksm
  CURRENT_CHECK_SUM=$(cat scripts/generate/$1.sh | sha1sum)

  if [ -f "$CHECK_SUM_FILE" ]; then
    OLD_CHECK_SUM=$(cat $CHECK_SUM_FILE)
  fi

  if [ ! "$OLD_CHECK_SUM" = "$CURRENT_CHECK_SUM" ]; then
    ./scripts/generate/$1.sh

    echo -n "$CURRENT_CHECK_SUM" > $CHECK_SUM_FILE
  fi
}

function resolve_node_dependencies() {
  CHECK_SUM_FILE=$1/package-lock.cksm
  CURRENT_CHECK_SUM=$(cat $1/package-lock.json | sha1sum)

  if [ -f "$CHECK_SUM_FILE" ]; then
    OLD_CHECK_SUM=$(cat $CHECK_SUM_FILE)
  fi

  if [ ! "$OLD_CHECK_SUM" = "$CURRENT_CHECK_SUM" ]; then
    ./scripts/npm-$1.sh install

    echo -n "$CURRENT_CHECK_SUM" > $CHECK_SUM_FILE
  fi
}

if [ ! -d certificate-authority ]; then
  mkdir certificate-authority

  openssl genrsa -out ./certificate-authority/private-key.pem 4096
  openssl req -x509 -new -nodes -key ./certificate-authority/private-key.pem -sha256 -days 2 -out ./certificate-authority/public-certificate.pem -subj "/C=US/ST=Texas/L=Houston/O=Me, Myself, and I/CN=Certificate-Authority"
else
  EXPIRY_STATUS=$(openssl x509 -checkend 86400 -noout -in ./certificate-authority/public-certificate.pem)
  if [ "$EXPIRY_STATUS" = "Certificate will expire" ]; then
    openssl req -x509 -new -nodes -key ./certificate-authority/private-key.pem -sha256 -days 2 -out ./certificate-authority/public-certificate.pem -subj "/C=US/ST=Texas/L=Houston/O=Me, Myself, and I/CN=Certificate-Authority"
  fi
fi

function generate_ssh_files() {
  if [ ! -f ./$1/private-key.pem ]; then
    openssl genrsa -out ./$1/private-key.pem 4096
  fi

  if [ ! -f ./$1/certificate-signature-request.pem ]; then
    openssl req -new -key ./$1/private-key.pem -out ./$1/certificate-signature-request.pem -subj "/C=US/ST=Texas/L=Houston/O=Me, Myself, and I/CN=$1"
  fi

  if [ ! -f ./$1/config.ext ]; then
    echo -n "" > ./$1/config.ext
    echo "authorityKeyIdentifier=keyid,issuer" >> ./$1/config.ext
    echo "basicConstraints=CA:FALSE" >> ./$1/config.ext
    echo "keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment" >> ./$1/config.ext
    echo "subjectAltName = @alt_names" >> ./$1/config.ext
    echo "" >> ./$1/config.ext
    echo "[alt_names]" >> ./$1/config.ext
    echo "DNS.1 = $1" >> ./$1/config.ext
    echo -n "DNS.2 = localhost" >> ./$1/config.ext
  fi

  if [ ! -f ./$1/public-certificate.pem ]; then
    openssl x509 -req -in ./$1/certificate-signature-request.pem -CA ./certificate-authority/public-certificate.pem -CAkey ./certificate-authority/private-key.pem -CAcreateserial -out ./$1/public-certificate.pem -days 2 -sha256 -extfile ./$1/config.ext

    cp ./certificate-authority/public-certificate.pem ./$1/certificate-authority-public-certificate.pem
  else
    EXPIRY_STATUS=$(openssl x509 -checkend 86400 -noout -in ./$1/public-certificate.pem)
    if [ "$EXPIRY_STATUS" = "Certificate will expire" ]; then
      openssl x509 -req -in ./$1/certificate-signature-request.pem -CA ./certificate-authority/public-certificate.pem -CAkey ./certificate-authority/private-key.pem -CAcreateserial -out ./$1/public-certificate.pem -days 2 -sha256 -extfile ./$1/config.ext
    fi
  fi
}

generate_environment_variables database-credentials
generate_environment_variables back-end-configuration
generate_environment_variables front-end-configuration

generate_ssh_files back-end
generate_ssh_files front-end

resolve_node_dependencies back-end
resolve_node_dependencies front-end

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

GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose up --detach front-end
