#!/bin/bash

NETWORK_NAME="izg-shared-network"
RUN_DEV="NO"

# Check to see if user wants to run npm dev mode
if [ $# -eq 1 ] && [ "$1" == "DEV" ]; then RUN_DEV="YES"; fi

# Create a shared network if it does not exist
if ! docker network ls | grep -q "$NETWORK_NAME"; then
  echo "Network $NETWORK_NAME does not exist. Creating it..."
  docker network create "$NETWORK_NAME"
else
  echo "Network $NETWORK_NAME already exists."
fi

# Run docker-compose
docker-compose up -d
if [ "$RUN_DEV" == "YES" ]; then
  npm run dev
fi
