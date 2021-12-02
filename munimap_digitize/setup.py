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
        'Flask==0.10.1',
        'Flask-Assets==0.11',
        'Flask-WTF==0.12',
        'Flask-SQLAlchemy==2.1',
        'SQLAlchemy==1.0.8',
        'GeoAlchemy2==0.2.6',
        'Shapely==1.5.12',
        'Flask-Login==0.3.2',
    ],
    include_package_data=True,
)
