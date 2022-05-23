# -*- coding: utf-8 -*-
"""
    setup.py
    ~~~~~~~~

    :copyright: (c) 2015 by Omniscale GmbH & Co. KG.
"""

"""
KKF
---

"""
from setuptools import setup

setup(
    name='munimap_digitize',
    version='0.1',
    url='<enter URL here>',
    author='Dominik Helle',
    author_email='support@omniscale.de',
    description='<enter short description here>',
    long_description=__doc__,
    packages=['munimap_digitize'],
    zip_safe=False,
    platforms='any',
    install_requires=[
        'Flask==0.12.5',
        'Flask-Assets==0.12',
        'Flask-WTF==0.15.1',
        'Flask-SQLAlchemy==2.5.1',
        'SQLAlchemy==1.4.36',
        'GeoAlchemy2==0.11.1',
        'Shapely==1.8.2',
        'Flask-Login==0.5.0',
        'WTForms==2.3.3',
        'WTForms-SQLAlchemy==0.3'
    ],
    include_package_data=True,
)
