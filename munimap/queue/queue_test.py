import os
import shutil
import tempfile

from .queue import SqliteQueue, Job

from nose.tools import eq_

class TestQueue(object):

    def setup(self):
        self.testdir = tempfile.mkdtemp()
        self.testfile = os.path.join(self.testdir, "queue.sqlite")

    def teardown(self):
        shutil.rmtree(self.testdir, ignore_errors=True)

    def test_queue(self):
        q = SqliteQueue(self.testfile)

        q.append(id='1', definition=1)
        q.append(id='2', definition=2)
        q.append(id='3', definition=3)

        eq_(q.peek(), Job(1, id='1', priority=0, status='added'))
        eq_(q.fetch(), Job(1, id='1', priority=0, status='inprocess'))
        eq_(q.fetch(), Job(2, id='2', priority=0, status='inprocess'))
        q.append(5, priority=10, id=5)
        eq_(q.peek(min_priority=11), None)
        eq_(q.peek(min_priority=10), Job(5, id='5', priority=10, status='added'))
        eq_(q.peek(), Job(5, id='5', priority=10, status='added'))
        eq_(q.fetch(), Job(5, id='5', priority=10, status='inprocess'))
        eq_(q.peek(min_priority=10), None)

        eq_(q.peek(min_priority=0), Job(3, id='3', priority=0, status='added'))
        eq_(q.fetch(), Job(3, id='3', priority=0, status='inprocess'))

    def test_get(self):
        q = SqliteQueue(self.testfile)
        eq_(q.get("missing"), None)

        id = q.append({'foo': 42})
        eq_(q.get(id), Job({'foo': 42}, id=id, status='added'))
        eq_(q.fetch(), Job({'foo': 42}, id=id, status='inprocess'))
        eq_(q.get(id), Job({'foo': 42}, id=id, status='inprocess'))

        q.mark_done(id, 'done')
        eq_(q.get(id), Job({'foo': 42}, id=id, result='done', status='finished'))


