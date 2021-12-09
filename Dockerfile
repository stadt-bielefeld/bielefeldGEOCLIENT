FROM python:2.7.16-jessie as BASE
FROM node:14.18.1-alpine3.14 as CLIENTBASE



FROM CLIENTBASE as CLIENTBUILDER

ARG ANOL_COMMIT_HASH=master
RUN apk add --no-cache wget unzip

RUN npm i -g npm@7

RUN mkdir -p tmp/anol
RUN cd /tmp/anol \
    && wget https://github.com/terrestris/anol/archive/refs/heads/$ANOL_COMMIT_HASH.zip -O anol.zip \
    && unzip anol.zip \
    && mv anol-$ANOL_COMMIT_HASH /anol

RUN cd /anol && npm ci

RUN mkdir -p /app

COPY . /app

WORKDIR /app

RUN npm ci
RUN npm run build



FROM BASE as BUILDER

RUN apt-get update && apt-get install -y \
    build-essential \
    python-dev

RUN pip install --upgrade pip \
    && pip install wheel setuptools

RUN mkdir -p /pkg
# We have to build the client bevor packing everything into a python package
COPY --from=CLIENTBUILDER /app /pkg
WORKDIR /pkg

RUN python setup.py clean && python setup.py egg_info sdist --formats=tar
RUN cd munimap_digitize && python setup.py clean && python setup.py egg_info sdist --formats=tar
RUN cd munimap_transport && python setup.py clean && python setup.py egg_info sdist --formats=tar



FROM BASE as RELEASE

# TODO check which libs are actually needed
RUN apt-get update && apt-get install -y \
    build-essential \
    python-dev \
    openjdk-7-jre-headless \
    libspatialindex-dev \
    libgeos-dev \
    wget \
    libffi-dev \
    libjpeg-dev \
    zlib1g-dev \
    libfreetype6-dev \
    libproj0 \
    gdal-bin \
    fcgiwrap \
    libgif-dev \
    libgdal1-dev \
    libcurl4-openssl-dev \
    libproj-dev \
    libcairo2-dev \
    libfribidi-dev \
    libharfbuzz-dev \
    librsvg2-dev \
    libfcgi-dev \
    fonts-dejavu-extra \
    ttf-unifont \
    locales

RUN echo "de_DE.UTF-8 UTF-8" >> /etc/locale.gen \
    && echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen \
    && locale-gen \
    && update-locale

RUN mkdir -p /opt/munimap \
    && mkdir -p /opt/mapproxy \
    && mkdir -p /opt/import \
    && mkdir -p /opt/etc \
    && mkdir -p /opt/etc/mapfish \
    && mkdir -p /opt/etc/mapproxy \
    && mkdir -p /opt/etc/munimap \
    && mkdir -p /opt/etc/import \
    && mkdir -p /opt/etc/imposm_changes \
    && mkdir -p /opt/etc/styles \
    && mkdir -p /opt/log \
    && mkdir -p /opt/pkgs \
    && mkdir -p /opt/var \
    && mkdir -p /opt/var/mapfish \
    && mkdir -p /opt/etc/munimap/app-configs \
    && mkdir -p /opt/etc/munimap/map-configs \
    && mkdir -p /opt/etc/munimap/selectionlists-configs \
    && mkdir -p /opt/etc/munimap/plugins \
    && mkdir -p /opt/etc/munimap/project \
    && mkdir -p /opt/log/mapproxy \
    && mkdir -p /opt/var/mapproxy \
    && mkdir -p /opt/log/munimap \
    && mkdir -p /opt/log/printqueue \
    && mkdir -p /opt/var/printqueue \
    && mkdir -p /src

# create empty files to better document which config files to mount
RUN touch /opt/etc/munimap/munimap.conf \
    && touch /opt/etc/munimap/alembic.ini \
    && touch /opt/etc/munimap/draw_icons.yaml \
    && touch /opt/etc/munimap/favicon.ico \
    && touch /opt/etc/munimap/mapfish.yaml

# TODO put alembic.ini (dev version) into repo and copy it here
#      instead of creating it as above.

# TODO check if this is actually still needed
# install gdal
WORKDIR /src
RUN wget -c http://download.osgeo.org/gdal/1.11.4/gdal-1.11.4.tar.gz \
    && tar -xzf gdal-1.11.4.tar.gz \
    && cd /src/gdal-1.11.4 \
    && ./configure --prefix=/opt/local/gdal \
    && make -j4 \
    && make install

RUN wget https://repo1.maven.org/maven2/org/mapfish/print/print-cli/3.9.0/print-cli-3.9.0-tar.tar -O /tmp/mapfish.tar \
    && tar -xvf /tmp/mapfish.tar -C /opt/var/mapfish

COPY --from=BUILDER /pkg/dist/munimap-*.tar /opt/pkgs
COPY --from=BUILDER /pkg/munimap_digitize/dist/munimap_digitize-*.tar /opt/pkgs
COPY --from=BUILDER /pkg/munimap_transport/dist/munimap_transport-*.tar /opt/pkgs
COPY --from=BUILDER /pkg/dev/manage.py /opt/munimap/bin/
COPY --from=BUILDER /pkg/gunicorn.conf /opt/etc/munimap/gunicorn.conf

RUN pip install --upgrade pip && pip install \
    wheel \
    gunicorn==17.5 \
    eventlet==0.17.4 \
    alembic==0.8.3 \
    scriptine==0.2.1 \
    && pip install -f file:///opt/pkgs \
    munimap \
    munimap_transport \
    munimap_digitize

# Hack to disable https for following script.
RUN PYTHONHTTPSVERIFY=0 python -c "import hyphen.dictools; hyphen.dictools.is_installed('de') or hyphen.dictools.install('de')"

ENV JAVA_HOME=/usr/lib/jvm/java-1.7.0-openjdk-amd64
WORKDIR /opt/etc/munimap
CMD gunicorn -c /opt/etc/munimap/gunicorn.conf "munimap.application:create_app(config_file='/opt/etc/munimap/munimap.conf')"
