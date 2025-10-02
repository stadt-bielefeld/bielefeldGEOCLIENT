from dictspec.validator import validate, ValidationError
from dictspec.spec import one_of, number, required, type_spec, combined, anything
from dictspec.compat import string_type


def validate_layers_conf(layers_conf):
    try:
        validate(layers_conf_spec, layers_conf)
    except ValidationError as ex:
        return ex.errors, ex.informal_only
    else:
        return [], True


postgis_source_spec = {
    'type': string_type,
    'srid': number(),
    'query': string_type,
}

wms_source_spec = {
    'url': string_type,
    'format': string_type,
    required('layers'): [string_type],
    'srs': string_type,
    'encoding': string_type,
    'directAccess': bool,
    'styles': [string_type],
    'transparent': bool
}

wmts_source_spec = {
    'url': string_type,
    'format': string_type,
    required('layer'): string_type,
    'srs': string_type,
    'extent': [number()],
    'matrixSet': string_type,
    'levels': number(),
    'hqUrl': string_type,
    'hqLayer': string_type,
    'hqMatrixSet': string_type,
    'directAccess': bool
}

select_type_spec = [{
    required('value'): string_type,
    'label': string_type
}]

digitize_properties_spec = [{
    required('name'): string_type,
    required('type'): one_of('text', 'int', 'float', 'select', 'boolean', 'date'),
    'label': string_type,
    'select': one_of(string_type, select_type_spec)
}]

digitize_source_spec = {
    required('name'): string_type,
    required('geom_type'): one_of('Point', 'LineString', 'Polygon'),
    'srs': string_type,
    'properties': digitize_properties_spec
}

static_geojson_source_spec = {
    'file': string_type,
    'srs': string_type,
}

sensorthings_url_parameters_spec = {
    'filter': string_type,
    'expand': string_type,
}

sensorthings_source_spec = {
    required('url'): string_type,
    required('urlParameters'): sensorthings_url_parameters_spec,
    'refreshInterval': number()
}

style_spec = {
    'type': 'simple',
    'radius': number(),
    'strokeColor': string_type,
    'strokeWidth': number(),
    'strokeDashstyle': string_type,
    'strokeOpacity': number(),
    'fillColor': string_type,
    'fillOpacity': number(),
    'externalGraphic': string_type,
    'graphicWidth': number(),
    'graphicHeight': number(),
    'graphicRotation': number(),
    'graphicXAnchor': number(),
    'graphicYAnchor': number(),
    'graphicScale': number(),
    'text': string_type,
    'propertyLabel': string_type,
    'fontWeight': string_type,
    'fontSize': string_type,
    'fontFace': string_type,
    'fontColor': string_type,
    'fontOffsetY': number(),
}

expression_spec = [anything()]

color_string = string_type
color_array = [number()]

line_cap_spec = one_of('butt', 'round', 'square')

line_join_spec = one_of('bevel', 'round', 'miter')

declutter_mode_spec = one_of('declutter', 'obstacle', 'none')

origin_spec = one_of('bottom-left', 'bottom-right', 'top-left', 'top-right')

anchor_units_spec = one_of('pixels', 'fraction')

align_spec = one_of('left', 'right', 'center', 'end', 'start')

justify_spec = one_of('left', 'center', 'right')

baseline_spec = one_of('bottom', 'top', 'middle', 'alphabetic', 'hanging', 'ideographic')

