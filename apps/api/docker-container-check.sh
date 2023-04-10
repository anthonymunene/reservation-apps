#!/bin/bash

function containerExists {
  echo "name = $1"
  if [ "$(docker container ls -f name=$1 | awk '{print $NF}' | grep -E '^'$1'$')" ]; then
    # echo "removing $1 container"
    # docker volume rm $1
    return 0
  else
  # echo "container $1 doesnt exist"
    return 1
  fi
}
