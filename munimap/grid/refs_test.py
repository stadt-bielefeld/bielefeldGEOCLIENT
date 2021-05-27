from nose.tools import eq_

from .refs import is_adjacent, group_refs, reduce_refs

def test_is_adjecent():
    assert is_adjacent((0, 0), (0, 0))
    assert is_adjacent((0, 0), (-1, 0))
    assert is_adjacent((0, 0), (0, -1))
    assert is_adjacent((0, 0), (1, 0))
    assert is_adjacent((0, 0), (0, 1))
    assert not is_adjacent((0, 0), (1, 1))
    assert not is_adjacent((0, 0), (-1, -1))

    assert is_adjacent((0, 0), (0, 0))
    assert is_adjacent((-1, 0), (0, 0))
    assert is_adjacent((0, -1), (0, 0))
    assert is_adjacent((1, 0), (0, 0))
    assert is_adjacent((0, 1), (0, 0))
    assert not is_adjacent((1, 1), (0, 0))
    assert not is_adjacent((-1, -1), (0, 0))

    assert not is_adjacent((0, 0), (-2, 0))
    assert not is_adjacent((0, 0), (0, -2))
    assert not is_adjacent((0, 0), (2, 0))
    assert not is_adjacent((0, 0), (0, 2))
    assert not is_adjacent((0, 0), (2, 2))
    assert not is_adjacent((0, 0), (-2, -2))

def test_grouped():
    eq_(group_refs([(0, 0), (0, 1)]),
        [[(0, 0), (0, 1)]])

    eq_(group_refs([(0, 0), (0, 2)]),
        [[(0, 0)], [(0, 2)]])

    eq_(group_refs([(0, 0), (0, 2), (0, 1)]),
        [[(0, 0), (0, 1), (0, 2)]])

    eq_(group_refs([(0, 0), (1, 2), (0, 1), (-1, 0), (2, 2)]),
        [[(0, 0), (0, 1), (-1, 0)], [(1, 2), (2, 2)]])


def test_reduce_refs():
    # X
    eq_(reduce_refs([(0, 0)]),
        [(0, 0)])

    # XX
    # left to right
    eq_(reduce_refs([(0, 0), (1, 0)]),
        [(0, 0), (1, 0)])

    # XX
    # left to right
    eq_(reduce_refs([(1, 0), (0, 0)]),
        [(0, 0), (1, 0)])

    # XXX
    #   X
    # left, top to right, low
    eq_(reduce_refs([(0, 1), (1, 1), (2, 1), (2, 0)]),
        [(0, 1), (2, 0)])

    # XXX
    # X
    # left, low to right, top
    eq_(reduce_refs([(0, 1), (1, 1), (2, 1), (0, 0)]),
        [(0, 0), (2, 1)])

    # XXX
    # X X
    # left, low to right, top
    eq_(reduce_refs([(0, 1), (1, 1), (2, 1), (0, 0), (2, 0)]),
        [(0, 0), (2, 1)])

    # XXX
    #   X
    # left, top to right, low
    eq_(reduce_refs([(0, 1), (1, 1), (2, 1), (2, 0)]),
        [(0, 1), (2, 0)])

    # XX
    #  XX
    # left, top to right, low
    eq_(reduce_refs([(0, 1), (1, 1), (1, 0), (2, 0)]),
        [(0, 1), (2, 0)])

    #  XX
    # XX
    # left, low to right, top
    eq_(reduce_refs([(0, 0), (1, 0), (1, 1), (2, 1)]),
        [(0, 0), (2, 1)])

    #  XX
    # XX
    # X
    # left, low to right, top
    eq_(reduce_refs([(0, 0), (0, 1), (1, 1), (1, 2), (2, 2)]),
        [(0, 0), (2, 2)])

    # X
    # XX
    # X
    # left, low to left, top
    eq_(reduce_refs([(0, 0), (0, 1), (1, 1), (0, 2)]),
        [(0, 0), (0, 2)])

    #  X
    # XX
    #  XX
    # left, middle to right, low
    eq_(reduce_refs([(0, 1), (1, 0), (1, 1), (1, 2), (2, 0)]),
        [(0, 1), (2, 0)])

