# bielefeldGEOCLIENT / Munimap

Munimap is an interactive online map with a plenty of abilities. Define theme based layer groups, restrict access to allowed users, export map extracts, digitize features (beta), integration in Form-Solutions formular software for building a citizen service portal and many more.

## Features

* Easy configuration using yaml files

* Highly customizable application

* Create multiple theme based online maps by configuration

* Easy to use layerswitcher with multiple background- and groupable theme layers

* Context-based information by right-clicking the map

* Possibility to serve metadata with every layer

* Customizable feedback function

* Integration of third party applications with optional token based access restrictions

![Munimap](./docs/munimap.png)

* Ability to export map extract into multiple formats using mapfish print v3

* Export map extract with street index and adjustable grid cells

![Munimap](./docs/munimap_print.png)

* Measurement

* Saving map configuration to exchangeable json files

* Powerful administration tools (users, maps, groups, layers, access rights, geoEDITOR plugins and selections lists, logs)

![Munimap](./docs/munimap_admin.png)

* Integration in Form-Solutions formular software for building a citizen service portal with geo functionality

![Munimap](./docs/munimap_geoEDITOR.png)

## Addons

### Munimap Digitize (beta status)

Adds ability to create and publish extra data.

![Munimap](./docs/munimap_digitize.png)

#### Features

* Customize editing surface with Munimap application configuration

* Publish data time-based

### Munimap Transport

Turns Munimap into an interactive journey planner.

#### Features

* Link to your local transport service provider

## Current status

### Missing

## Installation

#### Dependencies

* docker
* docker-compose

## Start

Go to the `docker` directory and build the containers (this may take several minutes):
```
docker-compose --profile prod build
```
After completion you can start the application like this, again from the `docker` directory:
```
docker-compose --profile prod up
```

## Documentation

Will be coming soon.

## Development

To learn how to configure a dev-environment please refer to the [readme for developers](./dev/README.md)

The source code is available at: https://github.com/stadt-bielefeld/bielefeldGEOCLIENT

You can report any issues at: https://github.com/stadt-bielefeld/bielefeldGEOCLIENT/issues
