from .combine import CombineSVG
from io import BytesIO

def test_simple():
	#
	check_combine([
			{'name': 'layer-1', 'content': '''<svg xmlns="http://www.w3.org/2000/svg"><path/></svg>'''},
			{'name': 'layer-2', 'content': '''<svg xmlns="http://www.w3.org/2000/svg"><path/></svg>'''},
		], '''<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg"><g id="layer-1"><path></path></g><g id="layer-2"><path></path></g></svg>'''
	)


def test_strip_empty_g():
	# strip empty <g>
	check_combine([
			{'name': 'layer-1', 'content': '''<svg xmlns="http://www.w3.org/2000/svg"><path/></svg>'''},
			{'name': 'layer-2', 'content': '''<svg xmlns="http://www.w3.org/2000/svg"><g id="foo"><path/></g></svg>'''},
		], '''<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg"><g id="layer-1"><path></path></g><g id="layer-2"><path></path></g></svg>'''
	)

def test_strip_empty_layer():
	# strip empty layer
	check_combine([
			{'name': 'layer-1', 'content': '''<svg xmlns="http://www.w3.org/2000/svg"></svg>'''},
			{'name': 'layer-2', 'content': '''<svg xmlns="http://www.w3.org/2000/svg"><g id="foo"></g></svg>'''},
			{'name': 'layer-3', 'content': '''<svg xmlns="http://www.w3.org/2000/svg"><g id="foo"><path/></g></svg>'''},
		], '''<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg"><g id="layer-3"><path></path></g></svg>'''
	)

def test_set_root_id():
	# set id of root <svg>
	check_combine([
			{'name': 'layer-1', 'content': '''<svg xmlns="http://www.w3.org/2000/svg" id="root"><path/></svg>'''},
			{'name': 'layer-2', 'content': '''<svg xmlns="http://www.w3.org/2000/svg" id="removed"><path/></svg>'''},
		], '''<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg" id="newroot"><g id="layer-1"><path></path></g><g id="layer-2"><path></path></g></svg>''',
		root_id="newroot",
	)

def test_combine_same_layer():
	# same layers are combined
	check_combine([
			{'name': 'layer', 'content': '''<svg xmlns="http://www.w3.org/2000/svg"><path/></svg>'''},
			{'name': 'layer', 'content': '''<svg xmlns="http://www.w3.org/2000/svg"><path/></svg>'''},
			{'name': 'other-layer', 'content': '''<svg xmlns="http://www.w3.org/2000/svg"><path/></svg>'''},
		], '''<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg"><g id="layer"><path></path><path></path></g><g id="other-layer"><path></path></g></svg>'''
	)


def test_remove_background_rect_exept_first():
	# remove background rects, but keep first rect
	check_combine([
			{'name': 'layer-1', 'content': '''<svg xmlns="http://www.w3.org/2000/svg"><path/><rect x="0" y="0" style="fill: black"/></svg>'''},
			{'name': 'layer-2', 'content': '''<svg xmlns="http://www.w3.org/2000/svg"><path/><rect x="0" y="0" style="fill: yellow"/></svg>'''},
		], '''<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg"><g id="layer-1"><path></path><rect y="0" x="0" style="fill: black"></rect></g><g id="layer-2"><path></path></g></svg>'''
	)


def check_combine(inputs, result, root_id=None):
	out = BytesIO()
	c = CombineSVG(out, root_id=root_id)

	for input in inputs:
		c.add(input['name'], BytesIO(input['content']))

	c.close()

	out.seek(0)
	assert result == out.read().replace('\n', '')
