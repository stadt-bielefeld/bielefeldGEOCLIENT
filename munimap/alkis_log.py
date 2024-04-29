# -:- encoding: utf8 -:-
import os
import csv

from flask import current_app
from flask_login import current_user

from werkzeug.exceptions import BadRequest, BadGateway
from urllib3.exceptions import InsecureRequestWarning
import datetime

def create_legitimation_log(functionname, id, company, reference, person, kind):
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
            csv_headers = ["Funktion", "Flurstücks-ID", "Benutzername", "Firma", "Aktenzeichen", 
                "Sachbearbeiter", "Art des berechtigten Interesses", "Uhrzeit", "Datum"]
            writer.writerow([h.encode("latin1") for h in csv_headers])

        time = now.strftime("%H:%M:%S")
        date = now.strftime("%d.%m.%Y")
        writer.writerow([
            functionname.encode('latin1'),
            id,
            current_user.mb_user_name.encode('latin1'),
            company.encode('latin1'),
            reference.encode('latin1'),
            person.encode('latin1'),
            kind.encode('latin1'),
            time,
            date
        ])
