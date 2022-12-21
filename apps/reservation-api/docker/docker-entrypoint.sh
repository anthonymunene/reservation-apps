#!/bin/sh

# Abort on any error (including if wait-for-it fails).
set -e

# Wait for the backend to be up, if we know where it is.
# if [ -n "$CUSTOMERS_HOST" ]; then
  # wait-for-it.sh "postgres:5432"
wait && npx dotenv-cli -e .env -- npx prisma generate && npx dotenv-cli -e .env -- npx prisma migrate deploy  && node --loader ts-node/esm --experimental-specifier-resolution=node prisma/seed.ts
# fi

# Run the main container command.
# exec "$@"
