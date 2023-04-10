#!/bin/bash

function volumeExists {
  if [ "$(docker volume ls -f name=$1 | awk '{print $NF}' | grep -E '^'$1'$')" ]; then
    echo "removing $1 volume"
    docker volume rm $1
    return 0
  else
    return 1
  fi
}
