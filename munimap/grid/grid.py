from __future__ import division
from .refs import refstr, DEFAULT_LABELS

def calculate_num_cells(out_size, max_width, max_cells=(20, 20), min_cells=(2, 2)):
    x = int(out_size[0] // max_width[0])
    y = int(out_size[1] // max_width[1])

    return min(max(min_cells[0], x), max_cells[0]), min(max(min_cells[1], y), max_cells[0])


class Grid(object):
    def __init__(self, bbox, size, def_res=100, map_res=100, cells=None,
                 max_grid_width_cm=(7, 7), min_cells=(4, 4), max_cells=(9, 9),
                 labels=None,
                 invert_top_labels=False, invert_left_labels=False,
         ):
        self.bbox = bbox
        self.out_size_px = size
        if labels is None:
            labels = DEFAULT_LABELS
        self.labels = labels
        self.invert_top_labels = invert_top_labels
        self.invert_left_labels = invert_left_labels

        out_size_cm = self.out_size_px[0] / map_res * 2.54, self.out_size_px[1] / map_res * 2.54
        if cells is None or cells == (0, 0):
            cells = calculate_num_cells(
                out_size=out_size_cm, max_width=max_grid_width_cm,
                max_cells=max_cells, min_cells=min_cells)
        self.cells = cells
        self.bbox_size = bbox[2] - bbox[0], bbox[3] - bbox[1]

        self.res = (
            self.bbox_size[0] / self.out_size_px[0],
            self.bbox_size[1] / self.out_size_px[1]
        )

        self.grid_size = self.bbox_size[0] / cells[0], self.bbox_size[1] / cells[1]
        grid_size_px = self.grid_size[0] / self.res[0], self.grid_size[1] / self.res[1]
        scale_factor = map_res / def_res
        # make label font 1/6th of grid size
        self.label_size = min(grid_size_px) / 6 / scale_factor
        # move labels into grid cell
        self.label_offset = (
            self.res[0] * self.label_size * 0.8 * scale_factor,
            self.res[1] * self.label_size * 1.0 * scale_factor
        )

    def boxes(self):
        boxes = []
        for y in xrange(self.cells[1]):
            y_ref = self.cells[1] - y if self.invert_left_labels else y +1
            for x in xrange(self.cells[0]):
                x_ref = self.cells[0] - x if self.invert_top_labels else x +1
                boxes.append(((x_ref, y_ref), (
                     self.bbox[0] + self.grid_size[0] * x,
                     self.bbox[3] - self.grid_size[1] * (y+1),
                     self.bbox[0] + self.grid_size[0] * (x+1),
                     self.bbox[3] - self.grid_size[1] * y,
                )))
        return boxes

    def lines(self):
        lines = []

        for i in xrange(self.cells[0]+1):
            lines.append([
                (self.bbox[0] + self.grid_size[0]*i, self.bbox[1]),
                (self.bbox[0] + self.grid_size[0]*i, self.bbox[3]),
            ])
        for i in xrange(self.cells[1]+1):
            lines.append([
                (self.bbox[0], self.bbox[1] + self.grid_size[1]*i),
                (self.bbox[2], self.bbox[1] + self.grid_size[1]*i),
            ])

        return lines

    def points(self):
        label_points = []
        # top labels (left to right)
        for i in xrange(self.cells[0]):
            label_value = (self.cells[0] - i) if self.invert_top_labels else (i + 1)
            label_points.append((
                refstr(label_value, labels=self.labels[0]),
                (
                    self.bbox[0] + self.grid_size[0]*(i + 0.5),
                    self.bbox[3] - self.label_offset[1],
                ),
            ))
            label_points.append((
                refstr(label_value, labels=self.labels[0]),
                (
                    self.bbox[0] + self.grid_size[0]*(i + 0.5),
                    self.bbox[1] + self.label_offset[1],
                ),
            ))
        # left labels (top to bottom)
        for i in xrange(self.cells[1]):
            label_value = (self.cells[1] - i) if self.invert_left_labels else (i + 1)
            label_points.append((
                refstr(label_value, labels=self.labels[1]),
                (
                    self.bbox[0] + self.label_offset[0],
                    self.bbox[3] - self.grid_size[1]*(i + 0.5),
                ),
            ))
            label_points.append((
                refstr(label_value, labels=self.labels[1]),
                (
                    self.bbox[2] - self.label_offset[0],
                    self.bbox[3] - self.grid_size[1]*(i + 0.5),
                ),
            ))

        return label_points

    def point_features(self):
        features = []
        for name, p in self.points():
            features.append({
                    "type": "Feature",
                    "properties": {
                        "name": name,
                        "label_size": self.label_size
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": p
                    },
                })
        return features

    def line_features(self):
        features = []
        for l in self.lines():
            features.append({
                    "type": "Feature",
                    "properties": {
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": l
                    },
                })
        return features

    def features(self, lines=True, points=True, srs=4326):
        features = []
        if lines:
            features.extend(self.line_features())
        if points:
            features.extend(self.point_features())
        return {
            "type": "FeatureCollection",
            'crs': {
                'type': 'name',
                'properties': {
                    'name': 'urn:ogc:def:crs:EPSG::%d' % srs,
                },
            },
            "features":  features,
        }
