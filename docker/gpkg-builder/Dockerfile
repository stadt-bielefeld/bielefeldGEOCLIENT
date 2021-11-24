FROM osgeo/gdal:ubuntu-small-3.4.0

RUN apt update && apt install -y \
    bash \
    cron

RUN mkdir -p /opt/etc/styles \
    && touch /opt/etc/styles/make_gpkg.sh \
    && chmod +x /opt/etc/styles/make_gpkg.sh

# We need a file to watch in order to keep tail running
RUN mkdir -p /var/log \
    && touch /var/log/cron.log

COPY ./make_gpkg.cron /tmp/make-gpkg
RUN crontab < /tmp/make-gpkg

CMD ["/bin/bash", "-c", "chmod 644 /etc/cron.d/make-gpkg && cron && tail -f /var/log/cron.log"]
