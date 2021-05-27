from copy import deepcopy

import requests

from flask import (
    current_app,
    abort,
)

from munimap.svg.mapserv import combined_mapserv_svg

def print_raw(print_request, output_file):
    raw_layer = None
    for layer in print_request.layers:
        raw_layer_name = '%s_raw' % layer
        if raw_layer_name in current_app.mapfish_layers:
            raw_layer = deepcopy(current_app.mapfish_layers[raw_layer_name])
            break
    if raw_layer is None:
        return abort(404)

    width_mm, height_mm = print_request.page_size
    width = int(round(width_mm * print_request.dpi / 25.6))
    height = int(round(height_mm * print_request.dpi / 25.6))

    params = {
        'LAYERS': ','.join(raw_layer['layers']),
        'FORMAT': print_request.mimetype,
        'SRS': 'EPSG:%s' % print_request.srs,
        'SERVICE': 'WMS',
        'VERSION': '1.1.1',
        'REQUEST': 'GetMap',
        'BBOX': ','.join(map(str, print_request.bbox)),
        'WIDTH': width,
        'HEIGHT': height,
        'STYLES': ''
    }

    if print_request.mimetype == 'image/svg+xml':
        with open(output_file, 'wb') as f:
            combined_mapserv_svg(raw_layer['baseURL'], print_params=params, output=f)

    else:
        result = requests.get(raw_layer['baseURL'], params=params)
        with open(output_file, 'wb') as f:
            f.write(result.content)
