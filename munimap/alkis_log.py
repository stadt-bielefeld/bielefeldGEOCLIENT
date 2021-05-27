# -:- encoding: utf8 -:-
import os
import csv

from flask import current_app
from flask.ext.login import current_user

from werkzeug.exceptions import BadRequest, BadGateway
from requests.packages.urllib3.exceptions import InsecureRequestWarning
import datetime

def create_legimiation_log(id, company, reference, person, kind):
    now = datetime.datetime.now()
    filename = '%s-%s.csv' % (now.strftime("%Y"), now.strftime("%m"))
    alkis_log = os.path.join(
        current_app.root_path,
        current_app.config['ALKIS_LOG_DIR'],
        filename
    )  

    read_mode = 'w'
    with_headers = True

    if os.path.exists(alkis_log):
        read_mode = 'a+'
        with_headers = False

    with open(alkis_log, read_mode) as csvfile:
        writer = csv.writer(
            csvfile, 
            quotechar='\"',
            delimiter=";",
            lineterminator="\n",
            quoting=csv.QUOTE_NONNUMERIC
        )

        if with_headers:
            csv_headers = [u"Flurstücks-ID", u"Benutzername", u"Firma", u"Aktenzeichen", 
                u"Sachbearbeiter", u"Art des berechtigten Interesses", u"Uhrzeit", u"Datum"]
            writer.writerow([h.encode("latin1") for h in csv_headers])

        time = now.strftime("%H:%M:%S")
        date = now.strftime("%d.%m.%Y")
        writer.writerow([
            id,
            current_user.mb_user_name.encode('latin1'),
            company.encode('latin1'),
            reference.encode('latin1'),
            person.encode('latin1'),
            kind.encode('latin1'),
            time,
            date
        ])
