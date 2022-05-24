# MuniMap Repository

## Requirements

* git
* wget
* docker
* docker-compose
* Node (>= 10)
* Python (>=3.8)
* Java 8 (openjdk-8-jre)
* virtualenv
* Required packages for building pip requirements:
  ```
  sudo apt install build-essential \
      python3-dev \
      libpython3-dev \
      python-gdal \
      python3-gdal \
      python3-pycurl \
      libgdal-dev \
      libspatialindex-dev \
      libgeos-dev \
      libssl-dev \
      libffi-dev \
      libjpeg-dev \
      zlib1g-dev \
      libfreetype6-dev \
      libproj-dev \
      gdal-bin \
      fcgiwrap \
      libgif-dev \
      libcurl4-openssl-dev \
      libproj-dev \
      libcairo2-dev \
      libfribidi-dev \
      libharfbuzz-dev \
      librsvg2-dev \
      libfcgi-dev \
      fonts-dejavu-extra \
      ttf-unifont \
      locales 
  ```

**Note**: Depending on your Python version, it can happen that during the package installation process you come across an error like `lib/hnjmodule.c:3:10: fatal error: Python.h: No such file or directory`.
If this shows, you need to install the appropriate dev library for your Python version, for instance `libpython3.9-dev` instead of `libpython3-dev`

## Initial development setup

The following steps are required once:

* Download mapfish

```
cd ../dev/
wget -q -O- https://repo1.maven.org/maven2/org/mapfish/print/print-cli/3.9.0/print-cli-3.9.0-tar.tar | tar -x -C ./mapfish
``` 

* Clone and install anol

```
cd ../../
git clone git@github.com:terrestris/anol.git
cd anol/
npm i
```

* Install (and watch) the bielefeldGEOCLIENT frontend

```
cd ../bielefeldGEOCLIENT/
npm i
npm start
```

* Install (and start) the munimap backend

```
# cd to directory where the venv should be created
python -m venv muni_venv
source muni_venv/bin/activate
cd dev/
pip install wheel setuptools
pip install -r requirements.txt
pip install -e ../
pip install --no-index -e ../munimap_digitize/
pip install --no-index -e ../munimap_transport/
python -c "import hyphen.dictools; hyphen.dictools.install('de')"
```

* Using a Python 3.9 Virtual Environment

  - Install python 3.9 on your system (Assuming debian based linux distro):
    - If Python3.9 is not available to install on your distro: 
      - `sudo add-apt-repository ppa:deadsnakes/ppa`
      - `sudo apt-get update`
    - Install Python3.9
      - `sudo apt install python3.9`
    - install python3.9 venv
      - `sudo apt install python3.9-venv`
  - create the virtual environment
    - `python3.9 -m venv muni_venv` (or any other name you like)


* Update translations

```
python dev/manage.py -c dev/configs/munimap.conf babel_refresh
python dev/manage.py -c dev/configs/munimap.conf babel_compile
```

* Build Documentation

TODO

## Start the application

After all steps from above have been applied successfully, the application can be started with:

```
python dev/manage.py -c dev/configs/munimap.conf runserver
```

If you want to use mapfish and have not configured Java 8 as the default Java Version, you need to set the `JAVA_HOME` environment variable. i.e.:
```
JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/ python dev/manage.py -c dev/configs/munimap.conf runserver
```

In another terminal the docker dev environment needs to be started
```
docker-compose --profile dev up
```

and the client (javascript) source can be watched via:

```
npm start
```

The application should now be available via [http://localhost:5000/](http://localhost:5000/).

Start print queue/broker (TODO UNTESTED):

```
python -m munimap.queue.worker -q /tmp/printqueue.sqlite
```



If you are running the dev setup and the prod setup after each other it can be that some of the permissions are not fitting. Try
```
sudo chmod -R a+rwx munimap/assets/
sudo chmod -R a+rwx dev/data/
```

## Testing the application

To test the application, you will need to install the requirements defined on `requirements-testing.txt`. To do so, run `pip install -r requirements-testing.txt`. Make sure you are on your virtual environment, altough not mandatory.

You will also need to have created the test database `munimap_test` or any other name, depending on your TestConfig, which is found in: `munimap/config.py`. The structure of the DB must be the same as the regular DB.

Tests run with [nose](https://nose.readthedocs.io/en/latest/). Go to the root level of the application and run `nosetests`
Then, you will be able to run the tests

**TODO**: Make creation and deletion of test DB automatic with test run
**TODO**: Consider migrating tests and fixtures to `pytest` in the future

## About building or generating documentation

If you need to work on changing the documentation, this is done using [Sphinx](https://www.sphinx-doc.org/en/master/).

Firts of all, you need to install the requirements defined on `requirements-docs.txt`. To do so, run `pip install -r requirements-docs.txt`. Make sure you are on your virtual environment, altough not mandatory.

A source is already provided and can be found in `docs` folder (`../docs/` if you are currently on `dev/`). 

If you make any changes and need to build it for publishing, simply run `sphinx-build`, providing the source folder and an output folder for the built version.

There is no need to create a new soure, but if some reason you need it, you can do so by syimply running `sphinx-quickstart` and answer the questions. Alternatively you can also run `sphinx-autogenerate` by providing a source file so it can autogenerate the `rst` files.

You can also generate API docs by running `sphinx-apidocs`.

Check the Sphinx documentation for further