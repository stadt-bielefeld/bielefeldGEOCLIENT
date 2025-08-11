from copy import deepcopy
from flask import current_app, url_for

from munimap.helper import layer_allowed_for_user
from munimap.helper import layers_allowed_for_user


def is_active(name, active, includes=[], excludes=[], explicits=[]):
    include = name in includes
    exclude = name in excludes
    explicit = name in explicits

    if len(explicits) > 0:
        return explicit
    if active and not exclude:
        return True
    if not active and include:
        return True
    return False

def hash_url_if_needed(layer, layers_config):
    endpoint_map = {
        'wms': 'munimap.wms_proxy',
        'tiledwms': 'munimap.wms_proxy',
        'wmts': 'munimap.wmts_proxy',
        'sensorthings': 'munimap.sensorthings_proxy'
    }
    layer_type = layer['type']
    if layer_type in endpoint_map.keys() and layers_config[layer['name']].get('hash'):
        params = {
            'url_hash': layers_config[layer['name']]['hash']
        }
        if layer_type == 'sensorthings':
            params['layer_name'] = layer['name']
        return url_for(
            endpoint_map[layer_type],
            **params
        )
    return layers_config[layer['name']].get('url')

def prepare_background_layers(app_config, layers_config):
    background_layers = []
    includes = (app_config['backgrounds']['include']
                if 'backgrounds' in app_config and
                   'include' in app_config['backgrounds']
                else [])
    excludes = (app_config['backgrounds']['exclude']
                if 'backgrounds' in app_config and
                   'exclude' in app_config['backgrounds']
                else [])
    explicits = (app_config['backgrounds']['explicit']
                 if 'backgrounds' in app_config and
                    'explicit' in app_config['backgrounds']
                 else [])

    layers = current_app.anol_layers['backgroundLayer']
    configLayers = [layers_config[l['name']] for l in layers]

    allowedLayersForUser = layers_allowed_for_user(configLayers)
    allowedAnolLayers = []

    for allowedLayerForUser in allowedLayersForUser:
        for layer in layers:
            if allowedLayerForUser['name'] == layer['name']:
                allowedAnolLayers.append(layer)
                break

    for layer in allowedAnolLayers:
        if not is_active(layer['name'], layer['status'] == 'active', includes,
                     excludes, explicits):
            continue

        background_layer = deepcopy(layer)

        background_layer['olLayer']['source']['url'] = hash_url_if_needed(background_layer, layers_config)
        background_layer['olLayer']['visible'] = (
            'map' in app_config and
            app_config['map'].get('defaultBackground') == background_layer['name']
        )
        background_layers.append(background_layer)

    if explicits:
        sorted_backgrounds = []
        for layer in explicits:
            for background in background_layers:
                if background['name'] == layer:
                    sorted_backgrounds.append(background)
        background_layers = sorted_backgrounds
    return background_layers


def prepare_group_layers(app_config, layers, group_active, layers_config):
    group_layers = []
    includes = (app_config['layers']['include']
                if 'layers' in app_config and
                   'include' in app_config['layers']
                else [])
    excludes = (app_config['layers']['exclude']
                if 'layers' in app_config and
                   'exclude' in app_config['layers']
                else [])
    explicits = (app_config['layers']['explicit']
                 if 'layers' in app_config and
                    'explicit' in app_config['layers']
                 else [])

    configLayers = [layers_config[l['name']] for l in layers]

    allowedLayersForUser = layers_allowed_for_user(configLayers)
    allowedAnolLayers = []

    for allowedLayerForUser in allowedLayersForUser:
        for layer in layers:
            if allowedLayerForUser['name'] == layer['name']:
                allowedAnolLayers.append(layer)
                break

    for _layer in allowedAnolLayers:
        layer_active = group_active and _layer['status'] == 'active'
        if not is_active(_layer['name'], layer_active, includes, excludes,
                         explicits):
            continue
        layer = deepcopy(_layer)

        layer['searchConfig'] = layer.get('searchConfig', [])
        layer['visible'] = (
            'map' in app_config and
            (layer['name'] in app_config['map'].get('defaultOverlays', [])))

        layer['olLayer']['source']['url'] = hash_url_if_needed(layer, layers_config)

        if layer['type'] == 'dynamic_geojson':
            layer['olLayer']['source']['url'] = url_for('vector.geojson') + '?'
            # set to default icon location if not specified
            if 'externalGraphicPrefix' not in layer:
                layer['externalGraphicPrefix'] = url_for('munimap.icons',
                                                         filename='')
        if layer['type'] == 'static_geojson':
            layer['olLayer']['source']['url'] = url_for(
                'munimap.static_geojson', filename=layer['olLayer']['source']['file'])
            if 'externalGraphicPrefix' not in layer:
                layer['externalGraphicPrefix'] = url_for('munimap.icons',
                                                         filename='')
            del layer['olLayer']['source']['file']

        if layer['type'] == 'digitize':
            layer['olLayer']['source']['url'] = url_for(
                'digitize.layer',
                name=layer['name']
            )
            if 'externalGraphicPrefix' not in layer:
                layer['externalGraphicPrefix'] = url_for('munimap.icons',
                                                         filename='')

        group_layers.append(layer)

    return group_layers


