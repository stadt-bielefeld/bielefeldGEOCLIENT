import os
import shutil
import tempfile
import threading
import time

from .queue import SqliteQueue, Broker

class TestBroker(object):

    def setup(self):
        self.testdir = tempfile.mkdtemp()
        self.testfile = os.path.join(self.testdir, "queue.sqlite")

    def teardown(self):
        shutil.rmtree(self.testdir, ignore_errors=True)

    def test_broker(self):
        q = SqliteQueue(self.testfile)

        def worker(definition):
            return "done"
        b = Broker(q, worker, max_running=2)
        t = threading.Thread(target=b.run)
        t.daemon = True
        t.start()

        ids = [q.append({"job": i}) for i in range(10)]

        while not all(q.get(id).status == 'finished' for id in ids):
            time.sleep(0.05)

    def test_worker_exception(self):
        q = SqliteQueue(self.testfile)

        def worker(definition):
            return 1/0

        b = Broker(q, worker)
        t = threading.Thread(target=b.run)
        t.daemon = True
        t.start()

        id = q.append({"job": 1})
        while q.get(id).status != 'finished':
            time.sleep(0.05)

        err = q.get(id).result
        assert err['error'].startswith("unable to process job "), err
        assert 'ZeroDivisionError' in err['traceback'], err

