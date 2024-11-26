# MuniMap Repository

## Publishing

1. Update version in `pyproject.toml`
2. Update commit hash of anol in `.github/workflows/publish.yml` if needed
3. Push tag according to version number of previous step
4. Publish pipeline will start automatically

## Requirements

* git
* wget
* docker
* docker-compose
* Node (>= 10)
* Python (>=3.9)
* Java 8 (openjdk-8-jre)
* virtualenv

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

* Install the munimap backend using a Python 3.9 Virtual Environment

  - Open new terminal
  - Install python 3.9 on your system (Assuming debian based linux distro):
    - If Python3.9 is not available to install on your distro: 
      - `sudo add-apt-repository ppa:deadsnakes/ppa`
      - `sudo apt-get update`
    - Install Python3.9 and other important dependencies:
  ```
  sudo apt install build-essential \
      python3.9 \
      python3-dev \
      python3.9-venv \
      libpython3.9-dev \
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
      fonts-unifont \
      postgresql \
      locales 
  ```

  - create the virtual environment
    - `python3.9 -m venv muni_venv` (or any other name you like)
  - Activate Virtual Environment
    - `source muni_venv/bin/activate`
  - Install requirements:
      ```
      cd dev/
      pip install build
      ```
  - Continue installing requirements
      ```
      pip install -r requirements.txt
      pip install -e ../
      pip install --no-index -e ../munimap_transport/
      ```
  - As long as the custom print layouts are still using the mapfish cli, we need to copy the icons to the mapfish config dir:
      ```
       cp -r ../munimap/static/img/icons/* configs/mapfish/icons/
      ```
  - Install language support
    - `python -c "import hyphen.dictools; hyphen.dictools.install('de')"`
    
## Update translations (optional)
  - Install locales. Run the command and then use the arrow key to search for "de_DE.UTF-8 UTF-8" and "de_DE ISO 8859-1" and select with the space bar. Tab to OK and confirm with Enter. Select "de_DE.UTF-8" as standard.
    ```
    sudo dpkg-reconfigure locales
    ```
  - In another terminal the docker dev environment needs to be started
    - `cd ../docker/`
    - `docker compose --profile dev up`
  - Update translations
    ```
    export FLASK_APP="manage.py"
    flask babel-refresh
    flask babel-compile
    ```

## Start databases and other background services

```bash
    cd docker/
    docker compose --profile dev up
```

## Start the python backend (flask)

- Then repeat these commands from the initial setup in another terminal:
    ```
    cd ./bielefeldGEOCLIENT 
    source muni_venv/bin/activate
    cd dev/
    export FLASK_APP="manage.py"
    ```
- `flask run-munimap`
  
By default a configuration file located in the `dev/` folder is used. However you can use a custom file by providing `FLASK_MUNIMAP_CONFIG` environment variable:
- `FLASK_APP=manage.py FLASK_MUNIMAP_CONFIG='../path/to/your/custom/config/file.conf' flask run-munimap`

For debugging purposes, you may use the environment variable `FLASK_DEBUG=1` if not set in the configuration file
- `FLASK_DEBUG=1 FLASK_APP=manage.py flask run-munimap`

You can also set the environment your app is running on by setting the `FLASK_ENV=development` environment variable, if not already in the config file
- `FLASK_ENV=development FLASK_APP=manage.py flask run-munimap`

If you want to use mapfish CLI instead of service and have not configured Java 8 as the default Java Version, you need to set the `JAVA_HOME` environment variable. i.e.:
- `JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/ FLASK_APP=manage.py flask run-munimap`

## Compile the frontend
and finally the client (javascript) source can be watched via(ran in the root folder, i.e, bielefeldGEOCLIENT):
```bash
nvm use
npm i
npm start
``` 

## Access the application

The application should now be available via [http://localhost:5000/](http://localhost:5000/) (Proxied to [http://localhost/](http://localhost/)).

The docs are available via [http://localhost:8082/](http://localhost:8082/) (Proxied to [http://localhost:4000](http://localhost:4000))

Start print queue/broker (make sure to adjust the path to printqueue.sqlite according to `PRINT_QUEUEFILE`):
- `JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/ python -m munimap.queue.worker -q /tmp/printqueue.sqlite`

If you are running the dev setup and the prod setup after each other it can be that some of the permissions are not fitting. Try
```
sudo chmod -R a+rwx munimap/assets/
sudo chmod -R a+rwx dev/data/
```
**Note**: Other commands are also set in the `manage.py`. You can check which commands exist by running `FLASK_APP=manage.py flask --help`

## Run alembic to upgrade to latest revision

While the database is up, run from the `bielefeldGEOCLIENT` folder:

```
alembic upgrade head
```

To create and apply a revision run:

```bash
# adjust model
alembic revision --autogenerate -m "<migration name>"
sudo chown -R "$USER" munimap/alembic/versions/*.py
# adjust migration
alembic upgrade head
```


## Debugging the application

# With VSCODE
A debug configuration is provided and can be found in `.vscode/launch.json`.
If you are using a custom config file for your application, you have to change it's path in `FLASK_MUNIMAP_CONFIG`.
Then all you need to do is start debugging with vscode

# With PyCharm
TODO

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

A source is already provided and can be found in `munimap-docs` folder (`../docker/munimap-docs/` if you are currently on `dev/`).  

If you make any changes and need to build it for publishing, simply run `sphinx-build`, providing the source folder and an output folder for the built version.

There is no need to create a new source, but if for some reason you need it, you can do so by simply running `sphinx-quickstart` and answer the questions. Alternatively you can also run `sphinx-autogenerate` by providing a source file so it can autogenerate the `rst` files.

You can also generate API docs by running `sphinx-apidocs`.

Check the Sphinx documentation for further information.

**NOTE**: A docker container for the docs is provided. By making changes to the source, a new documentation is automatically compiled from the source. However, you can always execute the container interactively and do your changes there directly or run the already mentioned commands.
