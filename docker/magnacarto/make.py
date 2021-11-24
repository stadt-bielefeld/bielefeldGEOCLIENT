#!/usr/bin/env python

import os
import yaml
import json
import argparse
from copy import deepcopy
from subprocess import call

def layer_idx(layers, name):
    for i, l in enumerate(layers):
        if l['name'] == name:
            return i
    raise ValueError("layer %s not found" % name)

def main():

    parser = argparse.ArgumentParser()
    parser.add_argument('--style', help='only generate named style')
    parser.add_argument('--styles', default='../styles.yaml')
    parser.add_argument('--mml', default='project.mml')

    args = parser.parse_args()

    with open(args.styles) as f:
        styles = yaml.load(f)

    with open(args.mml) as f:
        base_mml = json.load(f)

    if not os.path.exists('mml'):
        os.mkdir('mml')
    if not os.path.exists('map'):
        os.mkdir('map')

    for style_name, style in styles['styles'].iteritems():
        if args.style and style_name != args.style:
            continue

        magnacarto_opts = style.get('magnacarto')

        if magnacarto_opts.get('tml') is None:
            print 'Missing tml file in config for style %s' % style_name
            continue
        if magnacarto_opts.get('out') is None:
            print 'Missing out dir in config for style %s' % style_name
            continue

        mml = deepcopy(base_mml)
        mml['Stylesheet'] = style['stylesheets']
        exclude = set(style.get('exclude_layers', []))
        if exclude:
            for l in mml['Layer']:
                if l['name'] in exclude:
                    l['status'] = 'off'

        mml['Layer'] = [l for l in mml['Layer'] if l.get('status') != 'off']

        if 'mml_overwrite' in style:
            with open(style['mml_overwrite']) as f:
                overwrite = json.load(f)
                for l in overwrite['Layer']:
                    for i, l2 in enumerate(mml['Layer']):
                        if l['name'] == l2['name']:
                            mml['Layer'][i] = l
                            continue

        if 'layer_sort' in style:
            for before, after in style['layer_sort']:
                bidx = layer_idx(mml['Layer'], before)
                aidx = layer_idx(mml['Layer'], after)
                if bidx > aidx:
                    b = mml['Layer'].pop(bidx)
                    mml['Layer'].insert(aidx, b)

        mml_file = os.path.join('mml', style_name + '.mml')
        with open(mml_file, 'w') as f:
            json.dump(mml, f, indent=2, sort_keys=True)

        magnacarto_opts = style.get('magnacarto')
        call_opts = [
            'magnacarto',
            '-config', magnacarto_opts.get('tml'),
            '-mml', mml_file,
            '-out', magnacarto_opts.get('out'),
        ]
        for param in magnacarto_opts.get('additional_params', []):
            call_opts += param.split(' ')
        print ' '.join(call_opts)
        call(call_opts)

if __name__ == "__main__":
    main()
