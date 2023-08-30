

import logging
import os
import os.path
import re
import errno
import json
import threading
import tempfile
import subprocess
import time
import datetime

from contextlib import closing
from copy import deepcopy
from zipfile import ZipFile

import requests

from flask import current_app, render_template
from flask_babel import gettext as _

from munimap.query.feature_collection import query_feature_collection
from munimap.print_requests import MapRequest
from munimap.layers import (mapfish_grid_layer, mapfish_numeration_layer,
    mapfish_feature_collection_layer, mapfish_measure_feature_collection_layer)

log = logging.getLogger('munimap.print')

GRID_STYLE = {
    'strokeColor': 'rgb(50, 50, 50)',
    'strokeOpacity': 0.5,
    'strokeWidth': 1,
    'label': '[name]',
    'labelAlign': 'cm',
    'fontSize': '[label_size]',
    'fontColor': 'rgb(100, 100, 100)',
    'fontFamily': 'DejaVu Sans'
}

# see http://docs.geoserver.org/latest/en/user/styling/sld-reference/labeling.html
# and mapfish/styles/numberation.sld
NUMERATION_STYLE = {
    'label': '__num__',
    'labelXOffset': 12,
    'labelYOffset': 6,
    'fontColor': '#ffffff',
    'fontSize': 5,
    'fontFamily': 'DejaVu Sans Bold',
    'fillColor': '#000000',
    'circleMargin': 1.75,
    'circleXOffset': 0.3,
    'circleYOffset': -0.2
}


def create_mapfish_v2_style(mapfish_style_id, style, geometry_type, dpi):
    if geometry_type == 'LineString':
        symbolizer = {'type': 'line'}
    elif geometry_type == 'Point':
        if 'text' in style:
            style['label'] = style['text']
            symbolizer = {'type': 'text'}
        else:
            symbolizer = {'type': 'point'}
    elif geometry_type == 'Polygon':
        symbolizer = {'type': 'polygon'}

    symbolizer.update(style)

    style = {
        'symbolizers': [symbolizer]
    }
    style_filter = "[mapfishStyleId] = %s" % mapfish_style_id
    return {
        style_filter: style
    }


def prepare_style_for_mapfish(style, requested_opacity, internal_type='postgis', is_custom=False):
    if 'externalGraphic' in style:
        if internal_type in ['digitize'] or not is_custom:
            style['externalGraphic'] = os.path.abspath(os.path.join(
                current_app.config.get('MAPFISH_ICONS_DIR'),
                style['externalGraphic']
            ))
        else:
            style['externalGraphic'] = os.path.abspath(os.path.join(
                current_app.config.get('MAPFISH_CLI_ICONS_DIR'),
                style['externalGraphic']
            ))
        if 'graphicOpacity' in style:
            style['graphicOpacity'] = float(style['graphicOpacity']) * requested_opacity

    # extract opacity from rgba. mapfish print ignores opacity in rgba
    if 'fillColor' in style and 'rgba' in style['fillColor']:
        opacity = extract_opacity_from_rgba(style['fillColor'])
        style['fillOpacity'] = opacity * requested_opacity
    if 'strokeColor' in style and 'rgba' in style['strokeColor']:
        opacity = extract_opacity_from_rgba(style['strokeColor'])
        style['strokeOpacity'] = opacity * requested_opacity
    if 'radius' in style:
        style['pointRadius'] = style['radius']


