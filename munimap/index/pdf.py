# -:- encoding: utf8 -:-

from copy import copy

import io
import collections

import hyphen
import hyphen.dictools

from reportlab.pdfgen import canvas
from reportlab.pdfbase.pdfmetrics import stringWidth

from reportlab.platypus import (
    SimpleDocTemplate,
    PageTemplate,
    BaseDocTemplate,
    Paragraph
)
from reportlab.platypus.paragraph import ParaLines
from reportlab.platypus.frames import Frame
from reportlab.platypus.flowables import KeepTogether
from reportlab.platypus.doctemplate import _doNothing, FrameBreak

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm

if 'de' not in hyphen.dictools.list_installed():
    hyphen.dictools.install('de')
hyphenator = hyphen.Hyphenator('de')


from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

enc = 'UTF-8'

pdfmetrics.registerFont(TTFont('DejaVuSans', 'DejaVuSans.ttf',enc))
pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', 'DejaVuSans-Bold.ttf',enc))

class PageNumCanvas(canvas.Canvas):
    """
    http://code.activestate.com/recipes/546511-page-x-of-y-with-reportlab/
    http://code.activestate.com/recipes/576832/

    """

    def __init__(self, *args, **kwargs):
        """Constructor"""
        canvas.Canvas.__init__(self, *args, **kwargs)
        self.pages = []

    def showPage(self):
        """
        On a page break, add information to the list
        """
        self.pages.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        """
        Add the page number to each page (page x of y)
        """
        page_count = len(self.pages)

        for page in self.pages:
            self.__dict__.update(page)
            self._draw_footer(page_count)
            canvas.Canvas.showPage(self)

        canvas.Canvas.save(self)

    def _draw_footer(self, page_count):
        """
        Add page footer
        """
        # at this point, template has initialized canvas so
        # we can add the footer function to it if set
        if hasattr(self, 'draw_footer') and isinstance(self.draw_footer, collections.Callable):
            self.draw_footer(self, page_count)

class IndexTemplate(SimpleDocTemplate):

    def __init__(self, filename, title_height, draw_footer=False, **kw):
        self.title_height = title_height
        self.draw_footer = draw_footer
        SimpleDocTemplate.__init__(self, filename, **kw)

    def build(self, flowables, firstPage=_doNothing, laterPages=_doNothing,
              canvasmaker=PageNumCanvas, columns=2):
        self._calc()

        title_margin_bottom = self.height - self.title_height + self.bottomMargin

        first_page_frame_height = self.height - self.title_height

        column_width = self.width / columns

        first_page_title_frame = Frame(
            self.leftMargin,
            title_margin_bottom,
            self.width,
            self.title_height
        )

        first_page_columns = [Frame(
            self.leftMargin + (i * column_width),
            self.bottomMargin,
            column_width,
            first_page_frame_height ) for i in range(columns)]

        first_page_template = PageTemplate(id='First',
            frames=[first_page_title_frame] + first_page_columns,
            onPage=firstPage,
            pagesize=self.pagesize
        )

        later_pages_columns = [Frame(
            self.leftMargin + (i * column_width),
            self.bottomMargin,
            column_width,
            self.height) for i in range(columns)]

        later_pages_template = PageTemplate(id='Later',
            frames=later_pages_columns,
            onPage=laterPages,
            pagesize=self.pagesize
        )

        self.addPageTemplates([first_page_template, later_pages_template])

        if firstPage is _doNothing and hasattr(self,'firstPage'):
            first_page_template.beforeDrawPage = self.firstPage
        if laterPages is _doNothing and hasattr(self,'laterPages'):
            later_pages_template.beforeDrawPage = self.laterPages

        BaseDocTemplate.build(self,flowables, canvasmaker=canvasmaker)

    def beforeDocument(self):
        # set canvas draw_footer if set in template,
        # so we can style the footer from outside
        if self.draw_footer and hasattr(self.draw_footer , '__call__'):
            self.canv.draw_footer = self.draw_footer

