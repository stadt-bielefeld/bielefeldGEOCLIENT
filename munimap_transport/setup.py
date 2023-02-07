# -*- coding: utf-8 -*-
"""
    setup.py
    ~~~~~~~~

    :copyright: (c) 2016 by Omniscale GmbH & Co. KG.
"""

"""
KKF
---

"""
from setuptools import setup

setup(
    name='munimap_transport',
    version='0.1',
    url='<enter URL here>',
    author='Dominik Helle',
    author_email='support@omniscale.de',
    description='<enter short description here>',
    long_description=__doc__,
    packages=['munimap_transport'],
    zip_safe=False,
    platforms='any',
    install_requires=[
        'Flask==0.12.5',
        'Flask-Assets==0.12',
        'natsort==8.1.0'
    ],
    include_package_data=True,
)
