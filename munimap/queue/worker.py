import logging.config
import yaml
from flask.config import Config

from .queue import SqliteQueue, Broker
from ..export.mapfish import mapfish_printqueue_worker

if __name__ == '__main__':
    import sys
    import optparse

    parser = optparse.OptionParser()
    parser.add_option('-C', '--config-file', help='pyfile with config values')
    parser.add_option('-c', '--concurrency', type=int, default=2)
    parser.add_option('-q', '--queue-file', help='queue storage', default='printqueue.sqlite')
    parser.add_option('-l', '--log-config', default='/opt/etc/munimap/configs/logging.yaml')
    parser.add_option('--get-job', help='query job and exit')
    parser.add_option('--list-jobs', default=False, action='store_true', help='list all jobs and exit')
    options, args = parser.parse_args()

    file_config = Config(root_path='./')

    if options.config_file is not None:
        file_config.from_pyfile(options.config_file)

    if options.log_config is not None:
        with open(options.log_config) as file:
            logging_config = yaml.safe_load(file)
            logging.config.dictConfig(logging_config)

    q = SqliteQueue(file_config.get('PRINT_QUEUEFILE') or options.queue_file)

    if options.get_job:
        print(q.get(options.get_job))
        sys.exit(0)

    if options.list_jobs:
        for j in q:
            print(j)
        sys.exit(0)

    b = Broker(q, mapfish_printqueue_worker, max_running=file_config.get('PRINT_CONCURRENCY') or options.concurrency)
    b.run()
