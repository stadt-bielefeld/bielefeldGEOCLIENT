# bielefeldGEOCLIENT / Munimap

Munimap is an interactive online map with a plenty of abilities. Define theme based layer groups, restrict access to allowed users, export map extracts, digitize features (beta), integration in Form-Solutions formular software for building a citizen service portal and many more.

> **bielefeldGEOCLIENT presentation on FOSSGIS 2022! https://pretalx.com/fossgis2022/talk/8EYN7H/**

## Features

* Easy configuration using yaml files

* Highly customizable application

* Create multiple theme based online maps by configuration

* Easy to use layerswitcher with multiple background- and groupable theme layers

* Context-based information by right-clicking the map

* Possibility to serve metadata with every layer

* Customizable feedback function

* Integration of third party applications with optional token based access restrictions

![Munimap](./screenshots/munimap.png)

* Ability to export map extract into multiple formats using mapfish print v3

* Export map extract with street index and adjustable grid cells

![Munimap](./screenshots/munimap_print.png)

* Measurement

* Saving map configuration to exchangeable json files

* Powerful administration tools (users, maps, groups, layers, access rights, geoEDITOR plugins and selections lists, logs)

![Munimap](./screenshots/munimap_admin.png)

* Integration in Form-Solutions formular software for building a citizen service portal with geo functionality

![Munimap](./screenshots/munimap_geoEDITOR.png)

## Addons

### Munimap Digitize (beta status)

Adds ability to create and publish extra data.

![Munimap](./screenshots/munimap_digitize.png)

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

You need

* Postgresql >= 9.4
* PostGIS >= 2.1
* Mapfish Print >= 3.3
* Python = 2.6
* Virtualenv >= 4.3

### Munimap

See dev/README for install instructions for munimap, munimap_digitize and munimap_transport

## Start

See dev/README for starting instructions

## Documentation

Documentation can be found on
https://stadt-bielefeld.github.io/bielefeldGEOCLIENT

## Development

The source code is available at: https://github.com/stadt-bielefeld/bielefeldGEOCLIENT

You can report any issues at: https://github.com/stadt-bielefeld/bielefeldGEOCLIENT/issues
