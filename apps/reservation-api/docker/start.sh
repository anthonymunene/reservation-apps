#!/usr/bin/sh

npx prisma generate && npx prisma migrate deploy  && node --loader ts-node/esm --experimental-specifier-resolution=node prisma/seed.t
