import logging

from urllib3.util import parse_url
from flask import current_app

log = logging.getLogger('munimap.stats')


def log_stats(url, req, res, user):
    """ Log the stat.
    """
    should_log_stat = _should_log_stat(url, current_app.config.get('LOG_STATS_WHITELIST', []))
    if not should_log_stat:
        return
    user_name = user.mb_user_name
    user_department = user.mb_user_department

    referrer = req.referrer
    ip = req.remote_addr
    host = req.host
    user_agent = req.user_agent.string

    app = _get_app_from_url(referrer, current_app.url_map)

    status_code = res.status_code
    content_length = res.content_length

    msg = f'USER:{user_name} DEPARTMENT:{user_department} APP:{app} IP:{ip} URL:{url} STATUS:{status_code} ' \
          f'CONTENT-LENGTH:{content_length} HOST:{host} REFERER:{referrer} USER-AGENT:{user_agent}'
    log.info(msg)


def _get_app_from_url(url, url_map):
    """ Get the app name from the provided URL.

    Returns the name of the app or '/' for the default app
    that runs under root. Returns None if provided URL does
    not match the URLs of munimap.index.
    """
    parsed_url = parse_url(url)
    path = parsed_url.path
    try:
        adapter = url_map.bind('localhost')
        method, arg = adapter.match(path)
        if method != 'munimap.index':
            return None
        return arg.get('config', '/')
    except:
        return None


def _should_log_stat(url, accepted_urls):
    """ Check if stat should be logged.

    Returns True if provided URL starts with
    at least one URL from the list of accepted URLs.
    Returns False otherwise.
    """
    return any([url.startswith(u) for u in accepted_urls])
