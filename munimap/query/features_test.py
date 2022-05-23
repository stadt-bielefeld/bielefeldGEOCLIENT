# -:- encoding: UTF8 -:-
from .features import sort_features

from nose.tools import eq_

import random

import sys
import locale
if sys.platform == 'darwin':
    # use LATIN1/ISO8859-1 on Mac OS X as UTF8 collate is broken
    locale.setlocale(locale.LC_COLLATE, 'de_DE.ISO8859-1')
else:
    locale.setlocale(locale.LC_COLLATE, 'de_DE.UTF8')

def assert_sorted_features(features, **sort_args):
    """
    Creates a shuffled copy of features, sorts them and compares
    the resulting order with the input order of features.
    """
    for _ in range(10): # tests with a few shuffles
        shuffled = features[:]
        random.shuffle(shuffled)
        sort_features(shuffled, **sort_args)
        eq_(shuffled, features)


def test_sort_features_no_args():
    assert_sorted_features([
        {'properties': {'type': 'a', 'name': 'aaa'}},
        {'properties': {'type': 'b', 'name': 'aaa'}},
        {'properties': {'type': 'c', 'name': 'aaa'}},
        {'properties': {'type': 'c', 'name': 'bbb'}},
    ])


def test_sort_features_groups():
    assert_sorted_features([
        {'properties': {'group': 'c', 'name': 'aaa'}},
        {'properties': {'group': 'c', 'name': 'bbb'}},
        {'properties': {'group': 'a', 'name': 'aaa'}},
        {'properties': {'group': 'b', 'name': 'aaa'}}, # undefined group at the end
    ], groups=['c', 'a'], group_property='group')


def test_sort_features_properties():
    assert_sorted_features([
        {'properties': {'group': 'a', 'name': 'aaa'}},
        {'properties': {'group': 'b', 'name': 'aaa'}},
        {'properties': {'group': 'c', 'name': 'aaa'}},
        {'properties': {'group': 'c', 'name': 'aaa', 'id': 2}},
        {'properties': {'group': 'c', 'name': 'aaa', 'id': 10}},
        {'properties': {'group': 'c', 'name': 'bbb'}},
    ], sort_properties=('name', 'group', 'id'))


def test_sort_features_locales():
    assert_sorted_features([
        {'properties': {'name': '22'}},
        {'properties': {'name': 'al'}},
        {'properties': {'name': 'äl'}},
        {'properties': {'name': 'am'}},
        {'properties': {'name': 'äm'}},
        {'properties': {'name': 'az'}},
        {'properties': {'name': 'sb'}},
        {'properties': {'name': 'ss ab'}},
        {'properties': {'name': 'ss ac'}},
        {'properties': {'name': 'ssab'}},
        {'properties': {'name': 'ßac'}},
        {'properties': {'name': 'ssacc'}},
        {'properties': {'name': 'ssba'}},
        {'properties': {'name': 'Ssbb'}},
        {'properties': {'name': 'ssbc'}},
        {'properties': {'name': 'tac'}},
    ])
