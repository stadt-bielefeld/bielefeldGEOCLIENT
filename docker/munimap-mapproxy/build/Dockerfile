FROM python:2.7.16-jessie as BASE

RUN apt-get update && apt-get install -y \
    libgeos-dev \
    libproj0 \
    libproj-dev

RUN mkdir -p /opt/etc/mapproxy \
    && mkdir -p /opt/log/mapproxy \
    && mkdir -p /opt/mapproxy/bin \
    && mkdir -p /opt/var/mapproxy

WORKDIR /opt/etc/mapproxy

# create empty files to better document which config files to mount
RUN touch mapproxy.yaml

COPY ./requirements.txt requirements.txt
COPY ./app.py app.py
COPY ./log.ini log.ini
COPY ./gunicorn.conf gunicorn.conf

RUN pip install --upgrade pip \
    && pip install -r requirements.txt

CMD ["gunicorn", "-c", "/opt/etc/mapproxy/gunicorn.conf", "app:application"]
