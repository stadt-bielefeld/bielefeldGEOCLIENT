from __future__ import absolute_import

import csv
from io import BytesIO

from flask import (
    Blueprint,
    Response,
    jsonify,
    current_app,
    request,
    abort
)

from werkzeug import exceptions

from munimap.print_requests import MapRequest
from munimap.query.feature_collection import query_feature_collection
from munimap.query.pq import LayerNotFoundError
from munimap.index import create_index_pdf, features_to_index_data
from munimap.helper import layer_allowed_for_user

vector = Blueprint('vector', __name__)


@vector.route('/geojson', methods=['GET'])
def geojson():
    req = MapRequest.from_req(request)

    for _layer in req.layers:
        layer = current_app.layers[_layer]
        if not layer_allowed_for_user(layer):
            raise exceptions.Forbidden()

    try:
        fc = query_feature_collection(req, current_app.pg_layers)
    except LayerNotFoundError as e:
        current_app.logger.error(str(e))
        abort(400)
    return jsonify(fc)


@vector.route('/index.json', methods=['GET'])
def index_json():
    req = MapRequest.from_req(request)
    fc = query_feature_collection(req, current_app.pg_layers)
    return jsonify(features_to_index_data(fc, current_app.pg_layers))


@vector.route('/index.pdf', methods=['GET'])
def index_pdf():
    req = MapRequest.from_req(request)
    fc = query_feature_collection(req, current_app.pg_layers)
    index = features_to_index_data(fc, current_app.pg_layers)
    return Response(
        create_index_pdf(index, 'Index', columns=3),
        mimetype='application/pdf',
    )

@vector.route('/index.csv', methods=['GET'])
def index_csv():
    encoding = request.args.get('encoding', 'latin-1')
    delimiter = request.args.get('delimiter', ';')[0]
    req = MapRequest.from_req(request)
    fc = query_feature_collection(req, current_app.pg_layers)
    buf = BytesIO()
    w = csv.writer(buf, delimiter=delimiter)
    for f in fc['features']:
        if f['properties'].get('__ref__'):
            w.writerow((f['properties']['name'].encode(encoding), f['properties']['__ref__']))

    buf.seek(0)
    resp = Response(buf.read())
    resp.content_type = 'text/csv'
    return resp

@vector.route('/export/grid.geojson', methods=['GET'])
def grid_geojson():
    labels = request.args.get('labels', 'true').lower() in ('1', 'yes', 'true', 'on')
    lines = request.args.get('lines', 'true').lower() in ('1', 'yes', 'true', 'on')
    req = MapRequest.from_req(request)
    grid = req.grid
    if grid is None:
        return exceptions.BadRequest()

    return jsonify(grid.features(lines=lines, points=labels, srs=req.srs))

