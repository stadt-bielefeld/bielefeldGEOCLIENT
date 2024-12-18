# -*- coding: utf-8 -*-

import csv as csvlib

from flask import current_app

def csv_to_timetable_json(csv_file):
    routes = {}
    with open(csv_file, "rb") as csv_file:
        reader = csvlib.DictReader(csv_file,  delimiter=';')

        for lineno, row in enumerate(reader):
            # TODO check if we can use other row names here
            ref = row['Haltestellenname'].rstrip()
            if ref not in routes:
                routes[ref] = {}

            line = row['Linie']
            if line not in routes[ref]:
                routes[ref][line] = {
                    'files': [],
                }
            base_url = current_app.config['TIMETABLE_DOCUMENTS_BASE_URL']
            routes[ref][line]['files'].append({
                'title': row['RichtungsÃ¼berschrift'].rstrip(),
                'url': '%s%s' % (base_url, row['Datei'].lower())
            })

    return routes


def create_night_timetable_json(csv_file):
    routes = {}
    base_url = current_app.config['TIMETABLE_NIGHTLINE_DOCUMENTS_BASE_URL']

    with open(csv_file, "rb") as csv_file:
        reader = csvlib.DictReader(csv_file,  delimiter=';')

        for lineno, row in enumerate(reader):
            line = row['Line']

            routes[line] = {
                'files': {
                    'url': '%s%s' % (base_url, row['File'])
                }
            }
    return routes