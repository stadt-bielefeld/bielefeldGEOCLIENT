#!/bin/bash

set -e

# install custom certificates in /certs/

for file in /certs/*.crt; do
    if [ -e "$file" ]; then
        cp "$file" /usr/local/share/ca-certificates/
    fi
done

update-ca-certificates

# run alembic

alembic -c configs/alembic.ini upgrade head

# run the actual CMD

exec "$@"
