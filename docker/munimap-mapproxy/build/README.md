# Docker MapProxy

Running MapProxy server. To make this container run, following must be mounted:

- `/opt/etc/mapproxy/mapproxy.yaml`
- `cache_data` directory (location depends on `mapproxy.yaml`. Recommended path: `/opt/var/mapproxy/cache_data`)
