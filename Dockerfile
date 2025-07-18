ARG ANOL_COMMIT_HASH=7e564b3f9110adbd9fe381f587b7af06e24f66e6

FROM node:22-alpine@sha256:6e80991f69cc7722c561e5d14d5e72ab47c0d6b6cfb3ae50fb9cf9a7b30fdf97 AS clientbuilder

ARG ANOL_COMMIT_HASH
RUN apk add --no-cache wget unzip

RUN mkdir -p tmp/anol
RUN cd /tmp/anol \
    && wget https://github.com/terrestris/anol/archive/$ANOL_COMMIT_HASH.zip -O anol.zip \
    && unzip anol.zip \
    && mv anol-$ANOL_COMMIT_HASH /anol

RUN cd /anol && npm ci --omit=dev

RUN mkdir -p /app

COPY ./munimap /app/munimap
COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json
COPY ./webpack.config.js /app/webpack.config.js

WORKDIR /app

RUN npm ci
RUN npm run build



FROM python:3.9.13-bullseye AS builder

RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip \
    && pip install build

RUN mkdir -p /pkg
# We have to build the client bevor packing everything into a python package
COPY --from=clientbuilder /app/munimap /pkg/munimap

COPY ./pyproject.toml /pkg/pyproject.toml

WORKDIR /pkg

RUN python -m build



FROM python:3.9.13-bullseye AS runner

# TODO check which libs are actually needed
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
    build-essential \
    ca-certificates \
    python3-dev \
    libpython3-dev \
    python3-gdal \
    python3-pycurl \
    libgdal-dev \
    # openjdk-11-jre-headless \
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
    fonts-unifont \
    locales \
    software-properties-common \
    jq \
    && rm -rf /var/lib/apt/lists/*


RUN echo "de_DE.UTF-8 UTF-8" >> /etc/locale.gen \
    && echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen \
    && locale-gen \
    && update-locale

RUN mkdir -p /opt/munimap \
    && mkdir -p /opt/import \
    && mkdir -p /opt/etc \
    && mkdir -p /opt/etc/mapfish \
    && mkdir -p /opt/etc/munimap \
    && mkdir -p /opt/etc/import \
    && mkdir -p /opt/etc/imposm_changes \
    && mkdir -p /opt/etc/styles \
    && mkdir -p /opt/log \
    && mkdir -p /opt/pkgs \
    && mkdir -p /opt/var \
    && mkdir -p /opt/var/mapfish \
    && mkdir -p /opt/var/geostyler-cli \
    && mkdir -p /opt/etc/munimap/data/stats \
    && mkdir -p /opt/etc/munimap/configs \
    && mkdir -p /opt/etc/munimap/bielefeld \
    && mkdir -p /opt/etc/munimap/printqueue \
    && mkdir -p /opt/etc/munimap/printqueue/job-specs \
    && mkdir -p /opt/log/munimap \
    && mkdir -p /opt/log/printqueue \
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
RUN wget -qO - https://packages.adoptium.net/artifactory/api/security/keypair/default-gpg-key/public | apt-key add -
RUN add-apt-repository --yes https://packages.adoptium.net/artifactory/deb
RUN apt update -y && apt install temurin-8-jre -y

RUN wget -q -O- https://repo1.maven.org/maven2/org/mapfish/print/print-cli/3.9.0/print-cli-3.9.0-tar.tar | tar -x -C /opt/var/mapfish

RUN wget -q -O /tmp/geostyler-linux.zip https://github.com/geostyler/geostyler-cli/releases/download/v5.0.0/geostyler-linux.zip \
    && cd /opt/var/geostyler-cli \
    && unzip /tmp/geostyler-linux.zip \
    && rm /tmp/geostyler-linux.zip

RUN pip install --upgrade pip && \
    pip install \
    gunicorn==21.2.0 \
    eventlet==0.33.3 \
    dnspython==2.3.0

COPY ./gunicorn.conf /opt/etc/munimap/gunicorn.conf
COPY --from=builder /pkg/dist/munimap-*.whl /opt/pkgs

RUN pip install /opt/pkgs/munimap-*.whl

# Hack to disable https for following script.
RUN PYTHONHTTPSVERIFY=0 python -c "import hyphen.dictools; hyphen.dictools.is_installed('de_DE') or hyphen.dictools.install('de_DE')"

ENV JAVA_HOME=/usr/lib/jvm/temurin-8-jre-amd64

WORKDIR /opt/etc/munimap

HEALTHCHECK CMD curl -s http://localhost:8080/health | jq -e '.healthy == true' > /dev/null || exit 1

ENV REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt

RUN mkdir -p /certs

COPY ./munimap/logging.yaml /opt/etc/munimap/configs/logging.yaml

COPY ./entrypoint.sh /entrypoint.sh

# Flag to decide if alembic should be run before starting the application
ENV RUN_ALEMBIC="true"

# Flag to decide if icons should be copied to the mapfish config dir before starting the application
ENV COPY_ICONS_TO_MAPFISH_CONFIG_DIR="true"

ENTRYPOINT ["/entrypoint.sh"]

CMD ["gunicorn", "-c", "/opt/etc/munimap/gunicorn.conf", "munimap.application:create_app(config_file='/opt/etc/munimap/configs/munimap.conf')"]