def mapfish_layers(requested_layers, bbox=None, srs=None, dpi=None, scale=None, is_custom=False):
    if len(requested_layers) == 0:
        return []
    # convert list of strings to needed format
    if isinstance(requested_layers[0], str):
        requested_layers = [[name, {}] for name in requested_layers]
    layers = []

    # TODO handle layer not found
    num_offset = 1
    for name, params in reversed(requested_layers):
        requested_opacity = 1
        if 'opacity' in params:
            requested_opacity = float(params['opacity'])

        print_name = '%s_print' % name
        if print_name in current_app.mapfish_layers:
            name = print_name

        layer = deepcopy(current_app.mapfish_layers[name])
        if layer['type'] == 'geojson' and bbox and srs:
            if 'internal_type' in layer and layer['internal_type'] in ('postgis', 'digitize'):
                layer['geoJson'] = query_feature_collection(MapRequest(
                    bbox=bbox,
                    layers=[name],
                    srs=srs,
                    limit=1000,
                    ),
                    current_app.pg_layers,
                    num_offset=num_offset,
                )
            else:
                geojson_file = os.path.join(current_app.config.get('GEOJSON_DATA_PATH'), layer['file'])
                del layer['file']
                with open(geojson_file, 'r') as s:
                    layer['geoJson'] = json.loads(s.read())
                for feature in layer['geoJson']['features']:
                    feature['properties']['mapfishStyleId'] = '1'
                    feature['properties']['__layer__'] = name
            num_offset += len(layer['geoJson']['features'])
            # skip empty featureCollections, otherwise mapfish-print
            # raises "java.lang.NullPointerException"
            if len(layer['geoJson']['features']) == 0:
                    continue

            # load stylings from digitize and move to the layer
            if 'internal_type' in layer and layer['internal_type'] == 'digitize':
                style = {}
                for i, feature in enumerate(layer['geoJson']['features']):

                    geometry_type = feature['geometry']['type']
                    mapfish_style_id, feature_style = feature['properties']['__style__']

                    if scale is not None and 'minScale' in feature_style:
                        if feature_style['minScale'] > scale:
                            del layer['geoJson']['features'][i]
                            continue
                    if scale is not None and 'maxScale' in feature_style:
                        if feature_style['maxScale'] < scale:
                            del layer['geoJson']['features'][i]
                            continue

                    style.update(create_mapfish_v2_style(
                        mapfish_style_id,
                        feature_style,
                        geometry_type,
                        dpi))
                    # remove temp __style__ property only without mapfish show the feature
                    del feature['properties']['__style__']
                if not style:
                    layer['style'] = {}
                else:
                    layer['style'].update(style)

            for key in layer.get('style', {}):
                if key in ('version', 'styleProperty'):
                    continue

                style = layer['style'][key]
                if 'symbolizers' in style:
                    for symbolizer in style['symbolizers']:
                        prepare_style_for_mapfish(symbolizer, requested_opacity, layer.get('internal_type', layer.get('type')), is_custom=is_custom)
                else:
                    prepare_style_for_mapfish(style, requested_opacity, layer.get('internal_type', layer.get('type')), is_custom=is_custom)

            # remove interal_type only without mapfish works
            if 'internal_type' in layer:
                del layer['internal_type']

        elif layer['type'] == 'WMS':
            if dpi is not None:
                layer['customParams']['dpi'] = dpi
                layer['customParams']['map_resolution'] = dpi

            if 'opacity' in params:
                layer['opacity'] = float(params['opacity'])
        # elif layer['type'] == 'WMTS':
            # TODO how to request wmts with current dpi?
        layers.append(layer)

    return layers


def extract_opacity_from_rgba(rgba):
    opacity = 1.0
    values = re.findall("rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d?\.?\d*)\s*\)$", rgba)
    if len(values) == 1 and len(values[0]) == 4:
        return float(values[0][3])
    return opacity


