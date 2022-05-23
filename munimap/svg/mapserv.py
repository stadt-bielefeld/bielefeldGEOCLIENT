import re
import sys

from xml.etree.ElementTree import parse
from itertools import groupby
from contextlib import closing

import requests

from .combine import CombineSVG


def get_wms_layer_names(base_url, params={}):
    params = {k.upper(): v for k, v in list(params.items())}
    params['REQUEST'] = 'GetCapabilities'
    params['SERVICE'] = 'WMS'
    with closing(requests.get(base_url, params=params, stream=True)) as r:
        for layer in parse_layer_names(r.raw):
            yield layer


def parse_layer_names(f):
    tree = parse(f)
    root = tree.getroot()

    for elem in root.findall(
        './wms:Capability/wms:Layer/wms:Layer/wms:Name',
        {'wms': 'http://www.opengis.net/wms'}
    ):
        yield elem.text


def combined_mapserv_svg(base_url, print_params, output=sys.stdout):
    layers = get_wms_layer_names(base_url)

    c = CombineSVG(output)
    for layer_name, sublayers in groupby(layers, lambda l: re.sub('[-_].*$', '', l)):
        params = {k.upper(): v for k, v in list(print_params.items())}
        params['LAYERS'] = ','.join(sublayers)
        with closing(requests.get(base_url, params=params, stream=True)) as r:
            c.add(layer_name, r.raw)

    c.close()

if __name__ == '__main__':
    with open('/tmp/out.svg', 'wb') as f:
        combined_mapserv_svg(
            base_url='http://www.example.org/mapserv?map=/karte.map&map_resolution=216',
            print_params={
                'service': 'WMS',
                'version': '1.1.1',
                'request': 'GetMap',
                'width': str(195.79166666666666 * 300 / 25.6),
                'height': str(275.1666666666667 * 300 / 25.6),
                'srs': 'EPSG:25832',
                'styles': '',
                'format': 'image/svg+xml',
                'bbox': '467097.1662383815,5761787.349674104,469055.08290504816,5764539.01634077',
            },
            output=f)