def prepare_overlays(app_config, layers_config):
    overlays = []
    includes = (app_config['groups']['include']
                if 'groups' in app_config and
                   'include' in app_config['groups']
                else [])
    excludes = (app_config['groups']['exclude']
                if 'groups' in app_config and
                   'exclude' in app_config['groups']
                else [])
    explicits = (app_config['groups']['explicit']
                 if 'groups' in app_config and
                    'explicit' in app_config['groups']
                 else [])
    single_select = (app_config['groups']['singleSelect']
                 if 'groups' in app_config and
                    'singleSelect' in app_config['groups']
                 else [])

    for group in current_app.anol_layers['overlays']:
        if len(group['layers']) == 0:
            continue
        group_active = is_active(group['name'], group['status'] == 'active',
                                 includes, excludes, explicits)
        group_layers = prepare_group_layers(app_config, group['layers'],
                                            group_active, layers_config)

        single_select_group = False
        for s in single_select:
            if s == group['name']:
                single_select_group = True

        if len(group_layers) > 0:
            overlays.append({
                'layers': group_layers,
                'name': group['name'],
                'title': group['title'],
                'status': group['status'],
                'metadataUrl': group['metadataUrl'],
                'showGroup': group['showGroup'],
                'abstract': group['abstract'],
                'singleSelect': group['singleSelect'],
                'singleSelectGroup': single_select_group,
                'legend': group['legend'],
                'defaultVisibleLayers': group['defaultVisibleLayers'],
            })

    # sort overlays if they are explicits
    if explicits:
        sorted_overlays = []
        for layer in explicits:
            for overlay in overlays:
                if overlay['name'] == layer:
                    sorted_overlays.append(overlay)
        overlays = sorted_overlays
    return overlays


def prepare_draw_layers(app_config, layers_config):
    if not app_config.get('components', {}).get('digitize'):
        return []
    digitize_layer_names = app_config.get('digitizeConfig', {}).get('layers', [])
    if not digitize_layer_names:
        return []

    layers = []
    for group in current_app.anol_layers['overlays']:
        for l in group['layers']:
            if l['name'] in digitize_layer_names and l['type'] == 'digitize':
                layers.append(l)

    configLayers = [layers_config[l['name']] for l in layers]

    allowedLayersForUser = layers_allowed_for_user(configLayers)
    allowedDrawLayers = []

    for allowedLayerForUser in allowedLayersForUser:
        for layer in layers:
            if allowedLayerForUser['name'] == layer['name']:
                allowedDrawLayers.append(layer)
                break
    for allowedDrawLayer in allowedDrawLayers:
        allowedDrawLayer['url'] = url_for(
            'digitize.layer',
            name=allowedDrawLayer['name']
        )
        allowedDrawLayer['active'] = True
        if 'externalGraphicPrefix' not in allowedDrawLayer:
            allowedDrawLayer['externalGraphicPrefix'] = url_for('munimap.icons', filename='')

    return allowedDrawLayers


