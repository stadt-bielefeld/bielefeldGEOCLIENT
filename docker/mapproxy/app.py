# from logging.config import fileConfig
# fileConfig(r'/opt/etc/mapproxy/log.ini')

from mapproxy.wsgiapp import make_wsgi_app
application = make_wsgi_app('/opt/etc/mapproxy/mapproxy.yaml')
