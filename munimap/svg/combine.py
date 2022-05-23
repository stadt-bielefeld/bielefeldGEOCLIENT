import sys
from xml.etree.ElementTree import iterparse
from xml.sax.saxutils import XMLGenerator

PATH_TAG = '{http://www.w3.org/2000/svg}path'
RECT_TAG = '{http://www.w3.org/2000/svg}rect'
SVG_TAG = '{http://www.w3.org/2000/svg}svg'
SVG_NS = 'http://www.w3.org/2000/svg'


class CombineSVG(object):
    """
    CombineSVG combines multiple SVGa into a single SVG `output` stream.
    Different `layer_name`s are added into a separate SVG layers (`<g>`).
    Empty layers are stripped.

    Note: Only the simplest SVGs with <path> elements are supported (e.g.
    MapServer Cairo SVG output format).
    """

    def __init__(self, output, root_id=None):
        self.first = True
        self.root_id = root_id
        self.open_group = False
        self.last_layer_name = None
        self.out = XMLGenerator(output, 'utf-8')
        self.out.startPrefixMapping(None, SVG_NS)
        self.out.startDocument()

    def add(self, layer_name, r):
        """
        Add an SVG layer with `layer_name` from file object `r`.
        """
        if self.open_group and self.last_layer_name != layer_name:
            self.out.endElement('g')
            self.out.characters("\n")
            self.open_group = False

        for evt, elem in iterparse(r, events=('start', 'end')):
            if evt == 'start' and self.first and elem.tag == SVG_TAG:
                svg_attrib = {(None, k): v for k, v in list(elem.attrib.items())}
                if self.root_id:
                    svg_attrib[(None, 'id')] = self.root_id

                self.out.startElementNS((SVG_NS, 'svg'), 'svg', svg_attrib)
                self.out.characters("\n")
                continue

            if evt == 'end' and self.first and elem.tag == RECT_TAG:
                # only create open group layer has content
                if not self.open_group:
                    self.out.startElement('g', {'id': layer_name})
                    self.out.characters("\n")
                    self.open_group = True
                self.out.startElement('rect', elem.attrib)
                self.out.endElement('rect')
                self.out.characters("\n")

            elif evt == 'end' and elem.tag == PATH_TAG:
                # only create open group layer has content
                if not self.open_group:
                    self.out.startElement('g', {'id': layer_name})
                    self.out.characters("\n")
                    self.open_group = True
                self.out.startElement('path', elem.attrib)
                self.out.endElement('path')
                self.out.characters("\n")

        self.first = False
        self.last_layer_name = layer_name

    def close(self):
        """
        Close all open SVG XML elements.
        """
        if self.open_group:
            self.out.endElement('g')
            self.out.characters("\n")

        self.out.endElementNS((SVG_NS, 'svg'), 'svg')
        self.out.endDocument()


if __name__ == '__main__':
    c = CombineSVG(output=sys.stdout)

    for fname in sys.argv[1:]:
        with open(fname, 'rb') as f:
            c.add(fname, f)

    c.close()
