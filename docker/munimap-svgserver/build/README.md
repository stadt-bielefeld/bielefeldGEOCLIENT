# Docker SvgServer

Docker container for https://github.com/omniscale/svgserver.

Following mount points need to be added:

- `./style:/opt/etc/styles/bielefeld`
- `./data/gpkg:/opt/var/gpkg`

Please note: SvgServer expects a file `svg-translations.txt` contained within mountpoint`./style`.
