# -:- encoding: utf8 -:-

import itertools

def index_group_key(name):
    """
    Return key for group_by. A-Z for alpha including Umlauts,
    0 for numbers and * for other.
    """
    if not name:
        return '*'
    key = name[0]
    key = key.upper()
    if key.isnumeric():
        return '0'
    for char, replacement in [(u'Ä', 'A'), (u'Ü', 'U'), (u'Ö', 'O')]:
        if key == char:
            return replacement
    if key.isalpha():
        return key
    return '*'


def features_to_index_data(fc, layers):
    """
    Convert feature collection to dict for index PDF.

    Features are grouped by __layer__ property.
    Only features with __name__ and __ref__ property are added.
    Collects layer/topic titles from layers.
    """
    topics = []
    for layer, fs in itertools.groupby(fc['features'], lambda f: f['properties']['__layer__']):
        # TODO Mapfish-Digitize: add Digitize Layers too
        if layer not in layers:
            continue
        title = layers[layer]['title']
        groups = []

        fs = [f for f in fs if f['properties'].get('name') and f['properties'].get('__ref__')]

        if len(fs) > 60:
            grouped = itertools.groupby(fs, key=lambda f: index_group_key(f['properties'].get('name')))
        else:
            grouped = [(None, fs)]

        for key, group in grouped:
            topic = []
            for f in group:
                name = f['properties']['name']
                if '__num__' in f['properties']:
                    # prefix name with __num__
                    name = str(f['properties']['__num__']) + ' ' + name
                topic.append({'name': name, 'ref': f['properties']['__ref__']})

            if topic:
                if key:
                    groups.append({'entries': topic, 'title': key})
                else:
                    groups.append({'entries': topic})

        if groups:
            topics.append({'title': title, 'groups': groups})

    title = 'Index'
    if len(topics) == 1:
        title = topics[0]['title']
        del topics[0]['title']
    return {
        'title': title,
        'topics': topics,
    }


