FROM camptocamp/mapserver:7.6

# TODO check if gdal version actually works for given tasks
RUN apt update && apt install -y \
    gdal-bin \
    fonts-dejavu-extra \
    ttf-unifont

RUN mkdir -p /opt/etc/styles/project/map \
    && mkdir -p /opt/log/mapproxy \
    && chown -R www-data:www-data /opt/log/mapproxy
