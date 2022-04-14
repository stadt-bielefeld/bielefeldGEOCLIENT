import traceback
import time
import os
import uuid
import sqlite3
import threading

from json import loads, dumps
from time import sleep
try:
    from thread import get_ident
except ImportError:
    from dummy_thread import get_ident

import logging
log = logging.getLogger('munimap.print')


class SqliteQueue(object):

    _create = ("""
        CREATE TABLE IF NOT EXISTS jobs
        (
          id TEXT,
          priority INTEGER,
          added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          definition BLOB,
          result BLOB,
          status TEXT DEFAULT 'added'
        )
    """)
    _count = """SELECT COUNT(*) FROM jobs WHERE status = 'added'"""
    _append = 'INSERT INTO jobs (id, priority, definition, status) VALUES (?, ?, ?, ?)'
    _write_lock = 'BEGIN IMMEDIATE'
    _fetch_get = ("""
        SELECT id, priority, definition FROM jobs
        WHERE status = 'added' AND priority >= ?
        ORDER BY priority DESC, added LIMIT 1
    """)
    _inprocess = """UPDATE jobs SET status = 'inprocess' WHERE id = ?"""
    _peek = ("""
        SELECT id, priority, definition FROM jobs
        WHERE status = 'added' AND priority >= ?
        ORDER BY priority DESC, added LIMIT 1
    """)
    _done = """UPDATE jobs SET status = 'finished', result = ? WHERE id = ?"""
    _get = """SELECT priority, definition, result, status FROM jobs WHERE id = ?"""
    _cleanup = """DELETE FROM jobs WHERE added < datetime('now', ?)"""
    _iterate = """SELECT id, priority, definition, result, status FROM jobs ORDER BY priority DESC, added"""

    def __init__(self, path, cleanup_max_minutes=60*24):
        self.path = os.path.abspath(path)
        self._connection_cache = {}
        with self._get_conn() as conn:
            conn.execute(self._create)
            conn.execute(self._cleanup, ('-%d minute' % cleanup_max_minutes, ))

    def __len__(self):
        with self._get_conn() as conn:
            l = conn.execute(self._count).next()[0]
        return l

    def __iter__(self):
        with self._get_conn() as conn:
            for id, priority, obj_buffer, result, status in conn.execute(self._iterate):
                j = Job(
                    id=id,
                    definition=loads(str(obj_buffer)),
                    status=status,
                    priority=priority,
                )
                j.result = loads(str(result or 'null'))
                yield j

    def _get_conn(self):
        id = get_ident()
        if id not in self._connection_cache:
            self._connection_cache[id] = sqlite3.Connection(
                self.path,
                timeout=60,
            )
        return self._connection_cache[id]

    def append(self, definition, priority=0, id=None, finished=False):
        if id is None:
            id = uuid.uuid4().hex
        obj_buffer = buffer(dumps(definition))
        status = 'added'
        if finished:
            status = 'finished'
        with self._get_conn() as conn:
            conn.execute(self._append, (id, priority, obj_buffer, status))
        return id

    def fetch(self, sleep_wait=True, min_priority=0):
        keep_pooling = True
        wait = 0.1
        max_wait = 2
        tries = 0
        with self._get_conn() as conn:
            id = None
            while keep_pooling:
                conn.execute(self._write_lock)
                cursor = conn.execute(self._fetch_get, (min_priority,))
                try:
                    id, priority, obj_buffer = cursor.next()
                    keep_pooling = False
                except StopIteration:
                    conn.commit()  # unlock the database
                    if not sleep_wait:
                        keep_pooling = False
                        continue
                    tries += 1
                    sleep(wait)
                    wait = min(max_wait, tries / 10 + wait)
            if id:
                conn.execute(self._inprocess, (id,))
                return Job(
                    id=id,
                    definition=loads(str(obj_buffer)),
                    priority=priority,
                    status='inprocess',
                )
        return None

    def peek(self, min_priority=0):
        with self._get_conn() as conn:
            cursor = conn.execute(self._peek, (min_priority, ))
            try:
                id, priority, obj_buffer = cursor.next()
                return Job(
                    id=id,
                    definition=loads(str(obj_buffer)),
                    priority=priority,
                    status='added',
                )
            except StopIteration:
                return None

    def get(self, id):
        with self._get_conn() as conn:
            cursor = conn.execute(self._get, (id,))
            try:
                priority, obj_buffer, result, status = cursor.next()
                j = Job(
                    id=id,
                    definition=loads(str(obj_buffer)),
                    status=status,
                    priority=priority,
                )
                j.result = loads(str(result or 'null'))
                return j
            except StopIteration:
                return None

    def mark_done(self, id, result):
        obj_buffer = buffer(dumps(result))

        with self._get_conn() as conn:
            conn.execute(self._done, (obj_buffer, id))


