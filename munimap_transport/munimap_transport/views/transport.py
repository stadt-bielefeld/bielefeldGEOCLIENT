import os
import json

from flask import (
    Blueprint, render_template, abort, current_app,
    jsonify, request
)
from flask.wrappers import Response

from munimap.extensions import assets
from munimap.helper import load_app_config
from munimap.app_layers_def import prepare_layers_def

from munimap_transport.timetables import csv_to_timetable_json, create_night_timetable_json

from munimap_transport.queries import query_stations, query_route


transport = Blueprint(
    'transport',
    __name__,
    template_folder='../templates',
    static_folder='../static',
    static_url_path='/static',
    url_prefix='/mobiel'
)

# add assets for transport application
assets.append_path(transport.static_folder)

@transport.route('/')
def app():
    app_config = load_app_config('transport')
    layers_def = prepare_layers_def(app_config, current_app.layers)
    return render_template(
        'transport/app/index.html',
        layers_def=layers_def,
        app_config=app_config,
        timetable_documents=timetable_documents(),
    )


@transport.route('/stations.geojson')
def stations():
    if 'layer' not in request.args:
        abort(404)

    layer = request.args.get('layer')
    bbox = request.args.get('bbox').split(',')

    station_json = query_stations(
        layer=layer,
        bbox=bbox,
        with_hull=True,
        operator=current_app.config['TRANSPORT_OPERATOR'],
    )
    return Response(
        json.dumps(station_json),
        content_type='application/json',
    )

@transport.route('/station_points.geojson')
def station_points():
    if 'layer' not in request.args:
        abort(404)

    layer = request.args.get('layer')
    bbox = request.args.get('bbox').split(',')

    station_json = query_stations(
        layer=layer,
        bbox=bbox,
        with_hull=False,
        operator=current_app.config['TRANSPORT_OPERATOR'],
    )
    return Response(
        json.dumps(station_json),
        content_type='application/json',
    )


@transport.route('/timetable_documents.json')
def timetable_documents():
    if not current_app.config['TIMETABLE_DOCUMENTS_CSV']:
        return {}

    cache_dir = os.path.join(current_app.config['PROJECT_DIR'], 'static')
    filename = "timetable_documents.geojson"
    complete_path = os.path.join(cache_dir, filename)

    if os.path.exists(complete_path):
        updated_timestamp = os.path.getmtime(complete_path)
        timestamp = os.path.getmtime(current_app.config['TIMETABLE_DOCUMENTS_CSV'])

        if updated_timestamp > timestamp:
            with open(complete_path) as json_file:
                return json.load(json_file)

    # plans in the daytime
    csvfile = current_app.config['TIMETABLE_DOCUMENTS_CSV']
    timetable_json = csv_to_timetable_json(csvfile)

    # plans in the night
    timetable_night_csv = current_app.config['TIMETABLE_NIGHTLINE_CSV']
    if timetable_night_csv:
        timetable_night_json = create_night_timetable_json(timetable_night_csv)
        timetable_json.update(timetable_night_json)

    with open(complete_path, "w") as f:
        f.write(json.dumps(timetable_json))

    return timetable_json


@transport.route('/route/')
@transport.route('/route/<osm_id>')
def route(osm_id=None):
    if osm_id is None:
        abort(404)
    return jsonify(query_route(osm_id))