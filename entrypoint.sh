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

if [ "$RUN_ALEMBIC" = "true" ]; then
  alembic -c configs/alembic.ini upgrade head
fi

# copy icons to mapfish config dir

if [ "$COPY_ICONS_TO_MAPFISH_CONFIG_DIR" = "true" ]; then
  MUNIMAP_LOCATION=$(pip show munimap | grep Location | awk '{ print $2; }')
  cp -r $MUNIMAP_LOCATION/munimap/static/img/icons /opt/etc/munimap/configs/mapfish
fi

# run the actual CMD

exec "$@"