class DottedEntry(Paragraph):

    def __init__(self, text, ref, style, dot='. ', min_dots=0):
        self.ref = ref
        self.dot = dot
        self.min_dots = min_dots
        Paragraph.__init__(self, text, style)

    def _determine_lines(self, words, text_max_width, max_width, delimiter=' '):
        font_name = self.style.fontName
        font_size = self.style.fontSize
        current_width = 0
        lines = []
        line = []
        delimiter_width = stringWidth(delimiter, font_name,
                                      font_size, self.encoding)
        for word in words:
            word_width = stringWidth(word, font_name, font_size)
            new_width = current_width + delimiter_width + word_width
            if new_width <= text_max_width or not len(line):
                line.append(word)
                current_width = new_width
            else:
                if current_width > self.width:
                    self.width = current_width
                # readd delimiter if not empty space (Paragraph delimiter)
                # so we ship around overwriting Paragraph.drawPara
                if delimiter != ' ':
                    line = [delimiter.join(line) + delimiter]
                lines.append((max_width - current_width, line))
                line = [word]
                current_width = new_width - current_width
        # readd delimiter width cause this is the last line
        lines.append((max_width - current_width + delimiter_width, line))
        return lines

    def breakLines(self, max_widths):
        if not isinstance(max_widths,(tuple,list)):
            max_widths = [max_widths]
        max_width = max_widths[0]

        lines = []
        font_name = self.style.fontName
        font_size = self.style.fontSize

        min_dots_width = stringWidth(self.dot * self.min_dots, font_name,
                                     font_size, self.encoding)
        ref_width = stringWidth(self.ref, font_name, font_size, self.encoding)

        # text_max_width is the space left after drawing dot_count dots and ref
        text_max_width = max_width - min_dots_width - ref_width

        text_width = stringWidth(self.text, font_name, font_size, self.encoding)

        if text_width >= text_max_width:
            delimiter = ' '
            words = self.text.split(delimiter)
            if len(words) > 1:
                lines = self._determine_lines(words, text_max_width,
                                              max_width, delimiter)
            else:
                delimiter = '-'
                words = self.text.split(delimiter)
                if len(words) == 1:
                    if not isinstance(self.text, str):
                        text = self.text.decode('utf-8')
                    else:
                        text = self.text
                    words = hyphenator.wrap(text, 15)
                    lines = self._determine_lines(words, text_max_width,
                                                  max_width, '')
                else:
                    lines = self._determine_lines(words, text_max_width,
                                                  max_width, delimiter)
        else:
            text_width = stringWidth(self.text, self.style.fontName,
                                     self.style.fontSize, self.encoding)
            lines = [(max_width - text_width, [self.text])]
        return ParaLines(kind=0, fontSize=font_size, fontName=font_name,
                         textColor=self.style.textColor, ascent=font_size,
                         descent=-0.2 * font_size, lines=lines,
                         underline=False, link=False, strike=False, endDots=False)


    def wrap(self, available_width, available_height):
        # create function for adding right align ref, space filled with dots
        def add_dotted_ref(canvas):
            # get free space of last line in paragraph
            free_width, text = self.blPara.lines[-1]

            line_count = len(self.blPara.lines)
            text_height = self.style.leading * (line_count -1) + self.style.fontSize
            y = self.height - text_height

            ref_width = stringWidth(self.ref, self.style.fontName, self.style.fontSize)
            dot_width = stringWidth(self.dot, self.style.fontName, self.style.fontSize)

            # create dots-string
            dot_count = int((free_width - ref_width) / dot_width)
            dots = self.dot * dot_count

            # prepare string to write into canvas
            newx = available_width - dot_count * dot_width - ref_width

            tx = canvas.beginText(newx, y)
            tx.setFont(self.style.fontName, self.style.fontSize)
            tx.setFillColor(self.style.textColor)
            tx.textLine(dots + self.ref)

            # write
            canvas.drawText(tx)
        # add callback method to canvas
        setattr(self.canv, 'add_dotted_ref', add_dotted_ref)

        Paragraph.wrap(self, available_width, available_height)
        return self.width, self.height

    def draw(self):
        Paragraph.draw(self)
        # call after paragraph text was drawn
        self.canv.add_dotted_ref(self.canv)


def create_index_pdf(data, title=None, columns=2):
    pdf_buffer = io.StringIO()

    styles = getSampleStyleSheet()

    entries = []

    header_style = styles["Title"]
    header_style.fontSize=20
    header_style.leading = header_style.fontSize*1.1

    entries.append(Paragraph(data['title'], header_style))
    # go to next frame after title was drawn
    entries.append(FrameBreak())

    normal_style = styles["Normal"]
    normal_style.fontName = 'DejaVuSans'


    # this function is passed over template into canvas and called after
    # document draw is complete
    def draw_footer(canvas, page_count):
        if page_count <= 1:
            return
        font_name = normal_style.fontName
        font_size = normal_style.fontSize
        footer_text = "%d / %d" % (canvas._pageNumber, page_count)
        footer_text_width = stringWidth(footer_text, font_name, font_size)

        margin_left = canvas._pagesize[0] / 2 - footer_text_width /2
        margin_bottom = 7*mm

        canvas.saveState()
        canvas.setFont(normal_style.fontName, normal_style.fontSize)
        canvas.drawString(margin_left, margin_bottom, footer_text)
        canvas.restoreState()

    title_level_1_style = copy(styles["Normal"])
    title_level_1_style.fontName = 'DejaVuSans-Bold'
    title_level_1_style.fontSize = normal_style.fontSize + 4
    title_level_1_style.leading = normal_style.leading + 4
    title_level_1_style.spaceBefore = normal_style.leading * 3 - title_level_1_style.leading

    title_level_2_style = copy(styles["Normal"])
    title_level_2_style.fontName = 'DejaVuSans-Bold'
    title_level_2_style.spaceBefore = normal_style.leading * 2 - title_level_2_style.leading

    for topic in data['topics']:
        first_elements = []
        if 'title' in topic:
            first_elements.append(Paragraph(topic['title'], title_level_1_style))
        for group in topic['groups']:
            if 'title' in group:
                first_elements.append(Paragraph(group['title'], title_level_2_style))
            first_elements.append(DottedEntry(group['entries'][0]['name'], group['entries'][0]['ref'], normal_style))
            entries.append(KeepTogether(first_elements))
            first_elements = []
            for entry in group['entries'][1:]:
                entries.append(DottedEntry(entry['name'], entry['ref'], normal_style))

    # ensure header is fitting into title_height
    # otherwise header is drawn into first column
    doc = IndexTemplate(pdf_buffer,
        title_height=15*mm,
        draw_footer=draw_footer,
        title=title,
        leftMargin=10*mm,
        rightMargin=10*mm,
        topMargin=10*mm,
        bottomMargin=10*mm
    )

    doc.build(entries, columns=columns)

    pdf_buffer.reset()
    return pdf_buffer

if __name__ == '__main__':
    from .example_data import streets
    with open('streets_new.pdf', 'w') as pdf_file:
        pdf_buffer = create_index_pdf(streets, 'Straßenverzeichnis', 3)
        pdf_file.write(pdf_buffer.read())

    from .example_data import pois
    with open('pois_new.pdf', 'w') as pdf_file:
        pdf_buffer = create_index_pdf(pois, 'Interessante Orte', 3)
        pdf_file.write(pdf_buffer.read())
