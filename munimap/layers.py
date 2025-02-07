# -:- encoding: utf8 -:-

import yaml
import math
import hashlib
import os.path
from shapely.geometry import LineString, Polygon
from collections import OrderedDict

from copy import deepcopy
from flask import current_app

from munimap.helper import merge_dict, _l, resolve_selectionlist, InvalidAppConfigError
from munimap.validation import validate_layers_conf
from munimap.model import Feature

import logging
log = logging.getLogger('munimap.layers')


class UnsupportedLayerError(Exception):
    pass


class InvalidConfigurationError(Exception):
    pass


class WMTSMatrixError(Exception):
    pass


class Layer(dict):
    pass


class Source(dict):
    pass


class Style(dict):
    pass


class Group(dict):
    pass


def add_layers_base_url(url, layers_base_url='', default_protocol=''):
    if url.startswith('//') and default_protocol != '':
        return default_protocol + ':' + url
    if layers_base_url and not url.startswith('http'):
        return layers_base_url + url
    return url


def anol_background_layer(layer_conf, layers_base_url=''):
    source = None
    if layer_conf['type'] == 'wmts':
        layer = layer_conf['name']
        if layer_conf.get('source').get('directAccess'):
            layer = layer_conf.get('source').get('layer')

        source = {
            'layer': layer,
            'projection': layer_conf['source']['srs'],
            'format': layer_conf['source']['format'],
            'extent': layer_conf['source']['extent'],
            'levels': layer_conf['source']['levels'],
            'matrixSet': layer_conf['source']['matrixSet']
        }
    elif layer_conf['type'] in ('wms', 'tiledwms'):
        layers = layer_conf['name']
        if layer_conf.get('source').get('directAccess'):
            layers = ','.join(layer_conf.get('source').get('layers'))

        source = {
            'format': layer_conf['source']['format'],
            'params': {
                'LAYERS': layers,
                'SRS': layer_conf['source']['srs']
            }
        }
    else:
        raise UnsupportedLayerError(
            'background layer type "%s" is not supported' % layer_conf['type'])

    # TODO can we remove this property?
    if 'tilePixelRatio' in layer_conf['source']:
        source['tilePixelRatio'] = layer_conf['source']['tilePixelRatio']
    # TODO can we remove this property?
    if 'tileSize' in layer_conf['source']:
        source['tileSize'] = layer_conf['source']['tileSize']
    if 'hqUrl' in layer_conf['source']:
        source['hqUrl'] = layer_conf['source']['hqUrl']
    if 'hqLayer' in layer_conf['source']:
        source['hqLayer'] = layer_conf['source']['hqLayer']
    if 'hqMatrixSet' in layer_conf['source']:
        source['hqMatrixSet'] = layer_conf['source']['hqMatrixSet']

    background_layer = {
        'name': layer_conf['name'],
        'title': layer_conf['title'],
        'isBackground': True,
        'type': layer_conf['type'],
        'catalog': layer_conf.get('catalog', False),
        'status': layer_conf.get('status', 'active'),
        'olLayer': {
            'source': source
        }
    }

    if 'metadataUrl' in layer_conf:
        background_layer['metadataUrl'] = layer_conf['metadataUrl']

    if 'searchConfig' in layer_conf:
        background_layer['searchConfig'] = layer_conf['searchConfig']

    if 'legend' in layer_conf:
        background_layer['legend'] = layer_conf['legend']

    if 'opacity' in layer_conf:
        background_layer['opacity'] = layer_conf['opacity']

    if 'attribution' in layer_conf:
        background_layer['attribution'] = layer_conf['attribution']
        if 'last_update' in layer_conf:
            if layer_conf['type'] in ('wms', 'tiledwms', 'wmts'):
                background_layer['attribution'] = _l('%(name)s [edited %(last_update)s]', name=layer_conf['attribution'], last_update=layer_conf['last_update'])
            else:
                background_layer['attribution'] = _l('%(name)s [last update %(last_update)s]', name=layer_conf['attribution'], last_update=layer_conf['last_update'])

    return background_layer


