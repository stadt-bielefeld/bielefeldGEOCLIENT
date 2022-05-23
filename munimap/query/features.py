# -:- encoding: UTF-8 -:-
import locale

def sort_features(features, group_property='type', sort_properties=('name',), groups=None):
    """
    Sort list of features (with properties) by a single group property and multiple sort properties.
    Features are sorted by the group first, then the additional properties. Sorts features
    alphanumerical, except for group properties which are sorted by the order of the groups list.

    Sorts features in-place.

    :param groups: List of group values. Defines the sort order of the group property.

    >>> fc = [
    ...     {'properties': {'type': 'a', 'name': 'aaa'}},
    ...     {'properties': {'type': 'b', 'name': 'aaa'}},
    ...     {'properties': {'type': 'c', 'name': 'bbb'}},
    ...     {'properties': {'type': 'c', 'name': 'aaa'}},
    ... ]
    >>> sort_features(fc, groups=['c', 'a', 'b'])
    >>> fc  # doctest: +NORMALIZE_WHITESPACE
    [{'properties': {'type': 'c', 'name': 'aaa'}},
     {'properties': {'type': 'c', 'name': 'bbb'}},
     {'properties': {'type': 'a', 'name': 'aaa'}},
     {'properties': {'type': 'b', 'name': 'aaa'}}]
    """
    group_index = None
    if groups:
        group_index = {g: i for (i, g) in enumerate(groups)}

    def key(feature):
        k = []
        group = feature['properties'].get(group_property)
        if group_index:
            k.append(group_index.get(group, 1e99))
        else:
            k.append(group)

        locale_encoding = locale.getlocale(locale.LC_COLLATE)[1] or 'UTF-8'
        for p in sort_properties:
            v = feature['properties'].get(p)
            if v and isinstance(v, str):
                # get localized sort order by calling strxfrm
                # strxfrm expects encoded strings
                # split at whitespace as strxfrm can ignore it (depending on the collate)
                v = v.lower()
                v = v.replace('ä', 'ae')
                v = v.replace('ö', 'oe')
                v = v.replace('ü', 'ue')
                v = v.replace('ß', 'ss')
                v = tuple(locale.strxfrm(p) for p in
                    v.encode(locale_encoding, errors='replace').split(' '))
            k.append(v)

        return tuple(k)

    features.sort(key=key)
