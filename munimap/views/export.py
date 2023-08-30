

import os
import uuid

from flask import (
    Blueprint,
    url_for,
    jsonify,
    current_app,
    request,
    abort,
    send_file,
)
from werkzeug import exceptions

from munimap.export import mapfish, raw
from munimap.queue.queue import SqliteQueue
from munimap.print_requests import PrintRequest

export = Blueprint('export', __name__)

import logging
log = logging.getLogger('munimap.print')

@export.route('/export/map/<id>/status', methods=['GET'])
def print_check(id):
    q = SqliteQueue(current_app.config['PRINT_QUEUEFILE'])
    job = q.get(id)
    if not job:
        return abort(404)

    if job.result and 'error' in job.result:
        current_app.logger.error("unable to print: %s\n%s",
             job.result.get('error', ''),
             job.result.get('full_error', job.result))
        return jsonify({
            'status': 'error',
        }), 500

    if job.status == 'finished':
        return jsonify({
            'status': 'finished',
            'downloadURL': url_for('.print_download', id=id, _external=True),
        })

    resp = jsonify({
        'status': 'inprocess',
        'statusURL': url_for('.print_check', id=id, _external=True),
    })

    resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    resp.headers['Pragma'] = 'no-cache'
    return resp


@export.route('/export/map/<id>/download', methods=['GET'])
def print_download(id):
    q = SqliteQueue(current_app.config['PRINT_QUEUEFILE'])
    job = q.get(id)
    if not job or job.status != 'finished':
        return abort(404)

    if 'output_file' in job.result:
        return send_file(
            job.result['output_file'],
            as_attachment=True,
            # TODO generate filename
            # attachment_filename='output.' + print_request.output_format)
        )

    current_app.logger.error("unable to print: %s\n%s",
                     job.result.get('error', ''),
                     job.result.get('full_error', job.result))
    return abort(500)


@export.route('/export/map', methods=['POST'])
def print_post():
    log.info('starting print job')
    params = request.get_json()
    if params is None:
        raise exceptions.BadRequest(description='Invalid JSON request')

    print_request = PrintRequest.from_json(params)
    invalid_layers = []
    for layer in print_request.layers:
        if layer not in current_app.mapfish_layers:
            invalid_layers.append(layer)

    if len(invalid_layers) > 0:
        raise exceptions.BadRequest(
            description='Invalid layers %s' % ', '.join(invalid_layers)
        )

    config_file = current_app.config.get('MAPFISH_YAML')
    report_file = None
    is_custom = False
    if print_request.page_layout == 'custom':
        base_path = os.path.dirname(config_file)
        report_file = mapfish.create_jasper_report(
            print_request,
            base_path)
        config_file = mapfish.create_mapfish_yaml(
            print_request,
            base_path,
            report_file)
        if 'MAPFISH_CUSTOM_YAML_FOOTER' in current_app.config:
            with open(config_file, 'a') as f:
                f.write(current_app.config['MAPFISH_CUSTOM_YAML_FOOTER'])

        is_custom = True

    icons_dir = os.path.join(current_app.config['MAPFISH_ICONS_DIR'],
                             current_app.config['DRAW_ICONS_SUB_DIR'])
    if is_custom:
        # if using custom print layout (i.e. adjusted sizes) the mapfish cli is used
        icons_dir = os.path.join(current_app.config['MAPFISH_CLI_ICONS_DIR'],
                                 current_app.config['DRAW_ICONS_SUB_DIR'])

    spec_file = mapfish.create_spec_json(print_request, is_custom=is_custom,
                                         icons_dir=icons_dir)

    id = uuid.uuid4().hex
    if print_request.name is not None:
        output_file = os.path.abspath(
            os.path.join(current_app.config['PRINT_OUTDIR'],
                         print_request.name))
    else:
        output_file = os.path.abspath(
            os.path.join(current_app.config['PRINT_OUTDIR'],
                         '%s.%s' % (id, print_request.output_format)))

    q = SqliteQueue(current_app.config['PRINT_QUEUEFILE'])

    if print_request.output_format.startswith('raw_'):
        raw.print_raw(print_request, output_file)
        q.append({}, id=id, finished=True)
        q.mark_done(id, {'output_file': output_file})

        log.debug('added print job with id=%s' % (id))

        r = jsonify({
            'status': 'added',
            'statusURL': url_for('.print_check', id=id, _external=True),
        })
        return r, 201

    index_url = None
    if print_request.index_layers:
        params = print_request.as_strings()
        index_url = url_for(
            'vector.index_pdf',
            bbox=params['bbox'],
            srs=params['srs'],
            layers=params['index_layers'],
            width=params['width'],
            height=params['height'],
            cellsx=params['cellsx'],
            cellsy=params['cellsy'],
            dpi=params['dpi'],
        )
        # use local URL, drop SCRIPT_NAME
        if request.environ.get('SCRIPT_NAME'):
            script_name = request.environ['SCRIPT_NAME']
            if index_url.startswith(script_name):
                index_url = index_url[len(script_name)-1:]
        internal_app_url = current_app.config.get('INTERNAL_APP_URL', 'http://%(SERVER_NAME)s:%(SERVER_PORT)s' % request.environ)
        index_url = internal_app_url + index_url


    job = mapfish.mapfish_printqueue_task(
        spec_file=spec_file,
        config_file=config_file,
        output_file=output_file,
        index_url=index_url,
        report_file=report_file,
        is_custom=is_custom,
    )

    # Option to use the app without the queue system - used for the automatic tests
    if current_app.config['PRINT_USE_BROKER']:
        q.append(job, id=id)
    else:
        result = mapfish.mapfish_printqueue_worker(job)
        q.append(job, id=id, finished=True)
        q.mark_done(id, result)

    log.debug('added print job with id=%s' % (id))

    r = jsonify({
        'status': 'added',
        'statusURL': url_for('.print_check', id=id, _external=True),
        'downloadURL': url_for('.print_download', id=id, _external=True),
    })
    return r, 201
