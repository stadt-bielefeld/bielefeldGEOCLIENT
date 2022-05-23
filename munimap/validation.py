from dictspec.validator import validate, ValidationError
from dictspec.spec import one_of, number, required, type_spec, combined
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
    'directAccess': bool
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

digitize_source_spec = {
    'name': string_type,
    'srs': string_type,
}

static_geojson_source_spec = {
    'file': string_type,
    'srs': string_type,
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

legend_spec = {
    'type': string_type,
    'url': string_type,
    'title': string_type,
    'href': string_type,
    'text': string_type,
    'showLayerTitle': bool,
}

featureinfo_spec = {
    'target': string_type,
    'width': number(),
    'height': number(),
    'properties': [string_type],
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
            'source': wms_source_spec
        }),
        'tiledwms': combined(layer_commons, {
            'source': wms_source_spec
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
            'cluster': one_of(cluster_spec, bool),
        }),
        'static_geojson': combined(layer_commons, {
            'source': static_geojson_source_spec,
            'style': style_spec,
            'cluster': one_of(cluster_spec, bool),
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
