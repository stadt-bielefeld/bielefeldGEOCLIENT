from rtree import index
from shapely import geometry

class RefFinder(object):
    """
    Find refs of geometries in existing grid.

    :param grid: List of ref (x, y) and bbox tuples.
    """
    def __init__(self, grid):
        self.grid = []
        self.index = index.Index()

        for i, (ref, box) in enumerate(grid):
            self.grid.append((ref, geometry.box(*box)))
            self.index.add(i, box)

    def refs(self, geom):
        """
        Returns a list of grid refs (x, y) that are intersected
        by the `geom`.
        """
        index_hits = self.index.intersection(geom.bounds)
        if not index_hits:
            return None

        hits = []
        for hit in index_hits:
            ref, grid_geom = self.grid[hit]
            if geom.intersects(grid_geom):
                hits.append(ref)

        return hits
