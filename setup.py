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
        'bcrypt==3.2.2',
        'dictspec==0.2.1',
        'Flask==0.12.5',
        'Flask-Assets==0.12',
        'Flask-Babel==0.9',
        'Flask-Login==0.5.0',
        'flask-mailman==0.1.5',
        'Flask-Minify==0.39',
        'Flask-SQLAlchemy==2.5.1', 
        'Flask-WTF==0.15.1',
        'itsdangerous==2.0.1',
        'Jinja2==3.0.3',
        'libsass==0.8.3',
        'markupsafe==2.0.1',
        'psycopg2==2.9.3',
        'PyHyphen==4.0.3',
        'PyYAML==6.0',
        'reportlab==3.6.9',
        'Rtree==1.00',
        'Shapely==1.8.2',
        'speaklater3==1.4',
        'SQLAlchemy==1.4.36',
        'WTForms==2.3.3',
        'WTForms-SQLAlchemy==0.3',
    ],
)
