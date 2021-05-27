help:
	@echo 'all'
	@echo 'test      - run all tests, except mapfish-print tests'
	@echo 'test-all  - run all tests, skip most mapfish-print tests'
	@echo 'test-full - run everything'
	@echo 'update-anol' - update anol from the repository to munimap

all: test-all

test:
	nosetests

test-all:
	nosetests -a 'print,!print-full'

test-full:
	nosetests -a 'print-full'


GRUNT_BIN=./node_modules/grunt-cli/bin/grunt

update-anol-full:
	(cd dev/anol; npm install)
	(cd dev/anol; $(GRUNT_BIN) build-dev --force)
	mkdir -p munimap/static/libs/anol
	cp -rp dev/anol/build/* munimap/static/libs/anol
	cp -p dev/anol/build/img/* munimap/static/img/
	cp -p dev/anol/build/fonts/* munimap/static/fonts/

update-anol:
	(cd dev/anol; npm install)
	(cd dev/anol; $(GRUNT_BIN) build-anol-dev --force)
	mkdir -p munimap/static/libs/anol
	cp -rp dev/anol/build/* munimap/static/libs/anol
	cp -p dev/anol/build/img/* munimap/static/img/
	cp -p dev/anol/build/fonts/* munimap/static/fonts/