def anol_overlay_layer(layer_conf, layers_base_url=''):
    source = {}
    style = layer_conf.get('style')

    if layer_conf['type'] == 'postgis':
        source['additionalParameters'] = {
            'layers': [layer_conf['name']]
        }
    elif layer_conf['type'] == 'digitize':
        source['layer'] = layer_conf['source']['name']
        source['dataProjection'] = layer_conf['source']['srs']
    elif layer_conf['type'] == 'static_geojson':
        source['dataProjection'] = layer_conf['source']['srs']
        source['file'] = layer_conf['source']['file']
    elif layer_conf['type'] in ('wms', 'tiledwms'):
        layers = layer_conf['name']
        if layer_conf.get('source').get('directAccess'):
            layers = ','.join(layer_conf.get('source').get('layers'))

        source = {
            'format': layer_conf['source']['format'],
            'params': {
                'LAYERS': layers,
                'SRS': layer_conf['source']['srs']
            }
        }
        if layer_conf['type'] in ('wms'):
            source['projection'] = layer_conf['source']['srs']
    elif layer_conf['type'] == 'wmts':
        layer_name = layer_conf['name']
        if layer_conf.get('source').get('directAccess'):
            layer_name = layer_conf.get('source').get('layer')

        source['layer'] = layer_name
        source['projection'] = layer_conf['source']['srs']
        source['format'] = layer_conf['source']['format']
        source['extent'] = layer_conf['source']['extent']
        source['levels'] = layer_conf['source']['levels']
        source['matrixSet'] = layer_conf['source']['matrixSet']
    else:
        raise UnsupportedLayerError(
            'overlay layer type "%s" is not supported' % layer_conf['type'])

    ol_layer = {
        'source': source,
        'visible': False
    }

    anol_layer = {
        'name': layer_conf['name'],
        'title': layer_conf['title'],
        'type': layer_conf['type'],
        'catalog': layer_conf.get('catalog', False),
        'searchConfig': layer_conf.get('searchConfig', []),
        'status': layer_conf.get('status', 'active'),
        'olLayer': ol_layer
    }

    if 'opacity' in layer_conf:
        ol_layer['opacity'] = layer_conf['opacity']
        anol_layer['opacity'] = layer_conf['opacity']

    if layer_conf['type'] in ('postgis', 'static_geojson', 'digitize'):
        anol_layer['cluster'] = layer_conf.get('cluster', False)

    if layer_conf['type'] == 'digitize':
        anol_layer['geom_type'] = layer_conf['source'].get('geom_type')
        prop_def = layer_conf['source'].get('properties')
        if prop_def is not None:
            for prop in prop_def:
                try:
                    selectionlist = resolve_selectionlist(prop)
                except InvalidAppConfigError as ex:
                    log.error(f'Could not resolve selectionlist for layer {layer_conf["name"]}: {ex}')
                    continue
                if selectionlist is not None:
                    prop['select'] = selectionlist
            properties_schema = Feature.properties_schema_from_prop_def(prop_def)
            anol_layer['properties_schema'] = properties_schema
            anol_layer['properties_schema_form_options'] = Feature.properties_schema_form_options(prop_def)

    if style:
        if 'externalGraphicPrefix' in style:
            anol_layer['externalGraphicPrefix'] = style.pop('externalGraphicPrefix')
        anol_layer['style'] = style

    if 'attribution' in layer_conf:
        anol_layer['attribution'] = layer_conf['attribution']
        if 'last_update' in layer_conf:
            if layer_conf['type'] in ('wms', 'tiledwms', 'wmts'):
                anol_layer['attribution'] = _l('%(name)s [edited %(last_update)s]', name=layer_conf['attribution'], last_update=layer_conf['last_update'])
            else:
                anol_layer['attribution'] = _l('%(name)s [last update %(last_update)s]', name=layer_conf['attribution'], last_update=layer_conf['last_update'])

    if 'metadataUrl' in layer_conf:
        anol_layer['metadataUrl'] = layer_conf['metadataUrl']

    if 'showGroup' in layer_conf:
        anol_layer['showGroup'] = layer_conf['showGroup']

    if 'abstract' in layer_conf:
        anol_layer['abstract'] = layer_conf['abstract']

    if 'featureinfo' in layer_conf:
        anol_layer['featureinfo'] = layer_conf['featureinfo']

    if 'legend' in layer_conf:
        anol_layer['legend'] = layer_conf['legend']

    if layer_conf['type'] == 'postgis':
        anol_layer['type'] = 'dynamic_geojson'
        anol_layer['createIndex'] = layer_conf.get('create_index', True)

    return anol_layer