def prepare_layers_def(app_config, layers_config):
    layers_def = {
        'backgroundLayer': prepare_background_layers(app_config, layers_config),
        'overlays': prepare_overlays(app_config, layers_config)
    }
    return layers_def


def prepare_draw_layers_def(app_config, layers_config):
    return prepare_draw_layers(app_config, layers_config)


def names_from_app_layers_def(app_layers_def):
    names = []
    for layer in app_layers_def['backgroundLayer']:
        names.append(layer['name'])

    for group in app_layers_def['overlays']:
        for layer in group['layers']:
            names.append(layer['name'])
    return names


def feature_info_catalog_layers(app_layers_def):
    names = []
    for group in app_layers_def['overlays']:
        for layer in group['layers']:
            if layer.get('featureinfo'):
                catalogGroup = layer['featureinfo'].get('catalogGroup', False)
                if catalogGroup and layer['featureinfo'].get('catalog', False):
                    names.append(catalogGroup)
    return names

def prepare_catalog_layers_def(app_layers_def, layers_config, selected_group=None, selected_layer=None):
    used_layer_names = names_from_app_layers_def(app_layers_def)
    fi_catalog_layers = feature_info_catalog_layers(app_layers_def)
    background_layers = []

    for layer in current_app.anol_layers['backgroundLayer']:
        if layer['name'] in used_layer_names:
            continue
        if not layer_allowed_for_user(layers_config[layer['name']]):
            continue
        if not layer.get('catalog'):
            continue
        if selected_layer:
            continue

        background_layer = deepcopy(layer)
        background_layer['displayInLayerswitcher'] = False
        background_layer['permalink'] = False
        background_layer['catalogLayer'] = True
        background_layer['olLayer']['visible'] = True
        background_layer['olLayer']['source']['url'] = hash_url_if_needed(background_layer, layers_config)

        background_layers.append(background_layer)

    overlay_layers = []
    overlay_layers_names = []

    group_layers = []
    group_names = []

    for group in current_app.anol_layers['overlays']:
        if len(group['layers']) == 0:
            continue
        _has_group = False
        _group = deepcopy(group)
        if group['catalog'] or not selected_layer:
            if type(_group['catalog']) == bool:
                _group['catalog'] = {}
                _group['catalog']['title'] = _group['title']
            elif not _group['catalog'].get('title'):
                _group['catalog']['title'] = _group['title']

            _group['catalog']['visible'] = True
            _group['layers'] = []
            _group['catalogLayer'] = True

        if selected_group and selected_group != _group['name']:
            continue

        for _layer in group['layers']:
            if not layer_allowed_for_user(layers_config[_layer['name']]):
                continue

            if selected_layer and selected_layer != _layer['name']:
                continue

            _has_group = True
            layer = deepcopy(_layer)
            if type(layer['catalog']) == bool:
                layer['catalog'] = {}
                layer['catalog']['title'] = layer['title']
            elif not layer['catalog'].get('title'):
                layer['catalog']['title'] = layer['title']

            if group['name'] in fi_catalog_layers and not _layer.get('catalog'):
                layer['catalog']['visible'] = False
            else:
                layer['catalog']['visible'] = True

            if layer['name'] in used_layer_names:
                layer['predefined'] = True
            if layer['type'] == 'dynamic_geojson':
                layer['olLayer']['source']['url'] = url_for('vector.geojson') + '?'
            layer['olLayer']['source']['url'] = hash_url_if_needed(layer, layers_config)

            # set to default icon location if not specified
            if 'externalGraphicPrefix' not in layer:
                layer['externalGraphicPrefix'] = url_for('munimap.icons',
                                                         filename='')
            if layer['type'] == 'static_geojson':
                layer['olLayer']['source']['url'] = url_for(
                    'munimap.static_geojson', filename=layer['olLayer']['source']['file'])
                del layer['olLayer']['source']['file']

            if layer['type'] == 'digitize':
                layer['olLayer']['source']['url'] = url_for(
                    'digitize.layer',
                    name=layer['name']
                )

            layer['displayInLayerswitcher'] = True
            layer['permalink'] = False
            layer['olLayer']['visible'] = True
            layer['catalogLayer'] = True

            if (_layer.get('catalog') or selected_layer) and layer['name'] not in overlay_layers_names:
                overlay_layers_names.append(layer['name'])
                overlay_layers.append(layer)

            _group['layers'].append(layer)

        if _has_group and _group['name'] not in group_names:
            group_names.append(_group['name'])
            group_layers.append(_group)

    return background_layers + overlay_layers, group_layers

