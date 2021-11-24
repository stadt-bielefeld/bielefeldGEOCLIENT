FROM python:2.7-slim-buster

RUN apt update && apt install -y \
    wget \
    tar \
    fonts-dejavu-extra \
    ttf-unifont

ARG MAGNACARTO_VERSION=20170421-1afab84
ARG PKG_URL=https://download.omniscale.de/magnacarto/rel/dev-$MAGNACARTO_VERSION/
ARG FILENAME=magnacarto-dev-$MAGNACARTO_VERSION-linux-amd64

RUN mkdir -p /opt/local/magnacarto \
    && mkdir -p /opt/local/bin \
    && mkdir -p /opt/etc/styles/project

RUN cd /tmp \
    && wget --no-check-certificate --timestamping --continue --progress=dot:mega $PKG_URL$FILENAME.tar.gz \
    && tar zxvf $FILENAME.tar.gz \
    && cp $FILENAME/magnacarto /opt/local/magnacarto/$FILENAME \
    && chmod +x /opt/local/magnacarto/$FILENAME \
    && ln -sf /opt/local/magnacarto/$FILENAME /opt/local/bin/magnacarto

RUN pip install --upgrade pip && pip install \
    pyyaml==5.4.1

ENV PATH="${PATH}:/opt/local/bin"

COPY ./make.py /opt/etc/styles/project/make.py

WORKDIR /opt/etc/styles/project

ENTRYPOINT python make.py
