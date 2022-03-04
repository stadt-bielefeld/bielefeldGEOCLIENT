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

* Prepare mapfish

```
cd ../dev/
wget -q -O- https://repo1.maven.org/maven2/org/mapfish/print/print-cli/3.9.0/print-cli-3.9.0-tar.tar | tar -x -C ./mapfish
``` 

* Clone anol

```
cd ../../
git clone git@github.com:terrestris/anol.git
```

* Install (and watch) the bielefeldGEOCLIENT frontend

```
cd ../bielefeldGEOCLIENT/
npm i
npm start
```

* Install (and start) the munimap backend

```
cd dev/
virtualenv -p python2.7 muni_venv
source muni_venv/bin/activate
# Or: source muni_venv/bin/activate.fish
# Or: source muni_venv/bin/activate.csh
pip install -r requirements.txt
pip install -e ../
pip install --no-index -e ../munimap_digitize/
pip install --no-index -e ../munimap_transport/
python -c "import hyphen.dictools; hyphen.dictools.install('de')"
```

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
docker-compose up --profile dev 
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