def create_spec_json(req, is_custom=False, icons_dir=''):
    print_layers = mapfish_layers(req.layers, req.bbox, req.srs, req.dpi, req.calc_scale, is_custom=is_custom)
    numeration_features = query_feature_collection(
        MapRequest(
            bbox=req.bbox, layers=[
                name for name in req.layers
                if name in current_app.pg_layers and
                current_app.pg_layers[name].get('create_index', True)
            ], srs=req.srs, limit=req.limit
        ), current_app.pg_layers)

    if req.feature_collection:
        print_layers.insert(0, mapfish_feature_collection_layer(req.feature_collection, icons_dir))

    if req.measure_feature_collection:
        print_layers.insert(0, mapfish_measure_feature_collection_layer(req.measure_feature_collection))

    if len(numeration_features) > 0:
        print_layers.insert(0, mapfish_numeration_layer(numeration_features,
                                                        req.srs, req.scale,
                                                        req.dpi,
                                                        NUMERATION_STYLE))

    if req.grid:
        print_layers.insert(0, mapfish_grid_layer(req.grid, req.srs,
                            GRID_STYLE))

    # mapfish knows EPSG:4326 as CRS:84
    if req.srs == 4326:
        srs = 'CRS:84'
    else:
        srs = 'EPSG:%d' % req.srs

    spec = {
        'layout': req.page_layout.replace('-', '_').lower(),
        # TODO improve mimetype to output format convertion.
        # mapfish docu says "applicatin/pdf" is allowed, but it needs "pdf"
        # instead
        'outputFormat': req.mimetype.split('/')[1],
        'attributes': {
            'scale': _('Scale 1 : %(scale)s', scale=req.scale),
            'mapConfig': {
                'projection': srs,
                'dpi': req.dpi,
                'rotation': 0,
                'bbox': req.bbox,
                # with bbox, scale has no effect
                # it's needed only when center is given
                # 'scale': req.scale,
                'layers': print_layers
            }
        }
    }
    handle, spec_file_path = tempfile.mkstemp(
        dir=current_app.config.get('PRINT_JOBSPEC_DIR'),
        prefix=str(datetime.datetime.now()) + '.',
        suffix='.json'
    )
    with open(spec_file_path, 'w', encoding='utf8') as spec_file:
        spec_file.write(json.dumps(spec))
    return spec_file_path


def create_jasper_report(print_request, base_path):
    project_dir = current_app.config.get('PROJECT_DIR')
    margins = current_app.config.get('MAPFISH_PRINT_MAP_MARGINS', [0, 0, 0, 0])
    page_width = int(round((print_request.page_size[0] * 72) / 25.4))
    page_height = int(round((print_request.page_size[1] * 72) / 25.4))
    column_width = page_width - margins[1] - margins[3]
    map_height = page_height - margins[0] - margins[2]
    jasper_report = render_template(
        'munimap/mapfish/custom.jrxml',
        page_width=page_width,
        page_height=page_height,
        column_width=column_width,
        map_height=map_height)

    report_file = tempfile.mkstemp(dir=base_path, suffix='.jrxml')[1]
    with open(report_file, 'wb') as f:
        f.write(jasper_report.encode('utf8'))

    return report_file


def create_mapfish_yaml(print_request, base_path, report_file):
    margins = current_app.config.get('MAPFISH_PRINT_MAP_MARGINS', [0, 0, 0, 0])
    width = int(round((print_request.page_size[0] * 72) / 25.4))
    width = width - margins[1] - margins[3]
    height = int(round((print_request.page_size[1] * 72) / 25.4))
    height = height - margins[0] - margins[2]

    yaml_content = render_template(
        'munimap/mapfish/custom.yaml',
        width=width,
        height=height,
        report_file=os.path.basename(report_file))

    yaml_file = tempfile.mkstemp(dir=base_path, suffix='.yaml')[1]
    with open(yaml_file, 'w') as f:
        f.write(yaml_content)

    return yaml_file


def mapfish_printqueue_task(spec_file, config_file, output_file, index_url, report_file=None, is_custom=False):
    return {
        'type': 'mapfish_print',
        'mapfish_print_cmd': current_app.config.get('MAPFISH_PRINT_CMD'),
        'mapfish_print_base_url': current_app.config.get('MAPFISH_PRINT_BASE_URL'),
        'mapfish_print_create_url': current_app.config.get('MAPFISH_PRINT_CREATE_URL'),
        # custom print layouts (i.e. adjusted sizes) use the mapfish cli
        'mapfish_print_service': not is_custom,
        'spec_file': spec_file,
        'config_file': config_file,
        'output_file': output_file,
        'index_url': index_url,
        'report_file': report_file,
        'is_custom': is_custom,
    }


