
import re
from werkzeug.exceptions import BadRequest

from flask import current_app

from munimap.grid import Grid

import logging
log = logging.getLogger('munimap.print')


MISSING = object()

def parse_value(params, key, func, default=MISSING):
    if default is MISSING:
        # required argument
        if key not in params:
            raise BadRequest('missing param %s' % key)
    if key not in params:
        return default

    try:
        return func(params[key])
    except (ValueError, TypeError):
        raise BadRequest('invalid param value %s=%s' % (key, params[key]))

def parse_bbox(params):
    def _parse_bbox(values):
        bbox = [float(x) for x in values.split(',')]
        if len(bbox) != 4:
            raise ValueError
        return bbox
    return parse_value(params, 'bbox', _parse_bbox)

def parse_cells(params):
    x = parse_value(params, 'cellsx', int, default=0)
    y = parse_value(params, 'cellsy', int, default=0)

    return x, y

def parse_size(params):
    width = parse_value(params, 'width', int, default=None)
    height = parse_value(params, 'height', int, default=None)

    if width is None and height is None:
        return None, None

    if width is None or height is None:
        raise BadRequest('requires width and height param')

    return width, height

def parse_index_layers(params):
    return parse_value(params, 'index_layers', lambda x: x.split(','), default=[])

def parse_layers(params):
    return parse_value(params, 'layers', lambda x: x.split(','), default=[])

def parse_srs(params):
    def _parse_srs(val):
        if isinstance(val, int):
            return val
        return int(val.split(':')[-1])
    return parse_value(params, 'srs', _parse_srs, default=4326)


def check_value(params, key, check, default=MISSING):
    if default is MISSING:
        # required argument
        if key not in params:
            raise BadRequest('missing param %s' % key)
    if key not in params:
        return default

    if not check(params[key]):
        raise BadRequest('invalid param value %s=%s' % (key, params[key]))

    return params[key]

def check_bbox(params):
    def _check_bbox(bbox):
        if not isinstance(bbox, list) or len(bbox) != 4:
            return False
        if not all(isinstance(x, (float, int)) for x in bbox):
            return False
        return True
    return check_value(params, 'bbox', _check_bbox)

def check_int(params, key, default=MISSING):
    return check_value(params, key, lambda x: isinstance(x, int), default=default)

def check_list(params, key, default=MISSING):
    return check_value(params, key, lambda x: isinstance(x, list), default=default)

def check_dict(params, key, default=MISSING):
    return check_value(params, key, lambda x: isinstance(x, dict), default=default)

def format_list(l):
    if not l:
        return ''
    return ','.join(map(str, l))

def calc_res(size, bbox, dpi):
    w = abs(bbox[0] - bbox[2])
    h = abs(bbox[1] - bbox[3])
    return max(
        w / (size[0] / (25.4 / (0.28 * dpi))),
        h / (size[0] / (25.4 / (0.28 * dpi)))
    )

