from setuptools import setup, find_packages

setup(
    name='munimap',
    version="1.0",
    url='<enter URL here>',
    license='BSD',
    maintainer='terrestris GmbH & Co. KG',
    maintainer_email='info@terrestris.de',
    description='Municipality map with street index, search grid, etc.',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    platforms='any',
    install_requires=[
        'Flask',
        'Flask-Script',
        'Jinja2',
        'MarkupSafe',
        'PyYAML',
        'Werkzeug',
        'itsdangerous',
    ],
)
