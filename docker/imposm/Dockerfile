FROM golang:1.10

RUN apt update && apt install -y python3-pip \
      libprotobuf-dev libleveldb-dev libgeos-dev \
      libpq-dev python3-dev python-setuptools \
      gdal-bin \
      --no-install-recommends

RUN ln -s /usr/lib/libgeos_c.so /usr/lib/libgeos.so

WORKDIR $GOPATH
RUN go get github.com/tools/godep
RUN git clone https://github.com/omniscale/imposm3 src/github.com/omniscale/imposm3
RUN cd src/github.com/omniscale/imposm3 && make update_version && go install ./cmd/imposm/

WORKDIR /home

CMD ["imposm", "import", "-config", "imposm_config/config.json", "-read", "imposm_data/detmold-regbez-latest.osm.pbf", "-write", "-overwritecache", "-deployproduction"]