flat_style_spec = {
    # TODO add support for shape (also in anol)
    # TODO check how to properly use nested one_of types
    'circle-radius': one_of(number(), expression_spec),
    'circle-fill-color': one_of(color_string, color_array, expression_spec),
    'circle-stroke-color': one_of(color_string, color_array, expression_spec),
    'circle-stroke-width': one_of(number(), expression_spec),
    'circle-stroke-line-cap':  one_of(line_cap_spec, expression_spec),
    'circle-stroke-line-join': one_of(line_join_spec, expression_spec),
    'circle-stroke-line-dash': one_of([number()], expression_spec),
    'circle-stroke-line-dash-offset': one_of(number(), expression_spec),
    'circle-stroke-miter-limit': one_of(number(), expression_spec),
    'circle-displacement': one_of([number()], expression_spec),
    'circle-scale': one_of([number()], expression_spec),
    'circle-opacity': one_of(number(), expression_spec),
    'circle-rotation': one_of(number(), expression_spec),
    'circle-rotate-with-view': one_of(bool(), expression_spec),
    'circle-declutter-mode': declutter_mode_spec,
    'fill-color': one_of(color_string, color_array, expression_spec),
    'fill-pattern-src': one_of(string_type, expression_spec),
    'fill-pattern-size': one_of([number()], expression_spec),
    'fill-pattern-offset': one_of([number()], expression_spec),
    'fill-pattern-offset-origin': origin_spec,
    'icon-src': string_type,
    'icon-anchor': one_of([number()], expression_spec),
    'icon-anchor-origin': origin_spec,
    'icon-anchor-x-units': anchor_units_spec,
    'icon-anchor-y-units': anchor_units_spec,
    'icon-color': one_of(color_string, color_array, expression_spec),
    'icon-cross-origin': string_type,
    'icon-offset': one_of([number()], expression_spec),
    'icon-displacement': one_of([number()], expression_spec),
    'icon-offset-origin': origin_spec,
    'icon-opacity': one_of(number(), expression_spec),
    'icon-scale': one_of([number()], expression_spec),
    'icon-width': one_of(number(), expression_spec),
    'icon-height': one_of(number(), expression_spec),
    'icon-rotation': one_of(number(), expression_spec),
    'icon-rotate-with-view': one_of(bool(), expression_spec),
    'icon-size': one_of([number()], expression_spec),
    'icon-declutter-mode': declutter_mode_spec,
    'stroke-color': one_of(color_string, color_array, expression_spec),
    'stroke-width': one_of(number(), expression_spec),
    'stroke-line-cap': one_of(line_cap_spec, expression_spec),
    'stroke-line-join': one_of(line_join_spec, expression_spec),
    'stroke-line-dash': one_of([number()], expression_spec),
    'stroke-line-dash-offset': one_of(number(), expression_spec),
    'stroke-miter-limit': one_of(number(), expression_spec),
    'stroke-offset': one_of(number(), expression_spec),
    'stroke-pattern-src': string_type,
    'stroke-pattern-offset': one_of([number()], expression_spec),
    'stroke-pattern-offset-origin': origin_spec,
    'stroke-pattern-size': one_of([number()], expression_spec),
    'stroke-pattern-spacing': one_of(number(), expression_spec),
    'text-value': one_of(string_type, expression_spec),
    'text-font': one_of(string_type, expression_spec),
    'text-max-angle': one_of(number(), expression_spec),
    'text-offset-x': one_of(number(), expression_spec),
    'text-offset-y': one_of(number(), expression_spec),
    'text-overflow': one_of(bool(), expression_spec),
    'text-placement': one_of(string_type, expression_spec),
    'text-repeat': one_of(number(), expression_spec),
    'text-scale': one_of([number()], expression_spec),
    'text-rotate-with-view': one_of(bool(), expression_spec),
    'text-rotation': one_of(number(), expression_spec),
    'text-align': one_of(align_spec, expression_spec),
    'text-justify': one_of(justify_spec, expression_spec),
    'text-baseline': one_of(baseline_spec, expression_spec),
    'text-padding': one_of([number()], expression_spec),
    'text-fill-color': one_of(color_string, color_array, expression_spec),
    'text-background-fill-color': one_of(color_string, color_array, expression_spec),
    'text-stroke-color': one_of(color_string, color_array, expression_spec),
    'text-stroke-line-cap': one_of(line_cap_spec, expression_spec),
    'text-stroke-line-join': one_of(line_join_spec, expression_spec),
    'text-stroke-line-dash': one_of([number()], expression_spec),
    'text-stroke-line-dash-offset': one_of(number(), expression_spec),
    'text-stroke-miter-limit': one_of(number(), expression_spec),
    'text-stroke-width': one_of(number(), expression_spec),
    'text-background-stroke-color': one_of(color_string, color_array, expression_spec),
    'text-background-stroke-line-cap': one_of(line_cap_spec, expression_spec),
    'text-background-stroke-line-join': one_of(line_join_spec, expression_spec),
    'text-background-stroke-line-dash': one_of([number()], expression_spec),
    'text-background-stroke-line-dash-offset': one_of(number(), expression_spec),
    'text-background-stroke-miter-limit': one_of(number(), expression_spec),
    'text-background-stroke-width': one_of(number(), expression_spec),
    'text-declutter-mode': declutter_mode_spec,
    'z-index': one_of(number(), expression_spec)
}

