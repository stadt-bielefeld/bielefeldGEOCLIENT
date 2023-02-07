
import urllib.request, urllib.parse, urllib.error

from flask import (
    Blueprint,
    request,
    current_app,
    jsonify,
)

from flask_login import login_required, current_user

from munimap.alkis import (
    request_alkis_info,
    request_alkis_session,
    get_id_via_wms_get_feature_info
)

from munimap.alkis_log import create_legimiation_log

from munimap.alkis_selection import (
    request_owner,
    request_fs_via_fsk,
    request_fs_via_owner,
    request_fs_via_address,
    request_gemarkungen,
    request_strassen
)


alkis = Blueprint("alkis", __name__, url_prefix='/alkis')

def parse_legimation_request(request):
    company = request.args.get('company')
    reference = request.args.get('reference')
    person = request.args.get('person')
    kind = request.args.get('kind')
    return company, reference, person, kind

# Informationen zum Flurstueck (Auskunft)
@alkis.route("/info", methods=["GET"])
@alkis.route("/info/<feature_id>", methods=["GET"])
def info(feature_id=None):
    if not feature_id:
        ALKIS_GML_WMS = current_app.config.get('ALKIS_GML_WMS')
        params = {
            'BBOX': request.args.get('BBOX'),
            'WIDTH': request.args.get('WIDTH'),
            'X':  request.args.get('X'),
            'Y': request.args.get('Y'),
            'HEIGHT': request.args.get('HEIGHT'),
        }
        feature_id = get_id_via_wms_get_feature_info(
            ALKIS_GML_WMS,
            params,
            element='id'
        )

    if feature_id:
        response = request_alkis_info(alkis_id=feature_id)
        response = {
            'success': True,
            'url': '%s%s' % (current_app.config.get('ALKIS_BASE_URL'), response['getFlurstuecksinfoDocumentResponse'][0]['url'])
        }

        if (current_app.config.get('ALKIS_LEGITIMATION_GROUP') in current_user.groups_list):
            company, reference, person, kind = parse_legimation_request(request)
            create_legimiation_log(feature_id, company, reference, person, kind)
        return jsonify(response)

    return jsonify(params)

# IBR ALKIS Produkte (PDF)
@alkis.route("/pdf", methods=["GET"])
def pdf():
    token = request_alkis_session()
    feature_id = request.args.get('feature_id', None)
    alkis_id = request.args.get('alkis_id', None)
    if not feature_id:
        ALKIS_GML_WMS = current_app.config.get('ALKIS_GML_WMS')
        params = {
            'BBOX': request.args.get('BBOX'),
            'WIDTH': request.args.get('WIDTH'),
            'X':  request.args.get('X'),
            'Y': request.args.get('Y'),
            'HEIGHT': request.args.get('HEIGHT'),
        }
        alkis_id = get_id_via_wms_get_feature_info(
            ALKIS_GML_WMS,
            params,
            element='id'
        )
        feature_id = get_id_via_wms_get_feature_info(
            ALKIS_GML_WMS,
            params,
            element='flurstueckskennzeichen'
        )

    ALKIS_PDF_URL = current_app.config.get('ALKIS_PDF_URL')
    params = {
        'ipconnectid': current_app.config.get('IP_CONNECT_ID'),
        'fsk': '%s|%s' % (feature_id, alkis_id),
        'token': token,
        'popup': 'true',
    }

    url_params = urllib.parse.urlencode(params)

    if (current_app.config.get('ALKIS_LEGITIMATION_GROUP') in current_user.groups_list):
        company, reference, person, kind = parse_legimation_request(request)
        create_legimiation_log(feature_id, company, reference, person, kind)

    return jsonify({
        'success': True,
        'url': '%s%s' % (ALKIS_PDF_URL, url_params)
    })

# IBR ALKIS Produkte (Amtlich)
@alkis.route("/official", methods=["GET"])
@alkis.route("/official/<feature_id>", methods=["GET"])
@login_required
def official(feature_id=None):
    token = request_alkis_session()

    if not feature_id:
        ALKIS_GML_WMS = current_app.config.get('ALKIS_GML_WMS')
        params = {
            'BBOX': request.args.get('BBOX'),
            'WIDTH': request.args.get('WIDTH'),
            'X':  request.args.get('X'),
            'Y': request.args.get('Y'),
            'HEIGHT': request.args.get('HEIGHT'),
        }
        feature_id = get_id_via_wms_get_feature_info(
            ALKIS_GML_WMS,
            params,
            element='flurstueckskennzeichen'
        )
        alkis_id = get_id_via_wms_get_feature_info(
            ALKIS_GML_WMS,
            params,
            element='id'
        )

    ALKIS_PDF_URL = current_app.config.get('ALKIS_OFFICIAL_URL')
    params = {
        'ipconnectid': current_app.config.get('IP_CONNECT_ID'),
        'fsk': feature_id,
        'token': token,
        'prdfilter': '',
        'popup': 'true',
    }

    url_params = urllib.parse.urlencode(params)

    if (current_app.config.get('ALKIS_LEGITIMATION_GROUP') in current_user.groups_list):
        company, reference, person, kind = parse_legimation_request(request)
        create_legimiation_log(feature_id, company, reference, person, kind)

    return jsonify({
        'success': True,
        'url': '%s%s' % (ALKIS_PDF_URL, url_params)
    })


@alkis.route("/selection", methods=["GET"])
def selection():
    token = request_alkis_session()
    gemarkungen = request_gemarkungen(token)
    strassen = request_strassen(token)

    return jsonify({
        'gemarkungen': gemarkungen,
        'strassen': strassen
    })


@alkis.route("/selection/parcel", methods=["GET"])
def select_by_parcel():
    parcel = request_fs_via_fsk(request.args)
    return jsonify(parcel)


@alkis.route("/selection/address", methods=["GET"])
def select_by_address():
    parcel = request_fs_via_address(request.args)
    return jsonify(parcel)


@alkis.route("/selection/owner", methods=["GET"])
def select_by_owner():
    parcel = request_fs_via_owner(request.args)
    return jsonify(parcel)

@alkis.route("/selection/search_owner", methods=["GET"])
def search_owner():
    parcel = request_owner(request.args)
    return jsonify(parcel)


