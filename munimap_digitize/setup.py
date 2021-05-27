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
        'Flask',
        'Flask-Assets',
    ],
    include_package_data=True,
)
