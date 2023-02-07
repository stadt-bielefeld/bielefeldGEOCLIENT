import os
import subprocess
import platform

from flask import current_app

from munimap.export import mapfish
from munimap.print_requests import PrintRequest
from munimap.test.base import BaseTestWithTestDB

from nose.plugins.attrib import attr

tmp_dir = '/tmp/munimap-mapfish-prints'

def setUp():
    try:
        os.makedirs(tmp_dir)
        print(os.path.exists(tmp_dir))
    except:
        pass


def tearDown():
    open_cmd = 'open'
    if platform.system().lower() == 'linux':
        open_cmd = 'xdg-open'
    if any(f for f in os.listdir(tmp_dir) if not f.startswith('.')):
        subprocess.check_call([open_cmd, tmp_dir])


class TestMapfishLayouts(BaseTestWithTestDB):
    params = dict(
        bbox=[912139, 7007303.5, 917389, 7014728.5],
        scale=2500,
        layers=['omniscale', 'omniscale_gray', 'busstop'],
        outputFormat='png',
        dpi=100,
        srs=3857,
        pageLayout='a4_portrait',
        pageSize=[210, 297],
        mimetype='application/pdf',
        name='example.png'
    )

    def landscape_ayouts_cases(self):
        image_formats = ['png', 'pdf']
        for image_format in image_formats:
            yield 'a4_landscape', [297, 210], image_format
            yield 'a3_landscape', [297, 420], image_format
            yield 'a2_landscape', [420, 594], image_format
            yield 'a1_landscape', [594, 841], image_format
            yield 'a0_landscape', [841, 1189], image_format

    @attr('print')
    def test_landscape_layouts(self):
        for case in self.landscape_ayouts_cases():
            self.check(*case)

    def portrait_layouts_cases(self):
        image_formats = ['png', 'pdf']
        for image_format in image_formats:
            yield 'a4_portrait', [210, 297], image_format
            yield 'a3_portrait', [420, 297], image_format
            yield 'a2_portrait', [594, 420], image_format
            yield 'a1_portrait', [841, 594], image_format
            yield 'a0_portrait', [1189, 841], image_format

    @attr('print')
    def test_portrait_layouts(self):
        for case in self.portrait_layouts_cases():
            self.check(*case)

    def custom_layout_cases(self):
        image_formats = ['png', 'pdf']
        for image_format in image_formats:
            yield 'custom', [150, 150], image_format
            yield 'custom', [250, 500], image_format
            yield 'custom', [500, 250], image_format
            yield 'custom', [234, 345], image_format
            yield 'custom', [1150, 1050], image_format

    @attr('print')
    def test_custom_layouts(self):
        for case in self.custom_layout_cases():
            self.check_custom(*case)

    def check(self, page_layout, page_size, print_format):
        self.params['page_size'] = page_size
        self.params['page_layout'] = page_layout
        self.params['outputFormat'] = print_format

        if print_format == 'png':
            self.params['mimetype'] = 'image/png'

        if print_format == 'pdf':
            self.params['mimetype'] = 'application/pdf'

        self.params['name'] = 'munimap_%s_%s.%s' % (
            page_layout,
            self.params['dpi'],
            self.params['outputFormat'],
        )

        print_request = PrintRequest.from_json(self.params)
        spec_file = mapfish.create_spec_json(print_request)

        output_file = os.path.abspath(
            os.path.join(tmp_dir, print_request.name)
        )

        job = mapfish.mapfish_printqueue_task(
            spec_file=spec_file,
            config_file=current_app.config.get('MAPFISH_YAML'),
            output_file=output_file,
            index_url=None,
        )
        result = mapfish.mapfish_printqueue_worker(job)
        assert 'output_file' in result

    def check_custom(self, page_layout, page_size, print_format):
        self.params['page_size'] = page_size
        self.params['page_layout'] = page_layout
        self.params['outputFormat'] = print_format

        if print_format == 'png':
            self.params['mimetype'] = 'image/png'

        if print_format == 'pdf':
            self.params['mimetype'] = 'application/pdf'

        self.params['name'] = 'munimap_%s_%sx%s_%s.%s' % (
            page_layout,
            self.params['page_size'][0],
            self.params['page_size'][1],
            self.params['dpi'],
            self.params['outputFormat'],
        )

        print_request = PrintRequest.from_json(self.params)

        base_path = os.path.dirname(current_app.config.get('MAPFISH_YAML'))
        report_file = mapfish.create_jasper_report(
            print_request,
            base_path)
        config_file = mapfish.create_mapfish_yaml(
            print_request,
            base_path,
            report_file)
        is_custom = True

        spec_file = mapfish.create_spec_json(print_request)

        output_file = os.path.abspath(
            os.path.join(tmp_dir, print_request.name)
        )

        job = mapfish.mapfish_printqueue_task(
            spec_file=spec_file,
            config_file=config_file,
            output_file=output_file,
            index_url=None,
            report_file=report_file,
            is_custom=is_custom,
        )
        result = mapfish.mapfish_printqueue_worker(job)
        assert os.path.isfile(config_file) is False
        assert os.path.isfile(report_file) is False
        assert 'output_file' in result
