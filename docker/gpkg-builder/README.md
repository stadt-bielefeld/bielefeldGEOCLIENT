# Docker GPKG-Builder

Creates gpkg files as a cron job.

To actually make the container work, create following mount points:

- `/opt/etc/styles/make-gpkg.sh` - Shell script that actually creates gpkg files
- output directory, as specified in `make-gpkg.sh`
