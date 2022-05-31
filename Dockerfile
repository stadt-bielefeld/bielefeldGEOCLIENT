ARG ANOL_COMMIT_HASH=ce0b062442d165155fa2a0d1324ba70e3d95bd68



FROM node:14.18.1-alpine3.14 as CLIENTBUILDER

ARG ANOL_COMMIT_HASH
RUN apk add --no-cache wget unzip

RUN npm i -g npm@7

RUN mkdir -p tmp/anol
RUN cd /tmp/anol \
    && wget https://github.com/terrestris/anol/archive/$ANOL_COMMIT_HASH.zip -O anol.zip \
    && unzip anol.zip \
    && mv anol-$ANOL_COMMIT_HASH /anol

RUN cd /anol && npm ci

RUN mkdir -p /app

COPY ./munimap /app/munimap
COPY ./munimap_digitize /app/munimap_digitize
COPY ./munimap_transport /app/munimap_transport
COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json
COPY ./webpack.config.js /app/webpack.config.js

WORKDIR /app

RUN npm ci
RUN npm run build



FROM python:3.9.13-buster as BUILDER

RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip \
    && pip install wheel setuptools

RUN mkdir -p /pkg
# We have to build the client bevor packing everything into a python package
COPY --from=CLIENTBUILDER /app/munimap /pkg/munimap
COPY --from=CLIENTBUILDER /app/munimap_digitize /pkg/munimap_digitize
COPY --from=CLIENTBUILDER /app/munimap_transport /pkg/munimap_transport

COPY ./MANIFEST.in /pkg/MANIFEST.in
COPY ./setup.cfg /pkg/setup.cfg
COPY ./setup.py /pkg/setup.py

WORKDIR /pkg

RUN python setup.py clean && python setup.py egg_info sdist --formats=tar
RUN cd munimap_digitize && python setup.py clean && python setup.py egg_info sdist --formats=tar
RUN cd munimap_transport && python setup.py clean && python setup.py egg_info sdist --formats=tar



FROM python:3.9.13-buster as RUNNER

# TODO check which libs are actually needed
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    libpython3-dev \
    python-gdal \
    python3-gdal \
    python3-pycurl \
    libgdal-dev \
    #äopenjdk-11-jre-headless \
    libspatialindex-dev \
    libgeos-dev \
    libssl-dev \
    wget \
    libffi-dev \
    libjpeg-dev \
    zlib1g-dev \
    libfreetype6-dev \
    libproj-dev \
    gdal-bin \
    fcgiwrap \
    libgif-dev \
    libcurl4-openssl-dev \
    libproj-dev \
    libcairo2-dev \
    libfribidi-dev \
    libharfbuzz-dev \
    librsvg2-dev \
    libfcgi-dev \
    fonts-dejavu-extra \
    ttf-unifont \
    locales \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

    
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
    && mkdir -p /opt/etc/munimap/bielefeld \
    && mkdir -p /opt/log/mapproxy \
    && mkdir -p /opt/var/mapproxy \
    && mkdir -p /opt/log/munimap \
    && mkdir -p /opt/log/printqueue \
    && mkdir -p /opt/var/printqueue \
    && mkdir -p /src

RUN mkdir -p /opt/etc/munimap/configs/mapfish

# create empty files to better document which config files are needed
RUN touch /opt/etc/munimap/configs/munimap.conf \
    && touch /opt/etc/munimap/configs/alembic.ini \
    && touch /opt/etc/munimap/configs/draw_icons.yaml \
    && touch /opt/etc/munimap/configs/mapfish/mapfish.yaml

# Get and install openjdk-8-jre. Not available in Debian Buster
# TODO: Check for a possible mapfish print update, so version 11 can be used. Then this is not needed anymore. 
# openjdk-11-jre can be easily installed by apt#
RUN wget -qO - https://adoptopenjdk.jfrog.io/adoptopenjdk/api/gpg/key/public | apt-key add -
RUN add-apt-repository --yes https://adoptopenjdk.jfrog.io/adoptopenjdk/deb/
RUN apt update -y && apt install adoptopenjdk-8-hotspot-jre -y

RUN wget -q -O- https://repo1.maven.org/maven2/org/mapfish/print/print-cli/3.9.0/print-cli-3.9.0-tar.tar | tar -x -C /opt/var/mapfish

RUN pip install --upgrade pip && pip install \
    wheel \
    setuptools \
    gunicorn==20.1.0 \
    eventlet==0.30.2 \
    alembic==1.7.7 \
    scriptinep3==0.3.1

COPY ./gunicorn.conf /opt/etc/munimap/gunicorn.conf
COPY --from=BUILDER /pkg/dist/munimap-*.tar /opt/pkgs
COPY --from=BUILDER /pkg/munimap_digitize/dist/munimap_digitize-*.tar /opt/pkgs
COPY --from=BUILDER /pkg/munimap_transport/dist/munimap_transport-*.tar /opt/pkgs

RUN pip install -f file:///opt/pkgs \
    munimap \
    munimap_transport \
    munimap_digitize

# Hack to disable https for following script.
RUN PYTHONHTTPSVERIFY=0 python -c "import hyphen.dictools; hyphen.dictools.is_installed('de') or hyphen.dictools.install('de')"

ENV JAVA_HOME=/usr/lib/jvm/adoptopenjdk-8-hotspot-jre-amd64
WORKDIR /opt/etc/munimap
CMD gunicorn -c /opt/etc/munimap/gunicorn.conf "munimap.application:create_app(config_file='/opt/etc/munimap/configs/munimap.conf')"