def run_with_timeout(proc, timeout, input=None):
    """
    Run Popen process with given timeout. Kills the process if it does
    not finish in time.

    You need to set stdout and/or stderr to subprocess.PIPE in Popen, otherwise
    the output will be None.

    The returncode is 999 if the process was killed.

    :returns: (returncode, stdout string, stderr string)
    """
    output = []

    def target():
        output.extend(proc.communicate(input))

    thread = threading.Thread(target=target)
    thread.daemon = True
    thread.start()

    killed = False

    thread.join(timeout)
    if thread.is_alive():
        proc.terminate()
        killed = True
        thread.join()

    returncode = proc.returncode
    if killed:
        returncode = 999
    return returncode, output[0], output[1]


def ensure_directory(directory):
    if not os.path.exists(directory):
        try:
            os.makedirs(directory)
        except OSError as ex:
            log.error('could not create directory \'%s\'' % directory)
            if ex.errno != errno.EEXIST:
                raise


def mapfish_printqueue_service(job):
    map_filename = job['output_file']

    with open(job['spec_file']) as data_file:
        data = json.load(data_file)

    # TODO load output format not from filename?
    extension = os.path.splitext(map_filename)[1]

    r = requests.post(
        '%s%s' % (job['mapfish_print_create_url'], extension),
        json=data
    )

    if not r.ok:
        return {
            'error': 'error creating mapfish_print request',
            'full_error': r.content,
        }

    content = json.loads(r.content)
    status_url = content['statusURL']
    download_url = content['downloadURL']

    def request_status(status_url):
        status_request = requests.get(
            '%s%s' % (job['mapfish_print_base_url'], status_url)
        )
        content = json.loads(status_request.content)
        if not content['done']:
            time.sleep(1)
            request_status(status_url)

        if not status_request.ok or content['status'] in ['cancelled', 'error']:
            return {
                'error': 'error requesting mapfish print status',
                'full_error': r.content,
            }

    request_status(status_url)
    with open(map_filename, 'wb') as handle:

        response = requests.get(
            '%s%s' % (job['mapfish_print_base_url'], download_url),
            stream=True,
        )
        if not response.ok:
            return {
                'error': 'error downloading export document',
                'full_error': response.content,
            }

        for block in response.iter_content(1024):
            handle.write(block)
    return {}


def mapfish_printqueue_worker_process(job):
    map_filename = job['output_file']

    cmd = [
        job['mapfish_print_cmd'],
        '-config', job['config_file'],
        '-spec', job['spec_file'],
        '-output', map_filename,
    ]

    ensure_directory(os.path.dirname(map_filename))

    env = os.environ.copy()
    env['JAVA_OPTS'] = env.get('JAVA_OPTS', '') + ' -Djava.awt.headless=true'

    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        env=env,
    )

    timeout = job.get('timeout', 60 * 10)
    ret, stdout, _ = run_with_timeout(process, timeout=timeout)
    if ret == 999:
        return {
            'error': 'killed mapfish_print after %d seconds' % timeout,
            'full_error': stdout,
        }
    if ret != 0:
        return {
            'error': 'error while calling mapfish_print (%d)' % ret,
            'full_error': stdout,
        }

    return {}

def mapfish_printqueue_worker(job):
    log.info('print worker started')
    if job.get('type') != 'mapfish_print':
        return {'error': 'not a mapfish_print job'}

    map_filename = job['output_file']
    ensure_directory(os.path.dirname(map_filename))

    if job['mapfish_print_service']:
        file = mapfish_printqueue_service(job)
    else:
        file = mapfish_printqueue_worker_process(job)

    if 'error' in file:
        return file

    if job.get('is_custom', False):
        os.remove(job['config_file'])
        os.remove(job['report_file'])

    index_url = job.get('index_url')
    if not index_url:
        return {'output_file': map_filename}

    base_filename, ext = os.path.splitext(map_filename)
    zip_filename = base_filename + '.zip'
    zip_buf = ZipFile(zip_filename, 'w')

    with closing(requests.get(index_url)) as r:
        if not r.ok:
            zip_buf.close()
            return {
                'error': f'unable to request index from {index_url}',
                'full_error': f'{r}\n{r.content.decode()}',
            }
        zip_buf.writestr('index.pdf', r.content)

    zip_buf.write(map_filename, 'map' + ext)
    zip_buf.close()
    os.unlink(map_filename)

    return { 'output_file': zip_filename }
