import functools
import logging

from urllib3.util import parse_url
from urllib.parse import parse_qs
from flask import current_app

log = logging.getLogger('munimap.stats')


def preprocess_whitelist(whitelist):
    """ Create consistent whitelist
    """
    processed_strings = [{"url": item, "queries": []} for item in whitelist if isinstance(item, str)]
    processed_dicts = [{"queries": [], **item} for item in whitelist if isinstance(item, dict)]
    return processed_strings + processed_dicts


def log_stats(request, current_user, use_referrer=False, route_name='munimap.index', app_attr='config', url_from_response=False):
    """ Decorator for logging stats.

    Can be used for decorating functions that work with request and response objects (e.g. flask routes).
    Stats will be logged AFTER the decorated function was called.

    Arguments:
        - `use_referrer`: True, if the referrer URL should be used to derive the application name. False, otherwise.
        - `route_name`: name of the application route incl. the blueprint prefix, e.g. 'munimap.index'. This will
            be used to derive the app name from the route.
        - `app_attr`: The attribute name of the route that contains the application name.
        - `url_from_response`: True, if the URL should be taken from the request object that is attached to the
            response object. This can be useful for logging requests that were send by application code. E.g. the
            request after resolving the URL hash on the /proxy endpoints.
    """
    def dec_log_stats(func):
        @functools.wraps(func)
        def wrapper_log_stats(*args, **kwargs):
            res = func(*args, **kwargs)
            url = request.url
            if url_from_response:
                url = res.request.url
            _log_stats(url, request, res, current_user, use_referrer, route_name, app_attr)
            return res
        return wrapper_log_stats
    return dec_log_stats


def _log_stats(url, req, res, user, use_referrer, route_name, app_attr):
    """ Log the stat.
    """
    whitelist = preprocess_whitelist(current_app.config.get('LOG_STATS_WHITELIST', []))
    url_in_whitelist = _is_url_in_whitelist(url, whitelist)
    if not url_in_whitelist:
        return

    user_name = None
    user_department = None
    if not user.is_anonymous:
        user_name = user.mb_user_name
        user_department = user.mb_user_department

    referrer = req.referrer if hasattr(req, 'referrer') else None
    try:
        ip = req.headers.environ['HTTP_X_FORWARDED_FOR'].split(', ')[0]
    except:
        ip = None
    if ip is None:
        ip = req.remote_addr if hasattr(req, 'remote_addr') else None
    host = req.host if hasattr(req, 'host') else None
    user_agent = req.user_agent.string if hasattr(req, 'user_agent') else None

    if use_referrer:
        app = _get_app_from_url(referrer, current_app.url_map, route_name, app_attr)
    else:
        app = _get_app_from_url(req.base_url, current_app.url_map, route_name, app_attr)

    status_code = res.status_code if hasattr(res, 'status_code') else None
    content_length = res.headers.get('Content-Length', None) if hasattr(res, 'headers') else None

    user_name = user_name if user_name else ''
    user_department = user_department if user_department else ''
    app = app if app else ''
    ip = ip if ip else ''
    url = url if url else ''
    status_code = status_code if status_code else ''
    content_length = content_length if content_length is not None else ''
    host = host if host else ''
    referrer = referrer if referrer else ''
    user_agent = user_agent if user_agent else ''

    msg = f'{user_name}|{user_department}|{app}|{ip}|{url}|{status_code}|' \
          f'{content_length}|{host}|{referrer}|{user_agent}'
    log.info(msg)


def _get_app_from_url(url, url_map, route_name, app_attr):
    """ Get the app name from the provided URL.

    Returns the name of the app or '/' for the default app
    that runs under root. Returns None if provided URL does
    not match the URLs of route_name.
    """
    parsed_url = parse_url(url)
    path = parsed_url.path
    try:
        adapter = url_map.bind('localhost')
        method, arg = adapter.match(path)
        if method and method == route_name:
            return arg.get(app_attr, '/')
        return None
    except:
        return None


def _is_url_in_whitelist(url, accepted_urls):
    """ Check if URL is in whitelist of accepted URLs.

    Returns True if provided URL starts with
    at least one URL from the list of accepted URLs.
    Returns False otherwise.
    """
    parsed_url = parse_url(url)
    query_params = parse_qs(parsed_url.query)

    for item in accepted_urls:
        url_matches = url.startswith(item.get('url'))
        if not url_matches:
            continue
        # If no queries were configured, we count this as a match
        queries_match = True
        item_queries = item.get('queries')
        if item_queries:
            # query_param always creates lists for each param, respectively
            queries_match = all([qp.get('value') in query_params.get(qp.get('name'), []) for qp in item_queries])
        if queries_match:
            return True
    return False