def add_layer_to_group(groups, layer):
    for group in groups:
        if layer['name'] in group['layers']:
            idx = group['layers'].index(layer['name'])
            group['layers'][idx] = layer


def create_anol_layers(conf, layers_base_url=''):
    anol_conf = {
        'backgroundLayer': [],
        'overlays': []
    }

    for layer in conf['backgrounds']:
        try:
            anol_conf['backgroundLayer'].append(
                anol_background_layer(layer, layers_base_url)
            )
        except UnsupportedLayerError as ex:
            log.warn(ex)
            continue

    for group in conf['groups']:

        anol_group = {
            'name': group['name'],
            'title': group['title'],
            'metadataUrl': group.get('metadataUrl', ''),
            'searchConfig': group.get('searchConfig', []),
            'showGroup': group.get('showGroup', True),
            'abstract': group.get('abstract', ''),
            'legend': group.get('legend', False),
            'singleSelect': group.get('singleSelect', False),
            'singleSelectGroup': group.get('singleSelectGroup', False),
            'catalog': group.get('catalog', False),
            'status': group.get('status', 'active'),
            'layers': [],
            'defaultVisibleLayers': group.get('defaultVisibleLayers', []),
        }
        for layer in group['layers']:
            try:
                anol_group['layers'].append(
                    anol_overlay_layer(layer)
                )
            except UnsupportedLayerError as ex:
                log.warn(ex)
                continue
        anol_conf['overlays'].append(anol_group)

    return anol_conf


def load_anol_layers(configfile):
    with open(configfile, 'r') as f:
        layers_conf = yaml.safe_load(f)

    return create_anol_layers(layers_conf)


def create_mapfish_layers(conf, layers_base_url='', default_protocol=''):
    mapfish_layers = {}
    for layer_conf in conf['layers'].values():
        mapfish_layer_factory = None
        if layer_conf['type'] in ('wms', 'tiledwms'):
            mapfish_layer_factory = mapfish_wms_layer
        elif layer_conf['type'] == 'wmts':
            mapfish_layer_factory = mapfish_wmts_layer
        elif layer_conf['type'] in ('postgis', 'digitize',
                                    'dynamic_geojson', 'static_geojson'):
            mapfish_layer_factory = mapfish_geojson_layer
        else:
            log.warn('layer type "%s" is not supported' % layer_conf['type'])
            continue
        is_background = layer_conf in conf['backgrounds']
        if mapfish_layer_factory is not None:
            try:
                layer = mapfish_layer_factory(
                    layer_conf, is_background, layers_base_url, default_protocol)
                mapfish_layers[layer_conf['name']] = layer
                log.debug(f'Created mapfish layer {layer_conf["name"]} with config {str(layer)}')
            except WMTSMatrixError as ex:
                log.warn(ex)
                continue
    return mapfish_layers