def catalog_layer_by_name(app_layers_def, layers_config, layer):
    return prepare_catalog_layers_def(app_layers_def, layers_config, selected_layer=layer)

def catalog_group_by_name(app_layers_def, layers_config, group):
    return prepare_catalog_layers_def(app_layers_def, layers_config, selected_group=group)

def prepare_catalog_layers_name(app_layers_def, layers_config, selected=None):
    used_layer_names = names_from_app_layers_def(app_layers_def)
    fi_catalog_layers = feature_info_catalog_layers(app_layers_def)
    background_layers = []
    background_layer_names = []
    for layer in current_app.anol_layers['backgroundLayer']:
        background_layer_names.append(layer['name'])
        if layer['name'] in used_layer_names:
            continue
        if not layer_allowed_for_user(layers_config[layer['name']]):
            continue
        if not layer.get('catalog'):
            continue
        if selected and layer['name'] not in selected:
            continue

        background_layers.append({
            'title': layer['title'],
            'name': layer['name'],
            'visible': True,
            'abstract': layer.get('abstract'),
        })

    group_layers = []
    group_names = []

    overlay_layers = []
    overlay_layers_names = []

    for group in current_app.anol_layers['overlays']:
        if len(group['layers']) == 0:
            continue

        _has_group = False
        _group = deepcopy(group)
        if group['catalog'] or selected:
            if type(_group['catalog']) == bool:
                _group['catalog'] = {}
                _group['catalog']['title'] = _group['title']
            elif not _group['catalog'].get('title'):
                _group['catalog']['title'] = _group['title']

            _group['layers'] = []

        for _layer in group['layers']:
            if not layer_allowed_for_user(layers_config[_layer['name']]):
                continue
            _has_group = True
            layer = deepcopy(_layer)
            if type(layer['catalog']) == bool:
                layer['catalog'] = {}
                layer['catalog']['title'] = layer['title']
            elif not layer['catalog'].get('title'):
                layer['catalog']['title'] = layer['title']

            if _layer['name'] in used_layer_names and _layer['name'] not in background_layer_names:
                _group['predefined'] = True
                layer['predefined'] = True

            if group['name'] in fi_catalog_layers and not _layer.get('catalog'):
                visible = False
            else:
                visible = True

            if selected and _layer['name'] not in selected:
                continue

            if (_layer.get('catalog') or selected) and _layer['name'] not in overlay_layers_names:
                overlay_layers_names.append(layer['name'])
                overlay_layers.append({
                    'title': layer['catalog']['title'],
                    'predefined': layer.get('predefined', False),
                    'name': layer['name'],
                    'visible': visible,
                    'abstract': layer.get('abstract'),
                    'metadataUrl': layer.get('metadataUrl'),
                })

            _group['layers'].append(layer)

        if selected and _group['name'] not in selected:
            continue

        if not selected and len(_group['layers']) == 0:
            group_names.append(_group['name'])
            continue

        # selected layers should be listed regardless if they have
        # catalog = True. This ensures these layers can
        # be added via GFI.
        is_selected = selected and _group['name'] in selected

        if _has_group and (_group['catalog'] or is_selected) and _group['name'] not in group_names:
            group_names.append(_group['name'])
            group_layers.append({
                'title': _group['catalog']['title'] if _group['catalog'] else _group['name'],
                'predefined': _group.get('predefined', False),
                'name': _group['name'],
                'visible': True,
                'abstract': _group.get('abstract'),
                'metadataUrl': _group.get('metadataUrl'),
            })

    return background_layers + overlay_layers, group_layers

