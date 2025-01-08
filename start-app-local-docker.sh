#!/bin/bash

NETWORK_NAME="izg-shared-network"
RUN_DEV=false

# Parse command line arguments
while [ $# -gt 0 ]; do
    case "$1" in
        --dev|-d)
            RUN_DEV=true
            ;;
        --help|-h)
            echo "Usage: $0 [--dev]"
            echo "Options:"
            echo "  --dev, -d    Run in development mode"
            echo "  --help, -h   Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help to see available options"
            exit 1
            ;;
    esac
    shift
done

# Create a shared network if it does not exist
if ! docker network ls | grep -q "$NETWORK_NAME"; then
  echo "Network $NETWORK_NAME does not exist. Creating it..."
  docker network create "$NETWORK_NAME"
else
  echo "Network $NETWORK_NAME already exists."
fi

# Run docker-compose
docker-compose up -d
if [ "$RUN_DEV" = true ]; then
  npm run dev
fi
