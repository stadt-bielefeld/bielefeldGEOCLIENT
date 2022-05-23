__all__ = ['reduce_refs', 'group_refs']

def format_refs(refs, labels=None):
    if len(refs) == 1:
        return refstr(*refs[0], labels=labels)
    else:
        return refstr(*refs[0], labels=labels) + '-' + refstr(*refs[1], labels=labels)

DEFAULT_LABELS = (
    'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z'.split(),
    list(map(str, list(range(1, 27)))),
)

def refstr(x, y=None, labels=None):
    """
    >>> refstr(1)
    'A'
    >>> refstr(1, labels=['Z', 'X'])
    'Z'
    >>> refstr(26, 19)
    'Z19'
    """
    if y is not None:
        if labels is None:
            labels = DEFAULT_LABELS
        return refstr(x, labels=labels[0]) + refstr(y, labels=labels[1])
    else:
        if labels is None:
            labels = DEFAULT_LABELS[0]
        return labels[x-1]

def group_refs(refs):
    """
    Group all adjecent x/y references.

    >>> group_refs([(0, 0), (0, 2)])
    [[(0, 0)], [(0, 2)]]

    >>> group_refs([(0, 0), (0, 2), (0, 1)])
    [[(0, 0), (0, 1), (0, 2)]]

    """
    if not refs:
        return []

    grouped = [[refs[0]]]

    for ref in refs[1:]:
        added_to = None
        for group in grouped:
            for group_member in group[:]:
                if is_adjacent(ref, group_member):
                    if not added_to:
                        group.append(ref)
                        added_to = group
                        continue
                    else:
                        # add this group to the first matched group
                        added_to.extend(group)
                        group[:] = []
                        continue
        if not added_to:
            grouped.append([ref])

    # drop empty groups
    grouped = [g for g in grouped if g]

    return grouped

def minmax(vals):
    min_ = vals[0]
    max_ = vals[0]

    for v in vals[1:]:
        min_ = min(min_, v)
        max_ = max(max_, v)
    return min_, max_

def reduce_refs(refs):
    """
    Return extend of x/y references as "min" and "max" refs.

    Min/max refs are always a ref from `refs`. That means the "min"
    can also be in the upper/left corner if the refs stretch downwards
    to the right.

    See tests.
    """
    if len(refs) == 1:
        return [refs[0]]

    minx = refs[0][0]
    maxx = refs[0][0]
    maxxrefs = [refs[0]]
    minxrefs = [refs[0]]

    miny = refs[0][1]
    maxy = refs[0][1]
    maxyrefs = [refs[0]]
    minyrefs = [refs[0]]

    # collect all refs of the four boundaries (left->minx, etc.)
    for ref in refs[1:]:
        if ref[0] < minx:
            minx = ref[0]
            minxrefs = [ref]
        elif ref[0] == minx:
            minxrefs.append(ref)

        if ref[0] > maxx:
            maxx = ref[0]
            maxxrefs = [ref]
        elif ref[0] == maxx:
            maxxrefs.append(ref)

        if ref[1] < miny:
            miny = ref[1]
            minyrefs = [ref]
        elif ref[1] == miny:
            minyrefs.append(ref)

        if ref[1] > maxy:
            maxy = ref[1]
            maxyrefs = [ref]
        elif ref[1] == maxy:
            maxyrefs.append(ref)


    if (maxx-minx) >= (maxy-miny):
        # refs stretch horizontal
        minx_ymin, minx_ymax = minmax([r[1] for r in minxrefs])
        maxx_ymin, maxx_ymax = minmax([r[1] for r in maxxrefs])
        if minx_ymax >= maxx_ymax and minx_ymin > maxx_ymin:
            return [(minx, minx_ymax), (maxx, maxx_ymin)]
        else:
            return [(minx, minx_ymin), (maxx, maxx_ymax)]
    else:
        miny_xmin, miny_xmax = minmax([r[0] for r in minyrefs])
        maxy_xmin, maxy_xmax = minmax([r[0] for r in maxyrefs])
        if miny_xmax >= maxy_xmax and miny_xmin > maxy_xmin:
            return [(miny_xmax, miny), (maxy_xmin, maxy)]
        else:
            return [(miny_xmin, miny), (maxy_xmax, maxy)]


    if minx == maxx and miny == maxy:
        return [(minx, miny)]
    else:
        return [(minx, miny), (maxx, maxy)]

def is_adjacent(xxx_todo_changeme, xxx_todo_changeme1):
    (ax, ay) = xxx_todo_changeme
    (bx, by) = xxx_todo_changeme1
    if (bx+1 >= ax >= bx-1 and
        by+1 >= ay >= by-1 and
        not abs(ax-bx)+abs(ay-by) == 2):
            return True
    return False
