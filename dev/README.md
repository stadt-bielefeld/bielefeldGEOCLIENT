# MuniMap Repository

## Requirements

* git
* wget
* docker
* docker-compose
* Node (>= 10)
* Python (2.7)
* Java 8
* virtualenv
* Required packages for building pip requirements
```
sudo apt install libspatialindex-dev libjpeg-dev zlib1g-dev python2.7-dev build-essential libssl-dev libffi-dev
```

## Initial development setup

The following steps are required once:

* Startup the postgres docker container (from the root directory of the repository):

```
cd docker/
docker-compose up
```

* Get and import the OSM data

```
cd docker/imposm/imposm_data/

# This is just an example file
wget http://download.geofabrik.de/europe/germany/nordrhein-westfalen/detmold-regbez-latest.osm.pbf

cd ../../

docker-compose -f docker-compose-imposm.yaml up --abort-on-container-exit
```

* Create a mapbender like database called `mapbender`

* Create an admin user

* Prepare mapfish

```
cd ../dev/
mkdir mapfish
wget https://oss.sonatype.org/content/repositories/snapshots/org/mapfish/print/print-cli/3.3-SNAPSHOT/print-cli-3.3-SNAPSHOT-tar.tar -c -P ./mapfish
cd mapfish
tar -xvf print-cli-3.3-SNAPSHOT-tar.tar
``` 

* Clone and start anol in watch mode

```
cd ../../
git clone git@github.com:terrestris/anol.git
cd anol
npm i
npm start
```

Use `npm run build` to build it just once

* Install (and watch) the munimap frontend

```
cd ../bielefeldGEOCLIENT/
npm i
# npm start
```

* Install (and start) the munimap backend

```
cd dev/
virtualenv -p python2.7 bielefeldGEOCLIENT
source bielefeldGEOCLIENT/bin/activate
# Or: source bielefeldGEOCLIENT/bin/activate.fish
# Or: source bielefeldGEOCLIENT/bin/activate.csh
pip install -r requirements.txt
pip install -e ../
pip install --no-index -e ../munimap_digitize/
pip install --no-index -e ../munimap_transport/
python -c "import hyphen.dictools; hyphen.dictools.install('de')"

mkdir tmp
touch tmp/munimap.debug.log

python manage.py -c develop.example.conf create_db
# python manage.py -c develop.example.conf runserver
```

* Update translations

```
python manage.py -c develop.example.conf babel_refresh
python manage.py -c develop.example.conf babel_compile
```

* Build Documentation

TODO

## Start the application

After all steps from above have been applied successfully, the application can be started with:

```
cd dev/
python manage.py -c develop.example.conf runserver
```

If you want to use mapfish and have not configured Java 8 as the default Java Version, you need to set the `JAVA_HOME` environment variable. i.e.:
```
JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/ python manage.py -c ../../munimap-conf/conf/munimap/munimap_develop.conf runserver
```

and

```
cd bielefeldGEOCLIENT/
npm start
```

The application should now be available via [http://localhost:5000/](http://localhost:5000/).

Start print queue/broker (TODO UNTESTED):

```
python -m munimap.queue.worker -q /tmp/printqueue.sqlite
```