class MapRequest(object):
    def __init__(self, **kw):
        self.bbox = kw.get('bbox')
        self.srs = kw.get('srs')
        self.layers = kw.get('layers')
        self.index_layers = kw.get('index_layers')
        self.dpi = kw.get('dpi')
        self.cellsx = kw.get('cellsx')
        self.cellsy = kw.get('cellsy')
        self.limit = kw.get('limit')
        self.width = kw.get('height')
        self.height = kw.get('width')
        
        # save cells from grid if cells are 0,0
        if self.cellsx == 0 or self.cellsy == 0:
            grid = self.grid
            if grid:
                self.cellsy, self.cellsx = grid.cells

    @property
    def size(self):
        if self.width is None or self.height is None:
            return None
        return self.width, self.height

    @property
    def cells(self):
        if self.cellsx is None or self.cellsy is None:
            return None
        return self.cellsx, self.cellsy


    @property
    def grid(self):
        if not self.size:
            return None

        return Grid(
            self.bbox, self.size, cells=self.cells, map_res=self.dpi,
            labels=current_app.config.get('GRID_LABELS'),
            invert_top_labels=current_app.config.get('INVERT_TOP_GRID_LABELS'),
            invert_left_labels=current_app.config.get('INVERT_LEFT_GRID_LABELS'),
            # TODO def_res=self.def_res,
        )

    def as_strings(self):
        d = {}
        for k, v in self.__dict__.items():
            if isinstance(v, (list, tuple)):
                v = format_list(v)
            else:
                v = str(v)
            d[k] = v
        return d

    @classmethod
    def from_req(cls, req):
        param = dict((k.lower(), v) for k, v in req.args.items())

        param['width'], param['height'] = parse_size(param)
        param['bbox'] = parse_bbox(param)
        param['srs'] = parse_srs(param)
        param['layers'] = parse_layers(param)
        param['index_layers'] = parse_index_layers(param)
        param['dpi'] = int(param.get('dpi', 72))
        param['limit'] = int(param.get('limit', 1000))
        param['cellsx'], param['cellsy'] = parse_cells(param)
        return cls(**param)


PRINT_NAME_REGEX = re.compile(r'^[0-9a-zA-Z_\.\-]+$')

class PrintRequest(MapRequest):
    def __init__(self, **kw):
        MapRequest.__init__(self, **kw)
        self.output_format = kw.get('output_format')
        self.mimetype = kw.get('mimetype')
        self.page_layout = kw.get('page_layout')
        self.page_size = kw.get('page_size')
        self.scale = kw.get('scale')
        self.res = calc_res(self.page_size, self.bbox, self.dpi)
        self.calc_scale = self.res / 0.00028
        self.name = kw.get('name')
        self.feature_collection = kw.get('feature_collection')
        self.measure_feature_collection = kw.get('measure_feature_collection')

    @classmethod
    def from_json(cls, param):
        param = uncamel_case_dict(param)

        param['bbox'] = check_bbox(param)
        param['srs'] = check_int(param, 'srs')
        param['layers'] = check_list(param, 'layers')
        param['index_layers'] = check_list(param, 'index_layers', [])
        param['dpi'] = check_int(param, 'dpi', 300)
        param['limit'] = check_int(param, 'limit', 1000)
        param['cellsx'], param['cellsy'] = check_list(param, 'cells', [0, 0])
        param['page_size'] = check_list(param, 'page_size', None)
        param['output_format'] = check_value(param, 'output_format', lambda x: isinstance(x, str))
        param['mimetype'] = check_value(param, 'mimetype', lambda x: isinstance(x, str))
        param['page_layout'] = check_value(param, 'page_layout', lambda x: isinstance(x, str), 'custom')
        param['scale'] = check_value(param, 'scale', lambda x: isinstance(x, (float, int)))
        param['name'] = check_value(
            param,
            'name',
            lambda x: isinstance(x, str) and PRINT_NAME_REGEX.match(x)
        )

        param['cellsx'] = param['cellsx'] or 0 # set to 0 in case of None
        param['cellsy'] = param['cellsy'] or 0 # set to 0 in case of None
        param['feature_collection'] = check_dict(param, 'feature_collection', {})
        param['measure_feature_collection'] = check_dict(param, 'measure_feature_collection', {})
        return cls(**param)

    @property
    def grid(self):
        if not hasattr(self, 'page_size'):
            return None

        if len(self.index_layers) == 0:
            return None
        
        if not self.size and self.page_size:
            MM_PER_INCH = 25.4
            self.width = int(self.page_size[0] / MM_PER_INCH * self.dpi)
            self.height = int(self.page_size[1] / MM_PER_INCH * self.dpi)

        return MapRequest.grid.fget(self)

def uncamel_case_dict(d):
    result = {}
    for k, v in d.items():
        result[uncamel_case(k)] = v
    return result

def uncamel_case(key):
    return re.sub('([a-z])([A-Z])', lambda m: m.group(1) + '_' + m.group(2).lower(), key)
