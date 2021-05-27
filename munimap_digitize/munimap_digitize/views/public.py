from flask import (
    Blueprint,
    send_from_directory,
    jsonify,
    current_app
)

from munimap_digitize.model import Layer

digitize_public = Blueprint(
    'digitize_public',
    __name__,
    template_folder='../templates',
    static_folder='../static',
    static_url_path='/static',
    url_prefix='/digitize'
)

@digitize_public.route('/layer/<name>', methods=['GET'])
def layer(name):
    layer = Layer.by_name(name)
    return jsonify(layer.feature_collection)


@digitize_public.route('/icons/<path:filename>')
def icons(filename):
    return send_from_directory(
        current_app.config.get('DIGITIZE_ICONS_DIR'),
        filename
    )