def mapfish_wms_layer(layer_conf, is_background, layers_base_url='',
                      default_protocol=''):
    url = add_layers_base_url(
        layer_conf['source']['url'],
        layers_base_url or 'http://localhost',
        default_protocol=default_protocol)
    mapfish_layer = {
        'type': 'WMS',
        'baseURL': url,
        'imageFormat': layer_conf['source']['format'],
        'opacity': layer_conf['opacity'] if 'opacity' in layer_conf else 1,
        'layers': layer_conf['source']['layers'],
        'customParams': {}
    }
    printTileSize = layer_conf.get('printTileSize')
    if printTileSize is not None:
        mapfish_layer['type'] = 'TiledWMS'
        mapfish_layer['tileSize'] = printTileSize
    # make all request transparent, also background layers
    # can be transparent
    mapfish_layer['customParams']['transparent'] = True
    if layer_conf['source'].get('styles'):
        mapfish_layer['customParams']['styles'] = ','.join(layer_conf['source']['styles'])
    return mapfish_layer


def mapfish_wmts_matrices(levels, extent, tile_size=256):
    matrices = []
    top_left = [extent[0], extent[3]]
    width = extent[2] - extent[0]
    height = extent[3] - extent[1]
    min_res = max(width / tile_size, height / tile_size)
    res = [min_res]
    for level in range(1, levels):
        res.append(res[-1] / 2.0)
    for level, r in enumerate(res):
        scale = r / (0.28 / 1000)
        if r == 0:
            raise WMTSMatrixError(
                'Invalid resolutions given' + ', '.join(map(str, res))
            )
        if tile_size == 0:
            raise WMTSMatrixError('tile_size is 0')
        matrices.append({
            'identifier': '%02d' % level,
            'topLeftCorner': top_left,
            'scaleDenominator': '%f' % scale,
            'tileSize': [tile_size, tile_size],
            'matrixSize': [
                max(math.ceil(width // r / tile_size), 1),
                max(math.ceil(height // r / tile_size), 1)
            ]
        })
    return matrices


def mapfish_wmts_layer(layer_conf, is_background, layers_base_url='',
                       default_protocol=''):
    url = add_layers_base_url(
        layer_conf['source']['url'],
        layers_base_url or 'http://localhost',
        default_protocol=default_protocol)
    base_url = '%s{Layer}/{TileMatrixSet}/{TileMatrix}/{TileCol}/{TileRow}.%s' % (
        url,
        layer_conf['source']['format'].split('/')[-1]
    )
    mapfish_layer = {
        'type': 'WMTS',
        'baseURL': base_url,
        'layer': layer_conf['source']['layer'],
        'imageFormat': layer_conf['source']['format'],
        'matrixSet': layer_conf['source']['matrixSet'],
        'matrices': mapfish_wmts_matrices(
            layer_conf['source']['levels'],
            layer_conf['source']['extent']
        )
    }
    return mapfish_layer


def mapfish_geojson_layer(layer_conf, is_background, layers_base_url='',
                          default_protocol=''):
    mapfish_layer = {
        'type': 'geojson',
        'geoJson': None
    }
    if layer_conf['type'] == 'digitize':
        mapfish_layer['internal_type'] = 'digitize'
        mapfish_layer['style'] = {
            'version': 2
        }
    elif layer_conf['type'] == 'postgis':
        mapfish_layer['internal_type'] = 'postgis'
        mapfish_layer['style'] = {
            'version': 1,
            'styleProperty': 'mapfishStyleId',
            '1': layer_conf['style'] if layer_conf.get('style') else {}
        }
    elif layer_conf['type'] == 'static_geojson':
        mapfish_layer['file'] = layer_conf['source']['file']
        mapfish_layer['style'] = {
            'version': 1,
            'styleProperty': 'mapfishStyleId',
            '1': layer_conf.get('style', {})
        }

    return mapfish_layer


def mapfish_grid_layer(grid, srs, style):
    feature_collection = grid.features(srs=srs)
    for feature in feature_collection['features']:
        feature['properties']['mapfishStyleId'] = '1'

    return {
        'type': 'geojson',
        'geoJson': feature_collection,
        'style': {
            'version': 1,
            'styleProperty': 'mapfishStyleId',
            '1': style
        }
    }


def mapfish_numeration_layer(feature_collection, srs, scale, dpi, _style):
    style = deepcopy(_style)
    sld_file = os.path.join(
        current_app.config.get('MAPFISH_STYLES_PATH'),
        'numeration.sld'
    )
    sld_style = open(sld_file.encode('utf8'), 'r').read()

    sld_style = sld_style % style

    return {
        'type': 'geojson',
        'geoJson': feature_collection,
        'style': sld_style
    }


def mapfish_feature_collection_layer(feature_collection, icons_dir=''):
    style = {
        'version': '1',
        'styleProperty': "mapfishStyleId"
    }
    for id, feature in enumerate(feature_collection['features']):
        feature_style = feature['properties']['style']

        feature_style['strokeLinecap'] = 'round'
        if 'radius' in feature_style:
            feature_style['pointRadius'] = feature_style['radius']

        if 'text' in feature_style:
            feature_style = {
                'fontColor': feature_style['fontColor'],
                'labelRotation': str(feature_style['fontRotation']),
                'fontSize': feature_style['fontSize'],
                'fontWeight': feature_style['fontWeight'],
                'label': feature_style['text'],
                'labelAlign': 'cm',
                'fontFamily': 'Helvetica',
            }

        if 'externalGraphic' in feature_style:
            factor = 300.0 / 72.0
            feature_style = {
                'externalGraphic': os.path.join(
                    icons_dir,
                    feature_style['externalGraphic']
                ),
                'graphicHeight': feature_style.get('graphicHeight'),
                'graphicWidth': feature_style.get('graphicWidth'),
                'rotation': feature_style.get('graphicRotation'),
                'graphicXOffset': 0,
                # offset is calculated from image center in print resolution
                'graphicYOffset': feature_style.get('graphicYAnchor', 0) * factor / 2.0 * - 1
            }
        del feature['properties']['style']
        style[id] = feature_style
        style[id]['type'] = 'simple'
        feature['properties']['mapfishStyleId'] = id

    return {
        'type': 'geojson',
        'geoJson': feature_collection,
        'style': style
    }

def mapfish_measure_feature_collection_layer(feature_collection):
    for id, feature in enumerate(feature_collection['features']):
        geometry_type = feature['geometry']['type']
        if geometry_type not in ('LineString', 'Polygon'):
            continue

        segment_points = {
            'type': 'Feature',
                'geometry': {
                'type': 'MultiPoint',
                'coordinates': []
            },
            'properties': {
                'style': {
                    'pointRadius': '3',
                    'fillColor': '#848484',
                    'fillOpacity': '1',
                    'strokeWidth': '0',
                    'strokeColor': '#848484'
                },
            }
        }
        coordinates = feature['geometry']['coordinates']
        shapely_poly = False
        total_area = False
        if geometry_type in ('Polygon'):
            coordinates = feature['geometry']['coordinates'][0]
            shapely_poly = Polygon(coordinates)
            total_area = shapely_poly.area

        shapely_line = LineString(coordinates)
        total_length = shapely_line.length
        if total_length > 1000:
            total_length = '{0:.3f}km'.format(total_length / 1000)
        else:
            total_length = '{0:.2f}m'.format(total_length)

        if shapely_poly:
            if (total_area > 100000):
                total_area = '{0:.3f}ha'.format(total_area / 10000)
            else:
                total_area = '{0:.2f}m²'.format(total_area)

        for idx, coord in enumerate(coordinates):
            # add length  label on segments
            if idx != len(coordinates) - 1:
                start = coord
                end = coordinates[idx + 1]
                newPoint = [(end[0] + start[0]) / 2, (end[1] + start[1]) / 2]

                segment_line = LineString([start, end])
                if segment_line.length > 1000:
                    length = '{0:.3f}km'.format(segment_line.length / 1000)
                else:
                    length = '{0:.2f}m'.format(segment_line.length)

                labelPoint = {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': newPoint
                    },
                    'properties': {
                        'style': {
                             'fontColor': '#000000',
                             'fontFamily': 'Calibri,sans-serif',
                             'fontSize': '11px',
                             'fontStyle': 'normal',
                             'haloColor': '#FFFFFF',
                             'haloOpacity': '0.7',
                             'haloRadius': '1.0',
                             'label': length.replace('.',','),
                        }
                    }
                }
                feature_collection['features'].append(labelPoint)
            else:
                # create label for complete distance or area
                label = total_length
                if total_area:
                    label = '%s \n %s' % (total_area, total_length)

                # add total distance on last segments
                labelPoint = {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': coord
                    },
                    'properties': {
                        'style': {
                             'fontColor': '#000000',
                             'fontFamily': 'Calibri,sans-serif',
                             'fontSize': '12px',
                             'fontStyle': 'bold',
                             'haloColor': '#FFFFFF',
                             'haloOpacity': '0.7',
                             'haloRadius': '1.5',
                             'label': label.replace('.',','),
                        }
                    }
                }
                feature_collection['features'].append(labelPoint)
            segment_points['geometry']['coordinates'].append(coord)
        feature_collection['features'].append(segment_points)

    # create style
    style = {
        'version': '1',
        'styleProperty': 'mapfishStyleId'
    }
    for id, feature in enumerate(feature_collection['features']):
        if feature.get('properties') and feature['properties'].get('style'):
            feature_style = feature['properties']['style']
        else:
            feature_style = {
                'strokeLinecap': 'round',
                'strokeColor': '#000000',
                'strokeOpacity': 0.2,
                'strokeWidth': 1.5,
                'strokeDashstyle': 'longdash',
                'fillColor': '#FFFFFF',
                'fillOpacity': 0.2,
            }

        style[id] = feature_style
        style[id]['type'] = 'simple'
        feature['properties'] = {
            'mapfishStyleId': id
        }

    return {
        'type': 'geojson',
        'geoJson': feature_collection,
        'style': style
    }

def create_featureinfo_layers(conf, layers_base_url=''):
    featureinfo_layers = {}
    for layer_conf in conf['layers'].values():
        if layer_conf['type'] not in ('wms', 'tiledwms', 'wmts'):
            continue
        if 'featureinfo' not in layer_conf:
            continue
        url = add_layers_base_url(layer_conf['source']['url'], layers_base_url)
        featureinfo_layers[layer_conf['name']] = {
            'url': url,
            'encoding': layer_conf['source'].get('encoding', 'utf-8')
        }
    return featureinfo_layers


def apply_base_config(current_config, layer_configs):
    current_config = deepcopy(current_config)
    if 'base' in current_config:
        base_config_name = current_config.pop('base')
        base_config = None

        for layer_config in layer_configs:
            if layer_config['name'] == base_config_name:
                base_config = deepcopy(
                    apply_base_config(
                        layer_config, layer_configs
                    )
                )

        if base_config is None:
            raise InvalidConfigurationError('Base config "%s" not found' % base_config_name)
        current_config = merge_dict(
            current_config,
            base_config
        )
    return current_config


def load_layers_config(config_folder, protected_layer_names=[], proxy_hash_salt=None):
    """
    Return configuration dict from loaded yaml
    """
    layers_list = []
    yaml_content = {
        'layers': [],
        'groups': []
    }

    if not yaml_content.get('groups'):
        yaml_content['groups'] = []

    for filename in os.listdir(config_folder):
        if filename.endswith(".yaml"):
            # TODO check
            file = open('%s/%s' % (config_folder, filename), 'r')
            try:
                content = yaml.safe_load(file)
            except:
                content = {}

            if type(content) is not dict:
                content = {}

            if content.get('layers'):
                for layer in content.get('layers'):
                    yaml_content['layers'].append(layer)

            if content.get('groups'):
                for group in content.get('groups'):
                    yaml_content['groups'].append(group)

            # add layer to layers list for admin
            meta = content.get('meta', False)
            description = ''
            if meta:
                description = meta.get('description', '')

            layers_list.append({
                'name': filename,
                'description': description,
            })

    yaml_layers = []
    for layer_config in yaml_content['layers']:
        yaml_layers.append(apply_base_config(layer_config, yaml_content['layers']))
    yaml_content['layers'] = yaml_layers

    errors, informal_only = validate_layers_conf(yaml_content)
    for error in errors:
        log.warn(error)
    if not informal_only:
        raise InvalidConfigurationError('invalid layers configuration')

    layers = OrderedDict()
    backgrounds = []
    hash_map = {}
    for layer_config in yaml_content['layers']:
        layer = Layer(layer_config)
        layer['source'] = Source(layer['source'])
        if 'style' in layer:
            layer['style'] = Style(layer['style'])
        if layer['type'] in ['wms', 'wmts', 'tiledwms']:
            direct_access = layer['source'].get('directAccess', False)
            # hash is used to address hidden proxied URLs
            # if direct access is set the origin url will be used
            # authentication for protected layers is provided with session cookies
            if not direct_access:
                encoded_layer = (layer['source']['url'] + (proxy_hash_salt or '')).encode(encoding = 'UTF-8', errors = 'strict')
                layer['hash'] = hashlib.sha224(encoded_layer).hexdigest()
                hash_map[layer['hash']] = layer['source']['url']
            else:
                layer['url'] = layer['source']['url']
        layer['protected'] = layer['name'] in protected_layer_names
        layers[layer['name']] = layer
        if 'background' in layer:
            backgrounds.append(layer)

    layers_config = {
        'backgrounds': backgrounds,
        'groups': [],
        'layers': layers,
        'hash_map': hash_map
    }

    for group_config in yaml_content['groups']:
        group = Group(group_config)
        group['layers'] = []
        for layer_name in group_config['layers']:
            if layer_name not in layers:
                log.warn('group layer %s not found' % layer_name)
                continue
            group['layers'].append(layers[layer_name])
        if len(group['layers']) > 0:
            layers_config['groups'].append(group)
        else:
            log.warn('group %s empty' % group['name'])

    return layers_config, layers_list

def check_project_config(new_yaml_content, exclude_file):
    yaml_content = {
        'layers': [],
        'groups': []
    }
    if isinstance(new_yaml_content, str):
        return ['String only not supported'], False

    config_folder = current_app.config.get('LAYERS_CONF_DIR')

    for filename in os.listdir(config_folder):
        if filename == exclude_file:
            continue
        if filename.endswith(".yaml"):
            file = open('%s/%s' % (config_folder, filename), 'r')
            try:
                content = yaml.safe_load(file)
            except:
                content = {}

            if type(content) is not dict:
                content = {}

            if content.get('layers'):
                for layer in content.get('layers'):
                    yaml_content['layers'].append(layer)

            if content.get('groups'):
                for group in content.get('groups'):
                    yaml_content['groups'].append(group)

    if new_yaml_content.get('layers'):
        for layer in new_yaml_content.get('layers'):
            yaml_content['layers'].append(layer)

    if new_yaml_content.get('groups'):
        for group in new_yaml_content.get('groups'):
            yaml_content['groups'].append(group)

    yaml_layers = []
    for layer_config in yaml_content['layers']:
        yaml_layers.append(apply_base_config(layer_config, yaml_content['layers']))
    yaml_content['layers'] = yaml_layers

    errors, informal_only = validate_layers_conf(yaml_content)
    return errors, informal_only

def check_project_config_only(new_yaml_content):
    yaml_content = deepcopy(new_yaml_content)

    if isinstance(yaml_content, str):
        return ['String only not supported'], False

    if not yaml_content.get('layers'):
        yaml_content['layers'] = []

    if not yaml_content.get('groups'):
        yaml_content['groups'] = []

    yaml_layers = []
    for layer_config in yaml_content.get('layers'):
        yaml_layers.append(apply_base_config(layer_config, yaml_content['layers']))
    yaml_content['layers'] = yaml_layers

    errors, informal_only = validate_layers_conf(yaml_content)
    return errors, informal_only

if __name__ == '__main__':
    import sys
    import json
    json_content = load_anol_layers(sys.argv[1])
    with open(sys.argv[2], 'w') as json_file:
        json_file.write(json.dumps(json_content, indent=4))
