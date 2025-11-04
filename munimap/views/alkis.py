
import urllib.request, urllib.parse, urllib.error

from flask import (
    Blueprint,
    request,
    current_app,
    jsonify,
)

from flask_login import login_required

from munimap.alkis import (
    request_alkis_info,
    request_alkis_session,
    get_id_via_wms_get_feature_info
)

from munimap.alkis_log import create_legitimation_log

from munimap.alkis_selection import (
    request_owner,
    request_fs_via_fsk,
    request_fs_via_owner,
    request_fs_via_address,
    request_gemarkungen,
    request_strassen
)


alkis = Blueprint("alkis", __name__, url_prefix='/alkis')

def parse_legitimation_request(request):
    company = request.args.get('company', '')
    reference = request.args.get('reference', '')
    person = request.args.get('person', '')
    kind = request.args.get('kind', '')
    return company, reference, person, kind

# Informationen zum Flurstueck (Auskunft)
@alkis.get("/info")
@alkis.get("/info/<alkis_id>")
def info(alkis_id=None):
    alkis_fsk = request.args.get('alkis_fsk', None)
    if not alkis_id:
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
        alkis_fsk = get_id_via_wms_get_feature_info(
            ALKIS_GML_WMS,
            params,
            element='flurstueckskennzeichen'
        )

    if alkis_id:
        response = request_alkis_info(alkis_id)
        response = {
            'success': True,
            'url': '%s%s' % (current_app.config.get('ALKIS_BASE_URL'), response['getFlurstuecksinfoDocumentResponse'][0]['url'])
        }

        #if (current_app.config.get('ALKIS_LEGITIMATION_GROUP') in current_user.groups_list):
        company, reference, person, kind = parse_legitimation_request(request)
        create_legitimation_log("info", alkis_fsk, company, reference, person, kind)
        return jsonify(response)

    return jsonify(params)

# IBR ALKIS Produkte (PDF)
@alkis.get("/pdf")
def pdf():
    token = request_alkis_session()
    alkis_fsk = request.args.get('alkis_fsk', None)
    alkis_id = request.args.get('alkis_id', None)
    if not alkis_fsk:
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
        alkis_fsk = get_id_via_wms_get_feature_info(
            ALKIS_GML_WMS,
            params,
            element='flurstueckskennzeichen'
        )

    ALKIS_PDF_URL = current_app.config.get('ALKIS_PDF_URL')
    params = {
        'ipconnectid': current_app.config.get('IP_CONNECT_ID'),
        'fsk': '%s|%s' % (alkis_fsk, alkis_id),
        'token': token,
        'popup': 'true',
    }

    url_params = urllib.parse.urlencode(params)

    #if (current_app.config.get('ALKIS_LEGITIMATION_GROUP') in current_user.groups_list):
    company, reference, person, kind = parse_legitimation_request(request)
    create_legitimation_log("pdf", alkis_fsk, company, reference, person, kind)

    return jsonify({
        'success': True,
        'url': '%s%s' % (ALKIS_PDF_URL, url_params)
    })

# IBR ALKIS Produkte (Amtlich)
@alkis.get("/official")
@alkis.get("/official/<alkis_id>")
@login_required
def official(alkis_id=None):
    token = request_alkis_session()
    alkis_fsk = request.args.get('alkis_fsk', None)
    if not alkis_id:
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
        alkis_fsk = get_id_via_wms_get_feature_info(
            ALKIS_GML_WMS,
            params,
            element='flurstueckskennzeichen'
        )

    ALKIS_OFFICIAL_URL = current_app.config.get('ALKIS_OFFICIAL_URL')
    params = {
        'ipconnectid': current_app.config.get('IP_CONNECT_ID'),
        'fsk': alkis_fsk,
        'token': token,
        'prdfilter': '',
        'popup': 'true',
    }

    url_params = urllib.parse.urlencode(params)

    #if (current_app.config.get('ALKIS_LEGITIMATION_GROUP') in current_user.groups_list):
    company, reference, person, kind = parse_legitimation_request(request)
    create_legitimation_log("official", alkis_fsk, company, reference, person, kind)

    return jsonify({
        'success': True,
        'url': '%s%s' % (ALKIS_OFFICIAL_URL, url_params)
    })


@alkis.get("/selection")
def selection():
    token = request_alkis_session()
    gemarkungen = request_gemarkungen(token)
    strassen = request_strassen(token)

    return jsonify({
        'gemarkungen': gemarkungen,
        'strassen': strassen
    })


@alkis.get("/selection/parcel")
def select_by_parcel():
    parcel = request_fs_via_fsk(request.args)
    return jsonify(parcel)


@alkis.get("/selection/address")
def select_by_address():
    parcel = request_fs_via_address(request.args)
    return jsonify(parcel)


@alkis.get("/selection/owner")
def select_by_owner():
    parcel = request_fs_via_owner(request.args)

    company, reference, person, kind = parse_legitimation_request(request)
    create_legitimation_log("request_fs_via_owner", request.args.get('id', ''), company, reference, person, kind)

    return jsonify(parcel)

@alkis.get("/selection/search_owner")
def search_owner():
    parcel = request_owner(request.args)

    searchArgString = 'nachnameoderfirma=' + request.args.get('name', '') + ', vorname=' + request.args.get('firstname', '') + ', namensbestandteil=' + request.args.get('component', '')

    company, reference, person, kind = parse_legitimation_request(request)
    create_legitimation_log("request_owner", searchArgString, company, reference, person, kind)

    return jsonify(parcel)


