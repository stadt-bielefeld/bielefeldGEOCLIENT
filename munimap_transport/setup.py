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
        'Flask',
        'Flask-Assets',
        'natsort',
    ],
    include_package_data=True,
)
