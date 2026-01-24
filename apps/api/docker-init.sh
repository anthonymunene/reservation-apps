#!/bin/bash

source docker-container-check.sh
source docker-volume-check.sh

profile=${1:='dev'}
reset=$2
force_reset=$3

echo "starting docker containers of the $profile profile"

# Determine if we should reset
should_reset=false

if [ "$force_reset" = "force" ]; then
  # Force reset requested - always reset
  should_reset=true
  echo "Force reset requested"
elif [ "$reset" = "true" ]; then
  # Check if schema has changed
  schema_status=$(./check-schema-changes.sh)
  if [ "$schema_status" = "changed" ]; then
    should_reset=true
    echo "Schema changed - resetting database"
  else
    echo "Schema unchanged - skipping reset"
  fi
fi

if [ "$should_reset" = true ]; then
  echo "resetting docker volumes/containers"
  if [ "$(containerExists postgres-knex_$profile)" ]; then
    docker compose --profile=$profile down
  fi
  if [ "$(volumeExists api_db_knex_$profile)" ]; then
    echo "volumes exists...."
    docker volume rm api_db_knex_$profile
  fi
fi

docker compose --profile=$profile up -d
