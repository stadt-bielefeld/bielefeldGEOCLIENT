from setuptools import setup, find_packages

setup(
    name='munimap',
    version="1.0",
    url='<enter URL here>',
    license='BSD',
    author='Dominik Helle',
    author_email='support@omniscale.de',
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
