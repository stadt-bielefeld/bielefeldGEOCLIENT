# MuniMap Repository

## Publishing

1. Update commit hash of anol in `Dockerfile` if needed
2. Start release action on github 

## Requirements

* git
* wget
* docker
* docker-compose
* Node (>= 10)
* Python (>=3.12)
* Java 8 (openjdk-8-jre)
* virtualenv
* geostyler-cli (>= 5.0.0)

## Initial development setup

The following steps are required once:

###

Create a parent dir with any name for the bielefeldGEOCLIENT and clone the client from GitHub. 

```shell
mkdir <any-name>
cd <any-name>
git clone https://github.com/stadt-bielefeld/bielefeldGEOCLIENT
cd bielefeldGEOCLIENT
```

### Download mapfish

```
wget -q -O- https://repo1.maven.org/maven2/org/mapfish/print/print-cli/3.9.0/print-cli-3.9.0-tar.tar | tar -x -C dev/mapfish
``` 

### Download geostyler-cli

```
wget -q -O /tmp/geostyler-linux.zip https://github.com/geostyler/geostyler-cli/releases/download/v5.0.3/geostyler-linux.zip
mkdir -p dev/geostyler-cli
unzip /tmp/geostyler-linux.zip -d dev/geostyler-cli
```

### Clone and install anol

```
cd ../
git clone git@github.com:terrestris/anol.git
cd anol/
npm i --omit=dev
```

### Install (and watch) the bielefeldGEOCLIENT frontend

```
cd ../bielefeldGEOCLIENT/
npm ci
npm start
```

### Install the munimap backend using a Python 3.12 Virtual Environment

  - Open new terminal
  - Install python 3.12 on your system (Assuming debian based linux distro):
    - If Python3.12 is not available to install on your distro: 
      - `sudo add-apt-repository ppa:deadsnakes/ppa`
      - `sudo apt-get update`
    - Install Python3.12 and other important dependencies: (NOTE: This list of dependencies might be out of date,
      if you can correct it, please open a PR)
  ```
  sudo apt install build-essential \
      python3.12 \
      python3.12-dev \
      python3.12-venv \
      libpython3.12-dev \
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
    - `python3.12 -m venv ../muni_venv` (or any other location or name you like)
  - Activate Virtual Environment
    - `source ../muni_venv/bin/activate`
  - Install requirements:
      ```
      cd dev/
      pip install build
      ```
  - Continue installing requirements
      ```
      pip install -e ../
      ```
  - As long as the custom print layouts are still using the mapfish cli, we need to copy the icons to the mapfish config dir:
      ```
      mkdir -p configs/mapfish/icons/
      cp -r ../munimap/frontend/img/icons/* configs/mapfish/icons/
      ```

## Update translations (optional)
  - Install locales. Run the command and then use the arrow key to search for "de_DE.UTF-8 UTF-8" and "de_DE ISO 8859-1" and select with the space bar. Tab to OK and confirm with Enter. Select "de_DE.UTF-8" as standard.
    ```
    sudo dpkg-reconfigure locales
    ```
  - Update translations (in project root, i.e., bielefeldGEOCLIENT):
    ```
    pybabel extract -F ./munimap/babel.cfg -k lazy_gettext -k _l -o ./munimap/translations/messages.pot ./munimap
    # update catalog
    pybabel update -i ./munimap/translations/messages.pot -d ./munimap/translations
    # Manually add / update missing translations here and compile catalog afterwards
    pybabel compile -d ./munimap/translations
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
    ```
- `FLASK_APP="munimap.application:create_app()" FLASK_RUN_HOST=0.0.0.0 FLASK_RUN_PORT=5000 flask run`

With different config and JAVA_HOME (for mapfish cli) set:
- `FLASK_MUNIMAP_CONFIG=dev/configs/munimap.conf FLASK_APP="munimap.application:create_app()" JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/ FLASK_RUN_HOST=0.0.0.0 FLASK_RUN_PORT=5000 flask run --debug`
- `FLASK_MUNIMAP_CONFIG=../munimap-conf/munimap-app/configs/munimap-local-dev.conf FLASK_APP="munimap.application:create_app()" JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/ FLASK_RUN_HOST=0.0.0.0 FLASK_RUN_PORT=5000 flask run --debug`

## Compile the frontend
and finally the client (javascript) source can be watched via(ran in the root folder, i.e, bielefeldGEOCLIENT):
```bash
nvm use
npm ci
npm start
``` 

## Access the application

The application should now be available via [http://localhost:5000/](http://localhost:5000/) (Proxied to [http://localhost/](http://localhost/)).

The docs are available via [http://localhost:8082/](http://localhost:8082/) (Proxied to [http://localhost:4000](http://localhost:4000))

Start print queue/broker (make sure to adjust the path to printqueue.sqlite according to `PRINT_QUEUEFILE`):
- `JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/ python -m munimap.queue.worker -q /tmp/printqueue.sqlite -l dev/configs/logging.yaml`

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


## Working with the docker container

```bash
docker compose -f docker/docker-compose.yaml build munimap-app
```

Running the whole environment in docker (Current code changes might not be reflected).

```bash
docker compose -f docker/docker-compose.yaml --profile prod up
```

## Debugging the application

### With VSCODE
A debug configuration is provided and can be found in `.vscode/launch.json`.
If you are using a custom config file for your application, you have to change it's path in `FLASK_MUNIMAP_CONFIG`.
Then all you need to do is start debugging with vscode

### With PyCharm
TODO

### Coding advice / best practices
* ES6 imports are hoisted and execute before other code, which breaks Angular 1.x module registration that depends on sequential execution. Therefore please use
  - `require` for local modules and sub-modules
  - `import` for external libraries
  e.g. 
  ```javascript
  import 'bootstrap3/js/popover.js';
  import 'angular-schema-form-bootstrap';
  import 'anol/src/anol/anol.js';
  require('./base-config.js');
  require('./draw-popup-controller.js');
  require('./modules/colorpicker.js');
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

First of all, you need to install the requirements defined on `requirements-docs.txt`. To do so, run `pip install -r requirements-docs.txt`. Make sure you are on your virtual environment, altough not mandatory.

A source is already provided and can be found in `munimap-docs` folder (`../docker/munimap-docs/` if you are currently on `dev/`).  

If you make any changes and need to build it for publishing, simply run `sphinx-build`, providing the source folder and an output folder for the built version.

There is no need to create a new source, but if for some reason you need it, you can do so by simply running `sphinx-quickstart` and answer the questions. Alternatively you can also run `sphinx-autogenerate` by providing a source file so it can autogenerate the `rst` files.

You can also generate API docs by running `sphinx-apidocs`.

Check the Sphinx documentation for further information.

**NOTE**: A docker container for the docs is provided. By making changes to the source, a new documentation is automatically compiled from the source. However, you can always execute the container interactively and do your changes there directly or run the already mentioned commands.