flat_style_rule_spec = {
    required('style'): flat_style_spec,
    'filter': anything(),
    'else': bool,
}

legend_spec = {
    'type': string_type,
    'url': string_type,
    'title': string_type,
    'href': string_type,
    'text': string_type,
    'showLayerTitle': bool,
}

feature_info_item = {
    required('key'): string_type,
    'label': string_type,
    'format': one_of('date')
}

featureinfo_spec = {
    'target': string_type,
    'width': number(),
    'height': number(),
    'properties': [one_of(string_type, feature_info_item)],
    'featureCount': number(),
    'gml': bool,
    'gmlGroup': bool,
    'gmlStyle': style_spec,
    'catalog': bool,
    'catalogGroup': string_type
}

cluster_spec = {
    'clusterStyle': style_spec,
    'selectClusterStyle': style_spec
}

catalog_spec = {
    'title': string_type
}

meta_spec = {
    'description': string_type
}

result_marker_spec = {
    'graphicFile': string_type,
    'graphicWidth': number(),
    'graphicHeight': number(),
    'graphicYAnchor': number(),
    'graphicScale': number(),
    'strokeWidth': number(),
    'strokeColor': string_type,
    'strokeOpacity': number(),
}

geocoder_options_spec = {
    'viewbox': [number()],
    'url': string_type,
    'method': string_type,
    'steps': [string_type],
}

search_config_spec = {
    'name': string_type,
    'title': string_type,
    'geocoder': string_type,
    'geocoderOptions': geocoder_options_spec,
    'zoom': number(),
    'resultMarkerVisible': number(),
    'urlMarkerColor': string_type,
    'autoSearchChars': number(),
    'resultMarker': result_marker_spec,
 }

layer_commons = {
    required('name'): one_of(string_type, number()),
    required('title'): one_of(string_type, number()),
    'attribution': string_type,
    'status': one_of('active', 'inactive'),
    'catalog': one_of(bool, catalog_spec),
    'opacity': number(),
    'metadataUrl': string_type,
    'background': bool,
    'directAccess': bool,
    'abstract': string_type,
    'legend': one_of(legend_spec, 'GetLegendGraphic'),
    'featureinfo': featureinfo_spec,
    'searchConfig': [search_config_spec],
}

group_spec = {
    required('name'): string_type,
    required('title'): string_type,
    required('layers'): [string_type],
    'status': one_of('active', 'inactive'),
    'showGroup': bool,
    'singleSelect': bool,
    'catalog': one_of(bool, catalog_spec),
    'abstract': string_type,
    'metadataUrl': string_type,
    'legend': one_of(legend_spec, 'GetLegendGraphic'),
    'defaultVisibleLayers': [string_type],
}

layers_conf_spec = {
    'meta': one_of(bool, meta_spec),
    required('groups'): [group_spec],
    required('layers'): [type_spec('type', {
        'wms': combined(layer_commons, {
            'source': wms_source_spec,
            'printTileSize': [number()]
        }),
        'tiledwms': combined(layer_commons, {
            'source': wms_source_spec,
            'printTileSize': [number()]
        }),
        'wmts': combined(layer_commons, {
            'source': wmts_source_spec
        }),
        'postgis': combined(layer_commons, {
            'source': postgis_source_spec,
            'create_index': bool,
            'style': style_spec,
            'cluster': one_of(cluster_spec, bool),
        }),
        'digitize': combined(layer_commons, {
            'source': digitize_source_spec,
            'style': style_spec,
            'cluster': one_of(cluster_spec, bool),
        }),
        'static_geojson': combined(layer_commons, {
            'source': static_geojson_source_spec,
            'style': style_spec,
            'cluster': one_of(cluster_spec, bool),
        }),
        # TODO enable clustering and test it
        'sensorthings': combined(layer_commons, {
            'source': sensorthings_source_spec,
            'style': one_of(flat_style_spec, [flat_style_rule_spec]),
        })
    })]
    # 'meta': [meta_spec]
}


if __name__ == '__main__':
    import sys
    import yaml

    if len(sys.argv) < 2:
        print('Filename required')
        exit(0)

    yaml_content = yaml.safe_load(
        open(sys.argv[1], 'r')
    )

    from pprint import pprint
    pprint(validate_layers_conf(yaml_content))
