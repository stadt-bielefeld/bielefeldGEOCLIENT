FROM camptocamp/mapserver:7.6

RUN apt update && apt install -y \
    gdal-bin \
    fonts-dejavu-extra \
    ttf-unifont \
    python2.7 \
    python-pip \
    wget

RUN mkdir -p /opt/svgserver \
    && mkdir -p /opt/pkgs \
    && mkdir -p /opt/etc/styles/bielefeld \
    && mkdir -p /opt/log/mapproxy \
    && chown -R www-data:www-data /opt/log/mapproxy

RUN wget https://github.com/omniscale/svgserver/archive/a98f75ec9547fda25941129e854af046ba8f5dfe.tar.gz -O /opt/pkgs/svgserver-0.2.0.tar.gz

COPY requirements_svgserver.txt /opt/svgserver/requirements.txt

RUN pip install --upgrade pip && pip install -r /opt/svgserver/requirements.txt -f file:///opt/pkgs

WORKDIR /opt/etc/styles/bielefeld

ENTRYPOINT python -m svgserver.main --mapserver /usr/local/bin/mapserv --translations ./svg-translations.txt --port 8182 --url-prefix /svgserver --host 0.0.0.0
