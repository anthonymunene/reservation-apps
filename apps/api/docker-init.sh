#!/bin/bash

source docker-container-check.sh
source docker-volume-check.sh


profile=${1:='dev'}
reset=$2

echo "starting docker containers of the $profile profile"


if [ $reset ]; then
  echo "resetting docker volumes/containers"
  if [ "$(containerExists postgres-knex_$profile)" ]; then
    docker compose --profile=$profile down --remove-orphans
  fi
  if [ "$(volumeExists api_db_knex_$profile)" ]; then
    echo "volumes exists...."
    docker volume rm api_db_knex_$profile
  fi
  docker compose --profile=$profile up -d
else
  echo "starting docker"
  docker compose --profile=$profile up -d
fi