class Job(object):

    def __init__(self, definition, id=None, result=None, priority=0, status='unknown'):
        self.definition = definition
        self.id = id
        self.result = result
        self.status = status
        self.priority = priority

    def __repr__(self):
        return '<Job id=%s definition=%s result=%s status=%s>' % (
            self.id, self.definition, self.result, self.status)

    def __eq__(self, other):
        if not isinstance(other, Job):
            return NotImplemented
        return (
            self.id == other.id and
            self.status == other.status and
            self.definition == other.definition and
            self.result == other.result and
            self.priority == other.priority
        )


class Broker(object):

    def __init__(self, queue, worker_func, max_running=2):
        self.queue = queue
        self.max_running = max_running
        self.workers = []
        self.worker_func = worker_func

    def run(self):
        while True:
            if len(self.workers) >= self.max_running:
                self.wait_workers()

            log.debug("broker: waiting for next job")
            job = self.queue.fetch()
            log.debug("broker: dispatching %s", job)
            self.start_worker(job)

    def start_worker(self, job):
        def worker():
            try:
                result = self.worker_func(job.definition)
            except Exception as ex:
                result = {
                    'error': 'unable to process job %s' % job,
                    'traceback': traceback.format_exc(ex),
                }
            self.queue.mark_done(job.id, result=result)
            if log.isEnabledFor(logging.DEBUG):
                try:
                    # query again to get result and final status
                    j = self.queue.get(job.id)
                    if j.result.get('error'):
                        full_error = None
                        if 'full_error' in j.result:
                            full_error = j.result['full_error']
                            j.result['full_error'] = '...'
                        log.error('"%s" for %s. full error:\n%s', j.result['error'], j, full_error)
                    log.debug("broker: processed %s", j)
                except Exception as ex:
                    log.error("error while logging process: %s", ex)

        t = threading.Thread(target=worker)
        t.daemon = True
        t.start()
        self.workers.append(t)

    def wait_workers(self):
        while True:
            log.debug("broker: %d of %d workers running, waiting", len(
                self.workers), self.max_running)
            pending = self.workers
            self.workers = []
            for t in pending:
                if t.is_alive():
                    self.workers.append(t)
                else:
                    t.join()

            if len(self.workers) < self.max_running:
                return

            time.sleep(0.1)

if __name__ == '__main__':
    import sys
    import optparse

    parser = optparse.OptionParser()
    parser.add_option('-c', '--concurrency', type=int, default=2)
    parser.add_option('-q', '--queue-file', help='queue storage', default='/tmp/printqueue.sqlite')
    parser.add_option('--add-job', help='add job and exit')
    parser.add_option('--get-job', help='query job and exit')
    parser.add_option('--list-jobs', default=False, action='store_true', help='list all jobs and exit')
    options, args = parser.parse_args()


    logging.basicConfig(level=logging.DEBUG)

    def echo(job):
        return job

    q = SqliteQueue(options.queue_file)

    if options.add_job:
        print q.append(loads(options.add_job))
        sys.exit(0)

    if options.get_job:
        print q.get(options.get_job)
        sys.exit(0)

    if options.list_jobs:
        for j in q:
            print j
        sys.exit(0)

    b = Broker(q, echo, max_running=options.concurrency)
    b.run()
